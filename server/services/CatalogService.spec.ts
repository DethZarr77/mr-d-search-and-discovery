import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { IEnrichmentProvider } from '../providers/EnrichmentProvider';
import type { CatalogRepository } from '../repositories/CatalogRepository';
import type {
	CatalogItem,
	CatalogItemInfo,
	CatalogRequestQueryParams,
	MergedCatalogItem
} from '../../shared/types';
import { CatalogService } from './CatalogService';

const ITEMS: CatalogItem[] = [
	catalogItem({ id: '1', name: 'Wireless Headphones', category: 'Electronics' }),
	catalogItem({ id: '2', name: 'Water Bottle', category: 'Kitchen' }),
	catalogItem({ id: '3', name: 'Yoga Mat', category: 'Sports' }),
	catalogItem({ id: '4', name: 'Desk Lamp', category: 'Office' }),
	catalogItem({ id: '5', name: 'Trail Running Shoes', category: 'Sports' })
];

const ENRICHMENT_BY_ID = new Map<string, CatalogItemInfo>([
	['1', catalogItemInfo({ id: '1', popularity: 80, price: 100 })],
	['2', catalogItemInfo({ id: '2', popularity: 50, price: 200 })],
	['3', catalogItemInfo({ id: '3', popularity: 90, price: 50 })],
	['4', catalogItemInfo({ id: '4', popularity: 40, price: 85 })],
	['5', catalogItemInfo({ id: '5', popularity: 71, price: 129 })]
]);

function catalogItem(
	overrides: Partial<CatalogItem> & Pick<CatalogItem, 'id' | 'name' | 'category'>
): CatalogItem {
	return {
		description: 'A catalog item',
		image: 'https://example.com/image.png',
		...overrides
	};
}

function catalogItemInfo(
	overrides: Partial<CatalogItemInfo> & Pick<CatalogItemInfo, 'id'>
): CatalogItemInfo {
	return {
		availability: 'In Stock',
		delivery_estimate: '1-3 days',
		popularity: 50,
		price: 20,
		...overrides
	};
}

function params(overrides: Partial<CatalogRequestQueryParams> = {}): CatalogRequestQueryParams {
	return {
		filter: null,
		search_query: null,
		sort_by: 'popularity',
		sort_order: null,
		...overrides
	};
}

function itemIds(items: MergedCatalogItem[]): string[] {
	return items.map((item) => item.id);
}

describe('CatalogService', () => {
	let findAll: ReturnType<typeof vi.fn>;
	let getEnrichmentData: ReturnType<typeof vi.fn<IEnrichmentProvider['getEnrichmentData']>>;
	let service: CatalogService;

	beforeEach(() => {
		findAll = vi.fn().mockResolvedValue(ITEMS);
		getEnrichmentData = vi.fn<IEnrichmentProvider['getEnrichmentData']>(async (ids) => {
			const enrichment = new Map<string, CatalogItemInfo>();

			for (const id of ids) {
				const info = ENRICHMENT_BY_ID.get(id);
				if (info) {
					enrichment.set(id, info);
				}
			}

			return enrichment;
		});

		const catalogRepository = { findAll } as unknown as CatalogRepository;
		const enrichmentProvider: IEnrichmentProvider = { getEnrichmentData };

		service = new CatalogService(catalogRepository, enrichmentProvider);
	});

	describe('search and filter before enrichment', () => {
		it('requests enrichment only for items matching a name search', async () => {
			await service.listCatalogItems(params({ search_query: 'mat' }));

			expect(getEnrichmentData).toHaveBeenCalledOnce();
			expect(getEnrichmentData).toHaveBeenCalledWith(['3']);
		});

		it('requests enrichment only for items matching a category search', async () => {
			await service.listCatalogItems(params({ search_query: 'sports' }));

			expect(getEnrichmentData).toHaveBeenCalledOnce();
			expect(getEnrichmentData).toHaveBeenCalledWith(['3', '5']);
		});

		it('requests enrichment only for items matching an exact category filter', async () => {
			await service.listCatalogItems(
				params({
					filter: { filter_by: 'category', filter_value: 'Sports' }
				})
			);

			expect(getEnrichmentData).toHaveBeenCalledOnce();
			expect(getEnrichmentData).toHaveBeenCalledWith(['3', '5']);
		});

		it('applies search and filter together before calling the enrichment provider', async () => {
			await service.listCatalogItems(
				params({
					search_query: 'yoga',
					filter: { filter_by: 'category', filter_value: 'Sports' }
				})
			);

			expect(getEnrichmentData).toHaveBeenCalledOnce();
			expect(getEnrichmentData).toHaveBeenCalledWith(['3']);
		});

		it('does not partial-match category filters', async () => {
			await service.listCatalogItems(
				params({
					filter: { filter_by: 'category', filter_value: 'Sport' }
				})
			);

			expect(getEnrichmentData).toHaveBeenCalledOnce();
			expect(getEnrichmentData).toHaveBeenCalledWith([]);
		});

		it('requests enrichment for every item when search and filter are omitted', async () => {
			await service.listCatalogItems(params());

			expect(getEnrichmentData).toHaveBeenCalledOnce();
			expect(getEnrichmentData).toHaveBeenCalledWith(['1', '2', '3', '4', '5']);
		});
	});

	describe('enrichment failure', () => {
		it('still returns matched items and populates enrichment status', async () => {
			const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
			const consoleLog = vi.spyOn(console, 'log').mockImplementation(() => {});
			getEnrichmentData.mockRejectedValue(new Error('Request failed'));

			const result = await service.listCatalogItems(params({ search_query: 'mat' }));

			expect(itemIds(result.items)).toEqual(['3']);
			expect(result.items[0]?.extra_info).toBeNull();
			expect(result.enrichment).toEqual({
				message: 'Failed to get extra data',
				status: 'failed'
			});

			consoleError.mockRestore();
			consoleLog.mockRestore();
		});
	});

	describe('sort defaulting', () => {
		it('defaults sort order to descending popularity when sort_order is omitted', async () => {
			const result = await service.listCatalogItems(
				params({
					sort_by: 'popularity',
					sort_order: null
				})
			);

			expect(itemIds(result.items)).toEqual(['3', '1', '5', '2', '4']);
		});

		it('sorts by price ascending when requested', async () => {
			const result = await service.listCatalogItems(
				params({
					sort_by: 'price',
					sort_order: 'asc'
				})
			);

			expect(itemIds(result.items)).toEqual(['3', '4', '1', '5', '2']);
		});

		it('sorts by price descending when requested', async () => {
			const result = await service.listCatalogItems(
				params({
					sort_by: 'price',
					sort_order: 'desc'
				})
			);

			expect(itemIds(result.items)).toEqual(['2', '5', '1', '4', '3']);
		});
	});
});
