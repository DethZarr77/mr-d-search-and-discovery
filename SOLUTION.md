#### System Diagram

[System diagram v1.0](./docs/diagrams/System%20diagram%20v1.0.png)

## Frontend - TBD

## Backend:

#### Architecture

Layered architecture on the backend — separation of concerns, unit-testable. 

[layered-architecture-in-nodejs-and-express](https://codearchitecture.in/stories/layered-architecture-in-nodejs-and-express-class-based-design-dependency-injection-and-best-practices)

- Routes → Controllers → Services → Repositories
- Providers (e.g. enrichment) sit beside services as dependencies, not as HTTP peers
- Layered structure adapted from article, AI assisted converting examples from CommonJS to ESM/TS

#### Decisions

1. Filtering done before the enrichment-provider call (CatalogItem filtering) so fewer results are enriched. Then after enrichment call, we sort (CatalogItemInfo field sort)
2. Should enrichment fail, use fallback order for sorting, still return catalog items
