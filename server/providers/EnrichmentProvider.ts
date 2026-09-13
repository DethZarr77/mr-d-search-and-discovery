import { promises } from 'fs';
import type { CatalogItemInfo } from '../../shared/types';

/**
 * @returns Random delay in milliseconds between 1000 and 4000 (1 to 4 seconds)
 */
const getRandomTime = () => {
	return Math.floor(Math.random() * 3000) + 1000;
};

const simulateFlakyNetwork = () => {
	return new Promise((fulfill, reject) => {
		setTimeout(() => {
			// Network request dies a third of the time
			if (Math.random() < 0.3) {
				reject(new Error('Request failed'));
			}
			fulfill(1);
		}, getRandomTime());
	});
};

export type IEnrichmentProvider = {
	getEnrichmentData: (ids: string[]) => Promise<Map<string, CatalogItemInfo>>;
};

export class EnrichmentProvider implements IEnrichmentProvider {
	private filePath: string;

	constructor(filePath: string) {
		this.filePath = filePath;
	}

	async getEnrichmentData(ids: string[]): Promise<Map<string, CatalogItemInfo>> {
		console.log('Attempting to get enrichment data');
		await simulateFlakyNetwork();
		console.log('Network was fine');

		const items = await promises.readFile(this.filePath, 'utf-8');
		const parsedItems = JSON.parse(items) as CatalogItemInfo[];

		const enrichmentMap = new Map<string, CatalogItemInfo>();
		parsedItems.forEach((item) => {
			if (ids.includes(item.id)) {
				enrichmentMap.set(item.id, item);
			}
		});

		return enrichmentMap;
	}
}
