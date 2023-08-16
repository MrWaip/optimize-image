import path, { basename, extname } from 'node:path';

import { Plugin } from 'vite';
import sharp from 'sharp';

const pattern = '?optimized';

const isProd = process.env.NODE_ENV === 'production';

function isOptimized(id: string | undefined) {
	return id?.includes(pattern);
}

function parseURL(rawURL: string) {
	return new URL(rawURL.replace(/#/g, '%23'), 'file://');
}

async function generateImages(id: string) {
	const url = parseURL(id);
	const webpName = basename(url.pathname, extname(url.pathname)) + `.webp`;
	const avifName = basename(url.pathname, extname(url.pathname)) + `.avif`;
	const fallbackName = basename(url.pathname);

	const baseSharp = sharp(id);

	const [webp, avif, png] = await Promise.all([
		baseSharp.webp({ lossless: true, quality: 90 }).toBuffer(),
		baseSharp.webp({ lossless: true, quality: 90 }).toBuffer(),
		baseSharp.webp({ lossless: true, quality: 90 }).toBuffer()
		// baseSharp.clone().avif({ effort: 6, quality: 90 }).toBuffer(),
		// baseSharp
		// 	.png({
		// 		effort: 6,
		// 		quality: 90,
		// 		compressionLevel: 6,
		// 		progressive: true,
		// 		adaptiveFiltering: true
		// 	})
		// 	.toBuffer()
	]);

	return [
		{ name: webpName, source: webp },
		{ name: avifName, source: avif },
		{ name: fallbackName, source: png }
	];
}

export const imageOptimizerPlugin = (): Plugin[] => {
	const cache = new Map<string, string>();

	return [
		{
			name: '?sharp-handler',
			enforce: 'pre',
			async resolveId(id, importer) {
				if (!isOptimized(id)) return;

				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
				return path.resolve(path.dirname(importer!), id);
			},
			async load(id) {
				if (cache.has(id)) {
					return cache.get(id);
				}

				if (!isOptimized(id)) return;

				const unwrappedId = id.replace(pattern, '');

				const fallback = JSON.stringify(unwrappedId);

				if (!isProd)
					return {
						code: `import fallback from ${fallback};` + `export default { fallback };`,
						map: null
					};

				const images = await generateImages(unwrappedId);

				const [webpId, avifId, fallbackId] = images.map(({ source, name }) => {
					return this.emitFile({
						source,
						name: name,
						needsCodeReference: true,
						type: 'asset'
					});
				});

				const code = `export default { fallback: import.meta.ROLLUP_FILE_URL_${fallbackId}, avif: import.meta.ROLLUP_FILE_URL_${avifId}, webp: import.meta.ROLLUP_FILE_URL_${webpId} }`;

				cache.set(id, code);

				return code;
			}
		},
		{
			name: '?optimized-handler',
			enforce: 'pre',
			async resolveId(id, importer) {
				if (!isOptimized(id)) return;

				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
				return path.resolve(path.dirname(importer!), id);
			},
			async load(id) {
				if (cache.has(id)) {
					return cache.get(id);
				}

				if (!isOptimized(id)) return;

				const unwrappedId = id.replace(pattern, '');

				const fallback = JSON.stringify(unwrappedId);

				if (!isProd)
					return {
						code: `import fallback from ${fallback};` + `export default { fallback };`,
						map: null
					};

				const images = await generateImages(unwrappedId);

				const [webpId, avifId, fallbackId] = images.map(({ source, name }) => {
					return this.emitFile({
						source,
						name: name,
						needsCodeReference: true,
						type: 'asset'
					});
				});

				const code = `export default { fallback: import.meta.ROLLUP_FILE_URL_${fallbackId}, avif: import.meta.ROLLUP_FILE_URL_${avifId}, webp: import.meta.ROLLUP_FILE_URL_${webpId} }`;

				cache.set(id, code);

				return code;
			}
		}
	];
};
