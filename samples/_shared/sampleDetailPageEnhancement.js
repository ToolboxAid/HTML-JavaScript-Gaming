const METADATA_URL = '/samples/metadata/samples.index.metadata.json';
const BACK_TO_SAMPLES_HREF = '/samples/index.html';
const ENHANCER_STYLE_ID = 'sample-detail-enhancement-style';
const TAGS_BLOCK_ID = 'sample-detail-tags';
const NAV_BLOCK_ID = 'sample-detail-navigation';
const RELATED_BLOCK_ID = 'sample-detail-related';
const ENGINE_BLOCK_ID = 'sample-detail-engine-classes';

function asOptionalPath(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizeWhitespace(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function sortById(a, b) {
  return String(a.id).localeCompare(String(b.id));
}

function numericDistanceFromCurrent(currentId, candidateId) {
  const current = Number(currentId);
  const candidate = Number(candidateId);
  if (!Number.isFinite(current) || !Number.isFinite(candidate)) {
    return Number.POSITIVE_INFINITY;
  }
  return Math.abs(current - candidate);
}

function normalizeTag(tag) {
  return String(tag || '')
    .trim()
    .toLowerCase()
    .replace(/[_\s]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function normalizeEngineClassRef(value) {
  const raw = normalizeWhitespace(value).replace(/\\/g, '/');
  if (!raw) {
    return '';
  }

  const parts = raw
    .split('/')
    .map((part) => normalizeWhitespace(part))
    .filter(Boolean);

  if (parts.length === 0) {
    return '';
  }
  if (parts[0].toLowerCase() === 'engine') {
    return 'engine/' + parts.slice(1).join('/');
  }
  return 'engine/' + parts.join('/');
}

function removePriorGeneratedBlocks(main) {
  const staleIds = [TAGS_BLOCK_ID, NAV_BLOCK_ID, RELATED_BLOCK_ID, ENGINE_BLOCK_ID];
  for (const id of staleIds) {
    const element = main.querySelector('#' + id);
    if (element) {
      element.remove();
    }
  }

  const staleSections = Array.from(main.querySelectorAll('section'));
  for (const section of staleSections) {
    const heading = section.querySelector('h2, h3, strong');
    const headingText = normalizeWhitespace(heading ? heading.textContent : '').toLowerCase();
    if (
      headingText === 'related samples' ||
      headingText === 'engine classes used' ||
      headingText === 'engine + debug classes used'
    ) {
      section.remove();
    }
  }
}

export function parseSampleFromPathname(pathname) {
  const text = String(pathname || '');
  const direct = text.match(/\/samples\/phase(\d{2})\/(\d{4})(?:\/index\.html)?\/?$/);
  if (direct) {
    return { phase: direct[1], id: direct[2] };
  }

  const parts = text.split('/').filter(Boolean);
  for (let i = 0; i < parts.length - 1; i += 1) {
    if (/^phase\d{2}$/.test(parts[i]) && /^\d{4}$/.test(parts[i + 1])) {
      return { phase: parts[i].slice(5), id: parts[i + 1] };
    }
  }
  return null;
}

export function canonicalSampleHref(sample) {
  return '/samples/phase' + sample.phase + '/' + sample.id + '/index.html';
}

export function normalizeMetadata(raw) {
  if (!raw || typeof raw !== 'object') {
    throw new Error('Metadata root must be an object.');
  }

  const samples = Array.isArray(raw.samples) ? raw.samples : [];
  const normalized = samples.map((entry) => {
    const engineClassesRaw = Array.isArray(entry.engineClassesUsed) ? entry.engineClassesUsed : [];
    const normalizedEngineClasses = [
      ...new Set(engineClassesRaw.map((value) => normalizeEngineClassRef(value)).filter(Boolean))
    ].sort();

    const normalizedTags = [
      ...new Set((Array.isArray(entry.tags) ? entry.tags : []).map((tag) => normalizeTag(tag)).filter(Boolean))
    ].sort();

    return {
      id: String(entry.id || '').trim(),
      phase: String(entry.phase || '').trim(),
      title: String(entry.title || '').trim(),
      description: String(entry.description || '').trim(),
      indexLabel: String(entry.indexLabel || '').trim(),
      tags: normalizedTags,
      engineClassesUsed: normalizedEngineClasses,
      thumbnail: asOptionalPath(entry.thumbnail),
      preview: asOptionalPath(entry.preview)
    };
  });

  const valid = normalized.filter((entry) => /^\d{4}$/.test(entry.id) && /^\d{2}$/.test(entry.phase));
  valid.sort(sortById);
  return valid;
}

export function buildDetailModel(samples, currentId) {
  const list = Array.isArray(samples) ? [...samples].sort(sortById) : [];
  const index = list.findIndex((entry) => entry.id === currentId);
  if (index < 0) {
    return null;
  }

  const current = list[index];
  const previous = index > 0 ? list[index - 1] : null;
  const next = index < list.length - 1 ? list[index + 1] : null;

  const related = list
    .filter((entry) => entry.phase === current.phase && entry.id !== current.id)
    .sort(
      (a, b) =>
        numericDistanceFromCurrent(current.id, a.id) - numericDistanceFromCurrent(current.id, b.id) || sortById(a, b)
    )
    .slice(0, 3);

  return { current, previous, next, related };
}

function ensureStyles() {
  if (document.getElementById(ENHANCER_STYLE_ID)) {
    return;
  }

  const style = document.createElement('style');
  style.id = ENHANCER_STYLE_ID;
  style.textContent = [
    '.sample-detail-row { margin: 10px 0; }',
    '.sample-detail-row h2 { margin: 0 0 6px; font-size: 1.05rem; }',
    '.sample-detail-row ul { margin: 6px 0 0 18px; }',
    '.sample-detail-row li { margin: 3px 0; }',
    '.sample-detail-chips { display: flex; flex-wrap: wrap; gap: 8px; margin: 4px 0 0; }',
    '.sample-detail-chip {',
    '  display: inline-block;',
    '  padding: 3px 8px;',
    '  border-radius: 999px;',
    '  border: 1px solid #415172;',
    '  background: #1a2538;',
    '  color: #e7edf8;',
    '  font: 600 12px/1.2 monospace;',
    '}',
    '.sample-detail-nav { display: flex; flex-wrap: wrap; gap: 12px; margin: 10px 0; }',
    '.sample-detail-nav a { color: #9bd1ff; }',
    '.sample-detail-muted { color: #c7d5ea; margin: 6px 0 0; }'
  ].join('\n');
  document.head.appendChild(style);
}

function createLink(href, text) {
  const link = document.createElement('a');
  link.href = href;
  link.textContent = text;
  return link;
}

function ensureTitleAndDescription(main, model) {
  let h1 = main.querySelector('h1');
  if (!h1) {
    h1 = document.createElement('h1');
    h1.textContent = model.current.indexLabel || model.current.title || ('Sample ' + model.current.id);
    main.insertBefore(h1, main.firstChild);
  }

  if (main.firstElementChild !== h1) {
    main.insertBefore(h1, main.firstChild);
  }

  let description = null;
  let node = h1.nextElementSibling;
  while (node) {
    if (node.tagName.toLowerCase() === 'p') {
      description = node;
      break;
    }
    node = node.nextElementSibling;
  }

  if (!description) {
    description = document.createElement('p');
    description.textContent = model.current.description || 'No description available.';
    h1.insertAdjacentElement('afterend', description);
  }

  if (h1.nextElementSibling !== description) {
    h1.insertAdjacentElement('afterend', description);
  }

  return { h1, description };
}

function buildTagsBlock(model) {
  const section = document.createElement('section');
  section.id = TAGS_BLOCK_ID;
  section.className = 'sample-detail-row';

  const heading = document.createElement('h2');
  heading.textContent = 'Tags';
  section.appendChild(heading);

  const chips = document.createElement('div');
  chips.className = 'sample-detail-chips';
  const tags = model.current.tags.length > 0 ? model.current.tags : ['untagged'];
  for (const tag of tags) {
    const chip = document.createElement('span');
    chip.className = 'sample-detail-chip';
    chip.textContent = tag;
    chips.appendChild(chip);
  }
  section.appendChild(chips);
  return section;
}

function buildNavigationBlock(model) {
  const nav = document.createElement('nav');
  nav.id = NAV_BLOCK_ID;
  nav.className = 'sample-detail-nav';
  nav.appendChild(createLink(BACK_TO_SAMPLES_HREF, 'Back to Samples'));
  if (model.previous) {
    nav.appendChild(createLink(canonicalSampleHref(model.previous), 'Previous: ' + model.previous.id));
  }
  if (model.next) {
    nav.appendChild(createLink(canonicalSampleHref(model.next), 'Next: ' + model.next.id));
  }
  return nav;
}

function buildRelatedBlock(model) {
  const section = document.createElement('section');
  section.id = RELATED_BLOCK_ID;
  section.className = 'sample-detail-row';

  const heading = document.createElement('h2');
  heading.textContent = 'Related Samples';
  section.appendChild(heading);

  if (model.related.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'sample-detail-muted';
    empty.textContent = 'No related samples available.';
    section.appendChild(empty);
    return section;
  }

  const list = document.createElement('ul');
  for (const sample of model.related) {
    const item = document.createElement('li');
    item.appendChild(createLink(canonicalSampleHref(sample), (sample.indexLabel || ('Sample ' + sample.id + ' - ' + sample.title))));
    list.appendChild(item);
  }
  section.appendChild(list);
  return section;
}

function buildEngineClassesBlock(model) {
  const section = document.createElement('section');
  section.id = ENGINE_BLOCK_ID;
  section.className = 'sample-detail-row';

  const heading = document.createElement('h2');
  heading.textContent = 'Engine Classes Used';
  section.appendChild(heading);

  const refs = model.current.engineClassesUsed || [];
  if (refs.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'sample-detail-muted';
    empty.textContent = 'No normalized engine class references found.';
    section.appendChild(empty);
    return section;
  }

  const list = document.createElement('ul');
  for (const ref of refs) {
    const item = document.createElement('li');
    item.textContent = ref;
    list.appendChild(item);
  }
  section.appendChild(list);
  return section;
}

function reorderMainChildren(main, orderedNodes) {
  const orderedSet = new Set(orderedNodes.filter(Boolean));
  const extras = Array.from(main.children).filter((child) => !orderedSet.has(child));
  const finalOrder = [...orderedNodes.filter(Boolean), ...extras];
  for (const node of finalOrder) {
    if (node.parentNode === main) {
      main.appendChild(node);
    }
  }
}

async function loadMetadata() {
  const response = await fetch(METADATA_URL, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error('Metadata request failed: ' + response.status);
  }
  return response.json();
}

export async function applySampleDetailEnhancement() {
  const current = parseSampleFromPathname(window.location.pathname);
  if (!current) {
    return;
  }

  const main = document.querySelector('main');
  if (!main) {
    return;
  }

  const raw = await loadMetadata();
  const samples = normalizeMetadata(raw);
  const model = buildDetailModel(samples, current.id);
  if (!model) {
    return;
  }

  ensureStyles();
  removePriorGeneratedBlocks(main);

  const titleAndDescription = ensureTitleAndDescription(main, model);
  const tagsBlock = buildTagsBlock(model);
  const navBlock = buildNavigationBlock(model);

  titleAndDescription.description.insertAdjacentElement('afterend', tagsBlock);
  tagsBlock.insertAdjacentElement('afterend', navBlock);

  const canvas = main.querySelector('canvas');
  if (!canvas) {
    return;
  }

  const relatedBlock = buildRelatedBlock(model);
  const engineClassesBlock = buildEngineClassesBlock(model);
  canvas.insertAdjacentElement('afterend', relatedBlock);
  relatedBlock.insertAdjacentElement('afterend', engineClassesBlock);

  reorderMainChildren(main, [
    titleAndDescription.h1,
    titleAndDescription.description,
    tagsBlock,
    navBlock,
    canvas,
    relatedBlock,
    engineClassesBlock
  ]);

  if (model.current.indexLabel) {
    document.title = model.current.indexLabel;
  } else if (model.current.title) {
    document.title = 'Sample ' + model.current.id + ' - ' + model.current.title;
  }
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  applySampleDetailEnhancement().catch(() => {});
}
