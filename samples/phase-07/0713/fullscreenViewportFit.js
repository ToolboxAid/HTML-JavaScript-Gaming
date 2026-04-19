/*
Toolbox Aid
David Quesenberry
04/18/2026
fullscreenViewportFit.js
*/
export function computeContainSize({
  viewportWidth,
  viewportHeight,
  designWidth,
  designHeight,
} = {}) {
  const baseWidth = Number.isFinite(designWidth) && designWidth > 0 ? designWidth : 960;
  const baseHeight = Number.isFinite(designHeight) && designHeight > 0 ? designHeight : 540;
  const width = Number.isFinite(viewportWidth) && viewportWidth > 0 ? viewportWidth : baseWidth;
  const height = Number.isFinite(viewportHeight) && viewportHeight > 0 ? viewportHeight : baseHeight;
  const scale = Math.min(width / baseWidth, height / baseHeight);
  return {
    width: Math.max(1, Math.floor(baseWidth * scale)),
    height: Math.max(1, Math.floor(baseHeight * scale)),
  };
}

function readFullscreenState(documentRef) {
  return Boolean(documentRef?.fullscreenElement);
}

export function attachFullscreenViewportFit({
  canvas,
  documentRef = globalThis.document ?? null,
  windowRef = globalThis.window ?? null,
  designWidth = 960,
  designHeight = 540,
} = {}) {
  if (!canvas || !documentRef || !windowRef) {
    return {
      apply() {},
      reset() {},
      detach() {},
    };
  }

  const baselineStyles = {
    width: canvas.style.width,
    height: canvas.style.height,
    maxWidth: canvas.style.maxWidth,
    maxHeight: canvas.style.maxHeight,
    margin: canvas.style.margin,
    display: canvas.style.display,
  };

  function apply() {
    if (!readFullscreenState(documentRef)) {
      return;
    }
    const containSize = computeContainSize({
      viewportWidth: windowRef.innerWidth,
      viewportHeight: windowRef.innerHeight,
      designWidth,
      designHeight,
    });
    canvas.style.width = `${containSize.width}px`;
    canvas.style.height = `${containSize.height}px`;
    canvas.style.maxWidth = 'none';
    canvas.style.maxHeight = 'none';
    canvas.style.margin = '0 auto';
    canvas.style.display = 'block';
  }

  function reset() {
    canvas.style.width = baselineStyles.width;
    canvas.style.height = baselineStyles.height;
    canvas.style.maxWidth = baselineStyles.maxWidth;
    canvas.style.maxHeight = baselineStyles.maxHeight;
    canvas.style.margin = baselineStyles.margin;
    canvas.style.display = baselineStyles.display;
  }

  function syncWithFullscreenState() {
    if (readFullscreenState(documentRef)) {
      apply();
      return;
    }
    reset();
  }

  function onResize() {
    if (readFullscreenState(documentRef)) {
      apply();
    }
  }

  documentRef.addEventListener?.('fullscreenchange', syncWithFullscreenState);
  windowRef.addEventListener?.('resize', onResize);

  return {
    apply,
    reset,
    detach() {
      documentRef.removeEventListener?.('fullscreenchange', syncWithFullscreenState);
      windowRef.removeEventListener?.('resize', onResize);
      reset();
    },
  };
}
