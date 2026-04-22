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

function mountReturnToTopControl() {
  const existing = document.getElementById('ball-container');
  if (existing instanceof HTMLElement) {
    return;
  }

  const container = document.createElement('div');
  container.id = 'ball-container';
  container.className = 'ball-loc bounce';
  container.style.display = 'none';
  container.setAttribute('role', 'button');
  container.setAttribute('tabindex', '0');
  container.setAttribute('aria-label', 'Return to Top');
  container.innerHTML = `
    <div class="ball wave1"></div>
    <div class="ball wave2"></div>
    <div class="ball wave3"></div>
    <div class="ball static-ball"><i class="fa fa-arrow-up" aria-hidden="true"></i></div>
  `;

  let fadeRafId = 0;
  let fadeStart = 0;
  let fadeFrom = 0;
  let fadeTo = 0;
  const fadeDurationMs = 1500;

  const applyVisibility = (value) => {
    container.style.opacity = String(value);
    if (value <= 0.001) {
      container.style.display = 'none';
      container.style.pointerEvents = 'none';
    } else {
      container.style.display = 'block';
      container.style.pointerEvents = 'auto';
    }
  };

  const getOpacity = () => {
    const raw = Number.parseFloat(container.style.opacity || '0');
    return Number.isFinite(raw) ? raw : 0;
  };

  const startFade = (targetOpacity) => {
    if (fadeRafId) {
      window.cancelAnimationFrame(fadeRafId);
      fadeRafId = 0;
    }
    fadeFrom = getOpacity();
    fadeTo = targetOpacity;
    if (Math.abs(fadeTo - fadeFrom) < 0.01) {
      applyVisibility(fadeTo);
      return;
    }
    if (fadeTo > 0) {
      container.style.display = 'block';
      container.style.pointerEvents = 'auto';
    }
    fadeStart = performance.now();
    const step = (now) => {
      const elapsed = now - fadeStart;
      const progress = Math.min(1, elapsed / fadeDurationMs);
      const nextOpacity = fadeFrom + ((fadeTo - fadeFrom) * progress);
      applyVisibility(nextOpacity);
      if (progress < 1) {
        fadeRafId = window.requestAnimationFrame(step);
      } else {
        fadeRafId = 0;
      }
    };
    fadeRafId = window.requestAnimationFrame(step);
  };

  const updateVisibility = () => {
    const scrollTop = Math.max(
      window.scrollY || 0,
      document.documentElement?.scrollTop || 0,
      document.body?.scrollTop || 0
    );
    if (scrollTop > 250) {
      startFade(1);
    } else {
      startFade(0);
    }
  };

  const moveToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  container.addEventListener('click', moveToTop);
  container.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      moveToTop();
    }
  });

  window.addEventListener('scroll', updateVisibility, { passive: true });
  window.addEventListener('resize', updateVisibility, { passive: true });
  updateVisibility();
  document.body.appendChild(container);
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

  mountReturnToTopControl();
  void mountSampleDetailEnhancementIfNeeded();
}
