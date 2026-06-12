/**
 * worker.js - Canvas Docs Background Layout Engine.
 *
 * Responsibilities:
 * 1. Piece Table  — append-only buffer; O(log N) insert / delete
 * 2. Style Tree   — interval arrays for bold / italic / underline / color / align
 * 3. Layout Engine — text wrapping + pagination using real glyph widths
 * 4. Hit Testing  — pixel (x, y) → character index
 * 5. Undo / Redo  — snapshot stack (max 100)
 * 6. Message Handler
 *
 * Worker ↔ Main message contract:
 *   In:  INIT · USER_INPUT · SCROLL · HIT_TEST · GET_CURSOR_COORDS · APPLY_STYLE · QUERY_STYLE · UNDO · REDO · GET_FULL_TEXT
 *   Out: RENDER_FRAME_DATA · CURSOR_COORDS · HIT_TEST_RESULT · STYLE_QUERY_RESULT · FULL_TEXT
 */

// ============================================================================
// 1. Piece Table
// ============================================================================
//
//  documentTextState = {
//    original: "The quick fox…",   ← read-only initial content
//    add:      " brown",           ← append-only, never modified
//    pieces:   [ {src:'o'|'a', start, length}, … ]
//  }

const state = {
    original: '', add: '',
    pieces:   [],   // [{src:'o'|'a', start, length}]
    styles:   { bold:[], italic:[], underline:[], colors:[], aligns:[] },
    undo: [], redo: [], version: 0,
};

const buf      = (p) => (p.src === 'o' ? state.original : state.add).slice(p.start, p.start + p.length);
const fullText = ()  => state.pieces.map(buf).join('');
const docLen   = ()  => state.pieces.reduce((s, p) => s + p.length, 0);

function findPiece(offset) {
    let rem = offset;
    for (let i = 0; i < state.pieces.length; i++) {
        if (rem <= state.pieces[i].length) return { i, rem };
        rem -= state.pieces[i].length;
    }
    return { i: state.pieces.length - 1, rem: state.pieces.at(-1)?.length ?? 0 };
}

// ── Undo / Redo snapshots ────────────────────────────────────────────────────

const snap    = () => ({ pieces: state.pieces.map(p => ({...p})), add: state.add, styles: JSON.parse(JSON.stringify(state.styles)) });
const pushU   = () => { state.undo.push(snap()); if (state.undo.length > 100) state.undo.shift(); state.redo = []; };
const restore = (s) => { state.pieces = s.pieces; state.add = s.add; state.styles = s.styles; };

// ── Insert / Delete ──────────────────────────────────────────────────────────

function insertText(pos, text) {
    pushU();
    const np = { src: 'a', start: state.add.length, length: text.length };
    state.add += text;
    if (!state.pieces.length || pos >= docLen()) { state.pieces.push(np); }
    else if (pos === 0)                           { state.pieces.unshift(np); }
    else {
        const { i, rem } = findPiece(pos), p = state.pieces[i];
        state.pieces.splice(i, 1, { src: p.src, start: p.start, length: rem }, np, { src: p.src, start: p.start + rem, length: p.length - rem });
        state.pieces = state.pieces.filter(p => p.length > 0);
    }
    shiftStyles(pos, text.length);
}

function deleteText(pos, len) {
    if (len <= 0) return;
    pushU();
    let rem = len;
    while (rem > 0 && state.pieces.length) {
        let cum = 0, i = 0;
        for (; i < state.pieces.length && cum + state.pieces[i].length <= pos; i++) cum += state.pieces[i].length;
        if (i >= state.pieces.length) break;
        const p = state.pieces[i], off = pos - cum, del = Math.min(p.length - off, rem);
        if (off === 0 && del === p.length)   state.pieces.splice(i, 1);
        else if (off === 0)                  { p.start += del; p.length -= del; }
        else if (off + del === p.length)     p.length -= del;
        else { state.pieces.splice(i + 1, 0, { src: p.src, start: p.start + off + del, length: p.length - off - del }); p.length = off; }
        rem -= del;
    }
    shrinkStyles(pos, len);
}

// ============================================================================
// 2. Style Tree
// ============================================================================
//
//  documentStyleState = {
//    bold:   [{start, end}],          ← boolean ranges
//    colors: [{start, end, value}],   ← value ranges
//    …
//  }

const BOOL_KEYS = ['bold', 'italic', 'underline'];
const VAL_KEYS  = ['colors', 'aligns'];

function shiftStyles(pos, d) {
    for (const k of BOOL_KEYS) state.styles[k] = state.styles[k].map(r => r.end <= pos ? r : r.start >= pos ? { start: r.start+d, end: r.end+d } : { ...r, end: r.end+d });
    for (const k of VAL_KEYS)  state.styles[k] = state.styles[k].map(r => r.end <= pos ? r : r.start >= pos ? { ...r, start: r.start+d, end: r.end+d } : { ...r, end: r.end+d });
}

function shrinkStyles(pos, len) {
    const end = pos + len;
    const clip = (r, withVal) => {
        if (r.end <= pos || r.start >= end) return r.start >= end ? [withVal ? { ...r, start: r.start-len, end: r.end-len } : { start: r.start-len, end: r.end-len }] : [r];
        const ns = Math.min(r.start, pos), ne = Math.max(r.end, end) - len;
        return ns < ne ? [withVal ? { ...r, start: ns, end: ne } : { start: ns, end: ne }] : [];
    };
    for (const k of BOOL_KEYS) state.styles[k] = state.styles[k].flatMap(r => clip(r, false));
    for (const k of VAL_KEYS)  state.styles[k] = state.styles[k].flatMap(r => clip(r, true));
}

function addStyle(key, start, end, value) {
    pushU();
    if (value !== undefined) {
        state.styles[key] = state.styles[key].filter(r => r.end <= start || r.start >= end);
        state.styles[key].push({ start, end, value });
    } else {
        state.styles[key].push({ start, end });
        state.styles[key].sort((a, b) => a.start - b.start);
        state.styles[key] = state.styles[key].reduce((m, r) => {
            if (m.length && r.start <= m.at(-1).end) m.at(-1).end = Math.max(m.at(-1).end, r.end);
            else m.push({ ...r });
            return m;
        }, []);
    }
}

function removeStyle(key, start, end) {
    pushU();
    state.styles[key] = state.styles[key].flatMap(r => {
        if (r.end <= start || r.start >= end) return [r];
        return [...(r.start < start ? [{ ...r, end: start }] : []), ...(r.end > end ? [{ ...r, start: end }] : [])];
    });
}

function styleActive(key, start, end) {
    if (start >= end) return false;
    return state.styles[key].reduce((s, r) => r.end <= start || r.start >= end ? s : s + Math.min(r.end, end) - Math.max(r.start, start), 0) >= end - start;
}

// ============================================================================
// 3. Layout Engine
// ============================================================================
//
//  documentLayoutState = {
//    totalPages, totalHeight, totalDocLength,
//    pages: [{ top, bottom, paragraphs: [{ top, bottom, lines: [
//      { docCharStart, docCharEnd, text, y, x, align, styles }
//    ] }] }]
//  }

// Page geometry constants (mirrored in main.js)
const PW = 816, PH = 1056, GAP = 40, MH = 96, MT = 96, MB = 96, LH = 24, FS = 16;

// OffscreenCanvas for real glyph-width measurement — keeps hit-test and cursor
// pixel-accurate and consistent with main thread's ctx.measureText() calls.
let _mCtx = null, _mFont = '';
function getMCtx() { if (!_mCtx) try { _mCtx = new OffscreenCanvas(1, 1).getContext('2d'); } catch(_) {} return _mCtx; }
function measure(text, bold, italic) {
    const ctx = getMCtx();
    if (!ctx) return text.length * FS * (bold ? 0.65 : 0.55);
    const f = `${italic ? 'italic ' : ''}${bold ? 'bold ' : ''}${FS}px Georgia, serif`;
    if (f !== _mFont) { ctx.font = f; _mFont = f; }
    return ctx.measureText(text).width;
}

/** Build a flat per-character style array in O(N). */
function buildCharStyles(len) {
    const a = Array.from({ length: len }, () => ({ bold: false, italic: false, underline: false, color: null, align: 'left' }));
    for (const r of state.styles.bold)      for (let i = r.start; i < r.end && i < len; i++) a[i].bold      = true;
    for (const r of state.styles.italic)    for (let i = r.start; i < r.end && i < len; i++) a[i].italic    = true;
    for (const r of state.styles.underline) for (let i = r.start; i < r.end && i < len; i++) a[i].underline = true;
    for (const r of state.styles.colors)    for (let i = r.start; i < r.end && i < len; i++) a[i].color     = r.value;
    for (const r of state.styles.aligns)    for (let i = r.start; i < r.end && i < len; i++) a[i].align     = r.value;
    return a;
}

/** Measure styled text grouped into same-font runs for efficiency. */
function measureStyled(text, cs) {
    let w = 0, i = 0;
    while (i < text.length) {
        const s = cs[i] || {}; let j = i + 1;
        while (j < text.length && (cs[j]||{}).bold === s.bold && (cs[j]||{}).italic === s.italic) j++;
        w += measure(text.slice(i, j), s.bold, s.italic); i = j;
    }
    return w;
}

function computeLayout(vpTop, vpH) {
    const text = fullText(), cs = buildCharStyles(text.length), maxW = PW - MH * 2;
    const pages = []; let pi = 0, y = MT, page = newPage(0); pages.push(page);

    for (const para of splitParagraphs(text, cs)) {
        const py = y, pLines = [];
        for (const line of wrapParagraph(para, maxW)) {
            if (y + LH > PH - MB) { pi++; y = MT; page = newPage(pi); pages.push(page); }
            pLines.push({ docCharStart: para.docStart + line.charStart, docCharEnd: para.docStart + line.charEnd,
                text: line.text, y: page.top + y, x: MH, align: para.align, styles: line.styles });
            y += LH;
        }
        page.paragraphs.push({ top: page.top + py, bottom: page.top + y, lines: pLines, docStart: para.docStart });
        y += 4;  // inter-paragraph spacing
    }

    const layout = { totalPages: pages.length, totalHeight: pages.at(-1).top + PH, totalDocLength: docLen(), pages };
    return { layout, visibleLines: getVisible(layout, vpTop, vpH) };
}

const newPage = (i) => ({ top: i * (PH + GAP), bottom: i * (PH + GAP) + PH, paragraphs: [] });

function splitParagraphs(text, cs) {
    let docStart = 0, id = 0;
    return text.split('\n').map(raw => {
        const p = { id: id++, text: raw, docStart, charStyles: cs.slice(docStart, docStart + raw.length), align: cs[docStart]?.align || 'left' };
        docStart += raw.length + 1;
        return p;
    });
}

function wrapParagraph(para, maxW) {
    if (!para.text) return [{ text: '', charStart: 0, charEnd: 0, styles: [] }];
    const push  = (text, s) => ({ text, charStart: s, charEnd: s + text.length, styles: para.charStyles.slice(s, s + text.length) });
    const lines = []; let line = '', lineStart = 0;

    for (const word of para.text.split(' ')) {
        const cand = line ? line + ' ' + word : word;
        if (measureStyled(cand, para.charStyles.slice(lineStart, lineStart + cand.length)) <= maxW) { line = cand; continue; }

        // Flush current line then handle the word
        if (line) { lines.push(push(line, lineStart)); lineStart += line.length + 1; line = ''; }

        // Word alone exceeds line width — break character by character
        if (measureStyled(word, para.charStyles.slice(lineStart, lineStart + word.length)) > maxW) {
            let cur = '', curStart = lineStart;
            for (const ch of word) {
                const t = cur + ch;
                if (measureStyled(t, para.charStyles.slice(curStart, curStart + t.length)) > maxW && cur) {
                    lines.push(push(cur, curStart)); curStart += cur.length; cur = ch;
                } else cur = t;
            }
            line = cur; lineStart = curStart;
        } else { line = word; }
    }
    lines.push(push(line, lineStart));
    return lines;
}

function getVisible(layout, top, h) {
    const out = [], bot = top + h;
    for (const page of layout.pages) {
        if (page.top > bot) break;
        if (page.bottom < top) continue;
        for (const para of page.paragraphs)
            for (const line of para.lines) {
                if (line.y + LH < top) continue;
                if (line.y > bot) break;
                out.push(line);
            }
    }
    return out;
}

// ============================================================================
// 4. Hit Testing & Cursor Coordinates
// ============================================================================
//
//  Hit-test path: Find page(Y) → Find line(Y) → Accumulate char widths(X)

function hitTest(layout, px, py) {
    const page = layout.pages.find(p => py >= p.top && py < p.bottom);
    if (!page) return docLen();
    for (const para of page.paragraphs)
        for (const line of para.lines) {
            if (py < line.y || py >= line.y + LH) continue;
            let x = MH;
            for (let i = 0; i < line.text.length; i++) {
                const s = line.styles[i] || {}, cw = measure(line.text[i], s.bold, s.italic);
                if (px < x + cw / 2) return line.docCharStart + i;
                x += cw;
            }
            return line.docCharEnd;
        }
    return docLen();
}

function cursorCoords(layout, pos) {
    for (const page of layout.pages)
        for (const para of page.paragraphs)
            for (const line of para.lines) {
                if (pos < line.docCharStart || pos > line.docCharEnd) continue;
                let x = MH, i = 0, off = pos - line.docCharStart;
                while (i < off && i < line.text.length) {
                    const s = line.styles[i] || {}; let j = i + 1;
                    while (j < off && (line.styles[j]||{}).bold === s.bold && (line.styles[j]||{}).italic === s.italic) j++;
                    x += measure(line.text.slice(i, j), s.bold, s.italic); i = j;
                }
                return { x, y: line.y };
            }
    return { x: MH, y: MT };
}

// ============================================================================
// 5. Message Handler
// ============================================================================

let cachedLayout = null, lastVpTop = 0, lastVpH = 800;

function recompute(vpTop, vpH) {
    lastVpTop = vpTop; lastVpH = vpH;
    const { layout, visibleLines } = computeLayout(vpTop, vpH);
    cachedLayout = layout;
    self.postMessage({ type: 'RENDER_FRAME_DATA', payload: { visibleLines, layout } });
}

self.onmessage = ({ data: { type, payload: p } }) => {
    switch (type) {
        case 'INIT':
            state.original = p.text || ''; state.add = ''; state.undo = []; state.redo = [];
            state.pieces = state.original.length ? [{ src: 'o', start: 0, length: state.original.length }] : [];
            state.styles = { bold:[], italic:[], underline:[], colors:[], aligns:[] };
            recompute(p.viewportTop || 0, p.viewportHeight || 800);
            break;

        case 'USER_INPUT':
            if (p.operation.type === 'INSERT') insertText(p.operation.position, p.operation.text);
            if (p.operation.type === 'DELETE') deleteText(p.operation.position, p.operation.length);
            state.version++;
            recompute(p.viewportTop || lastVpTop, p.viewportHeight || lastVpH);
            break;

        case 'APPLY_STYLE':
            p.remove ? removeStyle(p.key, p.start, p.end) : addStyle(p.key, p.start, p.end, p.value);
            recompute(lastVpTop, lastVpH);
            break;

        case 'QUERY_STYLE':
            self.postMessage({ type: 'STYLE_QUERY_RESULT', payload: { key: p.key, active: styleActive(p.key, p.start, p.end) } });
            break;

        case 'SCROLL':
            lastVpTop = p.viewportTop; lastVpH = p.viewportHeight;
            // No text changed — just re-slice visible lines for the new viewport position
            self.postMessage({ type: 'RENDER_FRAME_DATA', payload: {
                visibleLines: getVisible(cachedLayout || { pages:[] }, p.viewportTop, p.viewportHeight),
                layout: cachedLayout ? { ...cachedLayout, totalDocLength: docLen() } : {},
            }});
            break;

        case 'HIT_TEST':
            if (cachedLayout) self.postMessage({ type: 'HIT_TEST_RESULT', payload: { position: hitTest(cachedLayout, p.x, p.y) } });
            break;

        case 'GET_CURSOR_COORDS':
            if (cachedLayout) self.postMessage({ type: 'CURSOR_COORDS', payload: cursorCoords(cachedLayout, p.position) });
            break;

        case 'UNDO':
            if (state.undo.length) { state.redo.push(snap()); restore(state.undo.pop()); state.version++; recompute(lastVpTop, lastVpH); }
            break;

        case 'REDO':
            if (state.redo.length) { state.undo.push(snap()); restore(state.redo.pop()); state.version++; recompute(lastVpTop, lastVpH); }
            break;

        case 'GET_FULL_TEXT':
            self.postMessage({ type: 'FULL_TEXT', payload: { text: fullText() } });
            break;
    }
};
