import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { imageOptimizerPlugin } from './imageOptimizerPlugin';

export default defineConfig({
	plugins: [
		imageOptimizerPlugin(), // ours plugin
		sveltekit()
	]
});
