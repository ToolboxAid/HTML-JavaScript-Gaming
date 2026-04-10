import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const SAMPLES_DIR = path.join(ROOT, 'samples');
const INDEX_PATH = path.join(SAMPLES_DIR, 'index.html');
const START_MARKER = '<!-- AUTO-GENERATED SAMPLE SECTIONS START -->';
const END_MARKER = '<!-- AUTO-GENERATED SAMPLE SECTIONS END -->';

function readFile(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function writeFile(filePath, content) {
  fs.writeFileSync(filePath, content, 'utf8');
}

function escapeHtml(text) {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function parseMetadataFromIndex(html) {
  const phaseMeta = new Map();
  const sampleMeta = new Map();

  const sectionRegex = /<section>\s*<h2>(.*?)<\/h2>\s*<p>(.*?)<\/p>\s*<div class="grid">([\s\S]*?)<\/div>\s*<\/section>/g;
  let sectionMatch;
  while ((sectionMatch = sectionRegex.exec(html)) !== null) {
    const heading = sectionMatch[1].trim();
    const description = sectionMatch[2].trim();
    const grid = sectionMatch[3];
    const phaseNumMatch = /^Phase\s+(\d{2})\b/.exec(heading);
    if (!phaseNumMatch) continue;
    const phaseNum = phaseNumMatch[1];
    phaseMeta.set(phaseNum, { heading, description });

    const linkRegex = /<a class="live" href="\.\/phase(\d{2})\/(\d{4})\/index\.html">Sample\s+\d{4}\s+-\s+([^<]+)<\/a>/g;
    let linkMatch;
    while ((linkMatch = linkRegex.exec(grid)) !== null) {
      const phaseFromLink = linkMatch[1];
      const sampleId = linkMatch[2];
      const sampleTitle = linkMatch[3].trim();
      if (phaseFromLink === phaseNum) {
        sampleMeta.set(sampleId, sampleTitle);
      }
    }
  }

  return { phaseMeta, sampleMeta };
}

function discoverCanonicalSamples() {
  const phaseDirs = fs.readdirSync(SAMPLES_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory() && /^phase\d{2}$/.test(d.name))
    .map((d) => d.name)
    .sort();

  const malformedPhaseDirs = fs.readdirSync(SAMPLES_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory() && d.name.startsWith('phase') && !/^phase\d{2}$/.test(d.name))
    .map((d) => d.name);

  if (malformedPhaseDirs.length > 0) {
    throw new Error('Malformed phase directory names: ' + malformedPhaseDirs.join(', '));
  }

  const duplicateSampleIds = new Map();
  const seenSampleIds = new Set();
  const phases = [];

  for (const phaseDir of phaseDirs) {
    const phaseNum = phaseDir.slice(5);
    const phasePath = path.join(SAMPLES_DIR, phaseDir);
    const entries = fs.readdirSync(phasePath, { withFileTypes: true });

    const malformedSampleDirs = entries
      .filter((e) => e.isDirectory() && !/^\d{4}$/.test(e.name))
      .map((e) => e.name);

    if (malformedSampleDirs.length > 0) {
      throw new Error('Malformed sample directory names in ' + phaseDir + ': ' + malformedSampleDirs.join(', '));
    }

    const sampleIds = entries
      .filter((e) => e.isDirectory() && /^\d{4}$/.test(e.name))
      .map((e) => e.name)
      .sort();

    const samples = [];
    for (const sampleId of sampleIds) {
      if (!sampleId.startsWith(phaseNum)) {
        throw new Error('Sample ' + sampleId + ' does not match phase ' + phaseNum);
      }

      if (seenSampleIds.has(sampleId)) {
        duplicateSampleIds.set(sampleId, true);
      }
      seenSampleIds.add(sampleId);

      const entryPath = path.join(phasePath, sampleId, 'index.html');
      if (!fs.existsSync(entryPath)) {
        throw new Error('Missing sample entrypoint: ' + path.relative(ROOT, entryPath));
      }

      samples.push({
        id: sampleId,
        href: './' + phaseDir + '/' + sampleId + '/index.html'
      });
    }

    phases.push({ phaseNum, phaseDir, samples });
  }

  if (duplicateSampleIds.size > 0) {
    throw new Error('Duplicate sample numbers detected: ' + [...duplicateSampleIds.keys()].join(', '));
  }

  return phases;
}

function buildGeneratedSections(phases, phaseMeta, sampleMeta) {
  const blocks = [];
  for (const phase of phases) {
    if (!phaseMeta.has(phase.phaseNum)) {
      throw new Error('Missing phase metadata for phase ' + phase.phaseNum);
    }
    const meta = phaseMeta.get(phase.phaseNum);

    const links = [];
    for (const sample of phase.samples) {
      if (!sampleMeta.has(sample.id)) {
        throw new Error('Ambiguous sample metadata: missing title for sample ' + sample.id);
      }
      const title = sampleMeta.get(sample.id);
      links.push('        <a class="live" href="' + sample.href + '">Sample ' + sample.id + ' - ' + escapeHtml(title) + '</a>');
    }

    const sectionLines = [
      '    <section>',
      '      <h2>' + escapeHtml(meta.heading) + '</h2>',
      '      <p>' + escapeHtml(meta.description) + '</p>',
      '      <div class="grid">',
      ...links,
      '      </div>',
      '    </section>'
    ];
    blocks.push(sectionLines.join('\n'));
  }

  return blocks.join('\n');
}

function replaceGeneratedBlock(html, generatedSections) {
  const withMarkers = html.includes(START_MARKER) && html.includes(END_MARKER);

  if (withMarkers) {
    const before = html.slice(0, html.indexOf(START_MARKER));
    const after = html.slice(html.indexOf(END_MARKER) + END_MARKER.length);
    return before + START_MARKER + '\n' + generatedSections + '\n    ' + END_MARKER + after;
  }

  const firstPhaseHeader = '<h2>Phase 01';
  const phase16Header = '<h2>Phase 16';
  const firstPhaseHeaderIndex = html.indexOf(firstPhaseHeader);
  if (firstPhaseHeaderIndex < 0) {
    throw new Error('Could not locate Phase 01 section in samples/index.html');
  }

  const firstSectionStart = html.lastIndexOf('<section>', firstPhaseHeaderIndex);
  if (firstSectionStart < 0) {
    throw new Error('Could not locate section start for Phase 01 in samples/index.html');
  }

  const phase16HeaderIndex = html.indexOf(phase16Header);
  const phase16SectionStart = phase16HeaderIndex >= 0 ? html.lastIndexOf('<section>', phase16HeaderIndex) : -1;

  if (phase16HeaderIndex >= 0 && phase16SectionStart < 0) {
    throw new Error('Could not locate section start for Phase 16 in samples/index.html');
  }

  const splitIndex = phase16SectionStart >= 0 ? phase16SectionStart : html.indexOf('</div>\n</body>');
  if (splitIndex < 0) {
    throw new Error('Could not locate insertion boundary in samples/index.html');
  }

  const prefix = html.slice(0, firstSectionStart);
  const suffix = html.slice(splitIndex);

  return prefix + START_MARKER + '\n' + generatedSections + '\n    ' + END_MARKER + '\n' + suffix;
}

function main() {
  const modeCheck = process.argv.includes('--check');
  const html = readFile(INDEX_PATH);
  const { phaseMeta, sampleMeta } = parseMetadataFromIndex(html);
  const phases = discoverCanonicalSamples();
  const generatedSections = buildGeneratedSections(phases, phaseMeta, sampleMeta);
  const nextHtml = replaceGeneratedBlock(html, generatedSections);

  if (!modeCheck && nextHtml !== html) {
    writeFile(INDEX_PATH, nextHtml);
  }

  const linkCount = (generatedSections.match(/class="live"/g) || []).length;
  console.log('OK phases=' + phases.length + ' samples=' + linkCount + ' mode=' + (modeCheck ? 'check' : 'write'));
}

try {
  main();
} catch (error) {
  console.error('FAIL ' + error.message);
  process.exit(1);
}
