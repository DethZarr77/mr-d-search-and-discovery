# Catalog item expansion
_Exported on 9/10/2026 at 18:01:20 GMT+2 from Cursor (3.18.25)_

---

**User**

@server/data/catalog-items.json:1-16 @server/data/catalog-item-info.json:1-30 Using the shape of these arrays of JSON, please flesh them out so I have 40 items, as well as another 40 'related' catalog-item-info records.

---

**Cursor**

I'll expand both JSON files to 40 matching records, using the current item and info shapes. First I'll check how those files are typed and used so the new data stays consistent.

I'll expand both files to 40 matching records (ids `"1"`–`"40"`), keeping the same fields and using varied categories, prices, stock, and popularity so search, filter, and sort have something to work with.

Both files now have **40 records**, keyed by the same string ids `"1"`–`"40"`.

**`catalog-items.json`** — product cards with `category`, `description`, `id`, `image`, and `name`. Categories are Electronics, Kitchen, Sports, Office, Home, and Outdoor so category filters have something to work with.

**`catalog-item-info.json`** — matching extra info with `availability`, `price`, `popularity`, and `delivery_estimate`. The original four records are unchanged. Across the set: prices from 9.50 to 300, popularity from 21 to 95, mixed delivery windows, and six items out of stock.

Placeholder images are still `https://via.placeholder.com/150`.

