import { mountToolboxAidHeader } from './index.js';

function resolveHeaderConfig(pathname) {
  const path = (pathname || '/').toLowerCase();

  if (path.includes('/games/index.html') ||
      path.includes('/samples/index.html') ||
      path.includes('/tools/index.html')) {
    return {
      titleUrl: '../index.html',
      links: [
        { label: 'Start', href: '../index.html' },
        { label: 'Games', href: '../games/index.html' },
        { label: 'Tools', href: '../tools/index.html' },
        { label: 'Samples', href: '../samples/index.html' }
      ]
    };
  }

  return {
    titleUrl: 'index.html',
    links: [
      { label: 'Start', href: 'index.html' },
      { label: 'Games', href: 'games/index.html' },
      { label: 'Tools', href: 'tools/index.html' },
      { label: 'Samples', href: 'samples/index.html' }
    ]
  };
}

const target = document.getElementById('shared-theme-header');
if (target) {
  const config = resolveHeaderConfig(window.location.pathname);
  mountToolboxAidHeader(target, config);
}

