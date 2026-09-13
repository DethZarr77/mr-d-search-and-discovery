import { IEnrichmentProvider } from '../providers/EnrichmentProvider';
import { CatalogRepository } from '../repositories/CatalogRepository';
import type {
	CatalogFilter,
	CatalogItem,
	CatalogRequestQueryParams,
	CatalogResponse,
	MergedCatalogItem
} from '../../shared/types';

export type ICatalogService = {
	listCatalogItems: (params: CatalogRequestQueryParams) => Promise<CatalogResponse>;
};

export class CatalogService implements ICatalogService {
	private catalogRepository: CatalogRepository;
	private enrichmentProvider: IEnrichmentProvider;

	constructor(catalogRepository: CatalogRepository, enrichmentProvider: IEnrichmentProvider) {
		this.catalogRepository = catalogRepository;
		this.enrichmentProvider = enrichmentProvider;
	}

	async listCatalogItems(params: CatalogRequestQueryParams) {
		const records: CatalogItem[] = await this.catalogRepository.findAll();
		const matchedItems = this.searchAndFilter(records, params);

		const catalogResponse: CatalogResponse = {
			items: matchedItems.map((record) => ({
				...record,
				extra_info: null
			})),
			enrichment: null
		};

		const ids = matchedItems.map((record) => record.id);

		try {
			const enrichmentData = await this.enrichmentProvider.getEnrichmentData(ids);

			catalogResponse.items.forEach((record) => {
				record.extra_info = enrichmentData.get(record.id) ?? null;
			});

			catalogResponse.enrichment = {
				message: 'Got extra data',
				status: 'success'
			};

			catalogResponse.items = this.sortItems(
				catalogResponse.items,
				params.sort_by,
				params.sort_order
			);
		} catch (error) {
			console.error(error);
			console.log('Network died');
			catalogResponse.enrichment = {
				message: 'Failed to get extra data',
				status: 'failed'
			};
		}

		return catalogResponse;
	}

	private searchAndFilter(items: CatalogItem[], params: CatalogRequestQueryParams): CatalogItem[] {
		return items.filter(
			(item) =>
				this.matchesSearch(item, params.search_query) && this.matchesFilter(item, params.filter)
		);
	}

	// Search query `includes` check for name or category
	private matchesSearch(item: CatalogItem, searchQuery: string | null): boolean {
		if (!searchQuery) {
			return true;
		}

		const query = searchQuery.toLowerCase();

		return item.name.toLowerCase().includes(query) || item.category.toLowerCase().includes(query);
	}

	// Filter check for category
	private matchesFilter(item: CatalogItem, filter: CatalogFilter | null): boolean {
		if (!filter) {
			return true;
		}

		if (filter.filter_by === 'category') {
			return item.category.toLowerCase() === filter.filter_value.toLowerCase();
		}

		return true;
	}

	// Bubble sort by popularity or price
	private sortItems(
		items: MergedCatalogItem[],
		sortBy: 'popularity' | 'price',
		sortOrder: 'asc' | 'desc' | null
	): MergedCatalogItem[] {
		// If no sort order is provided, default to `desc`
		const direction = sortOrder ?? 'desc';

		// If sort order is `asc`, multiply by 1, otherwise multiply by -1
		const multiplier = direction === 'asc' ? 1 : -1;

		return [...items].sort((a, b) => {
			const aValue = a.extra_info?.[sortBy];
			const bValue = b.extra_info?.[sortBy];

			if (aValue == null && bValue == null) {
				return 0;
			}
			if (aValue == null) {
				return 1;
			}
			if (bValue == null) {
				return -1;
			}

			return (aValue - bValue) * multiplier;
		});
	}
}
