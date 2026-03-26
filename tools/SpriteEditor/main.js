/*
Toolbox Aid
David Quesenberry
03/26/2026
main.js
*/
function renderFrameStrip(documentRef, count = 6) {
  const strip = documentRef.getElementById('frameStrip');
  if (!strip) return;
  strip.innerHTML = '';
  for (let i = 0; i < count; i += 1) {
    const card = documentRef.createElement('div');
    card.className = `frame-thumb${i === 0 ? ' active' : ''}`;
    card.innerHTML = `<strong>Frame ${i + 1}</strong><button type="button" data-frame="${i}">Select</button>`;
    strip.appendChild(card);
  }

  strip.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    const button = target.closest('button[data-frame]');
    if (!button) return;
    const frame = Number(button.getAttribute('data-frame'));
    strip.querySelectorAll('.frame-thumb').forEach((node, index) => {
      node.classList.toggle('active', index === frame);
    });
    const statusLine = documentRef.getElementById('statusLine');
    if (statusLine) {
      statusLine.textContent = `Frame ${frame + 1} selected.`;
    }
  });
}

function bootSpriteEditor(documentRef = globalThis.document ?? null) {
  if (!documentRef) return null;
  renderFrameStrip(documentRef);
  const statusLine = documentRef.getElementById('statusLine');
  if (statusLine) {
    statusLine.textContent = 'Sprite Editor v1.1 loaded with engine UI integration.';
  }
  return true;
}

if (typeof document !== 'undefined') {
  bootSpriteEditor();
}

export { bootSpriteEditor };
