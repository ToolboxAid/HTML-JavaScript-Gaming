import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const SAMPLES_DIR = path.join(ROOT, 'samples');
const METADATA_PATH = path.join(SAMPLES_DIR, 'metadata', 'samples.index.metadata.json');

function readFile(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function writeFile(filePath, content) {
  fs.writeFileSync(filePath, content, 'utf8');
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function discoverCanonicalSamples() {
  const results = [];
  const phaseEntries = fs.readdirSync(SAMPLES_DIR, { withFileTypes: true });
  const phaseDirs = phaseEntries
    .filter((entry) => entry.isDirectory() && /^phase\d{2}$/.test(entry.name))
    .map((entry) => entry.name)
    .sort();

  for (const phaseDir of phaseDirs) {
    const phase = phaseDir.slice(5);
    const phasePath = path.join(SAMPLES_DIR, phaseDir);
    const sampleEntries = fs.readdirSync(phasePath, { withFileTypes: true });

    const sampleIds = sampleEntries
      .filter((entry) => entry.isDirectory() && /^\d{4}$/.test(entry.name))
      .map((entry) => entry.name)
      .sort();

    for (const id of sampleIds) {
      const sampleDir = path.join(phasePath, id);
      const indexPath = path.join(sampleDir, 'index.html');
      if (!fs.existsSync(indexPath)) {
        throw new Error('Missing sample entrypoint: ' + path.relative(ROOT, indexPath));
      }
      results.push({
        id,
        phase,
        phaseDir,
        sampleDir,
        indexPath
      });
    }
  }

  return results;
}

function loadMetadata() {
  if (!fs.existsSync(METADATA_PATH)) {
    throw new Error('Missing metadata file: ' + path.relative(ROOT, METADATA_PATH));
  }

  let parsed;
  try {
    parsed = JSON.parse(readFile(METADATA_PATH));
  } catch (error) {
    throw new Error('Invalid metadata JSON: ' + error.message);
  }

  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Metadata root must be an object.');
  }
  if (!Array.isArray(parsed.phases) || !Array.isArray(parsed.samples)) {
    throw new Error('Metadata must contain "phases" and "samples" arrays.');
  }
  return parsed;
}

function normalizeWhitespace(value) {
  return String(value || '')
    .replace(/\s+/g, ' ')
    .trim();
}

function stripTags(value) {
  return normalizeWhitespace(String(value || '').replace(/<[^>]*>/g, ' '));
}

function extractHeadingAndDescription(indexHtml) {
  const h1Match = indexHtml.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  const title = h1Match ? stripTags(h1Match[1]) : '';
  const paragraphMatch = indexHtml.match(/<p[^>]*>([\s\S]*?)<\/p>/i);
  const description = paragraphMatch ? stripTags(paragraphMatch[1]) : '';
  return { title, description };
}

function normalizeTag(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[_\s]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function normalizeEngineReference(rawRef) {
  const ref = normalizeWhitespace(rawRef).replace(/\\/g, '/');
  if (!ref) {
    return '';
  }

  const segments = ref
    .split('/')
    .map((segment) => normalizeWhitespace(segment))
    .filter(Boolean);

  if (segments.length === 0) {
    return '';
  }

  if (segments[0].toLowerCase() === 'src' && segments[1] && segments[1].toLowerCase() === 'engine') {
    return 'src/engine/' + segments.slice(2).join('/');
  }

  if (segments[0].toLowerCase() === 'engine') {
    return 'src/engine/' + segments.slice(1).join('/');
  }

  return 'src/engine/' + segments.join('/');
}

function walkJsFiles(dirPath) {
  const out = [];
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'assets') {
        continue;
      }
      out.push(...walkJsFiles(fullPath));
      continue;
    }
    if (entry.isFile() && /\.(m?js)$/i.test(entry.name)) {
      out.push(fullPath);
    }
  }
  return out;
}

function parseImportSymbols(specifierText) {
  const text = normalizeWhitespace(specifierText);
  if (!text) {
    return [];
  }

  if (text.startsWith('{') && text.endsWith('}')) {
    return text
      .slice(1, -1)
      .split(',')
      .map((part) => normalizeWhitespace(part))
      .filter(Boolean)
      .map((part) => normalizeWhitespace(part.split(/\s+as\s+/i)[0]))
      .filter(Boolean);
  }

  if (text.startsWith('*')) {
    const match = text.match(/\*\s+as\s+([A-Za-z_$][\w$]*)/);
    return match ? [match[1]] : [];
  }

  if (text.includes(',')) {
    const [defaultPart, namedPart] = text.split(',', 2);
    const symbols = [];
    const defaultSymbol = normalizeWhitespace(defaultPart);
    if (defaultSymbol) {
      symbols.push(defaultSymbol);
    }
    if (namedPart && namedPart.includes('{')) {
      symbols.push(...parseImportSymbols(namedPart.slice(namedPart.indexOf('{'))));
    }
    return symbols;
  }

  return [text];
}

function collectEngineClassReferencesFromJs(sampleDir) {
  const files = walkJsFiles(sampleDir);
  const refs = new Set();

  for (const filePath of files) {
    const source = readFile(filePath);
    const importRegex = /(?:^|\n)\s*import\s+([\s\S]*?)\s+from\s+["']([^"']+)["']/g;
    const exportRegex = /(?:^|\n)\s*export\s+[\s\S]*?\s+from\s+["']([^"']+)["']/g;
    const bareImportRegex = /(?:^|\n)\s*import\s+["']([^"']+)["']/g;

    let match;
    while ((match = importRegex.exec(source)) !== null) {
      const specifier = match[1];
      const importSource = match[2];
      collectFromImportSource(importSource, parseImportSymbols(specifier), refs);
    }

    while ((match = exportRegex.exec(source)) !== null) {
      const importSource = match[1];
      collectFromImportSource(importSource, [], refs);
    }

    while ((match = bareImportRegex.exec(source)) !== null) {
      const importSource = match[1];
      collectFromImportSource(importSource, [], refs);
    }
  }

  return [...refs].sort();
}

function collectFromImportSource(importSource, symbols, refs) {
  const source = String(importSource || '').replace(/\\/g, '/');
  const marker = 'src/engine/';
  const markerIndex = source.indexOf(marker);
  if (markerIndex < 0) {
    return;
  }

  const afterMarker = source.slice(markerIndex + marker.length).replace(/^\//, '');
  if (!afterMarker) {
    return;
  }

  const modulePath = afterMarker.replace(/\.js$/i, '');
  if (!modulePath) {
    return;
  }

  if (!symbols || symbols.length === 0) {
    refs.add(normalizeEngineReference('src/engine/' + modulePath));
    return;
  }

  for (const symbol of symbols) {
    const cleanSymbol = normalizeWhitespace(symbol);
    if (!cleanSymbol) {
      continue;
    }
    refs.add(normalizeEngineReference('src/engine/' + modulePath + '/' + cleanSymbol));
  }
}

function buildTagNoiseSet(sample, title) {
  const out = new Set(['engine', 'theme', 'phase', 'sample']);
  out.add(String(sample.id).toLowerCase());
  out.add(String(sample.phase).toLowerCase());
  out.add('phase-' + String(sample.phase));
  out.add('sample-' + String(sample.id));
  const titleTokens = String(title || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .split(' ')
    .map((token) => normalizeTag(token))
    .filter(Boolean);
  for (const token of titleTokens) {
    out.add(token);
  }
  return out;
}

function buildTagsFromEngineClasses(engineClassesUsed, sample, title) {
  const noise = buildTagNoiseSet(sample, title);
  const tags = new Set();

  for (const ref of engineClassesUsed) {
    const parts = String(ref).split('/').filter(Boolean);
    if (parts.length === 0) {
      continue;
    }
    const last = normalizeTag(parts[parts.length - 1]);
    if (!last) {
      continue;
    }
    if (/^\d+$/.test(last)) {
      continue;
    }
    if (noise.has(last)) {
      continue;
    }
    tags.add(last);
  }

  return [...tags].sort();
}

function normalizeMetadataAndPreviews() {
  const metadata = loadMetadata();
  const samples = discoverCanonicalSamples();
  const metadataById = new Map(metadata.samples.map((entry) => [String(entry.id), entry]));
  const normalizedSamples = [];
  let previewVerifiedCount = 0;

  for (const sample of samples) {
    const currentEntry = metadataById.get(sample.id);
    if (!currentEntry) {
      throw new Error('Missing metadata entry for sample ' + sample.id);
    }

    const indexHtml = readFile(sample.indexPath);
    const pageMeta = extractHeadingAndDescription(indexHtml);
    const fallbackTitle = normalizeWhitespace(currentEntry.title || '');
    const titleFromPage = pageMeta.title || fallbackTitle || ('Sample ' + sample.id);
    const descriptionFromPage =
      pageMeta.description || normalizeWhitespace(currentEntry.description || '') || titleFromPage;

    const engineClassesUsed = collectEngineClassReferencesFromJs(sample.sampleDir).map(normalizeEngineReference).filter(Boolean);
    const tags = buildTagsFromEngineClasses(engineClassesUsed, sample, titleFromPage);
    const previewPath = '/samples/phase' + sample.phase + '/' + sample.id + '/assets/preview.svg';
    const previewFilePath = path.join(ROOT, previewPath.replace(/^\//, '').replace(/\//g, path.sep));
    if (!fs.existsSync(previewFilePath)) {
      throw new Error('Missing runtime preview asset for sample ' + sample.id + ': ' + path.relative(ROOT, previewFilePath));
    }
    previewVerifiedCount += 1;

    const nextEntry = {
      ...currentEntry,
      phase: sample.phase,
      id: sample.id,
      title: fallbackTitle || titleFromPage,
      description: descriptionFromPage,
      tags,
      engineClassesUsed,
      thumbnail: previewPath,
      preview: previewPath
    };

    if (sample.id === '1316' || sample.id === '1317' || sample.id === '1318') {
      nextEntry.indexLabel = titleFromPage;
    } else if ('indexLabel' in nextEntry) {
      delete nextEntry.indexLabel;
    }

    normalizedSamples.push(nextEntry);
  }

  metadata.samples = normalizedSamples;
  writeFile(METADATA_PATH, JSON.stringify(metadata, null, 2) + '\n');

  return {
    sampleCount: samples.length,
    metadataCount: normalizedSamples.length,
    previewVerifiedCount
  };
}

function main() {
  const result = normalizeMetadataAndPreviews();
  console.log(
    'OK normalized samples=' +
      result.sampleCount +
      ' metadata=' +
      result.metadataCount +
      ' previews=' +
      result.previewVerifiedCount
  );
}

try {
  main();
} catch (error) {
  console.error('FAIL ' + error.message);
  process.exit(1);
}
