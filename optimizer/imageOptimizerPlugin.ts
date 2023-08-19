import { extname, resolve, dirname } from 'node:path';

import { Plugin } from 'vite';
import { getExtensions, getPathFor } from './constants';

const pattern = '?optimized';

function isIdForOptimization(id: string | undefined) {
	return id?.includes(pattern);
}

function resolveId(id: string, importer: string) {
	return resolve(dirname(importer), id);
}

function generateTemplate(fallback: string, imports: string[], src: string) {
	return [
		`<script lang="ts">`,
		...imports,
		`import fallback from "${fallback}";`,
		`import Picture from '$lib/Picture.svelte';`,
		`const src = { ${src} };`,
		`</script>`,
		`<Picture {src} {...$$restProps}  />`
	]
		.filter(Boolean)
		.join('\n');
}

export const imageOptimizerPlugin = (): Plugin[] => {
	return [
		{
			name: '?optimized-handler',
			enforce: 'pre',
			async resolveId(id, importer) {
				if (!isIdForOptimization(id)) return;

				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
				const absolutePath = resolveId(id, importer!);
				const [imagePath] = absolutePath.split('?');
				return imagePath.replace('.svelte', '') + '.svelte?optimized';
			},
			async load(id) {
				if (!isIdForOptimization(id)) return;

				const original = id.replace(pattern, '').replace('.svelte', '');
				const originalExtension = extname(original);
				const extensions = getExtensions(originalExtension);

				const optimizedFiles = await Promise.all(
					extensions.map(async (extension) => {
						const path = getPathFor(original, extension);
						const name = extension.replace('.', '');
						return { extension, resolved: await this.resolve(path), name };
					})
				);

				const fallback =
					optimizedFiles.find(({ extension }) => extension === originalExtension)?.resolved?.id ??
					original;

				const compressed = optimizedFiles.filter(
					({ extension, resolved }) => resolved && extension !== originalExtension
				);

				const src = ['fallback', ...compressed.map(({ name }) => name)].filter(Boolean).join(', ');

				const imports = compressed.map(
					({ resolved, name }) => `import ${name} from "${resolved?.id}";`
				);

				return generateTemplate(fallback, imports, src);
			}
		}
	];
};
