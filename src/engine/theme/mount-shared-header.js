import { mountToolboxAidHeader } from './index.js';

const target = document.getElementById('shared-theme-header');
if (target) {
  mountToolboxAidHeader(target);
}

async function mountSampleDetailEnhancementIfNeeded() {
  const path = String(window.location.pathname || '');
  const isSampleDetailRoute = /\/samples\/phase-?\d{2}\/\d{4}(?:\/index\.html)?\/?$/i.test(path);
  if (!isSampleDetailRoute) {
    return;
  }
  try {
    const module = await import('/samples/shared/sampleDetailPageEnhancement.js');
    if (typeof module.applySampleDetailEnhancement === 'function') {
      await module.applySampleDetailEnhancement();
    }
  } catch {
    // Non-fatal: sample page remains usable even if enhancement fails to load.
  }
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  void mountSampleDetailEnhancementIfNeeded();
}
