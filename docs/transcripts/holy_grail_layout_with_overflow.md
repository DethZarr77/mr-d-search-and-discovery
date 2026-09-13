# Holy grail layout with overflow
_Exported on 9/11/2026 at 15:20:35 GMT+2 from Cursor (3.18.25)_

---

**User**

Implement a version of the holy grail layout so that the page grows to as much as it can, and the table overflows, with sticky headers

---

**Cursor**

I'll inspect the current page, layout, and styles so the holy grail layout can fill the viewport and keep the table overflowing with sticky headers.

The layout will fill the viewport with a header/main/footer grid, and the table will scroll in the remaining space with a sticky header.

I'll verify the layout fills the viewport and that the table scrolls under a sticky header, using a headless browser since no in-editor browser tools are available.

The catalog now uses a **holy grail layout**: the page fills the viewport, and only the table scrolls.

- **Shell:** the app is locked to the viewport height (`h-dvh`), so the document itself does not grow.
- **Grid:** header (search/filters) and footer (result count) stay put; the middle row uses `minmax(0, 1fr)` so it takes all leftover space.
- **Table:** that middle pane is the overflow container. Column headers are `sticky` with a white background so they stay visible while rows scroll underneath.

Load results and you should see the filters and “Results: N” stay on screen while the table body scrolls.

