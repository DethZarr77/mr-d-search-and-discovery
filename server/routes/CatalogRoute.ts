import { Router } from 'express';
import type { CatalogController } from '../controllers/CatalogController.ts';

export function createCatalogRouter(catalogController: CatalogController): Router {
	const router = Router();
	router.get('/catalog', catalogController.listCatalogItems);
	return router;
}
