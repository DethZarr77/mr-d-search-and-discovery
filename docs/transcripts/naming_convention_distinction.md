# Naming convention distinction
_Exported on 9/10/2026 at 17:59:58 GMT+2 from Cursor (3.18.25)_

---

**User**

what's with the naming convention of this repo? I'm using layered architecture as the guide for which classes to create, and the guide says `catalog.service.ts` vs `@server/repositories/catalogRepository.ts ` - why the distinction?

---

**Cursor**

I'll check the repo's naming patterns and any architecture/style guide so I can explain the `catalog.service.ts` vs `catalogRepository.ts` distinction.

The cited guide looks like the source of the mixed names. I’ll pull its file examples so we can compare them to this repo.

There isn’t a meaningful architectural reason for the split. The repo copied two different file-naming styles from the same guide.

Your current files:

| File | Style |
|---|---|
| `catalog.route.ts` | Nest/Angular: `feature.layer.ts` |
| `catalog.controller.ts` | Nest/Angular: `feature.layer.ts` |
| `catalog.service.ts` | Nest/Angular: `feature.layer.ts` |
| `catalogRepository.ts` | class-name: `catalogRepository` |

The [layered architecture article](https://codearchitecture.in/stories/layered-architecture-in-nodejs-and-express-class-based-design-dependency-injection-and-best-practices) does the same thing: `services/category.service.js` next to `repositories/CategoryRepository.js` and `MongoCategoryRepository.js`. That mix got carried into this repo. There is no `@server` alias either — that’s just the `server/` folder.

**What each style is trying to say**

1. **`catalog.service.ts`** — NestJS/Angular: “this is the catalog *service*.” The folder already says the layer; the suffix repeats it. The class inside is still `CatalogService`.

2. **`catalogRepository.ts`** — classic class-file: the file is named after the type it exports (`CatalogRepository`). The article uses that for the repository *contract* vs concrete implementations (`MongoCategoryRepository.js`). That is useful once you have more than one implementation. Right now you only have the abstract class, so the extra distinction doesn’t buy much.

Layers themselves are not the reason for the names. Routes, controllers, and services could equally be `catalogRoute.ts` / `catalogService.ts`, and the repository could equally be `catalog.repository.ts`.

**Pick one and stick with it.** For this codebase, Nest-style is the better fit because three of four files already use it:

```
catalog.route.ts
catalog.controller.ts
catalog.service.ts
catalog.repository.ts          // abstract / default
json-catalog.repository.ts     // later, if you add a concrete impl
```

Class names stay PascalCase either way (`CatalogService`, `CatalogRepository`). Only the filenames need to agree.

