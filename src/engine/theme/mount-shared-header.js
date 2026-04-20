import { createToolboxAidHeader } from './index.js';

const mountRoot = document.getElementById('shared-theme-header-root') || document.getElementById('shared-theme-header');
if (mountRoot) {
  const shell = document.createElement('details');
  shell.className = 'is-collapsible';
  shell.open = true;

  const summary = document.createElement('summary');
  summary.className = 'is-collapsible__summary';
  summary.textContent = 'Header and Intro';

  const content = document.createElement('div');
  content.className = 'is-collapsible__content';

  const headerTarget = document.createElement('div');
  headerTarget.id = 'shared-theme-header';

  const introMain = document.createElement('main');
  introMain.className = 'page-shell';

  const introSection = document.createElement('section');
  introSection.className = 'page-intro';

  const introTitle = document.createElement('h1');
  introTitle.className = 'page-intro-title';

  const introDetails = document.createElement('p');
  introDetails.className = 'page-intro-details';

  introSection.append(introTitle, introDetails);
  introMain.append(introSection);
  content.append(headerTarget, introMain);
  shell.append(summary, content);

  mountRoot.replaceWith(shell);

  createToolboxAidHeader().then((headerNode) => {
    headerTarget.prepend(headerNode);
    const body = document.body;
    const fallbackTitle = document.querySelector('body > main h1');
    const fallbackDetails = document.querySelector('body > main p');
    const title = body.dataset.headerTitle || fallbackTitle?.textContent?.trim() || '';
    const details = body.dataset.headerDetails || fallbackDetails?.textContent?.trim() || '';

    introTitle.textContent = title;
    introDetails.textContent = details;
  });
}
