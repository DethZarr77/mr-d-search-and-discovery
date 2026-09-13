<script lang="ts">
	import LoadingSkeleton from './LoadingSkeleton.svelte';

	let { loading, results, hasFetched, globalErrorMessage } = $props();
</script>

{#if loading}
	<LoadingSkeleton />
{:else if results.length > 0}
	<div class="h-full min-h-0 min-w-0 overflow-auto">
		<table id="results" class="w-full min-w-160 border-separate border-spacing-0">
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
						<td class="border-b border-gray-200 p-2"
							>{result.extra_info?.delivery_estimate ?? '—'}</td
						>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
{:else if hasFetched && !globalErrorMessage}
	<div class="rounded-md border border-gray-500 bg-gray-50 px-2 py-1 text-gray-500 text-center flex flex-col items-center justify-center">
		<p class="text-bold text-lg">No results found.</p>
        <p class="text-lg">Please try again with different search criteria.</p>
	</div>
{/if}
