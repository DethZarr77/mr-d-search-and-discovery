# Router instance usage
_Exported on 9/10/2026 at 17:59:21 GMT+2 from Cursor (3.18.25)_

---

**User**

@server/routes/catalog.route.ts:5 Is it necessary to call this Router() function here? doesn't that return an instance?
Surely we create this once somewhere else, then just re-use that instance?

---

**Cursor**

I'll look at how `Router()` is used in this file and how the rest of the server wires routes, so I can answer whether this instance should be created once and reused.

Yes — `Router()` returns a **new** instance every time. That is the intended use, not a leftover you should hoist.

`express()` in `server/index.ts` is the one app you create once. `Router()` is a factory for **mini-apps**: each one has its own routing table. You create one per feature, attach routes, then mount it on the app:

```ts
const catalogRouter = createCatalogRouter(catalogController);
app.use(catalogRouter);
```

You only call `createCatalogRouter` once at bootstrap. After that you reuse **that** returned instance, not a global `Router()`.

A shared singleton router imported by every route file would work, but it is worse: all routes share one table, mount prefixes like `app.use('/api', catalogRouter)` stop being useful, and tests cannot inject a controller without also mutating global route state. The factory exists so `CatalogController` can be passed in instead of imported as a module singleton.

You could skip `Router()` entirely and do `app.get('/catalog', ...)` on the main app. `Router()` is for splitting routes by domain, not for sharing one object. Calling it here is correct.

