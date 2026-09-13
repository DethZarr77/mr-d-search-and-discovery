# Catalog item model class
_Exported on 9/10/2026 at 18:00:17 GMT+2 from Cursor (3.18.25)_

---

**User**

@server/repositories/FileCatalogRepository.ts:5-11 Do i need a concrete model class for catalog item? 

---

**Cursor**

I'll look at how catalog items are typed and loaded so I can tell you whether a concrete model class is needed.

No. `CatalogItem` as a type is enough.

`CatalogItemModel` is an ORM idea (Mongoose/Sequelize): a class that knows how to query a table. You don’t have a database. The source of truth is `server/data/catalog-items.json`, and the type already describes those plain objects.

A model class would just wrap JSON you already have, with no extra behavior.

Two problems in the constructor:

- `private model: CatalogItem[]` is an array of items
- `CatalogItemModel` would be a class — those are different things

For `FileCatalogRepository`, inject the data source (file path, or a `readFile` function for tests), then parse JSON as `CatalogItem[]`:

```ts
class FileCatalogRepository extends CatalogRepository {
    constructor(private filePath: string) {
        super();
    }

    async findAll(): Promise<CatalogItem[]> {
        const raw = await readFile(this.filePath, 'utf8');
        return JSON.parse(raw) as CatalogItem[];
    }
}
```

Keep domain shape in `types` (`CatalogItem`, `CatalogItemInfo`). The repository’s job is I/O; a model class doesn’t buy you anything until you add a real DB.

