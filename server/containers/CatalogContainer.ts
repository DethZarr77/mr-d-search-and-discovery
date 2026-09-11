import { join } from 'node:path';

import { CatalogController } from '../controllers/CatalogController';
import { FileCatalogRepository } from '../repositories/FileCatalogRepository';
import { createCatalogRouter } from '../routes/CatalogRoute';
import { CatalogService } from '../services/CatalogService';
import { EnrichmentProvider } from '../providers/EnrichmentProvider';

// Paths to the catalog and enrichment data files
const catalogFilePath = join(import.meta.dirname, '../data/catalog-items.json');
const enrichmentFilePath = join(import.meta.dirname, '../data/catalog-item-info.json');

const enrichmentProvider = new EnrichmentProvider(enrichmentFilePath);
const catalogRepository = new FileCatalogRepository(catalogFilePath);
const catalogService = new CatalogService(catalogRepository, enrichmentProvider);
const catalogController = new CatalogController(catalogService);
const catalogRouter = createCatalogRouter(catalogController);

export { catalogRouter };
