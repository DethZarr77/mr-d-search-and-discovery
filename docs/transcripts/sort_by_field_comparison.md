# Sort by field comparison
_Exported on 9/11/2026 at 11:35:12 GMT+2 from Cursor (3.18.25)_

---

**User**

@server/controllers/CatalogController.ts:32 This check needs tightening.
I tested with query params `sort_by=Price` (case sensitive) and that then caused the results to be sorted by popularity ("Price" != "price").
I noticed we can't simply toLowerCase() this field due to it's signature.
What can we do to ensure we're comparing lowercase strings when determining the sort_by field?

---

**Cursor**

I'll inspect the controller and related types so we can compare `sort_by` case-insensitively without fighting the current type signature.

`query.sort_by` isn’t always a string in Express, so I’ll narrow that first, then compare a lowercased value the same way `search_query` is already handled.

Express types `query.sort_by` as more than a string, which is why `toLowerCase()` fails. I’ll narrow it to a string first, then compare the lowercased value.

That comment is heavier than it needs to be. I’ll slim it to match the rest of the file.

The blocker is Express’s query type, not `toLowerCase()` itself.

`req.query.sort_by` is typed as `string | ParsedQs | (string | ParsedQs)[] | undefined`. Calling `.toLowerCase()` on that fails because it might be an object or array. You already handle that for `search_query` with a `typeof === 'string'` guard.

The same pattern works here: narrow first, then compare a lowercase string, then return the union literal (`'price' | 'popularity'`) that `CatalogRequestQueryParams` expects:

```32:35:server/controllers/CatalogController.ts
		const sort_by =
			typeof query.sort_by === 'string' && query.sort_by.toLowerCase() === 'price'
				? 'price'
				: 'popularity';
```

`Price`, `PRICE`, and `price` now all sort by price. Anything else still defaults to popularity.

`sort_order` has the same case-sensitivity gap (`Asc` would fall through to `null` / `desc`) if you want that tightened the same way.

