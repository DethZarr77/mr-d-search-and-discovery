import { IEnrichmentProvider } from '../providers/EnrichmentProvider';
import { CatalogRepository } from '../repositories/CatalogRepository';
import type { CatalogItem, CatalogResponse } from '../types';

export type ICatalogService = {
	listCatalogItems: () => Promise<CatalogResponse>;
};

export class CatalogService implements ICatalogService {
	private catalogRepository: CatalogRepository;
	private enrichmentProvider: IEnrichmentProvider;

	constructor(catalogRepository: CatalogRepository, enrichmentProvider: IEnrichmentProvider) {
		this.catalogRepository = catalogRepository;
		this.enrichmentProvider = enrichmentProvider;
	}

	async listCatalogItems() {
		// fetch catalog items
		const records: CatalogItem[] = await this.catalogRepository.findAll();

		const catalogResponse: CatalogResponse = {
			items: [],
			enrichment: null
		};

		// const ids: Set<string> = new Set();
		const ids: string[] = [];

		try {
			records.forEach((record) => {
				// Add id to array (use `Set` here if duplicates are an issue)
				ids.push(record.id);

				// Add record to merged records
				catalogResponse.items.push({
					...record,
					extra_info: null
				});
			});

			// fetch enrichment data using id's from `records`
			const enrichmentData = await this.enrichmentProvider.getEnrichmentData(ids);

			// Add enrichment data to each record
			catalogResponse.items.forEach((record) => {
				record.extra_info = enrichmentData.get(record.id) ?? null;
			});

			// Set enrichment status to success
			catalogResponse.enrichment = {
				message: 'Got enrichment data',
				status: 'success'
			};
		} catch (error) {
			console.error(error);
			console.log('Network died');
			// Set enrichment status to failed
			catalogResponse.enrichment = {
				message: 'Network died',
				status: 'failed'
			};
		}

		return catalogResponse;
	}
}
