import path, { basename, extname } from 'node:path';

import { Plugin } from 'vite';
import sharp from 'sharp';

const pattern = '?optimized';

const isProd = process.env.NODE_ENV === 'production';

function isIdForOptimization(id: string | undefined) {
	return id?.includes(pattern);
}

const forSharpPattern = /\?(webp|avif|fallback)/;

function isIdForSharp(id: string | undefined) {
	return forSharpPattern.test(id || '');
}

function resolveId(id: string, importer: string) {
	return path.resolve(path.dirname(importer), id);
}

export const imageOptimizerPlugin = (): Plugin[] => {
	let isSsr = false;

	return [
		{
			name: '?sharp-handler',
			enforce: 'pre',
			configResolved(options) {
				isSsr = !!options.build.ssr;
			},
			async resolveId(id, importer) {
				if (!isIdForSharp(id)) return;

				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
				return resolveId(id, importer!);
			},
			async load(id) {
				if (!isIdForSharp(id)) return;

				const unwrappedId = id.replace(forSharpPattern, '');
				let [, extension] = id.split('?');

				let buffer: Uint8Array;

				if (extension === 'fallback') {
					buffer = await sharp(unwrappedId)
						.png({ quality: 70, effort: 7, compressionLevel: 6 })
						.toBuffer();
				} else if (extension === 'webp') {
					buffer = await sharp(unwrappedId).webp({ quality: 80 }).toBuffer();
				} else {
					buffer = await sharp(unwrappedId).avif({ quality: 60 }).toBuffer();
				}

				if (extension === 'fallback') extension = extname(unwrappedId).replace('.', '');

				const name = basename(unwrappedId, extname(unwrappedId)) + `.${extension}`;

				const referenceId = this.emitFile({
					type: 'asset',
					name: name,
					needsCodeReference: true,
					source: buffer
				});

				return `export default import.meta.ROLLUP_FILE_URL_${referenceId};`;
			}
		},
		{
			name: '?optimized-handler',
			enforce: 'pre',
			async resolveId(id, importer) {
				if (!isIdForOptimization(id)) return;

				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
				return resolveId(id, importer!);
			},
			async load(id) {
				if (!isIdForOptimization(id)) return;

				const unwrappedId = id.replace(pattern, '');

				if (!isProd || isSsr) {
					return {
						code: `import fallback from "${unwrappedId}";` + `export default { fallback };`,
						map: null
					};
				}

				const webp = JSON.stringify(unwrappedId + '?webp');
				const avif = JSON.stringify(unwrappedId + '?avif');
				const fallback = JSON.stringify(unwrappedId + '?fallback');

				return (
					`import webp from ${webp};` +
					`import avif from ${avif};` +
					`import fallback from ${fallback};` +
					`export default {webp, avif, fallback};`
				);
			}
		}
	];
};
