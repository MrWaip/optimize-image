<script lang="ts">
	import Source from '../images/source.png';
	import Image from '../images/source.png?optimized';
	import Picture from './Picture.svelte';
</script>

<div class="container">
	<div>
		<Picture src={Source} />

		<div>
			Original
		</div>
	</div>

	<div>
		<Picture src={Image} />

		<div>
			Optimized
		</div>
	</div>
</div>

<style>
	.container {
		display: flex;
		gap: 1rem;
	}
</style>
