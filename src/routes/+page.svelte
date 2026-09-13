<script lang="ts">
	import type { CatalogResponse, EnrichmentStatus, MergedCatalogItem } from '../../shared/types';
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { SvelteURLSearchParams } from 'svelte/reactivity';
	import LoadingSkeleton from '../components/LoadingSkeleton.svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';

	// Options
	const categories = ['All', 'Electronics', 'Kitchen', 'Sports', 'Books', 'Clothing', 'Other'];
	const sortBy = ['price', 'popularity'];
	const sortOrder = ['asc', 'desc'];

	// State
	let searchString = $state('');
	let sortByField = $state(sortBy[0]);
	let sortOrderField = $state(sortOrder[0]);
	let categoryField = $state(categories[0]);
	let loading = $state(false);
	let hasFetched = $state(false);
	let results = $state<MergedCatalogItem[]>([]);
	let enrichmentStatus = $state<EnrichmentStatus | null>(null);
	let globalErrorMessage = $state<string | null>(null);

	// Sync state from URL on mount (once-off)
	onMount(() => {
		const urlParams = page.url.searchParams;
		let hasSearchParams = false;

		if (urlParams.has('search_query')) {
			hasSearchParams = true;
			searchString = urlParams.get('search_query') ?? '';
		}
		if (urlParams.has('filter_value')) {
			hasSearchParams = true;
			categoryField = urlParams.get('filter_value') ?? categories[0];
		}
		if (urlParams.has('sort_by')) {
			hasSearchParams = true;
			sortByField = urlParams.get('sort_by') ?? sortBy[0];
		}
		if (urlParams.has('sort_order')) {
			hasSearchParams = true;
			sortOrderField = urlParams.get('sort_order') ?? sortOrder[0];
		}

		if (hasSearchParams) {
			fetchResults();
		}
	});

	const fetchResults = async () => {
		loading = true;
		enrichmentStatus = null;
		globalErrorMessage = null;

		const queryParams = new SvelteURLSearchParams();

		if (searchString.trim() !== '') {
			queryParams.set('search_query', searchString.trim());
		}
		if (categoryField !== categories[0]) {
			queryParams.set('filter_by', 'category');
			queryParams.set('filter_value', categoryField);
		}
		if (sortByField) {
			queryParams.set('sort_by', sortByField);
		}
		if (sortOrderField) {
			queryParams.set('sort_order', sortOrderField);
		}

		await goto(resolve(`/?${queryParams.toString()}`), {
			replaceState: true,
			keepFocus: true,
			noScroll: true
		});

		try {
			// fetch() returns Response (not generic). The JSON body is CatalogResponse.
			const response = await fetch(`/catalog?${queryParams.toString()}`);
			if (!response.ok) {
				throw new Error(`Failed to fetch results (${response.status})`);
			}
			const data: CatalogResponse = await response.json();
			results = data.items;
			enrichmentStatus = data.enrichment;
		} catch (error) {
			console.error(error);
			results = [];
			enrichmentStatus = null;
			globalErrorMessage = error instanceof Error ? error.message : 'Error fetching results';
		} finally {
			hasFetched = true;
			loading = false;
		}
	};

	const clearSearch = () => {
		if (searchString.trim() === '') return;

		searchString = '';
		fetchResults();
	};
</script>

<div class="mx-auto grid h-full max-w-5xl grid-rows-[auto_minmax(0,1fr)_auto] gap-2 p-4">
	<header class="flex flex-col gap-2">
		<h2 class="mb-2 text-2xl font-bold">Product Catalog</h2>
		<div class="flex flex-row gap-2">
			<input
				type="text"
				placeholder="Search"
				bind:value={searchString}
				class="w-full rounded-md border-2 border-gray-300 p-2"
			/>
			<input
				class="rounded-md {loading || !searchString.trim() ? 'bg-gray-300' : 'bg-blue-500'} px-4 py-2 text-white"
				type="button"
				value="Clear"
				disabled={loading || !searchString.trim()}
				onclick={clearSearch}
			/>
		</div>
		<div class="flex flex-row justify-between gap-2">
			<div class="flex items-center gap-2">
				<label for="category"><strong>Category</strong></label>
				<select bind:value={categoryField}>
					{#each categories as category (category)}
						<option value={category}>{category}</option>
					{/each}
				</select>
			</div>
			<div class="flex flex-row items-center gap-1">
				<label for="sort-by"><strong>Sort by: </strong></label>
				{#each sortBy as sortOption (sortOption)}
					<input
						id={`sort-by-${sortOption}`}
						checked={sortByField === sortOption}
						type="radio"
						name="sort-by"
						bind:group={sortByField}
						value={sortOption}
					/>
					<label for={`sort-by-${sortOption}`}>{sortOption}</label>
				{/each}
			</div>
			<div class="flex flex-row items-center gap-1">
				<label for="sort-direction"><strong>Sort direction:</strong></label>
				{#each sortOrder as order (order)}
					<input
						id={`sort-direction-${order}`}
						checked={sortOrderField === order}
						type="radio"
						name="sort-direction"
						bind:group={sortOrderField}
						value={order}
					/>
					<label for={`sort-direction-${order}`}>{order}</label>
				{/each}
			</div>
		</div>
		<div class="flex flex-row justify-between">
			<button
				class="rounded-md  {loading ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-500 cursor-pointer'} px-4 py-2 text-white"
				onclick={fetchResults}
				disabled={loading}>{loading ? 'Loading...' : 'Get Results'}</button
			>
            {#if globalErrorMessage}
                <p class="text-bold rounded-md border border-red-500 bg-red-50 px-2 py-1 text-red-500">
                    {globalErrorMessage}
                </p>
            {/if}
			{#if !loading && enrichmentStatus?.status === 'success'}
				<p
					class="text-bold rounded-md border border-green-500 bg-green-50 px-2 py-1 text-green-500"
				>
					{enrichmentStatus.message}
				</p>
			{:else if enrichmentStatus?.status === 'failed'}
				<p class="text-bold rounded-md border border-red-500 bg-red-50 px-2 py-1 text-red-500">
					Error: {enrichmentStatus.message}
				</p>
			{/if}
		</div>
	</header>

	<div class="min-h-0 overflow-auto overscroll-contain">
		{#if loading}
			<LoadingSkeleton />
		{:else if results.length > 0}
			<table id="results" class="w-full border-separate border-spacing-0">
				<thead class="sticky top-0 z-10">
					<tr>
						<th class="border-b bg-gray-100 p-2 text-left">Name</th>
						<th class="border-b bg-gray-100 p-2 text-left">Category</th>
						<th class="border-b bg-gray-100 p-2 text-left">Price</th>
						<th class="border-b bg-gray-100 p-2 text-left">Popularity</th>
						<th class="border-b bg-gray-100 p-2 text-left">Availability</th>
						<th class="border-b bg-gray-100 p-2 text-left">Delivery Estimate</th>
					</tr>
				</thead>
				<tbody>
					{#each results as result (result.id)}
						<tr>
							<td class="border-b border-gray-200 p-2">{result.name}</td>
							<td class="border-b border-gray-200 p-2">{result.category}</td>
							<td class="border-b border-gray-200 p-2">{result.extra_info?.price ?? '—'}</td>
							<td class="border-b border-gray-200 p-2">{result.extra_info?.popularity ?? '—'}</td>
							<td class="border-b border-gray-200 p-2">{result.extra_info?.availability ?? '—'}</td>
							<td class="border-b border-gray-200 p-2">{result.extra_info?.delivery_estimate ?? '—'}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		{:else if hasFetched && !globalErrorMessage}
			<p class="rounded-md border border-gray-500 bg-gray-50 px-2 py-1 text-gray-500">
				No results found
			</p>
		{/if}
	</div>
	<footer>
		{#if !loading && results.length > 0}
			<p>Results: {results.length}</p>
		{/if}
	</footer>
</div>
