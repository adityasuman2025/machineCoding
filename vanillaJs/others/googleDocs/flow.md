# Canvas Docs — Rich Text Editor

A Google Docs-inspired rich-text editor built entirely from scratch using **HTML5 Canvas**, **Web Workers**, and a **Piece Table** buffer. No frameworks, no libraries — just vanilla JavaScript following a strict frontend system design.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser Tab                          │
│                                                             │
│  ┌─────────────┐      postMessage       ┌────────────────┐  │
│  │  Main Thread │ ───────────────────► │  Web Worker    │  │
│  │  (main.js)   │ ◄─────────────────── │  (worker.js)   │  │
│  └─────────────┘      postMessage       └────────────────┘  │
│         │                                      │            │
│    draw() via                           Piece Table +        │
│    rAF loop                             Layout Engine        │
│         │                                                    │
│  ┌──────▼──────┐                                            │
│  │ <canvas>    │   ← all rendering happens here             │
│  │ #doc-canvas │                                            │
│  └─────────────┘                                            │
│                                                             │
│  ┌─────────────┐                                            │
│  │ <textarea>  │   ← hidden; holds real keyboard focus      │
│  │ #interceptor│                                            │
│  └─────────────┘                                            │
└─────────────────────────────────────────────────────────────┘
```

---

## Data Flow Diagrams

### 1. User Types a Character

```mermaid
sequenceDiagram
    participant U  as User
    participant I  as InputInterceptor<br/>(hidden textarea)
    participant M  as main.js
    participant W  as worker.js
    participant C  as <canvas>

    U->>I: keydown / input event
    I->>M: onInput() reads interceptor.value
    M->>M: insert(text) — clears interceptor
    M->>W: postMessage USER_INPUT<br/>{ op: INSERT, position, text }
    W->>W: insertText() — appends to addBuffer<br/>splits Piece Table at cursor
    W->>W: shiftStyles() — updates style intervals
    W->>W: computeLayout() — wraps text into lines,<br/>paginates into pages
    W->>M: postMessage RENDER_FRAME_DATA<br/>{ visibleLines, layout }
    M->>M: dirty = true<br/>update canvas-container height
    M->>W: postMessage GET_CURSOR_COORDS<br/>{ position }
    W->>M: postMessage CURSOR_COORDS { x, y }
    M->>M: scrollToCursor(y)
    M->>C: requestAnimationFrame → draw()<br/>pages + selection + text + cursor
```

---

### 2. User Clicks to Place Cursor

```mermaid
sequenceDiagram
    participant U  as User
    participant C  as <canvas>
    participant M  as main.js
    participant W  as worker.js

    U->>C: mousedown (clientX, clientY)
    C->>M: onMouseDown(e)
    M->>M: e.preventDefault() — keep focus on interceptor
    M->>M: toDocCoords() converts canvas px → page-relative coords<br/>x = canvasX - pageLeft  (page-relative)<br/>y = canvasY + scrollTop (absolute doc Y)
    M->>W: postMessage HIT_TEST { x, y }
    W->>W: hitTest() — finds page → paragraph → line → char<br/>using real OffscreenCanvas glyph widths
    W->>M: postMessage HIT_TEST_RESULT { position }
    M->>M: cursorPos = position<br/>selAnchor = null
    M->>W: postMessage GET_CURSOR_COORDS { position }
    W->>M: postMessage CURSOR_COORDS { x, y }
    M->>C: draw() — blink reset + cursor repaint
```

---

### 3. User Drags to Select Text

```mermaid
sequenceDiagram
    participant U  as User
    participant C  as <canvas>
    participant M  as main.js
    participant W  as worker.js

    U->>C: mousedown → records mouseAnchor = cursorPos
    loop while mouse held
        U->>C: mousemove (clientX, clientY)
        C->>M: onMouseMove(e)
        M->>W: postMessage HIT_TEST { x, y }<br/>pendingHit = { anchor: mouseAnchor, isSelecting: true }
        W->>M: postMessage HIT_TEST_RESULT { position }
        M->>M: selAnchor = mouseAnchor<br/>cursorPos  = position
        M->>C: draw() — selection highlight + cursor repaint
    end
    U->>C: mouseup → mouseDown = false
```

---

### 4. Piece Table — Insert Operation

```
Before insert at position 7:
  originalBuffer: "Hello, World!"
  addBuffer:      ""
  pieces:         [ { src:'o', start:0, length:13 } ]

After insert("!") at position 7:
  originalBuffer: "Hello, World!"
  addBuffer:      "!"
  pieces:         [
    { src:'o', start:0, length:7  },   ← "Hello, "
    { src:'a', start:0, length:1  },   ← "!"
    { src:'o', start:7, length:6  },   ← "World!"
  ]
```

> The original buffer is **never modified**. All edits append to `addBuffer`
> and restructure the piece list — keeping every undo snapshot cheap (just a
> copy of the piece array, not the full text).

---

### 5. Layout Engine Pipeline

```mermaid
flowchart TD
    A[getFullText\nflatten piece table → string] --> B[buildCharStyles\nO·N  per-char style array]
    B --> C[splitParagraphs\nsplit on newlines]
    C --> D[wrapParagraph\ngreedy word-wrap at maxWidth\nchar-break if word > line]
    D --> E[paginate\noverflow line → new page]
    E --> F[documentLayoutState\npages → paragraphs → lines]
    F --> G[getVisible\nslice lines inside viewport]
    G --> H[RENDER_FRAME_DATA →\nmain thread]
```

---

### 6. Hit Test — Click to Character

```mermaid
flowchart TD
    A["Click pixel (x, y)"] --> B{Find page\nwhere y ∈ page.top…bottom}
    B -->|not found| Z[return end of document]
    B -->|found| C{Find line\nwhere y ∈ line.y…line.y+LH}
    C -->|not found| Z
    C -->|found| D[Accumulate char widths\nusing OffscreenCanvas\nmeasureText per glyph]
    D --> E{x < charX + cw/2?}
    E -->|yes| F[return docCharStart + i]
    E -->|no| G[advance x += cw\nnext char]
    G --> E
```

---

### 7. Style Toggle Flow (⌘B Bold)

```mermaid
sequenceDiagram
    participant U  as User
    participant M  as main.js
    participant W  as worker.js

    U->>M: ⌘B keydown with text selected
    M->>M: toggleStyle('bold')\nrecords pendingStyle = { key, start, end }
    M->>W: postMessage QUERY_STYLE { key:'bold', start, end }
    W->>W: styleActive() — checks if entire [start,end)\nis already covered by bold intervals
    W->>M: postMessage STYLE_QUERY_RESULT { key, active: true/false }
    M->>M: if active → remove style (toggle off)\nif inactive → add style (toggle on)
    M->>W: postMessage APPLY_STYLE { key, start, end, remove: bool }
    W->>W: addStyle() / removeStyle()\nmerge/clip intervals in style tree
    W->>W: recompute layout
    W->>M: postMessage RENDER_FRAME_DATA
    M->>M: draw() — re-render with new styles
```

---

## File Structure

```
googleDocs/
├── index.html    — Shell: scroll-viewport, hidden interceptor, canvas
├── style.css     — Minimal: viewport + scrollbar + sticky canvas
├── main.js       — UI controller: render loop, input, worker gateway
└── worker.js     — Engine: Piece Table, Style Tree, Layout, Hit Test
```

## Key Design Decisions

| Decision | Rationale |
|---|---|
| **Piece Table** over array buffer | O(log N) insert/delete; undo snapshots are cheap (just copy the piece list, not the text) |
| **Web Worker** for layout | Layout is CPU-intensive (measure every glyph); running it off the main thread keeps the render loop at 60 FPS |
| **OffscreenCanvas** in worker | Gives the worker real `measureText()` so hit-test and cursor pixel positions are exact — consistent with the main thread renderer |
| **Hidden `<textarea>` interceptor** | Canvas has no native text input; the textarea holds focus and captures IME, paste, and all key events without us re-implementing the browser's keyboard handling |
| **Sticky canvas + tall container** | The canvas `position:sticky` always fills the viewport; a tall `#canvas-container` drives the native scrollbar so we get free scroll physics |
| **`e.preventDefault()` on mousedown** | Without this the browser moves focus from the textarea to the canvas on every click, breaking subsequent typing |
