<script lang="ts">
	import Picture from '$lib/Picture.svelte';
	import Source from '../images/source1.png';
	import Image from '../images/source1.png?optimized';
	import JpegImg from '../images/big-jpeg.jpg?optimized';

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

	<div>
		<JpegImg /> 

		
		<div>
			Jpeg Optimized
		</div>
	</div>
</div>

<style>
	.container {
		display: flex;
		gap: 1rem;
	}
</style>
