import type { Request, Response, NextFunction } from 'express';
import { ICatalogService } from '../services/CatalogService';

export class CatalogController {
	private catalogService: ICatalogService;

	constructor(catalogService: ICatalogService) {
		this.catalogService = catalogService;
		this.listCatalogItems = this.listCatalogItems.bind(this);
	}

	async listCatalogItems(req: Request, res: Response, next: NextFunction) {
		try {
			const result = await this.catalogService.listCatalogItems();
			res.json(result);
		} catch (error) {
			next(error);
		}
	}
}
