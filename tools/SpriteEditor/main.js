/*
Toolbox Aid
David Quesenberry
03/26/2026
main.js
*/
const STORAGE_KEY = 'toolboxaid.spriteeditor.v1.1';

function createBlankFrame(size) {
  return Array.from({ length: size * size }, () => 0);
}

function normalizeData(raw) {
  const defaultData = { gridSize: 16, fps: 8, loop: true, frames: [createBlankFrame(16)] };
  if (!raw || typeof raw !== 'object') return defaultData;

  const gridSize = Number(raw.gridSize) || 16;
  const fps = Math.max(1, Math.min(60, Number(raw.fps) || 8));
  const loop = raw.loop !== false;

  let frames = [];
  if (Array.isArray(raw.frames) && raw.frames.length > 0) {
    frames = raw.frames.map((frame) => {
      if (!Array.isArray(frame)) return createBlankFrame(gridSize);
      const out = createBlankFrame(gridSize);
      for (let i = 0; i < out.length && i < frame.length; i += 1) {
        out[i] = frame[i] ? 1 : 0;
      }
      return out;
    });
  } else if (Array.isArray(raw.pixels)) {
    const out = createBlankFrame(gridSize);
    for (let i = 0; i < out.length && i < raw.pixels.length; i += 1) {
      out[i] = raw.pixels[i] ? 1 : 0;
    }
    frames = [out];
  } else {
    frames = [createBlankFrame(gridSize)];
  }

  return { gridSize, fps, loop, frames };
}

function bootSpriteEditor(documentRef = globalThis.document ?? null) {
  if (!documentRef) return null;

  const editorCanvas = documentRef.getElementById('editorCanvas');
  const previewCanvas = documentRef.getElementById('previewCanvas');
  const frameStrip = documentRef.getElementById('frameStrip');
  const statusLine = documentRef.getElementById('statusLine');
  const jsonArea = documentRef.getElementById('jsonArea');
  const fpsInput = documentRef.getElementById('fpsInput');
  const loopToggle = documentRef.getElementById('loopToggle');

  if (!editorCanvas || !previewCanvas || !frameStrip || !statusLine || !jsonArea || !fpsInput || !loopToggle) {
    return null;
  }

  const editorCtx = editorCanvas.getContext('2d');
  const previewCtx = previewCanvas.getContext('2d');
  if (!editorCtx || !previewCtx) {
    return null;
  }

  let data = normalizeData(null);
  let activeFrame = 0;
  let previewFrame = 0;
  let playing = false;
  let accumulator = 0;
  let lastTs = 0;

  function setStatus(text) {
    statusLine.textContent = text;
  }

  function drawFrame(ctx, canvas, frame) {
    const size = data.gridSize;
    const cell = canvas.width / size;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let y = 0; y < size; y += 1) {
      for (let x = 0; x < size; x += 1) {
        const idx = (y * size) + x;
        ctx.fillStyle = frame[idx] ? '#f59e0b' : '#0f172a';
        ctx.fillRect(x * cell, y * cell, cell, cell);
        ctx.strokeStyle = '#1e293b';
        ctx.strokeRect(x * cell, y * cell, cell, cell);
      }
    }
  }

  function renderFrameStrip() {
    frameStrip.innerHTML = '';
    data.frames.forEach((frame, index) => {
      const card = documentRef.createElement('div');
      card.className = `frame-thumb${index === activeFrame ? ' active' : ''}`;
      const mini = documentRef.createElement('canvas');
      mini.width = 64;
      mini.height = 64;
      const miniCtx = mini.getContext('2d');
      if (miniCtx) {
        const size = data.gridSize;
        const cell = mini.width / size;
        for (let y = 0; y < size; y += 1) {
          for (let x = 0; x < size; x += 1) {
            const idx = (y * size) + x;
            miniCtx.fillStyle = frame[idx] ? '#f59e0b' : '#0b1220';
            miniCtx.fillRect(x * cell, y * cell, cell, cell);
          }
        }
      }
      const btn = documentRef.createElement('button');
      btn.type = 'button';
      btn.textContent = `Frame ${index + 1}`;
      btn.addEventListener('click', () => {
        activeFrame = index;
        renderAll();
        setStatus(`Selected frame ${index + 1}.`);
      });
      card.appendChild(mini);
      card.appendChild(btn);
      frameStrip.appendChild(card);
    });
  }

  function exportJson() {
    const out = {
      version: '1.1',
      gridSize: data.gridSize,
      fps: data.fps,
      loop: data.loop,
      frames: data.frames,
    };
    jsonArea.value = JSON.stringify(out, null, 2);
    setStatus('Exported JSON.');
  }

  function renderAll() {
    drawFrame(editorCtx, editorCanvas, data.frames[activeFrame]);
    drawFrame(previewCtx, previewCanvas, data.frames[previewFrame]);
    fpsInput.value = String(data.fps);
    loopToggle.checked = data.loop;
    renderFrameStrip();
  }

  function updateFromJson() {
    try {
      const parsed = JSON.parse(jsonArea.value);
      data = normalizeData(parsed);
      activeFrame = 0;
      previewFrame = 0;
      renderAll();
      setStatus('Import successful.');
    } catch {
      setStatus('Import failed: invalid JSON.');
    }
  }

  function saveLocal() {
    globalThis.localStorage?.setItem(STORAGE_KEY, JSON.stringify(data));
    setStatus('Saved locally.');
  }

  function loadLocal() {
    const raw = globalThis.localStorage?.getItem(STORAGE_KEY);
    if (!raw) {
      setStatus('No local save found.');
      return;
    }
    try {
      data = normalizeData(JSON.parse(raw));
      activeFrame = 0;
      previewFrame = 0;
      renderAll();
      setStatus('Loaded local save.');
    } catch {
      setStatus('Local save is invalid.');
    }
  }

  function nextPreviewFrame() {
    if (previewFrame < data.frames.length - 1) {
      previewFrame += 1;
    } else if (data.loop) {
      previewFrame = 0;
    } else {
      playing = false;
    }
  }

  function tick(ts) {
    if (!lastTs) lastTs = ts;
    const dt = ts - lastTs;
    lastTs = ts;
    if (playing) {
      accumulator += dt;
      const frameMs = 1000 / data.fps;
      while (accumulator >= frameMs) {
        accumulator -= frameMs;
        nextPreviewFrame();
      }
      drawFrame(previewCtx, previewCanvas, data.frames[previewFrame]);
    }
    globalThis.requestAnimationFrame?.(tick);
  }

  editorCanvas.addEventListener('click', (event) => {
    const rect = editorCanvas.getBoundingClientRect();
    const size = data.gridSize;
    const cell = editorCanvas.width / size;
    const x = Math.floor((event.clientX - rect.left) / cell);
    const y = Math.floor((event.clientY - rect.top) / cell);
    if (x < 0 || y < 0 || x >= size || y >= size) return;
    const idx = (y * size) + x;
    data.frames[activeFrame][idx] = data.frames[activeFrame][idx] ? 0 : 1;
    renderAll();
  });

  documentRef.getElementById('addFrame')?.addEventListener('click', () => {
    data.frames.push(createBlankFrame(data.gridSize));
    activeFrame = data.frames.length - 1;
    previewFrame = activeFrame;
    renderAll();
    setStatus('Added frame.');
  });

  documentRef.getElementById('dupFrame')?.addEventListener('click', () => {
    data.frames.splice(activeFrame + 1, 0, [...data.frames[activeFrame]]);
    activeFrame += 1;
    previewFrame = activeFrame;
    renderAll();
    setStatus('Duplicated frame.');
  });

  documentRef.getElementById('delFrame')?.addEventListener('click', () => {
    if (data.frames.length <= 1) {
      setStatus('Cannot delete the last frame.');
      return;
    }
    data.frames.splice(activeFrame, 1);
    activeFrame = Math.max(0, Math.min(activeFrame, data.frames.length - 1));
    previewFrame = activeFrame;
    renderAll();
    setStatus('Deleted frame.');
  });

  documentRef.getElementById('prevFrame')?.addEventListener('click', () => {
    activeFrame = (activeFrame - 1 + data.frames.length) % data.frames.length;
    previewFrame = activeFrame;
    renderAll();
    setStatus('Moved to previous frame.');
  });

  documentRef.getElementById('nextFrame')?.addEventListener('click', () => {
    activeFrame = (activeFrame + 1) % data.frames.length;
    previewFrame = activeFrame;
    renderAll();
    setStatus('Moved to next frame.');
  });

  documentRef.getElementById('playPreview')?.addEventListener('click', () => {
    playing = true;
    setStatus('Preview playing.');
  });

  documentRef.getElementById('pausePreview')?.addEventListener('click', () => {
    playing = false;
    setStatus('Preview paused.');
  });

  fpsInput.addEventListener('change', () => {
    data.fps = Math.max(1, Math.min(60, Number(fpsInput.value) || 8));
    fpsInput.value = String(data.fps);
    setStatus(`FPS set to ${data.fps}.`);
  });

  loopToggle.addEventListener('change', () => {
    data.loop = Boolean(loopToggle.checked);
    setStatus(`Loop ${data.loop ? 'enabled' : 'disabled'}.`);
  });

  documentRef.getElementById('exportJson')?.addEventListener('click', exportJson);
  documentRef.getElementById('importJson')?.addEventListener('click', updateFromJson);
  documentRef.getElementById('saveLocal')?.addEventListener('click', saveLocal);
  documentRef.getElementById('loadLocal')?.addEventListener('click', loadLocal);

  exportJson();
  renderAll();
  setStatus('Sprite Editor v1.1 ready.');
  globalThis.requestAnimationFrame?.(tick);
  return true;
}

if (typeof document !== 'undefined') {
  bootSpriteEditor();
}

export { bootSpriteEditor, normalizeData };
