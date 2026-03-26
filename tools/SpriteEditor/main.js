/*
Toolbox Aid
David Quesenberry
03/26/2026
main.js
*/
function bootSpriteEditorShell(documentRef = globalThis.document ?? null) {
  if (!documentRef) return null;
  const app = documentRef.getElementById('app');
  if (!app) return null;

  const now = new Date().toLocaleString();
  app.innerHTML = `
    <section class="shell">
      <h1>Sprite Editor</h1>
      <p class="subtitle">New editor shell is active. Legacy editor is preserved for workflow continuity.</p>
      <div class="statusRow">
        <span class="badge live">Shell Active</span>
        <span class="badge legacy">Legacy Preserved</span>
      </div>
      <ul class="notes">
        <li>Legacy editor: <a href="../spriteeditorold/index.html">tools/spriteeditorold</a></li>
        <li>This shell is the replacement entry point for the next Sprite Editor rebuild.</li>
      </ul>
      <p class="stamp">Initialized: ${now}</p>
    </section>
  `;

  return { app };
}

if (typeof document !== 'undefined') {
  bootSpriteEditorShell();
}

export { bootSpriteEditorShell };
