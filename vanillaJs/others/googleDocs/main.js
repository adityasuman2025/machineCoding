/**
 * main.js - Canvas Docs UI Controller (Main Thread).
 *
 * Data flow (unidirectional):
 *   User types → InputInterceptor <textarea> → workerOp() → Worker
 *              → RENDER_FRAME_DATA → dirty=true → requestAnimationFrame → draw()
 *
 * Sections:
 * 1. Constants & State
 * 2. Canvas Setup (HiDPI)
 * 3. Worker & Message Handler
 * 4. Render Loop
 * 5. Input (Mouse + Keyboard)
 * 6. Text Mutations
 * 7. Style Helpers
 */

// ============================================================================
// 1. Constants & State
// ============================================================================

// Page geometry — must match worker.js
const PAGE_W = 816, PAGE_H = 1056, PAGE_GAP = 40, MARGIN_H = 96, LINE_H = 24, FONT_SIZE = 16;
const BG = '#f0f2f5', PAGE_BG = '#fff', SHADOW = 'rgba(0,0,0,0.13)', CURSOR_CLR = '#2563eb', SEL_CLR = 'rgba(37,99,235,0.22)';

let worker, canvas, ctx, interceptor, scrollport;

// Layout state — updated on every RENDER_FRAME_DATA from worker
let visLines = [], meta = { totalPages: 1, totalHeight: PAGE_H, totalDocLength: 0 };

// Cursor & selection (character offsets into the full document)
let cursorPos = 0, selAnchor = null, cursorXY = { x: MARGIN_H, y: 96 }, cursorOn = true, cursorTimer;

// Flags for async worker round-trips
let dirty = false, pendingHit = null, pendingStyle = null, wordSelPending = false;
let mouseDown = false, mouseAnchor = null;

// ============================================================================
// 2. Canvas Setup (HiDPI)
// ============================================================================

function resizeCanvas() {
    const r = devicePixelRatio || 1, W = scrollport.clientWidth, H = scrollport.clientHeight;
    canvas.width = W * r; canvas.height = H * r;
    canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
    ctx.setTransform(r, 0, 0, r, 0, 0);   // reset before scale — avoids accumulation on resize
    dirty = true;
}

// ============================================================================
// 3. Worker & Message Handler
// ============================================================================

function initWorker() {
    worker = new Worker('worker.js');
    worker.onerror = (e) => console.error('[Worker]', e.message);
    worker.onmessage = ({ data: { type, payload: p } }) => {
        switch (type) {
            case 'RENDER_FRAME_DATA':
                // New layout ready — update visible lines and refresh cursor pixel position
                visLines = p.visibleLines; meta = p.layout;
                document.getElementById('canvas-container').style.height = meta.totalHeight + 'px';
                dirty = true;
                worker.postMessage({ type: 'GET_CURSOR_COORDS', payload: { position: cursorPos } });
                break;
            case 'CURSOR_COORDS':
                cursorXY = p; scrollToCursor(p.y); dirty = true;
                break;
            case 'HIT_TEST_RESULT':
                if (pendingHit) { selAnchor = pendingHit.isSelecting ? pendingHit.anchor : null; cursorPos = p.position; pendingHit = null; }
                resetBlink(); worker.postMessage({ type: 'GET_CURSOR_COORDS', payload: { position: cursorPos } }); dirty = true;
                break;
            case 'STYLE_QUERY_RESULT':
                // Worker confirmed whether range is already fully styled — now toggle it
                if (pendingStyle?.key === p.key) {
                    const { key, start, end } = pendingStyle; pendingStyle = null;
                    worker.postMessage({ type: 'APPLY_STYLE', payload: { key, start, end, remove: p.active } });
                }
                break;
            case 'FULL_TEXT':
                if (wordSelPending) { wordSelPending = false; wordSelect(p.text); }
                break;
        }
    };
    worker.postMessage({
        type: 'INIT',
        payload: {
            text: 'Start typing your document here…\n\nThis editor is built on a Piece Table buffer, a Web Worker layout engine, and an HTML5 Canvas renderer.\n\nShortcuts: ⌘B Bold · ⌘I Italic · ⌘U Underline · ⌘Z Undo · ⌘⇧Z Redo',
            viewportTop: 0, viewportHeight: scrollport.clientHeight,
        },
    });
}

// ============================================================================
// 4. Render Loop
// ============================================================================

function renderLoop() { if (dirty) { draw(); dirty = false; } requestAnimationFrame(renderLoop); }

/**
 * Paint one frame. Draw order:
 *   1. Background  2. Page rectangles  3. Selection  4. Text  5. Cursor
 */
function draw() {
    const r = devicePixelRatio || 1, W = canvas.width / r, H = canvas.height / r;
    const st = scrollport.scrollTop, pl = (W - PAGE_W) / 2;   // pl = pageLeft in canvas coords

    // 1. Background
    ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H);

    // 2. Page backgrounds (only those visible in the viewport)
    for (let p = 0; p < meta.totalPages; p++) {
        const pt = p * (PAGE_H + PAGE_GAP) - st;
        if (pt + PAGE_H < 0 || pt > H) continue;
        ctx.save(); ctx.shadowColor = SHADOW; ctx.shadowBlur = 18; ctx.shadowOffsetY = 3;
        ctx.fillStyle = PAGE_BG; ctx.fillRect(pl, pt, PAGE_W, PAGE_H); ctx.restore();
    }

    // 3. Selection highlight rectangles
    if (selAnchor !== null && selAnchor !== cursorPos) {
        const [lo, hi] = [Math.min(selAnchor, cursorPos), Math.max(selAnchor, cursorPos)];
        ctx.fillStyle = SEL_CLR;
        for (const ln of visLines) {
            if (ln.docCharEnd < lo || ln.docCharStart > hi) continue;
            const x1 = charX(ln, Math.max(lo, ln.docCharStart) - ln.docCharStart, pl);
            const x2 = charX(ln, Math.min(hi, ln.docCharEnd)   - ln.docCharStart, pl);
            ctx.fillRect(x1, ln.y - st, x2 - x1, LINE_H);
        }
    }

    // 4. Text — each line is drawn as a series of same-style runs
    for (const ln of visLines) {
        if (!ln.text) continue;
        let sx = pl + MARGIN_H;
        if (ln.align === 'center') sx = pl + (PAGE_W - lineW(ln)) / 2;
        if (ln.align === 'right')  sx = pl + PAGE_W - MARGIN_H - lineW(ln);
        drawLine(ln, sx, ln.y - st + LINE_H - 5);
    }

    // 5. Cursor bar
    if (cursorOn && cursorXY) {
        const cx = pl + cursorXY.x, cy = cursorXY.y - st;
        ctx.beginPath(); ctx.moveTo(cx, cy + 2); ctx.lineTo(cx, cy + LINE_H - 2);
        ctx.strokeStyle = CURSOR_CLR; ctx.lineWidth = 2; ctx.stroke();
    }
}

// ── Drawing helpers ──────────────────────────────────────────────────────────

/** CSS font string for a char-style object. */
const fnt = (s) => `${s.italic ? 'italic ' : ''}${s.bold ? 'bold ' : ''}${FONT_SIZE}px Georgia, serif`;

/**
 * Find the end index of the same bold/italic run starting at `i` (capped at `max`).
 * Used by charX and lineW to batch ctx.measureText calls.
 */
function runEnd(ln, i, max) {
    const s = ln.styles?.[i] || {};
    let j = i + 1;
    while (j < max && (ln.styles?.[j] || {}).bold === s.bold && (ln.styles?.[j] || {}).italic === s.italic) j++;
    return j;
}

/** Canvas X of the character boundary at `off` chars into `ln`. */
function charX(ln, off, pl) {
    let x = pl + MARGIN_H, i = 0;
    while (i < off && i < ln.text.length) {
        ctx.font = fnt(ln.styles?.[i] || {});
        x += ctx.measureText(ln.text.slice(i, runEnd(ln, i, off))).width;
        i = runEnd(ln, i, off);
    }
    return x;
}

/** Total rendered pixel width of a line (for center / right alignment). */
function lineW(ln) {
    let w = 0, i = 0, N = ln.text.length;
    while (i < N) {
        ctx.font = fnt(ln.styles?.[i] || {});
        w += ctx.measureText(ln.text.slice(i, runEnd(ln, i, N))).width;
        i = runEnd(ln, i, N);
    }
    return w;
}

/** Draw a line as consecutive same-style (bold/italic/underline/color) runs. */
function drawLine(ln, sx, by) {
    let x = sx, i = 0;
    while (i < ln.text.length) {
        const s = ln.styles?.[i] || {};
        // Find end of run where ALL style properties match
        let j = i + 1;
        while (j < ln.text.length) {
            const ns = ln.styles?.[j] || {};
            if (ns.bold !== s.bold || ns.italic !== s.italic || ns.underline !== s.underline || ns.color !== s.color) break;
            j++;
        }
        const run = ln.text.slice(i, j);
        ctx.font = fnt(s); ctx.fillStyle = s.color || '#1a1a1a'; ctx.fillText(run, x, by);
        const tw = ctx.measureText(run).width;
        if (s.underline) { ctx.beginPath(); ctx.moveTo(x, by + 2); ctx.lineTo(x + tw, by + 2); ctx.strokeStyle = s.color || '#1a1a1a'; ctx.lineWidth = 1; ctx.stroke(); }
        x += tw; i = j;
    }
}

// ── Cursor helpers ────────────────────────────────────────────────────────────

function resetBlink() {
    cursorOn = true; clearInterval(cursorTimer);
    cursorTimer = setInterval(() => { cursorOn = !cursorOn; dirty = true; }, 530);
}

function scrollToCursor(y) {
    const vt = scrollport.scrollTop, vh = scrollport.clientHeight;
    if (y < vt + 12)               scrollport.scrollTop = y - 24;
    if (y + LINE_H > vt + vh - 12) scrollport.scrollTop = y + LINE_H - vh + 24;
}

// ============================================================================
// 5. Input (Mouse + Keyboard)
// ============================================================================

/**
 * Convert a canvas-relative click to page-relative document coords.
 * Worker's hit-test uses: X=0 at left edge of page, Y=0 at top of page 1.
 */
function toDocCoords(cx, cy) {
    const r = devicePixelRatio || 1, rect = canvas.getBoundingClientRect(), pl = canvas.width / r / 2 - PAGE_W / 2;
    return { x: (cx - rect.left) - pl, y: (cy - rect.top) + scrollport.scrollTop };
}

function onMouseDown(e) {
    if (e.button) return;
    e.preventDefault(); interceptor.focus();  // prevent browser stealing focus from interceptor
    mouseDown = true; mouseAnchor = cursorPos; selAnchor = null;
    pendingHit = { anchor: null, isSelecting: false };
    worker.postMessage({ type: 'HIT_TEST', payload: toDocCoords(e.clientX, e.clientY) });
}
function onMouseMove(e) {
    if (!mouseDown) return;
    pendingHit = { anchor: mouseAnchor, isSelecting: true };
    worker.postMessage({ type: 'HIT_TEST', payload: toDocCoords(e.clientX, e.clientY) });
}
function onDblClick() { wordSelPending = true; worker.postMessage({ type: 'GET_FULL_TEXT' }); }

function wordSelect(text) {
    let s = cursorPos, e = cursorPos;
    while (s > 0 && /\w/.test(text[s - 1])) s--;
    while (e < text.length && /\w/.test(text[e])) e++;
    selAnchor = s; cursorPos = e;
    worker.postMessage({ type: 'GET_CURSOR_COORDS', payload: { position: cursorPos } }); dirty = true;
}

function moveCursor() { worker.postMessage({ type: 'GET_CURSOR_COORDS', payload: { position: cursorPos } }); resetBlink(); dirty = true; }

function onKeyDown(e) {
    const dl = meta.totalDocLength || 0, hasSel = selAnchor !== null && selAnchor !== cursorPos, mod = e.metaKey || e.ctrlKey;

    // ── ⌘/Ctrl shortcuts ──────────────────────────────────────────────────
    if (mod) {
        if (e.key.toLowerCase() === 'a') { selAnchor = 0; cursorPos = dl; e.preventDefault(); dirty = true; return; }
        if (e.key === 'z' && !e.shiftKey) { worker.postMessage({ type: 'UNDO' }); selAnchor = null; e.preventDefault(); return; }
        if (e.key === 'y' || (e.key === 'z' && e.shiftKey)) { worker.postMessage({ type: 'REDO' }); selAnchor = null; e.preventDefault(); return; }
        if (e.key === 'b') { toggleStyle('bold');      e.preventDefault(); return; }
        if (e.key === 'i') { toggleStyle('italic');    e.preventDefault(); return; }
        if (e.key === 'u') { toggleStyle('underline'); e.preventDefault(); return; }
    }

    // ── Navigation (Arrow keys, Home, End) ────────────────────────────────
    if (e.key.startsWith('Arrow') || e.key === 'Home' || e.key === 'End') {
        e.preventDefault();
        const horiz = e.key === 'ArrowLeft' || e.key === 'ArrowRight';
        const dir   = (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === 'End') ? 1 : -1;
        if (e.key === 'Home') { if (e.shiftKey && selAnchor === null) selAnchor = cursorPos; cursorPos = 0; }
        else if (e.key === 'End') { if (e.shiftKey && selAnchor === null) selAnchor = cursorPos; cursorPos = dl; }
        else if (hasSel && !e.shiftKey) { cursorPos = dir > 0 ? Math.max(selAnchor, cursorPos) : Math.min(selAnchor, cursorPos); }
        else { if (e.shiftKey && selAnchor === null) selAnchor = cursorPos; cursorPos = Math.max(0, Math.min(cursorPos + (horiz ? dir : dir * 70), dl)); }
        if (!e.shiftKey || e.key === 'Home' || e.key === 'End') { if (!e.shiftKey) selAnchor = null; }
        moveCursor(); return;
    }

    // ── Editing keys ──────────────────────────────────────────────────────
    if (e.key === 'Backspace') { e.preventDefault(); hasSel ? delSel() : cursorPos > 0 && (cursorPos--, workerOp('DELETE', cursorPos, 1)); resetBlink(); return; }
    if (e.key === 'Delete')    { e.preventDefault(); hasSel ? delSel() : cursorPos < dl && workerOp('DELETE', cursorPos, 1); resetBlink(); return; }
    if (e.key === 'Enter')     { e.preventDefault(); insert('\n'); return; }
    if (e.key === 'Tab')       { e.preventDefault(); insert('    '); return; }
    // All other keys fall through → browser writes to interceptor → onInput fires
}

function onInput()  { const v = interceptor.value; if (!v) return; interceptor.value = ''; insert(v); }
function onPaste(e) { e.preventDefault(); const t = (e.clipboardData || window.clipboardData).getData('text'); if (t) insert(t); }

// ============================================================================
// 6. Text Mutations
// ============================================================================

function insert(text) {
    if (selAnchor !== null && selAnchor !== cursorPos) delSel(true);
    workerOp('INSERT', cursorPos, text);
    cursorPos += text.length; selAnchor = null; resetBlink();
}

function delSel(silent) {
    const from = Math.min(selAnchor, cursorPos), len = Math.abs(cursorPos - selAnchor);
    cursorPos = from; selAnchor = null;
    workerOp('DELETE', from, len);
    if (!silent) resetBlink();
}

/** Single gateway for all USER_INPUT messages to the worker. */
function workerOp(opType, position, arg) {
    const op = opType === 'INSERT' ? { type: opType, position, text: arg } : { type: opType, position, length: arg };
    worker.postMessage({ type: 'USER_INPUT', payload: { operation: op, viewportTop: scrollport.scrollTop, viewportHeight: scrollport.clientHeight } });
}

// ============================================================================
// 7. Style Helpers
// ============================================================================

/**
 * Query the worker whether [start,end) is fully styled, then toggle.
 * The response comes back as STYLE_QUERY_RESULT and is handled in onmessage.
 */
function toggleStyle(key) {
    if (selAnchor === null || selAnchor === cursorPos) return;
    const start = Math.min(selAnchor, cursorPos), end = Math.max(selAnchor, cursorPos);
    pendingStyle = { key, start, end };
    worker.postMessage({ type: 'QUERY_STYLE', payload: { key, start, end } });
}

// ============================================================================
// Bootstrap
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
    canvas = document.getElementById('doc-canvas');
    ctx    = canvas.getContext('2d');
    interceptor = document.getElementById('input-interceptor');
    scrollport  = document.getElementById('scroll-viewport');

    resizeCanvas();

    canvas.addEventListener('mousedown',   onMouseDown);
    canvas.addEventListener('mousemove',   onMouseMove);
    canvas.addEventListener('mouseup',     () => mouseDown = false);
    canvas.addEventListener('dblclick',    onDblClick);
    canvas.addEventListener('contextmenu', e => e.preventDefault());

    interceptor.addEventListener('keydown', onKeyDown);
    interceptor.addEventListener('input',   onInput);
    interceptor.addEventListener('paste',   onPaste);

    scrollport.addEventListener('scroll', () =>
        worker?.postMessage({ type: 'SCROLL', payload: { viewportTop: scrollport.scrollTop, viewportHeight: scrollport.clientHeight } }));

    // Refocus interceptor whenever user clicks outside the canvas (e.g. browser chrome)
    document.addEventListener('pointerdown', e => {
        if (e.target !== canvas && e.target !== interceptor) setTimeout(() => interceptor.focus(), 10);
    });

    window.addEventListener('resize', () => {
        resizeCanvas();
        worker?.postMessage({ type: 'SCROLL', payload: { viewportTop: scrollport.scrollTop, viewportHeight: scrollport.clientHeight } });
    });

    initWorker();
    interceptor.focus();
    resetBlink();
    renderLoop();
});
