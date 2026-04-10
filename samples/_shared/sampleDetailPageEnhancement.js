const METADATA_URL = '/samples/metadata/samples.index.metadata.json';
const BACK_TO_SAMPLES_HREF = '/samples/index.html';
const ENHANCER_STYLE_ID = 'sample-detail-enhancement-style';
const ENHANCER_ROOT_ID = 'sample-detail-enhancement-root';

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

  const normalized = samples.map((entry) => ({
    id: String(entry.id || '').trim(),
    phase: String(entry.phase || '').trim(),
    title: String(entry.title || '').trim(),
    description: String(entry.description || '').trim(),
    tags: Array.isArray(entry.tags) ? entry.tags.map((tag) => String(tag).trim()).filter(Boolean) : [],
    preview: entry && typeof entry.preview === 'string' ? entry.preview.trim() : ''
  }));

  const valid = normalized.filter((entry) => /^\d{4}$/.test(entry.id) && /^\d{2}$/.test(entry.phase));
  valid.sort((a, b) => a.id.localeCompare(b.id));
  return valid;
}

export function buildDetailModel(samples, currentId) {
  const list = Array.isArray(samples) ? samples : [];
  const index = list.findIndex((entry) => entry.id === currentId);
  if (index < 0) {
    return null;
  }

  const current = list[index];
  const previous = index > 0 ? list[index - 1] : null;
  const next = index < list.length - 1 ? list[index + 1] : null;

  const samePhase = list.filter((entry) => entry.phase === current.phase && entry.id !== current.id);
  const related = samePhase.slice(0, 3);

  return { current, previous, next, related };
}

function ensureStyles() {
  if (document.getElementById(ENHANCER_STYLE_ID)) {
    return;
  }

  const style = document.createElement('style');
  style.id = ENHANCER_STYLE_ID;
  style.textContent = [
    '.sample-detail-enhancement {',
    '  margin: 0 0 14px;',
    '  padding: 12px;',
    '  border: 1px solid #2d3a52;',
    '  border-radius: 8px;',
    '  background: #111826;',
    '  color: #e7edf8;',
    '}',
    '.sample-detail-enhancement h2 { margin: 0 0 6px; font-size: 1.1rem; }',
    '.sample-detail-enhancement p { margin: 0 0 8px; color: #c7d5ea; }',
    '.sample-detail-enhancement .meta-row { display: flex; flex-wrap: wrap; gap: 8px; margin: 8px 0; }',
    '.sample-detail-enhancement .chip {',
    '  display: inline-block;',
    '  padding: 3px 8px;',
    '  border-radius: 999px;',
    '  border: 1px solid #415172;',
    '  background: #1a2538;',
    '  font: 600 12px/1.2 monospace;',
    '}',
    '.sample-detail-enhancement nav { display: flex; flex-wrap: wrap; gap: 12px; margin: 10px 0 2px; }',
    '.sample-detail-enhancement a { color: #9bd1ff; }',
    '.sample-detail-enhancement .related { margin: 10px 0 0; }',
    '.sample-detail-enhancement .related ul { margin: 6px 0 0 18px; padding: 0; }',
    '.sample-detail-enhancement .related li { margin: 2px 0; }',
    '.sample-detail-enhancement figure { margin: 10px 0 0; }',
    '.sample-detail-enhancement img { max-width: 100%; height: auto; border-radius: 6px; border: 1px solid #374765; }'
  ].join('\n');

  document.head.appendChild(style);
}

function createLink(href, text) {
  const link = document.createElement('a');
  link.href = href;
  link.textContent = text;
  return link;
}

function buildEnhancementElement(model) {
  const root = document.createElement('section');
  root.className = 'sample-detail-enhancement';
  root.id = ENHANCER_ROOT_ID;

  const title = document.createElement('h2');
  title.textContent = 'Sample ' + model.current.id + ' - ' + model.current.title;
  root.appendChild(title);

  const description = document.createElement('p');
  description.textContent = model.current.description || 'No description available.';
  root.appendChild(description);

  const metaRow = document.createElement('div');
  metaRow.className = 'meta-row';

  const phaseChip = document.createElement('span');
  phaseChip.className = 'chip';
  phaseChip.textContent = 'Phase ' + model.current.phase;
  metaRow.appendChild(phaseChip);

  const tags = model.current.tags.length > 0 ? model.current.tags : ['Untagged'];
  for (const tag of tags) {
    const tagChip = document.createElement('span');
    tagChip.className = 'chip';
    tagChip.textContent = tag;
    metaRow.appendChild(tagChip);
  }

  root.appendChild(metaRow);

  const nav = document.createElement('nav');
  nav.appendChild(createLink(BACK_TO_SAMPLES_HREF, 'Back to Samples'));

  if (model.previous) {
    nav.appendChild(createLink(canonicalSampleHref(model.previous), 'Previous: ' + model.previous.id));
  }
  if (model.next) {
    nav.appendChild(createLink(canonicalSampleHref(model.next), 'Next: ' + model.next.id));
  }

  root.appendChild(nav);

  if (model.current.preview) {
    const figure = document.createElement('figure');
    const image = document.createElement('img');
    image.src = model.current.preview;
    image.alt = 'Preview for sample ' + model.current.id;
    figure.appendChild(image);
    root.appendChild(figure);
  }

  const relatedWrap = document.createElement('div');
  relatedWrap.className = 'related';
  const relatedHeading = document.createElement('strong');
  relatedHeading.textContent = 'Related samples';
  relatedWrap.appendChild(relatedHeading);

  if (model.related.length === 0) {
    const none = document.createElement('p');
    none.textContent = 'No related samples available.';
    relatedWrap.appendChild(none);
  } else {
    const list = document.createElement('ul');
    for (const sample of model.related) {
      const item = document.createElement('li');
      item.appendChild(createLink(canonicalSampleHref(sample), 'Sample ' + sample.id + ' - ' + sample.title));
      list.appendChild(item);
    }
    relatedWrap.appendChild(list);
  }

  root.appendChild(relatedWrap);
  return root;
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

  const mount = document.querySelector('main');
  if (!mount || document.getElementById(ENHANCER_ROOT_ID)) {
    return;
  }

  const raw = await loadMetadata();
  const samples = normalizeMetadata(raw);
  const model = buildDetailModel(samples, current.id);
  if (!model) {
    return;
  }

  ensureStyles();
  const element = buildEnhancementElement(model);
  mount.insertBefore(element, mount.firstChild);

  const titleText = 'Sample ' + model.current.id + ' - ' + model.current.title;
  if (!document.title || !document.title.startsWith('Sample ' + model.current.id)) {
    document.title = titleText;
  }
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  applySampleDetailEnhancement().catch((error) => {
    console.warn('[sample-detail-enhancement]', error && error.message ? error.message : error);
  });
}
