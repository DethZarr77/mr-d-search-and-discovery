## Search and Discovery

This is a simple full stack app that simulates the retrieval of, and display of Product Data.
It aims to simulate a SvelteKit frontend querying and consuming data from a Node.js Express backend.

### Running the project

1. Install dependencies with `pnpm install`
2. Start the express server (separate terminal):

```sh

# Express default port 3000
pnpm run server
```

3. Keep the API running, then start the dev server in a new terminal session:

```sh

# Svelte default port 5173
pnpm run dev

```

### Other scripts

1. Create a build for this project:

```sh
pnpm run build
```

2. Run tests for this project:

```sh
# Run tests in general (just unit at this stage)
pnpm run test

# Run unit tests
pnpm run test:unit
```

### Catalog API request examples

GET Catalog Items (all):
URL: http://localhost:3000/catalog

GET Catalog Items — free text search (`name` + `category`):
URL: http://localhost:3000/catalog?search_query=mat

GET Catalog Items — filtered by Category = `Sports`:
URL: http://localhost:3000/catalog?filter_by=category&filter_value=Sports

GET Catalog Items — sorted by Price ascending:
URL: http://localhost:3000/catalog?sort_by=price&sort_order=asc

GET Catalog Items — sorted by Popularity descending (default sort field / order when omitted):
URL: http://localhost:3000/catalog?sort_by=popularity&sort_order=desc

GET Catalog Items — filtered by Category = `Sports`, sorted by Price ascending:
URL: http://localhost:3000/catalog?filter_by=category&filter_value=Sports&sort_by=price&sort_order=asc

GET Catalog Items — search + filter + sort:
URL: http://localhost:3000/catalog?search_query=mat&filter_by=category&filter_value=Sports&sort_by=price&sort_order=asc
