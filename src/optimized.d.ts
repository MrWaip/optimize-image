declare module '*?optimized' {
	import type { ComponentType, SvelteComponent } from 'svelte';
	import type { HTMLImgAttributes } from 'svelte/elements';

	const value: ComponentType<SvelteComponent<HTMLImgAttributes>>;
	export default value;
}
