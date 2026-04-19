let templateCache = '';
export let TOOLBOXAID_HEADER_HTML = '';
const FALLBACK_TEMPLATE = `<header class="toolboxaid-theme-header">
  <div class="flex header-content">
    <div id="social" class="social-icons align-center">
      <a href="__SOCIAL_URL__" target="_blank" rel="noopener noreferrer" aria-label="Toolbox Aid on YouTube"><i class="fa fa-youtube"></i></a>
    </div>
    <div id="image" class="header-image bg-image-fill site-tagline">
      <h1 class="site-name align-center"><a href="__TITLE_URL__">__TITLE__</a></h1>
    </div>
    <div id="tagline" class="site-tagline site-tagline-alt align-center">
      <h2>__TAGLINE__</h2>
    </div>
    <div id="nav" class="site-nav align-center">
      <nav>
        <div class="menu-header-container">
          <ul id="menu-header" class="menu">__NAV_ITEMS__</ul>
        </div>
      </nav>
    </div>
  </div>
</header>`;

async function loadTemplate() {
  if (templateCache) {
    return templateCache;
  }

  const templateUrl = new URL('./toolboxaid-header.template.html', import.meta.url);
  const response = await fetch(templateUrl);
  if (!response.ok) {
    throw new Error('Failed to load toolboxaid-header.template.html');
  }

  templateCache = await response.text();
  TOOLBOXAID_HEADER_HTML = templateCache;
  return templateCache;
}

async function resolveTemplate() {
  try {
    return await loadTemplate();
  } catch (_error) {
    // Fallback keeps local file:// preview usable when fetch is restricted.
    templateCache = FALLBACK_TEMPLATE;
    TOOLBOXAID_HEADER_HTML = FALLBACK_TEMPLATE;
    return FALLBACK_TEMPLATE;
  }
}

function buildNavItems(links) {
  return links
    .map((link) => `<li class="menu-item"><a href="${link.href}">${link.label}</a></li>`)
    .join('');
}

function renderHeaderHtml(template, options) {
  const config = options || {};
  const title = config.title || 'Toolbox Aid';
  const tagline = config.tagline || 'HTML Javascript Gaming';
  const socialUrl = config.socialUrl || 'https://youtube.com/@ToolboxAid';
  const titleUrl = config.titleUrl || '/';
  const navLinks = Array.isArray(config.links) && config.links.length > 0 ? config.links : DEFAULT_NAV_LINKS;

  return template
    .replace('__SOCIAL_URL__', socialUrl)
    .replace('__TITLE_URL__', titleUrl)
    .replace('__TITLE__', title)
    .replace('__TAGLINE__', tagline)
    .replace('__NAV_ITEMS__', buildNavItems(navLinks));
}

export async function createToolboxAidHeader(options) {
  const template = await resolveTemplate();
  const html = renderHeaderHtml(template, options);
  const nodeTemplate = document.createElement('template');
  nodeTemplate.innerHTML = html.trim();
  return nodeTemplate.content.firstElementChild;
}

export async function mountToolboxAidHeader(target = document.body, options) {
  const container = typeof target === 'string' ? document.querySelector(target) : target;
  if (!container) {
    throw new Error('mountToolboxAidHeader target not found');
  }

  const existing = container.querySelector('.toolboxaid-theme-header');
  if (existing) {
    return existing;
  }

  const header = await createToolboxAidHeader(options);
  container.prepend(header);
  return header;
}
