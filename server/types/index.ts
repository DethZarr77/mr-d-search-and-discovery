// Single item
type CatalogItem = {
    category: string;
    description: string;
    id: string;
    image: string;
    name: string;
};

// Extra info for single item
type CatalogItemInfo = {
    availability: string;
    delivery_estimate: string;
    id: string;
    popularity: number;
    price: number;
};

// Merged item with extra info
type MergedCatalogItem = CatalogItem & {
    extra_info: CatalogItemInfo | null 
}

// Simple status object for enrichment call status
type EnrichmentStatus = {
    message: string | null,
    status: 'failed' | 'success',
}

// Response object for catalog endpoint
type CatalogResponse = {
    enrichment: EnrichmentStatus,
    items: MergedCatalogItem[],
}

// Filter object for catalog endpoint
type CatalogFilter = {
    filter_by: 'category';
    filter_value: string;
}

// Query params for catalog endpoint
type CatalogRequestQueryParams = {
    filter: CatalogFilter;
    search_query: string | null;
    sort_by: 'popularity' | 'price';
    sort_order: 'asc' | 'desc' | null;
}

export type { 
    CatalogFilter,
    CatalogItem, 
    CatalogItemInfo, 
    CatalogRequestQueryParams,
    CatalogResponse,
    EnrichmentStatus,  
    MergedCatalogItem,
};