import { CatalogItem } from '../types';

export class CatalogRepository {
	constructor() {
		if (new.target === CatalogRepository) {
			throw new Error('CatalogRepository is an abstract class and cannot be instantiated directly');
		}
	}

	async findAll(): Promise<CatalogItem[]> {
		throw new Error('findAll() not implemented');
	}
}
