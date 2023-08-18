<script lang="ts">
	type OptimizedSrc = {
		avif?: string;
		webp?: string;
		fallback: string;
	};

	export let src: OptimizedSrc | string;

	function getSource(src: OptimizedSrc | string): OptimizedSrc {
		if (typeof src === 'string') {
			return { fallback: src };
		}

		return src;
	}

	$: sources = getSource(src);
</script>

<picture>
	{#if sources.avif}
		<source srcset={sources.avif} type="image/avif" />
	{/if}

	{#if sources.webp}
		<source srcset={sources.webp} type="image/webp" />
	{/if}

	<img src={sources.fallback} alt="" />
</picture>

<style>
	img {
		width: 100%;
		height: 100%;
		object-fit: contain;
	}
</style>