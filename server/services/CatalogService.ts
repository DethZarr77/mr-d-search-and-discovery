import { CatalogRepository } from "../repositories/CatalogRepository";
import type { CatalogItem, CatalogResponse } from "../types";


export type ICatalogService = {
	listCatalogItems: () => Promise<CatalogResponse>;
};

export class CatalogService implements ICatalogService {
    private catalogRepository: CatalogRepository;

    constructor(catalogRepository: CatalogRepository){
        this.catalogRepository = catalogRepository;
    }

    async listCatalogItems(){
        // fetch catalog items
        const records: CatalogItem[] = await this.catalogRepository.findAll();

        // fetch enrichment data using id's from `records`

        // if fetch succeeds, map over each enrichment record, find corresponding catalog item, add properties to `extra_info`
        
        // return collated object (casting is interim)
        return { items: records, enrichment: null } as CatalogResponse;
    }
}