import { join } from 'node:path';

import { CatalogController } from '../controllers/CatalogController';
import { FileCatalogRepository } from '../repositories/FileCatalogRepository';
import { createCatalogRouter } from '../routes/CatalogRoute';
import { CatalogService } from '../services/CatalogService';

const filePath = join(import.meta.dirname, '../data/catalog-items.json');

const catalogRepository = new FileCatalogRepository(filePath)
const catalogService = new CatalogService(catalogRepository);
const catalogController = new CatalogController(catalogService);
const catalogRouter = createCatalogRouter(catalogController);

export { catalogRouter };