import { access } from 'node:fs/promises';
import { createReadStream } from 'node:fs';
import { $ } from 'execa';
import { Extension, TRANSFORMERS, getExtensions, getPathFor, imagesRegex } from './constants';
import { extname } from 'node:path';

async function isExists(path: string) {
	return await access(path)
		.then(() => true)
		.catch(() => false);
}

async function toSharp(originalFile: string, outFile: string, extension: Extension) {
	const sharp = TRANSFORMERS[extension]();
	const fileStream = createReadStream(originalFile);
	await fileStream.pipe(sharp).toFile(outFile);
	return outFile;
}

async function processFile(filePath: string): Promise<string[]> {
	const originalExtension = extname(filePath);
	const extensions = getExtensions(originalExtension);
	const checks = await Promise.all(
		extensions.map(async (extension) => {
			const path = getPathFor(filePath, extension);
			return { isExists: await isExists(path), path, extension };
		})
	);

	return await Promise.all(
		checks
			.filter(({ isExists }) => !isExists)
			.map(({ path, extension }) => toSharp(filePath, path, extension))
	);
}

async function main() {
	const { stdout } = await $`git diff --name-only --staged --binary --diff-filter=AM`;

	const files = stdout
		.trim()
		.split('\n')
		.filter((path) => {
			return imagesRegex.test(path);
		});

	const results = (await Promise.all(files.map((file) => processFile(file)))).flat();

	if (results.length === 0) return;

	await $`git add ${results}`;
}

main();
