let templateCache = '';
export let TOOLBOXAID_HEADER_HTML = '';

function resolveNavSection(pathname) {
  const path = String(pathname || '/').toLowerCase();
  if (path === '/' || path === '/index.html') {
    return 'home';
  }
  if (path.startsWith('/games/')) {
    return 'games';
  }
  if (path.startsWith('/samples/')) {
    return 'samples';
  }
  if (path.startsWith('/tools/')) {
    return 'tools';
  }
  return 'home';
}

function applyActiveNavState(header) {
  if (!header) {
    return;
  }

  const section = resolveNavSection(window?.location?.pathname);
  const sectionHrefMap = {
    home: '/index.html',
    games: '/games/index.html',
    samples: '/samples/index.html',
    tools: '/tools/index.html'
  };
  const activeHref = sectionHrefMap[section];
  const navLinks = header.querySelectorAll('.menu-item a');

  navLinks.forEach((link) => {
    const href = link.getAttribute('href') || '';
    const isActive = href === activeHref;
    link.classList.toggle('is-active', isActive);
    if (isActive) {
      link.setAttribute('aria-current', 'page');
    } else {
      link.removeAttribute('aria-current');
    }
  });
}

async function loadTemplate() {
  if (templateCache) {
    return templateCache;
  }

  const templateUrl = new URL('./toolboxaid-header.html', import.meta.url);
  const response = await fetch(templateUrl);
  if (!response.ok) {
    throw new Error('Failed to load toolboxaid-header.html');
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
    applyActiveNavState(existing);
    return existing;
  }

  const header = await createToolboxAidHeader();
  applyActiveNavState(header);
  container.prepend(header);
  return header;
}
