Here is a comprehensive system design diagram blueprint for your spreadsheet engine. It details how the engine decouples computation from the DOM thread, structured around your specified sections.

---

## 1. Requirements/Scope

* **Functional:**
* Support basic numbers and reactive text updates across a $26 \times 100$ cell grid.
* Compute algebraic formulas (`=A1*2 + 10`) and basic array range functions (`SUM`, `AVERAGE`).
* Detect circular dependencies immediately and fallback gracefully to an error state (`#REF!`).


* **Non-Functional:**
* **Performance:** Achieve 60 FPS scrolling and zero frame drops on data evaluation loops.
* **Memory Management:** Prevent memory leaks during high-frequency edits by keeping DOM manipulation minimal.



---

## 2. Tech Stack

| Component | Technology | Rationale |
| --- | --- | --- |
| **UI Presentation Layer** | Native Semantic HTML5 + CSS3 | Provides structured accessibility, layout flexibility, and native scroll behaviors. |
| **UI Orchestration** | Vanilla JavaScript (ES6+) | Direct, lean execution with native $O(1)$ ID lookups via `document.getElementById()`; removes the performance overhead of virtual-DOM diffing. |
| **Formula Engine Layer** | HTML5 Web Workers API | Offloads JavaScript execution to a separate background background worker thread, ensuring the main thread remains responsive. |

---

## 3. Component Architecture

The visual layout below establishes how components are partitioned between threads to isolate synchronous visual mutations from heavy graph parsing:

```
[MAIN THREAD (UI PRESENTATION)]
┌────────────────────────────────────────────────────────┐
│  Formula Bar Container (<section>)                     │
│    ├── Cell Coordinate Indicator (<div>)               │
│    └── Formula Input Text Bar (<input>)                │
└───────────────────────────┬────────────────────────────┘
                            │ (Binds Input Edits)
                            ▼
┌────────────────────────────────────────────────────────┐
│  Workspace Grid Container (Main DOM Tree Window)       │
│    └── Workspace Table Viewport (<table>)               │
│          └── Element Node Matrix (<tr> / <td> Pool)    │
│                └── Inline Text Area Overlay (<textarea>)│
└───────────────────────────▲────────────────────────────┘
                            │
            postMessage()   │   onmessage (cellUpdates)
        ┌───────────────────┴───────────────────┐
        │  UI Controller Gateway (engine.js)     │
        └───────────────────┬───────────────────┘
                            │▲
                            ││ (Thread Boundary Inter-Process Communication)
                            ▼│
        ┌───────────────────────────────────────┐
        │  Background Computation Engine Worker  │
        │  (worker.js)                          │
        └───────────────────────────────────────┘
[BACKGROUND BACKGROUND WORKER THREAD (DATA LOGIC)]

```

### 3.a. Component Hierarchy

* **Application Boundary Wrapper**
* `Formula Bar Editor` (Active Selection display, Raw Input String Collector).
* `Grid Table Viewport Canvas` (Scroll Container, Column/Row Sticky Header elements, Cell Grid Array).
* `Active Node Focus Cell` (Selected state overlay, Textarea Inline Text Editor Node injected upon double-click events).





### 3.b. Dependency Diagram

The lifecycle graph below illustrates the precise processing direction when a user modifies an evaluation target:

```
[User Input Trigger]
        │
        ▼
[engine.js: sendCellEdit()] ──(postMessage)──► [worker.js: onmessage]
                                                    │
                                                    ▼
                                            [parseDependencies()]
                                                    │
                                                    ▼
                                            [checkCycle() DFS]
                                             ├── YES ──► [Flag #REF! Error State]
                                             └── NO  ──► [Rebuild DAG Edge Matrix]
                                                                │
                                                                ▼
                                                       [getTopologicalOrder()]
                                                                │
                                                                ▼
                                                       [evaluateFormula()]
                                                                │
                                                                ▼
[engine.js: Point-Targeted DOM Patch] ◄──(postMessage)── [Compile Update Payload]

```

---

## 4. Data Models & API Contracts

### 4.a. Data Model

The in-memory JavaScript cache representation matches this layout structure inside the worker thread:

```json
{
  "cells": {
    "A1": { "raw": "10", "computed": 10, "error": null },
    "B1": { "raw": "=A1*2", "computed": 20, "error": null },
    "C1": { "raw": "=SUM(A1:B1)", "computed": 30, "error": "#REF!" }
  },
  "directDependencies": {
    "B1": ["A1"],
    "C1": ["A1", "B1"]
  },
  "edges": {
    "A1": ["B1", "C1"],
    "B1": ["C1"]
  }
}

```

### 4.b. Component API Contract (Worker Gateway Messages)

#### 1. Mutation Payload (Main Thread $\rightarrow$ Background Worker)

```json
{
  "type": "editCell",
  "payload": {
    "cellId": "B1",
    "rawValue": "=A1*5"
  }
}

```

#### 2. Evaluation Graph Result (Background Worker $\rightarrow$ Main Thread)

```json
{
  "type": "cellUpdates",
  "payload": {
    "updates": [
      { "cellId": "B1", "computed": 50, "error": null },
      { "cellId": "C1", "computed": 60, "error": null }
    ]
  }
}

```

---

## 5. Optimizations & Performance

* **$O(1)$ Point-Targeted DOM Patching with Memory Safety:** Rather than querying elements via heavy selector traversals or caching DOM references in memory, the engine queries cells directly by their unique ID (e.g., `document.getElementById('cell-' + cellId)`). This allows V8 to modify cell text content atomically while preventing detached DOM memory leaks during grid resizing, row/column deletions, or resets.
* **Layout Batching:** UI selection transitions and render updates run inside a `requestAnimationFrame` context, batching visual changes to align with the screen's layout refresh cycles.
* **Memory Footprint Staging:** Complex range regex extractions, token parsing, and topological array sorting run on a separate CPU thread, completely removing heavy data parsing from the UI layer.

---

## 6. Accessibility (a11y)

* **Keyboard Navigation Grid Interceptor:** Includes explicit listener overrides for `ArrowUp`, `ArrowDown`, `ArrowLeft`, `ArrowRight`, `Tab`, and `Enter` key combinations to manage user focus programmatically across the grid coordinates.
* **Semantic Elements:** Employs explicit structural elements (`<table>`, `<th>`, `<td>`) alongside assistive tags like `aria-label="Formula Editor"` and `aria-hidden="true"`, ensuring screen readers can correctly announce the layout structure.

---

## 7. Adaptability

* **Configurable Grid Boundaries:** The structural layout is defined by explicit constants (`COLUMNS = 26`, `ROWS = 100`). This ensures the viewport can scale easily if dimensions are increased or configuration settings change.
* **Abstracted Formula Parsing:** The mathematical evaluation is decoupled from the spreadsheet grid layer. This modular design makes it easy to replace the current evaluation logic with an Abstract Syntax Tree (AST) token parser or expand the engine's built-in formula library without changing how the user interface operates.