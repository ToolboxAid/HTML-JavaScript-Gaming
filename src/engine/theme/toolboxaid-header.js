let templateCache = '';
export let TOOLBOXAID_HEADER_HTML = '';

async function loadTemplate() {
  if (templateCache) {
    return templateCache;
  }

  const templateUrl = new URL('./toolboxaid-header.html', import.meta.url);
  const response = await fetch(templateUrl);
  if (!response.ok) {
    throw new Error('Failed to load src/engine/theme/toolboxaid-header.html');
  }

  templateCache = await response.text();
  TOOLBOXAID_HEADER_HTML = templateCache;
  return templateCache;
}

export async function createToolboxAidHeader() {
  const html = await loadTemplate();
  const nodeTemplate = document.createElement('template');
  nodeTemplate.innerHTML = html.trim();
  return nodeTemplate.content.firstElementChild;
}

export async function mountToolboxAidHeader(target = document.body) {
  const container = typeof target === 'string' ? document.querySelector(target) : target;
  if (!container) {
    throw new Error('mountToolboxAidHeader target not found');
  }

  const existing = container.querySelector('.toolboxaid-theme-header');
  if (existing) {
    return existing;
  }

  const header = await createToolboxAidHeader();
  container.prepend(header);
  return header;
}
