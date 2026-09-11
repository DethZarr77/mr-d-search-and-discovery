import type { Request, Response, NextFunction } from 'express';
import { ICatalogService } from '../services/CatalogService';
import type { CatalogFilter, CatalogRequestQueryParams } from '../types';

export class CatalogController {
	private catalogService: ICatalogService;

	constructor(catalogService: ICatalogService) {
		this.catalogService = catalogService;
		this.listCatalogItems = this.listCatalogItems.bind(this);
	}

	async listCatalogItems(req: Request, res: Response, next: NextFunction) {
		try {
			const params = this.parseQueryParams(req.query);
			const result = await this.catalogService.listCatalogItems(params);
			res.json(result);
		} catch (error) {
			next(error);
		}
	}

	// Parse query params into our clean `CatalogRequestQueryParams` object
	private parseQueryParams(query: Request['query']): CatalogRequestQueryParams {
		const searchRaw = query.search_query;

		// If query string is not empty, trim and keep it, otherwise set to null
		const search_query =
			typeof searchRaw === 'string' && searchRaw.trim() !== ''
				? searchRaw.trim().toLowerCase()
				: null;

		/**
		 * Default `sort_by` to `popularity` if not set.
		 * req.query.sort_by is typed as string | ParsedQs | (string | ParsedQs)[] | undefined
		 * Therefore we need to narrow it down to cater for the lowercase comparison.
		 */
		const sort_by =
			typeof query.sort_by === 'string' && query.sort_by.toLowerCase() === 'price'
				? 'price'
				: 'popularity';

		// keep any sort order if provided, otherwise set `null if not provided. Service will treat null as `desc`.
		const sort_order =
			typeof query.sort_order === 'string' &&
			(query.sort_order.toLowerCase() === 'asc' || query.sort_order.toLowerCase() === 'desc')
				? (query.sort_order.toLowerCase() as 'asc' | 'desc')
				: null;

		return {
			filter: this.parseFilter(query),
			search_query,
			sort_by,
			sort_order
		};
	}

	/**
	 * Parse filter query params into our clean `CatalogFilter` object
	 * Depending on the version of Express, the query params may be nested or not.
	 *
	 * e.g.
	 * `/catalog?filter=category:electronics`
	 * `/catalog?filter[category]=electronics`
	 *
	 * This may be over-engineering, but it's a good example of how to handle different query param formats.
	 *
	 * @param query - The query params from the request
	 * @returns `CatalogFilter` object or `null` if no filter is provided
	 */
	private parseFilter(query: Request['query']): CatalogFilter | null {
		const nested = query.filter;

		// `filter_by` and `filter_value` are the keys in the query params.
		let filterBy: unknown = query.filter_by ?? query['filter[filter_by]'];
		let filterValue: unknown = query.filter_value ?? query['filter[filter_value]'];

		// If the query params are nested, we need to extract the `filter_by` and `filter_value` from the nested object
		if (nested && typeof nested === 'object' && !Array.isArray(nested)) {
			filterBy = nested.filter_by;
			filterValue = nested.filter_value;
		}

		// If the filter_by is `category` and the filter_value is a string and not empty, return the CatalogFilter object
		if (filterBy === 'category' && typeof filterValue === 'string' && filterValue.trim() !== '') {
			return { filter_by: 'category', filter_value: filterValue.trim() } as CatalogFilter;
		}

		// Filter is not `category` or the filter_value is not a string or empty, return null (no filter)
		return null;
	}
}
