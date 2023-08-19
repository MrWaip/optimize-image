import { extname } from 'node:path';
import sharp from 'sharp';

export type Extension = '.png' | '.avif' | '.webp' | '.jpeg' | '.jpg';

export const SUFFIX = '-compressed';

export const imagesRegex = new RegExp(`(?<!${SUFFIX})\\.(png|jpg|jpeg)$`);

const JPEG_TRANSFORMER = () =>
	sharp().jpeg({ progressive: true, quality: 80, optimiseCoding: true });

export const TRANSFORMERS: Record<Extension, () => sharp.Sharp> = {
	'.png': () => sharp().png({ quality: 70, effort: 7, compressionLevel: 6 }),
	'.avif': () => sharp().avif({ quality: 60, effort: 3 }),
	'.webp': () => sharp().webp(),
	'.jpeg': JPEG_TRANSFORMER,
	'.jpg': JPEG_TRANSFORMER
};

const EXTENSIONS: Extension[] = ['.avif', '.webp'];

export function getPathFor(path: string, extension: Extension): string {
	const originalExtension = extname(path);
	return path.replace(originalExtension, `${SUFFIX}${extension}`);
}

export function getExtensions(rawExtension: string): Extension[] {
	if (!TRANSFORMERS[rawExtension]) {
		throw new Error(`Такое расширение "${rawExtension}" мы тут не обрабатываем`);
	}

	return [...EXTENSIONS, rawExtension as Extension];
}
