/*
Toolbox Aid
David Quesenberry
03/21/2026
LayeredRenderSystem.js
*/
export function renderByLayers(renderer, layers = []) {
  const ordered = [...layers].sort((a, b) => (a.z ?? 0) - (b.z ?? 0));
  ordered.forEach((layer) => {
    if (typeof layer.render === 'function') {
      layer.render(renderer);
    }
  });
}
