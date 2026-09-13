#### System Diagram

[System diagram v1.3](./docs/diagrams/System%20diagram%20v1.3.png)

---

## Frontend

#### Architecture

SvelteKit + Tailwind — thin client over the catalog API, shared types from `shared/types`.

- Search / category / sort controls → build query params → `GET /catalog` → render table
- Runes (`$state`) for form state, loading, results, and enrichment status
- `CatalogResults` + `StatusBanner` + `LoadingSkeleton` as components
- Client fetch via Vite proxy `/catalog`

#### Decisions / notes

1. Explicit "Get Results" button rather than live search — keeps enrichment latency (1–4s) under user control
2. Search submit syncs state to URL via goto
3. Refresh syncs URL to page state. No params = don't search, params = fetch items
4. Shared contract via `shared/types` so FE types stay aligned with `CatalogResponse` / `MergedCatalogItem`
5. Categories hardcoded for now (All + known set); ideally a `GET /categories` lookup as noted in backend decision 6
6. Enrichment status surfaced in the UI (`StatusBanner`); table `extra_info` nulls shown as `—` when enrichment fails
7. URL `goto` with `replaceState`/`keepFocus`/`noScroll` so query sync doesn't spam history or jump scroll
8. Sticky table header + scrollable results pane so controls stay put while browsing
9. Responsive results pane — `min-w-0` + overflow ensures table scrolls inside middle row
10. Radio values stay API strings, labels capitalized for display
11. UI default sort is `price` / `asc` (control initial state). The page always sends `sort_by` and `sort_order`, so API defaults (`popularity` / `desc`) only apply to direct API calls that omit those params

---

## Backend

#### Architecture

Layered architecture on the backend — separation of concerns, unit-testable.

[layered-architecture-in-nodejs-and-express](https://codearchitecture.in/stories/layered-architecture-in-nodejs-and-express-class-based-design-dependency-injection-and-best-practices)

- Routes → Controllers → Services → Repositories
- Providers (e.g. enrichment) sit beside services as dependencies, not as HTTP peers
- Layered structure adapted from article (CommonJS examples converted to ESM/TS for this repo)
- `CatalogContainer` wires repo + enrichment provider into the service
- Shared API types live in `shared/types` so frontend and backend use one contract

#### Decisions / notes

1. Searching & filtering done before the enrichment-provider call (CatalogItem filtering) so fewer results are enriched. Then after enrichment call, we sort (CatalogItemInfo field sort)
2. Enrichment simulation: 1-4s delay, failure 1/3 times. Should enrichment fail, still return catalog items with per-item `extra_info: null`, surface `enrichment` status on the response, and fall back to sorting by `name` using the requested `sort_order` (default `desc`)
3. Searching done against `CatalogItem.name` and `CatalogItem.category`, partial strings accepted
4. No search query / no filter = return all items
5. Filter is optional and not required on every request
6. Category filter is 1:1, no partial string matching (exact match, case-insensitive on the value). `filter_by` must be the literal `category`. In FE I would derive categories from the catalog, not from the filtered result list. Usually this would be a lookup table fetch (`GET /categories`)
7. Encountered a case sensitivity bug with queryParams. E.g. `sort_by=Price` defaulted to `popularity`. Added checks for if the param is a string, then lowercased `sort_by`, `sort_order`, and `search_query`. `filter_by` still expects the exact value `category` (not case-normalized)
8. Manual CORS middleware for the Vite origin so the browser can call Express on another port
9. When `sort_by` / `sort_order` are omitted, API defaults are `popularity` and `desc` (via `sort_order: null` treated as `desc` in the service). The FE UI uses different control defaults — see frontend decision 11

---

## AI Assistance

I used AI for the following items:

#### Implementation (with my rules / constraints)

1. Converting layered-architecture article examples from CommonJS to ESM/TypeScript for this repo’s structure
2. Expanding `catalog-items.json` / `catalog-item-info.json` to 40 matching records from the existing shapes
3. Implementing backend search, filter, and sort in `CatalogController` + `CatalogService` (I specified the rules from this doc; do not change architecture; keep `EnrichmentProvider` as-is)
4. Tightening case-insensitive `sort_by` parsing after I hit `sort_by=Price` defaulting to popularity (narrow Express query types, then lowercase)
5. Backend Vitest specs for core behaviour: search/filter reducing the set before enrichment (mock provider + expected ids), enrichment failure still returning items with status populated, and sort defaulting / query param parsing — plus wiring tests into the existing `server` Vitest project
6. Frontend holy-grail layout so the page fills the viewport, the table overflows/scrolls, and headers stay sticky

#### Questions / explanations (no greenfield design hand-off)

7. Whether `Router()` should be created once globally vs per feature router factory
8. File naming mix (`catalog.service.ts` vs `catalogRepository.ts`) vs the layered-architecture guide
9. Whether a concrete catalog-item model class is needed for `FileCatalogRepository` (answer: type + JSON is enough)
10. How to resolve the catalog data file path under ESM (`import.meta.dirname` vs `__dirname` / cwd-relative paths)
11. Why `parseFilter` checks flat, bracket, and nested query shapes — how Express query parsing works

#### Docs

12. Reviewing this file against the implementation, correcting gaps, and reorganizing Architecture vs Decisions / notes

#### Transcripts

Session transcripts for the items above (and related Q&A):

- [Catalog item expansion](./docs/transcripts/catalog_item_expansion.md) — #2
- [Catalog item search and filter](./docs/transcripts/catalog_item_search_and_filter.md) — #3
- [Unit tests for CatalogService](./docs/transcripts/unit_tests_for_catalogservice.md) — #5
- [Holy grail layout with overflow](./docs/transcripts/holy_grail_layout_with_overflow.md) — #6
- [Router instance usage](./docs/transcripts/router_instance_usage.md) — #7
- [Naming convention distinction](./docs/transcripts/naming_convention_distinction.md) — #8
- [Catalog item model class](./docs/transcripts/catalog_item_model_class.md) — #9
- [Data file path import](./docs/transcripts/data_file_path_import.md) — #10
- [Sort by field comparison](./docs/transcripts/sort_by_field_comparison.md) — related to sort / enrichment-fail fallback
- [Codebase implementation review](./docs/transcripts/codebase_implementation_review.md) — #12
