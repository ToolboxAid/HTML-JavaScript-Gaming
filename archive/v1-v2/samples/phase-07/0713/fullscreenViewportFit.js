/*
Toolbox Aid
David Quesenberry
04/18/2026
fullscreenViewportFit.js
*/
export function computeCoverSize({
  viewportWidth,
  viewportHeight,
  designWidth,
  designHeight,
} = {}) {
  const baseWidth = Number.isFinite(designWidth) && designWidth > 0 ? designWidth : 960;
  const baseHeight = Number.isFinite(designHeight) && designHeight > 0 ? designHeight : 540;
  const width = Number.isFinite(viewportWidth) && viewportWidth > 0 ? viewportWidth : baseWidth;
  const height = Number.isFinite(viewportHeight) && viewportHeight > 0 ? viewportHeight : baseHeight;
  const scale = Math.max(width / baseWidth, height / baseHeight);
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
    position: canvas.style.position,
    left: canvas.style.left,
    top: canvas.style.top,
    transform: canvas.style.transform,
  };

  function apply() {
    if (!readFullscreenState(documentRef)) {
      return;
    }
    const coverSize = computeCoverSize({
      viewportWidth: windowRef.innerWidth,
      viewportHeight: windowRef.innerHeight,
      designWidth,
      designHeight,
    });
    canvas.style.width = `${coverSize.width}px`;
    canvas.style.height = `${coverSize.height}px`;
    canvas.style.maxWidth = 'none';
    canvas.style.maxHeight = 'none';
    canvas.style.margin = '0';
    canvas.style.display = 'block';
    canvas.style.position = 'fixed';
    canvas.style.left = '50%';
    canvas.style.top = '50%';
    canvas.style.transform = 'translate(-50%, -50%)';
  }

  function reset() {
    canvas.style.width = baselineStyles.width;
    canvas.style.height = baselineStyles.height;
    canvas.style.maxWidth = baselineStyles.maxWidth;
    canvas.style.maxHeight = baselineStyles.maxHeight;
    canvas.style.margin = baselineStyles.margin;
    canvas.style.display = baselineStyles.display;
    canvas.style.position = baselineStyles.position;
    canvas.style.left = baselineStyles.left;
    canvas.style.top = baselineStyles.top;
    canvas.style.transform = baselineStyles.transform;
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
