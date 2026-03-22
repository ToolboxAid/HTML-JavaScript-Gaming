/*
Toolbox Aid
David Quesenberry
03/22/2026
generate-sample-manifest.mjs
*/
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const samplesDir = path.join(root, 'samples');
const outputDir = path.join(root, 'docs', 'build');
const outputFile = path.join(outputDir, 'sample-manifest.json');

const entries = await fs.readdir(samplesDir, { withFileTypes: true });
const samples = entries
  .filter((entry) => entry.isDirectory() && entry.name.startsWith('sample'))
  .map((entry) => ({
    id: entry.name,
    indexHtml: `samples/${entry.name}/index.html`,
  }))
  .sort((a, b) => a.id.localeCompare(b.id));

await fs.mkdir(outputDir, { recursive: true });
await fs.writeFile(outputFile, JSON.stringify({ generatedAt: 'repo-time', samples }, null, 2));
console.log(`Wrote ${outputFile}`);
