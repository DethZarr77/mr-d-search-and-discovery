#### System Diagram

[System diagram v1.1](./docs/diagrams/System%20diagram%20v1.1.png)

## Frontend - TBD

## Backend:

#### Architecture

Layered architecture on the backend — separation of concerns, unit-testable.

[layered-architecture-in-nodejs-and-express](https://codearchitecture.in/stories/layered-architecture-in-nodejs-and-express-class-based-design-dependency-injection-and-best-practices)

- Routes → Controllers → Services → Repositories
- Providers (e.g. enrichment) sit beside services as dependencies, not as HTTP peers
- Layered structure adapted from article, AI assisted converting examples from CommonJS to ESM/TS
- `CatalogContainer` wires repo + enrichment provider into the service
- Enrichment simulation: 1-4s delay, failure 1/3 times, graceful failure (enrichmentStatus + root `extra_info: null`)
- Encountered a case sensitivity bug with queryParams. E.g. `sort_by=Price` defaulted to `popularity`. Added checks for if the param is a string, then lowercased it to match the searching/sorting checks
- Asked AI to write specific backend tests to verify the 'core' functionality (search + filter before sort, graceful enrichment failure, default query parameter parsing )

#### Decisions

1. Searching & filtering done before the enrichment-provider call (CatalogItem filtering) so fewer results are enriched. Then after enrichment call, we sort (CatalogItemInfo field sort)
2. Should enrichment fail, use fallback order for sorting, still return catalog items
3. Searching done against `CatalogItem.name` and `CatalogItem.category`, partial strings accepted
4. No search query / no filter = return all items.
5. Filter is optional and not required on every request
6. Category filter is 1:1, no partial string matching. In FE I would derive categories from the catalog, not from the filtered result list. Usually this would be a lookup table fetch (GET /categories)
