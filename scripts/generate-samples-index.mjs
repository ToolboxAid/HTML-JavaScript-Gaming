import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const SAMPLES_DIR = path.join(ROOT, 'samples');
const INDEX_PATH = path.join(SAMPLES_DIR, 'index.html');
const METADATA_PATH = path.join(SAMPLES_DIR, 'metadata', 'samples.index.metadata.json');
const START_MARKER = '<!-- AUTO-GENERATED SAMPLE SECTIONS START -->';
const END_MARKER = '<!-- AUTO-GENERATED SAMPLE SECTIONS END -->';

function readFile(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function writeFile(filePath, content) {
  fs.writeFileSync(filePath, content, 'utf8');
}

function escapeHtml(text) {
  return String(text)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function escapeAttr(text) {
  return escapeHtml(text).replaceAll('\n', ' ').replaceAll('\r', ' ');
}

function discoverCanonicalSamples() {
  const phaseEntries = fs.readdirSync(SAMPLES_DIR, { withFileTypes: true });
  const phaseDirs = phaseEntries
    .filter((d) => d.isDirectory() && /^phase\d{2}$/.test(d.name))
    .map((d) => d.name)
    .sort();

  const malformedPhaseDirs = phaseEntries
    .filter((d) => d.isDirectory() && d.name.startsWith('phase') && !/^phase\d{2}$/.test(d.name))
    .map((d) => d.name);

  if (malformedPhaseDirs.length > 0) {
    throw new Error('Malformed phase directory names: ' + malformedPhaseDirs.join(', '));
  }

  const duplicateSampleIds = new Set();
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
        duplicateSampleIds.add(sampleId);
      }
      seenSampleIds.add(sampleId);

      const entryPath = path.join(phasePath, sampleId, 'index.html');
      if (!fs.existsSync(entryPath)) {
        throw new Error('Missing sample entrypoint: ' + path.relative(ROOT, entryPath));
      }

      samples.push({
        id: sampleId,
        phase: phaseNum,
        href: './' + phaseDir + '/' + sampleId + '/index.html'
      });
    }

    phases.push({ phaseNum, phaseDir, samples });
  }

  if (duplicateSampleIds.size > 0) {
    throw new Error('Duplicate sample numbers detected: ' + [...duplicateSampleIds].join(', '));
  }

  return phases;
}

function assertRequiredField(obj, field, context) {
  if (!(field in obj)) {
    throw new Error('Missing required field "' + field + '" in ' + context);
  }
}

function normalizeTag(tag) {
  const normalized = String(tag)
    .trim()
    .toLowerCase()
    .replaceAll(/[_\s]+/g, '-')
    .replaceAll(/-+/g, '-')
    .replaceAll(/^-|-$/g, '');
  return normalized;
}

function parseMetadataObject(raw) {
  if (!raw || typeof raw !== 'object') {
    throw new Error('Metadata root must be an object.');
  }
  if (!Array.isArray(raw.phases)) {
    throw new Error('Metadata field "phases" must be an array.');
  }
  if (!Array.isArray(raw.samples)) {
    throw new Error('Metadata field "samples" must be an array.');
  }

  const phaseMeta = new Map();
  const sampleMeta = new Map();
  const sampleEntrypaths = new Set();

  for (let i = 0; i < raw.phases.length; i += 1) {
    const entry = raw.phases[i];
    const context = 'phases[' + i + ']';
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
      throw new Error(context + ' must be an object.');
    }

    assertRequiredField(entry, 'phase', context);
    assertRequiredField(entry, 'title', context);
    assertRequiredField(entry, 'description', context);

    if (!/^\d{2}$/.test(entry.phase)) {
      throw new Error(context + '.phase must be 2 digits.');
    }
    if (typeof entry.title !== 'string' || entry.title.trim() === '') {
      throw new Error(context + '.title must be a non-empty string.');
    }
    if (typeof entry.description !== 'string' || entry.description.trim() === '') {
      throw new Error(context + '.description must be a non-empty string.');
    }
    if (phaseMeta.has(entry.phase)) {
      throw new Error('Duplicate phase metadata entry: ' + entry.phase);
    }

    phaseMeta.set(entry.phase, {
      title: entry.title.trim(),
      description: entry.description.trim()
    });
  }

  for (let i = 0; i < raw.samples.length; i += 1) {
    const entry = raw.samples[i];
    const context = 'samples[' + i + ']';
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
      throw new Error(context + ' must be an object.');
    }

    assertRequiredField(entry, 'id', context);
    assertRequiredField(entry, 'phase', context);
    assertRequiredField(entry, 'title', context);
    assertRequiredField(entry, 'description', context);
    assertRequiredField(entry, 'tags', context);

    if (!/^\d{4}$/.test(entry.id)) {
      throw new Error(context + '.id must be 4 digits.');
    }
    if (!/^\d{2}$/.test(entry.phase)) {
      throw new Error(context + '.phase must be 2 digits.');
    }
    if (entry.id.slice(0, 2) !== entry.phase) {
      throw new Error('Phase/sample mismatch in metadata for sample ' + entry.id);
    }
    if (typeof entry.title !== 'string' || entry.title.trim() === '') {
      throw new Error(context + '.title must be a non-empty string.');
    }
    if (typeof entry.description !== 'string' || entry.description.trim() === '') {
      throw new Error(context + '.description must be a non-empty string.');
    }
    if (!Array.isArray(entry.tags)) {
      throw new Error(context + '.tags must be an array.');
    }

    const tagSet = new Set();
    for (let t = 0; t < entry.tags.length; t += 1) {
      if (typeof entry.tags[t] !== 'string' || entry.tags[t].trim() === '') {
        throw new Error(context + '.tags[' + t + '] must be a non-empty string.');
      }
      const normalizedTag = normalizeTag(entry.tags[t]);
      if (!normalizedTag) {
        throw new Error(context + '.tags[' + t + '] is invalid after normalization.');
      }
      tagSet.add(normalizedTag);
    }

    if (sampleMeta.has(entry.id)) {
      throw new Error('Duplicate sample metadata entry: ' + entry.id);
    }

    const canonicalEntrypath = './phase' + entry.phase + '/' + entry.id + '/index.html';
    if (sampleEntrypaths.has(canonicalEntrypath)) {
      throw new Error('Duplicate sample entry path detected: ' + canonicalEntrypath);
    }
    sampleEntrypaths.add(canonicalEntrypath);

    sampleMeta.set(entry.id, {
      phase: entry.phase,
      title: entry.title.trim(),
      description: entry.description.trim(),
      tags: [...tagSet]
    });
  }

  return { phaseMeta, sampleMeta };
}

function loadMetadata() {
  if (!fs.existsSync(METADATA_PATH)) {
    throw new Error('Missing metadata file: ' + path.relative(ROOT, METADATA_PATH));
  }

  let raw;
  try {
    raw = JSON.parse(readFile(METADATA_PATH));
  } catch (error) {
    throw new Error('Invalid metadata JSON: ' + error.message);
  }

  return parseMetadataObject(raw);
}

function validateMetadataAgainstCanonical(phases, metadata) {
  const canonicalPhaseSet = new Set(phases.map((phase) => phase.phaseNum));
  const canonicalSampleMap = new Map();

  for (const phase of phases) {
    if (!metadata.phaseMeta.has(phase.phaseNum)) {
      throw new Error('Missing phase metadata for canonical phase ' + phase.phaseNum);
    }
    for (const sample of phase.samples) {
      canonicalSampleMap.set(sample.id, sample);
      if (!metadata.sampleMeta.has(sample.id)) {
        throw new Error('Missing sample metadata for canonical sample ' + sample.id);
      }
      const sampleInfo = metadata.sampleMeta.get(sample.id);
      if (sampleInfo.phase !== phase.phaseNum) {
        throw new Error('Phase/sample mismatch for metadata sample ' + sample.id);
      }
    }
  }

  for (const phaseId of metadata.phaseMeta.keys()) {
    if (!canonicalPhaseSet.has(phaseId)) {
      throw new Error('Metadata contains non-canonical phase ' + phaseId);
    }
  }
  for (const sampleId of metadata.sampleMeta.keys()) {
    if (!canonicalSampleMap.has(sampleId)) {
      throw new Error('Metadata contains non-canonical sample ' + sampleId);
    }
  }
}

function buildGeneratedSections(phases, metadata) {
  const blocks = [];
  for (const phase of phases) {
    const phaseInfo = metadata.phaseMeta.get(phase.phaseNum);
    const links = [];

    for (const sample of phase.samples) {
      const sampleInfo = metadata.sampleMeta.get(sample.id);
      const tagValue = sampleInfo.tags.join(', ');
      links.push(
        '        <a class="live" href="' +
          sample.href +
          '" title="' +
          escapeAttr(sampleInfo.description) +
          '" data-tags="' +
          escapeAttr(tagValue) +
          '">Sample ' +
          sample.id +
          ' - ' +
          escapeHtml(sampleInfo.title) +
          '</a>'
      );
    }

    blocks.push(
      [
        '    <section>',
        '      <h2>' + escapeHtml(phaseInfo.title) + '</h2>',
        '      <p>' + escapeHtml(phaseInfo.description) + '</p>',
        '      <div class="grid">',
        ...links,
        '      </div>',
        '    </section>'
      ].join('\n')
    );
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

function runSelfTests() {
  const validRaw = {
    phases: [{ phase: '13', title: 'Phase 13', description: 'Network' }],
    samples: [
      {
        id: '1316',
        phase: '13',
        title: 'A',
        description: 'A',
        tags: [' Network ', 'PHASE 13', 'sample_a', 'sample-a']
      }
    ]
  };
  const parsed = parseMetadataObject(validRaw);
  const normalizedTags = parsed.sampleMeta.get('1316').tags.join(',');
  if (normalizedTags !== 'network,phase-13,sample-a') {
    throw new Error('Self-test failed: tag normalization mismatch.');
  }

  let duplicateIdFailed = false;
  try {
    parseMetadataObject({
      phases: [{ phase: '13', title: 'Phase 13', description: 'Network' }],
      samples: [
        { id: '1316', phase: '13', title: 'A', description: 'A', tags: ['network'] },
        { id: '1316', phase: '13', title: 'B', description: 'B', tags: ['network'] }
      ]
    });
  } catch (error) {
    duplicateIdFailed = String(error.message || '').includes('Duplicate sample metadata entry');
  }
  if (!duplicateIdFailed) {
    throw new Error('Self-test failed: duplicate sample ID was not rejected.');
  }

  let badTagFailed = false;
  try {
    parseMetadataObject({
      phases: [{ phase: '13', title: 'Phase 13', description: 'Network' }],
      samples: [{ id: '1316', phase: '13', title: 'A', description: 'A', tags: ['   '] }]
    });
  } catch (error) {
    badTagFailed = String(error.message || '').includes('non-empty string');
  }
  if (!badTagFailed) {
    throw new Error('Self-test failed: invalid tag was not rejected.');
  }
}

function main() {
  const modeSelfTest = process.argv.includes('--self-test');
  if (modeSelfTest) {
    runSelfTests();
    console.log('OK self-test metadata validation and tag normalization');
    return;
  }

  const modeCheck = process.argv.includes('--check');
  const html = readFile(INDEX_PATH);
  const phases = discoverCanonicalSamples();
  const metadata = loadMetadata();
  validateMetadataAgainstCanonical(phases, metadata);
  const generatedSections = buildGeneratedSections(phases, metadata);
  const nextHtml = replaceGeneratedBlock(html, generatedSections);

  if (!modeCheck && nextHtml !== html) {
    writeFile(INDEX_PATH, nextHtml);
  }

  const linkCount = (generatedSections.match(/class="live"/g) || []).length;
  console.log(
    'OK phases=' +
      phases.length +
      ' samples=' +
      linkCount +
      ' metadata=' +
      metadata.sampleMeta.size +
      ' mode=' +
      (modeCheck ? 'check' : 'write')
  );
}

try {
  main();
} catch (error) {
  console.error('FAIL ' + error.message);
  process.exit(1);
}
