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
  const headerIntroAccordion = document.querySelector('.is-collapsible');
  const headerIntroSummary = headerIntroAccordion?.querySelector('.is-collapsible__summary');
  const isHeaderIntroAccordion = headerIntroAccordion instanceof HTMLDetailsElement
    && headerIntroSummary instanceof HTMLElement
    && headerIntroSummary.textContent?.trim().toLowerCase() === 'header and intro';

  if (isHeaderIntroAccordion) {
    headerIntroAccordion.addEventListener('toggle', async () => {
      if (!document.fullscreenEnabled) {
        return;
      }

      if (headerIntroAccordion.open) {
        if (document.fullscreenElement) {
          try {
            await document.exitFullscreen();
          } catch {
            // Ignore fullscreen exit failures because accordion state remains usable.
          }
        }
        return;
      }

      if (!document.fullscreenElement && typeof document.documentElement?.requestFullscreen === 'function') {
        try {
          await document.documentElement.requestFullscreen();
        } catch {
          // Ignore fullscreen request failures because accordion state remains usable.
        }
      }
    });
  }

  void mountSampleDetailEnhancementIfNeeded();
}
