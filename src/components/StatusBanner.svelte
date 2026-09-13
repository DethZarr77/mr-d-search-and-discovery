<script lang="ts">
	let { globalErrorMessage, enrichmentStatus, loading } = $props();
    
</script>

{#if globalErrorMessage}
	<p class="text-bold rounded-md border border-red-500 bg-red-50 px-2 py-1 text-red-500">
		{globalErrorMessage}
	</p>
{/if}
{#if !loading && enrichmentStatus?.status === 'success'}
	<p class="text-bold rounded-md border border-green-500 bg-green-50 px-2 py-1 text-green-500">
		{enrichmentStatus.message}
	</p>
{:else if enrichmentStatus?.status === 'failed'}
	<p class="text-bold rounded-md border border-red-500 bg-red-50 px-2 py-1 text-red-500">
		Error: {enrichmentStatus.message}
	</p>
{/if}
