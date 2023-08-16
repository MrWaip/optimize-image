<script lang="ts">
	import Source from '../images/source.png';
	import Image from '../images/source.png?optimized';
	import Picture from './Picture.svelte';
</script>

<div>
	<Picture src={Image} />

	<Picture src={Source} />
</div>

<style>
	div {
		display: flex;
		width: 900px;
	}
</style>
