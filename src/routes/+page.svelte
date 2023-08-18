<script lang="ts">
	import Picture from '$lib/Picture.svelte';
	import Source from '../images/source.png';
	import Image from '../images/source.png?optimized';

</script>

<div class="container">
	<div>
		<Picture src={Source} />

		<div>
			Original
		</div>
	</div>

	<div>
		<Image /> 

		
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
