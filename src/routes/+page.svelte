<script lang="ts">
	import Picture from '$lib/Picture.svelte';
	import Source from '../images/source1.png';
	import Image from '../images/source1.png?optimized';
	import JPEG from '../images/big-jpeg.jpg?optimized';
</script>

<div class="container">
	<JPEG />
</div>

<style>
	.container {
		display: flex;
		gap: 1rem;
	}
</style>
