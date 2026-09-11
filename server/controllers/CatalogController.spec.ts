import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { NextFunction, Request, Response } from 'express';
import type { ICatalogService } from '../services/CatalogService';
import type { CatalogRequestQueryParams, CatalogResponse } from '../types';
import { CatalogController } from './CatalogController';

const emptyResponse: CatalogResponse = {
	enrichment: null,
	items: []
};

describe('CatalogController', () => {
	let listCatalogItems: ReturnType<typeof vi.fn<ICatalogService['listCatalogItems']>>;
	let controller: CatalogController;
	let res: Response;
	let next: NextFunction;

	beforeEach(() => {
		listCatalogItems = vi
			.fn<ICatalogService['listCatalogItems']>()
			.mockResolvedValue(emptyResponse);
		const catalogService: ICatalogService = { listCatalogItems };
		controller = new CatalogController(catalogService);
		res = { json: vi.fn() } as unknown as Response;
		next = vi.fn();
	});

	async function parseQuery(query: Request['query']): Promise<CatalogRequestQueryParams> {
		await controller.listCatalogItems({ query } as Request, res, next);
		expect(listCatalogItems).toHaveBeenCalledOnce();
		return listCatalogItems.mock.calls[0][0] as CatalogRequestQueryParams;
	}

	describe('query param parsing', () => {
		it('defaults sort_by to popularity and sort_order to null when omitted', async () => {
			const params = await parseQuery({});

			expect(params).toEqual({
				filter: null,
				search_query: null,
				sort_by: 'popularity',
				sort_order: null
			});
		});

		it('parses sort_by=price case-insensitively', async () => {
			const params = await parseQuery({ sort_by: 'Price' });

			expect(params.sort_by).toBe('price');
		});

		it('falls back to popularity for an unrecognised sort_by', async () => {
			const params = await parseQuery({ sort_by: 'name' });

			expect(params.sort_by).toBe('popularity');
		});

		it('parses sort_order case-insensitively', async () => {
			const asc = await parseQuery({ sort_order: 'ASC' });
			expect(asc.sort_order).toBe('asc');

			listCatalogItems.mockClear();

			const desc = await parseQuery({ sort_order: 'DESC' });
			expect(desc.sort_order).toBe('desc');
		});

		it('treats an invalid sort_order as omitted', async () => {
			const params = await parseQuery({ sort_order: 'up' });

			expect(params.sort_order).toBeNull();
		});

		it('trims and lowercases search_query', async () => {
			const params = await parseQuery({ search_query: '  Mat  ' });

			expect(params.search_query).toBe('mat');
		});

		it('treats a blank search_query as omitted', async () => {
			const params = await parseQuery({ search_query: '   ' });

			expect(params.search_query).toBeNull();
		});

		it('parses flat category filter params', async () => {
			const params = await parseQuery({
				filter_by: 'category',
				filter_value: '  Sports  '
			});

			expect(params.filter).toEqual({
				filter_by: 'category',
				filter_value: 'Sports'
			});
		});

		it('parses nested filter query objects', async () => {
			const params = await parseQuery({
				filter: {
					filter_by: 'category',
					filter_value: 'Kitchen'
				}
			});

			expect(params.filter).toEqual({
				filter_by: 'category',
				filter_value: 'Kitchen'
			});
		});

		it('parses bracket-style filter keys', async () => {
			const params = await parseQuery({
				'filter[filter_by]': 'category',
				'filter[filter_value]': 'Office'
			});

			expect(params.filter).toEqual({
				filter_by: 'category',
				filter_value: 'Office'
			});
		});

		it('ignores filters that are not category or have an empty value', async () => {
			const unknownField = await parseQuery({
				filter_by: 'price',
				filter_value: '100'
			});
			expect(unknownField.filter).toBeNull();

			listCatalogItems.mockClear();

			const emptyValue = await parseQuery({
				filter_by: 'category',
				filter_value: '   '
			});
			expect(emptyValue.filter).toBeNull();
		});
	});
});
