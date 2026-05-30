import { expect, test } from "@playwright/test";
import fs from "node:fs/promises";
import path from "node:path";
import { startRepoServer } from "../../helpers/playwrightRepoServer.mjs";
import { workspaceV2CoverageReporter } from "../../helpers/workspaceV2CoverageReporter.mjs";

const uatManifestPath = path.resolve("tests/fixtures/midi-studio-v2/uat-midi-studio-v2.game.manifest.json");
const roadmapPath = path.resolve("docs/dev/roadmaps/MIDI_STUDIO_V2_ROADMAP.md");
const implementationAuditPath = path.resolve("docs/dev/reports/PR_26146_033-midi-studio-v2-implementation-audit.md");
const implementationAuditValidationPath = path.resolve("docs/dev/reports/PR_26146_033-midi-studio-v2-implementation-audit_validation.md");
const canonicalSongModelAuditPath = path.resolve("docs/dev/reports/PR_26146_045-midi-studio-v2-duplicate-data-audit.md");

const validManifest = {
  schema: "html-js-gaming.game-manifest",
  version: 1,
  game: { id: "MidiFixture", name: "MIDI Fixture", folder: "MidiFixture" },
  launch: { directPath: "games/MidiFixture/index.html" },
  tools: {
    "asset-manager-v2": { version: 1, assets: {} },
    "midi-studio-v2": {
      activeSongId: "theme-main",
      directorMode: { enabled: true, defaultIntensity: "medium" }
    }
  },
  music: {
    version: 1,
    runtimePreference: "rendered",
    songs: [
      {
        id: "theme-main",
        name: "Main Theme",
        sourceMidi: "assets/music/midi/theme-main.mid",
        instrumentSet: "General MIDI",
        rendered: {
          wav: "assets/music/rendered/theme-main.wav",
          mp3: "assets/music/rendered/theme-main.mp3",
          ogg: "assets/music/rendered/theme-main.ogg"
        },
        defaultRuntimeFormat: "ogg",
        loop: { enabled: true, startSeconds: 1, endSeconds: 64 },
        director: {
          mood: "heroic",
          intensity: "medium",
          usage: ["title", "menu"],
          notes: "Opening cue."
        },
        tags: ["theme", "menu"]
      },
      {
        id: "combat-light",
        name: "Light Combat",
        sourceMidi: "",
        instrumentSet: { id: "gm-combat", name: "Combat GM" },
        rendered: {
          wav: "assets/music/rendered/combat-light.wav",
          mp3: "assets/music/rendered/combat-light.mp3",
          ogg: "assets/music/rendered/combat-light.ogg"
        },
        defaultRuntimeFormat: "ogg",
        loop: { enabled: true },
        director: {
          mood: "tense",
          intensity: "high",
          usage: ["combat"],
          notes: "Short encounter loop."
        },
        tags: ["combat"]
      },
      {
        id: "source-only",
        name: "Source Only",
        sourceMidi: "assets/music/midi/source-only.mid",
        instrumentSet: "General MIDI",
        rendered: {},
        defaultRuntimeFormat: "ogg",
        loop: { enabled: false },
        director: {
          mood: "mysterious",
          intensity: "low",
          usage: ["debug"],
          notes: "Instruction-only MIDI with no rendered preview target."
        },
        tags: ["instruction-only"]
      }
    ]
  }
};

const validMidiBytes = Buffer.from([
  0x4d, 0x54, 0x68, 0x64,
  0x00, 0x00, 0x00, 0x06,
  0x00, 0x01,
  0x00, 0x02,
  0x01, 0xe0,
  0x4d, 0x54, 0x72, 0x6b,
  0x00, 0x00, 0x00, 0x13,
  0x00, 0xff, 0x51, 0x03, 0x07, 0xa1, 0x20,
  0x00, 0xff, 0x58, 0x04, 0x04, 0x02, 0x18, 0x08,
  0x00, 0xff, 0x2f, 0x00,
  0x4d, 0x54, 0x72, 0x6b,
  0x00, 0x00, 0x00, 0x10,
  0x00, 0xc0, 0x05,
  0x00, 0x90, 0x3c, 0x40,
  0x83, 0x60, 0x80, 0x3c, 0x40,
  0x00, 0xff, 0x2f, 0x00
]);

const warningMidiBytes = Buffer.from([
  0x4d, 0x54, 0x68, 0x64,
  0x00, 0x00, 0x00, 0x06,
  0x00, 0x01,
  0x00, 0x03,
  0x01, 0xe0,
  0x4d, 0x54, 0x72, 0x6b,
  0x00, 0x00, 0x00, 0x13,
  0x00, 0xff, 0x51, 0x03, 0x07, 0xa1, 0x20,
  0x00, 0xff, 0x58, 0x04, 0x04, 0x02, 0x18, 0x08,
  0x00, 0xff, 0x2f, 0x00,
  0x4d, 0x54, 0x72, 0x6b,
  0x00, 0x00, 0x00, 0x10,
  0x00, 0xf0, 0x01, 0x7e,
  0x00, 0x80, 0x3e, 0x40,
  0x00, 0x90, 0x40, 0x40,
  0x00, 0xff, 0x2f, 0x00,
  0x4d, 0x54, 0x72, 0x6b,
  0x00, 0x00, 0x00, 0x04,
  0x00, 0xff, 0x2f, 0x00
]);

const corruptMidiBytes = Buffer.from([
  0x4d, 0x54, 0x68, 0x64,
  0x00, 0x00, 0x00, 0x06,
  0x00, 0x00,
  0x00, 0x01,
  0x01, 0xe0,
  0x4d, 0x54, 0x72, 0x6b,
  0x00, 0x00, 0x00, 0x01,
  0x00
]);

function installMockAudio(page, { webAudio = true, webAudioResumeError = "" } = {}) {
  return page.addInitScript(({ webAudio, webAudioResumeError }) => {
    window.__midiStudioAudioEvents = [];
    window.__midiStudioPreviewSynthEvents = [];
    window.Audio = class MockAudio {
      constructor(src) {
        this.currentTime = 0;
        this.duration = 12;
        this.loop = false;
        this.paused = true;
        this.preload = "";
        this.src = src;
        this.volume = 1;
      }

      play() {
        this.paused = false;
        window.__midiStudioAudioEvents.push({ action: "play", loop: this.loop, src: this.src });
        return Promise.resolve();
      }

      pause() {
        this.paused = true;
        window.__midiStudioAudioEvents.push({ action: "pause", src: this.src });
      }
    };
    if (!webAudio) {
      Object.defineProperty(window, "AudioContext", { configurable: true, value: undefined });
      Object.defineProperty(window, "webkitAudioContext", { configurable: true, value: undefined });
      return;
    }
    class MockAudioParam {
      setValueAtTime(value, time) {
        window.__midiStudioPreviewSynthEvents.push({ action: "param-set", time, value });
      }

      linearRampToValueAtTime(value, time) {
        window.__midiStudioPreviewSynthEvents.push({ action: "param-ramp", time, value });
      }
    }
    class MockGain {
      constructor() {
        this.gain = new MockAudioParam();
      }

      connect() {}

      disconnect() {}
    }
    class MockBufferSource {
      constructor() {
        this.buffer = null;
      }

      connect() {}

      disconnect() {}

      start(time) {
        window.__midiStudioPreviewSynthEvents.push({ action: "buffer-start", time });
      }

      stop(time) {
        window.__midiStudioPreviewSynthEvents.push({ action: "buffer-stop", time });
      }
    }
    class MockOscillator {
      constructor() {
        this.frequency = new MockAudioParam();
        this.type = "sine";
      }

      connect() {}

      disconnect() {}

      start(time) {
        window.__midiStudioPreviewSynthEvents.push({ action: "oscillator-start", time, type: this.type });
      }

      stop(time) {
        window.__midiStudioPreviewSynthEvents.push({ action: "oscillator-stop", time });
      }
    }
    class MockAudioContext {
      constructor() {
        this.currentTime = 0;
        this.destination = {};
        this.sampleRate = 8000;
        this.state = "suspended";
      }

      createBuffer(channels, frameCount) {
        return {
          channels,
          frameCount,
          getChannelData: () => new Float32Array(frameCount)
        };
      }

      createBufferSource() {
        return new MockBufferSource();
      }

      createGain() {
        return new MockGain();
      }

      createOscillator() {
        return new MockOscillator();
      }

      resume() {
        if (webAudioResumeError) {
          return Promise.reject(new Error(webAudioResumeError));
        }
        this.state = "running";
        window.__midiStudioPreviewSynthEvents.push({ action: "resume" });
        return Promise.resolve();
      }
    }
    Object.defineProperty(window, "AudioContext", { configurable: true, value: MockAudioContext });
    Object.defineProperty(window, "webkitAudioContext", { configurable: true, value: MockAudioContext });
  }, { webAudio, webAudioResumeError });
}

async function openMidiStudio(page, routePayload = validManifest, midiRoutes = {}, audioOptions = {}) {
  const server = await startRepoServer();
  await installMockAudio(page, audioOptions);
  await page.route((url) => url.pathname === "/midi-fixture.game.manifest.json", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify(routePayload)
    });
  });
  await page.route((url) => url.pathname.endsWith(".mid"), async (route) => {
    const requestPath = new URL(route.request().url()).pathname;
    const routeEntry = Object.entries(midiRoutes).find(([path]) => requestPath.endsWith(path));
    if (!routeEntry) {
      await route.fulfill({ status: 404, body: "missing MIDI fixture" });
      return;
    }
    await route.fulfill({
      body: routeEntry[1],
      contentType: "audio/midi"
    });
  });
  await workspaceV2CoverageReporter.start(page);
  await page.goto(`${server.baseUrl}/tools/midi-studio-v2/index.html?manifestPath=/midi-fixture.game.manifest.json`, { waitUntil: "domcontentloaded" });
  return server;
}

async function openMidiStudioForImport(page, audioOptions = {}) {
  const server = await startRepoServer();
  await installMockAudio(page, audioOptions);
  await workspaceV2CoverageReporter.start(page);
  await page.goto(`${server.baseUrl}/tools/midi-studio-v2/index.html`, { waitUntil: "domcontentloaded" });
  return server;
}

async function openMidiStudioFromWorkspace(page, manifestPayload, audioOptions = {}) {
  const server = await startRepoServer();
  const hostContextId = "midi-studio-v2-workspace-context";
  await installMockAudio(page, audioOptions);
  await page.addInitScript(({ hostContextId: contextId, manifest }) => {
    const toolId = "midi-studio-v2";
    const toolSettings = manifest.tools?.[toolId] || {};
    const payload = {
      schema: "html-js-gaming.midi-studio-v2",
      toolId,
      version: manifest.music?.version || 1,
      runtimePreference: manifest.music?.runtimePreference || "rendered",
      activeSongId: toolSettings.activeSongId || manifest.music?.activeSongId || manifest.music?.songs?.[0]?.id || "",
      directorMode: toolSettings.directorMode || manifest.music?.directorMode || {},
      songs: manifest.music?.songs || []
    };
    window.sessionStorage.setItem(contextId, JSON.stringify({
      ...manifest,
      tools: {
        ...(manifest.tools || {}),
        [toolId]: payload
      }
    }));
    window.sessionStorage.setItem(`workspace.tools.${toolId}`, JSON.stringify({
      schema: { name: "workspace-tool-state", version: 1 },
      workspace: {
        hostContextId: contextId,
        source: "workspace-manager-v2",
        toolId
      },
      data: payload,
      dirty: {
        isDirty: false,
        reason: "clean",
        changedAt: "",
        changedKeys: []
      }
    }));
  }, { hostContextId, manifest: manifestPayload });
  await workspaceV2CoverageReporter.start(page);
  await page.goto(`${server.baseUrl}/tools/midi-studio-v2/index.html?launch=workspace&fromTool=workspace-manager-v2&hostContextId=${hostContextId}&workspaceMode=uat`, { waitUntil: "domcontentloaded" });
  return server;
}

async function openMidiStudioWorkspaceProxyNav(page, audioOptions = {}) {
  const server = await startRepoServer();
  await installMockAudio(page, audioOptions);
  await workspaceV2CoverageReporter.start(page);
  await page.goto(`${server.baseUrl}/tools/midi-studio-v2/index.html?launch=workspace`, { waitUntil: "domcontentloaded" });
  return server;
}

async function selectMidiStudioTab(page, tabId) {
  const tab = page.locator(`[data-midi-studio-tab="${tabId}"]`);
  if (await tab.getAttribute("aria-selected") === "true") {
    return;
  }
  await tab.click();
  await expect(tab).toHaveAttribute("aria-selected", "true");
}

function parseGuidedSectionRows(sourceText) {
  return String(sourceText || "")
    .split(/[\n;]+/)
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry, index) => {
      const bracketMatch = entry.match(/^\[([^\]]+)\]\s*(.*)$/);
      const separatorIndex = entry.indexOf(":");
      return {
        chords: bracketMatch
          ? bracketMatch[2].trim()
          : separatorIndex >= 0
            ? entry.slice(separatorIndex + 1).trim()
            : entry,
        label: bracketMatch
          ? bracketMatch[1].trim()
          : separatorIndex >= 0
          ? entry.slice(0, separatorIndex).trim()
            : `Section ${index + 1}`
      };
    });
}

async function fillSongSheetSectionBuilder(page, sourceText) {
  const rows = parseGuidedSectionRows(sourceText);
  const namedFields = {
    bridge: "#songSheetSectionBridgeInput",
    chorus: "#songSheetSectionChorusInput",
    intro: "#songSheetSectionIntroInput",
    outro: "#songSheetSectionOutroInput",
    verse: "#songSheetSectionVerseInput"
  };
  for (const selector of Object.values(namedFields)) {
    await page.locator(selector).fill("");
  }
  const customRows = [];
  for (const row of rows) {
    const selector = namedFields[row.label.toLowerCase()];
    if (selector) {
      await page.locator(selector).fill(row.chords);
    } else {
      customRows.push(`${row.label}: ${row.chords}`);
    }
  }
  await page.locator("#songSheetCustomSectionsInput").fill(customRows.join("\n"));
}

async function clearSongSheetSequence(page) {
  while (await page.locator("#songSheetSequenceList option").count()) {
    await page.locator("#songSheetSequenceList").selectOption({ index: 0 });
    await page.locator("#songSheetSequenceRemoveButton").click();
  }
}

async function addSongSheetSequenceLabels(page, labels) {
  await clearSongSheetSequence(page);
  for (const label of labels) {
    await page.locator("#songSheetAvailableSectionsList").selectOption(label);
    await page.locator("#songSheetAddSectionToSequenceButton").click();
  }
}

async function fillGuidedSongSheet(page, { intro = "Am F", key = "A minor", loop = "Am F C G", loopSections = "loop", sections = null, sequence = null, style = "retro-arcade", tempo = "132" } = {}) {
  await selectMidiStudioTab(page, "song-setup");
  await page.locator("#songSheetTempoInput").fill(tempo);
  await page.locator("#songSheetKeyInput").selectOption(key);
  await page.locator("#songSheetStyleInput").selectOption(style);
  const sourceSections = sections || `intro: ${intro}\nloop: ${loop}`;
  await fillSongSheetSectionBuilder(page, sourceSections);
  const sequenceLabels = sequence !== null
    ? String(sequence).split(/[\n,;]+/).map((entry) => entry.trim()).filter(Boolean)
    : parseGuidedSectionRows(sourceSections)
      .filter((row) => row.chords.trim())
      .map((row) => row.label.toLowerCase() === "intro"
        ? "Intro"
        : row.label.toLowerCase() === "verse"
          ? "Verse"
          : row.label.toLowerCase() === "chorus"
            ? "Chorus"
            : row.label.toLowerCase() === "bridge"
              ? "Bridge"
              : row.label.toLowerCase() === "outro"
                ? "Outro"
                : row.label);
  if (sequenceLabels.length) {
    await addSongSheetSequenceLabels(page, sequenceLabels);
  }
  void loopSections;
}

async function fillInstrumentGrid(page, {
  bass = "A2 - F2 - | C3 - G2 -",
  beats = "4",
  chords = "Am F C G | Am F C G",
  drums = "kick hat snare hat | kick hat snare hat",
  lead = "E4 G4 A4 - | C5 B4 G4 -",
  pad = "Am - F - | C - G -",
  sections = "intro:1, loop:1",
  subdivision = "1"
} = {}) {
  await selectMidiStudioTab(page, "auto-create-parts");
  await page.locator("#instrumentGridSectionsInput").fill(sections);
  await page.locator("#instrumentGridBeatsInput").fill(beats);
  await page.locator("#instrumentGridSubdivisionInput").selectOption(subdivision);
  await page.locator(".midi-studio-v2__advanced-lane-source").evaluate((details) => {
    details.open = true;
  });
  await page.locator("#instrumentGridChordsInput").fill(chords);
  await page.locator("#instrumentGridBassInput").fill(bass);
  await page.locator("#instrumentGridPadInput").fill(pad);
  await page.locator("#instrumentGridLeadInput").fill(lead);
  await page.locator("#instrumentGridDrumsInput").fill(drums);
}

async function audioDiagnosticsRows(page) {
  return page.locator("#audioDiagnostics div").evaluateAll((rows) => Object.fromEntries(rows.map((row) => [
    row.querySelector("dt")?.textContent || "",
    row.querySelector("dd")?.textContent || ""
  ])));
}

function spreadsheetCell(page, lane, stepIndex) {
  return page.locator(`.midi-studio-v2__spreadsheet-note-cell[data-lane="${lane}"][data-step-index="${stepIndex}"]`);
}

function octaveCell(page, rowToken, stepIndex) {
  return page.locator(`.midi-studio-v2__octave-note-cell[data-row-token="${rowToken}"][data-step-index="${stepIndex}"]`);
}

function octaveNoteBlock(page, lane) {
  return page.locator(`.midi-studio-v2__octave-note-cell[data-note-lanes~="${lane}"]`);
}

function octaveTimelineCanvas(page) {
  return page.locator("[data-octave-timeline-canvas='true']");
}

async function canvasTimelineState(page) {
  return page.evaluate(() => window.__midiStudioV2App.instrumentGrid.timelineCanvasState());
}

async function waitForCanvasRender(page) {
  await page.waitForFunction(() => Number(document.querySelector("[data-octave-timeline-canvas='true']")?.dataset.renderFrame || 0) > 0);
}

async function scrollCanvasCellIntoView(page, rowToken, stepIndex) {
  await page.locator("#instrumentGridOutput").evaluate((output, target) => {
    const state = window.__midiStudioV2App.instrumentGrid.timelineCanvasState();
    const rowIndex = state.rows.findIndex((row) => row.value === target.rowToken);
    output.scrollLeft = Math.max(0, state.axisWidth + target.stepIndex * state.cellSize - output.clientWidth / 2);
    output.scrollTop = Math.max(0, state.headerHeight + rowIndex * state.cellSize - output.clientHeight / 2);
    output.dispatchEvent(new Event("scroll"));
  }, { rowToken, stepIndex });
}

async function clickCanvasCell(page, rowToken, stepIndex) {
  await scrollCanvasCellIntoView(page, rowToken, stepIndex);
  const point = await page.evaluate((target) => window.__midiStudioV2App.instrumentGrid.timelineCanvasCellCenter(target.rowToken, target.stepIndex), { rowToken, stepIndex });
  expect(point).toBeTruthy();
  await page.mouse.click(point.x, point.y);
}

async function clickCanvasSectionHeader(page, label, occurrenceIndex = 0) {
  await page.locator("[data-octave-timeline-canvas='true']").evaluate((canvas) => {
    const top = canvas.getBoundingClientRect().top + window.scrollY;
    window.scrollTo(0, Math.max(0, top - 160));
  });
  await page.locator("#instrumentGridOutput").evaluate((output, target) => {
    const point = window.__midiStudioV2App.instrumentGrid.timelineCanvasSectionHeaderCenter(target.label, target.occurrenceIndex);
    if (!point) {
      return;
    }
    const rect = output.getBoundingClientRect();
    const desiredX = rect.left + Math.min(rect.width - 24, Math.max(24, rect.width * 0.65));
    if (point.x < rect.left + 24 || point.x > rect.right - 24) {
      output.scrollLeft = Math.max(0, output.scrollLeft + point.x - desiredX);
    }
  }, { label, occurrenceIndex });
  await page.waitForFunction((target) => {
    const output = document.querySelector("#instrumentGridOutput");
    const point = window.__midiStudioV2App.instrumentGrid.timelineCanvasSectionHeaderCenter(target.label, target.occurrenceIndex);
    const rect = output?.getBoundingClientRect();
    return Boolean(point && rect && point.x >= rect.left + 8 && point.x <= rect.right - 8);
  }, { label, occurrenceIndex });
  const point = await page.evaluate((target) => window.__midiStudioV2App.instrumentGrid.timelineCanvasSectionHeaderCenter(target.label, target.occurrenceIndex), { label, occurrenceIndex });
  expect(point).toBeTruthy();
  await page.mouse.click(point.x, point.y);
}

async function clickCanvasKeyboardKey(page, rowToken) {
  await page.locator("#instrumentGridOutput").evaluate((output, target) => {
    const state = window.__midiStudioV2App.instrumentGrid.timelineCanvasState();
    const rowIndex = state.rows.findIndex((row) => row.value === target.rowToken);
    output.scrollLeft = 0;
    output.scrollTop = Math.max(0, state.headerHeight + rowIndex * state.cellSize - output.clientHeight / 2);
    output.dispatchEvent(new Event("scroll"));
  }, { rowToken });
  const point = await page.evaluate((target) => {
    const canvas = document.querySelector("[data-octave-timeline-canvas='true']");
    const state = window.__midiStudioV2App.instrumentGrid.timelineCanvasState();
    const rowIndex = state.rows.findIndex((row) => row.value === target.rowToken);
    if (!canvas || rowIndex < 0) {
      return null;
    }
    const rect = canvas.getBoundingClientRect();
    return {
      x: rect.left + state.axisWidth / 2,
      y: rect.top + state.headerHeight + rowIndex * state.cellSize + state.cellSize / 2
    };
  }, { rowToken });
  expect(point).toBeTruthy();
  await page.mouse.click(point.x, point.y);
}

async function hoverCanvasCell(page, rowToken, stepIndex) {
  await scrollCanvasCellIntoView(page, rowToken, stepIndex);
  const point = await page.evaluate((target) => window.__midiStudioV2App.instrumentGrid.timelineCanvasCellCenter(target.rowToken, target.stepIndex), { rowToken, stepIndex });
  expect(point).toBeTruthy();
  await page.mouse.move(point.x, point.y);
}

async function dragCanvasCells(page, fromRowToken, fromStepIndex, toRowToken, toStepIndex) {
  await scrollCanvasCellIntoView(page, fromRowToken, fromStepIndex);
  const points = await page.evaluate((target) => ({
    from: window.__midiStudioV2App.instrumentGrid.timelineCanvasCellCenter(target.fromRowToken, target.fromStepIndex),
    to: window.__midiStudioV2App.instrumentGrid.timelineCanvasCellCenter(target.toRowToken, target.toStepIndex)
  }), { fromRowToken, fromStepIndex, toRowToken, toStepIndex });
  expect(points.from).toBeTruthy();
  expect(points.to).toBeTruthy();
  await page.mouse.move(points.from.x, points.from.y);
  await page.mouse.down();
  await page.mouse.move(points.to.x, points.to.y, { steps: 8 });
  await page.mouse.up();
}

async function canvasCellPixel(page, rowToken, stepIndex) {
  return page.evaluate((target) => {
    const canvas = document.querySelector("[data-octave-timeline-canvas='true']");
    const point = window.__midiStudioV2App.instrumentGrid.timelineCanvasCellCenter(target.rowToken, target.stepIndex);
    const ratio = canvas.width / canvas.clientWidth;
    const sample = canvas.getContext("2d").getImageData(Math.round((point.x - canvas.getBoundingClientRect().left) * ratio), Math.round((point.y - canvas.getBoundingClientRect().top) * ratio), 1, 1).data;
    return Array.from(sample);
  }, { rowToken, stepIndex });
}

async function emptyCanvasRun(page, { lane = "lead", length = 3 } = {}) {
  return page.evaluate(({ lane, length }) => {
    const app = window.__midiStudioV2App;
    const result = app.lastInstrumentGridResult;
    const state = app.instrumentGrid.timelineCanvasState();
    const rows = state.rows.map((row) => row.value);
    const hasNote = (rowToken, stepIndex) => result.timeline.some((event) => event.lane === lane
      && event.stepIndex === stepIndex
      && app.instrumentGrid.rowsForEvent(event).includes(rowToken));
    for (const rowToken of rows) {
      for (let stepIndex = 1; stepIndex <= result.totalSteps - length; stepIndex += 1) {
        let empty = true;
        for (let offset = 0; offset < length; offset += 1) {
          if (hasNote(rowToken, stepIndex + offset)) {
            empty = false;
            break;
          }
        }
        if (empty) {
          return { rowToken, stepIndex };
        }
      }
    }
    return null;
  }, { lane, length });
}

async function hasCanvasNote(page, lane, rowToken, stepIndex) {
  return page.evaluate((target) => {
    const app = window.__midiStudioV2App;
    return app.lastInstrumentGridResult.timeline.some((event) => event.lane === target.lane
      && event.stepIndex === target.stepIndex
      && app.instrumentGrid.rowsForEvent(event).includes(target.rowToken));
  }, { lane, rowToken, stepIndex });
}

function instrumentRow(page, lane) {
  return page.locator(`.midi-studio-v2__instrument-row[data-lane="${lane}"]`);
}

function instrumentLaneDomId(lane) {
  return String(lane || "")
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join("");
}

async function selectInstrumentRow(page, lane) {
  await instrumentRow(page, lane).locator(`[data-lane-label="${lane}"]`).click();
}

function timelineQuickInstrumentRow(page, lane) {
  return page.locator(`[data-quick-instrument-lane="${lane}"]`);
}

function instrumentTypeSelect(page, lane) {
  return page.locator(`#previewInstrumentType${instrumentLaneDomId(lane)}Select`);
}

function instrumentSelect(page, lane) {
  return page.locator(`#previewInstrument${instrumentLaneDomId(lane)}Select`);
}

function instrumentToggle(page, lane, kind) {
  return instrumentRow(page, lane).locator(`.midi-studio-v2__lane-toggle--${kind}`);
}

async function instrumentScrollSnapshot(page) {
  return page.evaluate(() => {
    const leftPanel = document.querySelector(".tool-starter__panel--left");
    const instrumentPanel = document.querySelector(".midi-studio-v2__instrument-list-panel");
    return {
      instrumentLeft: instrumentPanel?.scrollLeft || 0,
      instrumentTop: instrumentPanel?.scrollTop || 0,
      leftLeft: leftPanel?.scrollLeft || 0,
      leftTop: leftPanel?.scrollTop || 0,
      windowX: window.scrollX,
      windowY: window.scrollY
    };
  });
}

async function controlColors(page, selector) {
  return page.locator(selector).evaluate((control) => {
    const style = getComputedStyle(control);
    return {
      borderTopColor: style.borderTopColor,
      color: style.color
    };
  });
}

async function setInputValue(page, selector, value, eventType = "input") {
  await page.locator(selector).evaluate((input, { dispatchType, nextValue }) => {
    input.value = String(nextValue);
    input.dispatchEvent(new Event(dispatchType, { bubbles: true }));
  }, { dispatchType: eventType, nextValue: value });
}

async function setCheckboxValue(page, selector, checked) {
  await page.locator(selector).evaluate((input, nextChecked) => {
    input.checked = Boolean(nextChecked);
    input.dispatchEvent(new Event("change", { bubbles: true }));
  }, checked);
}

async function visibleMidiStudioControlOwnership(page, activeTabId) {
  return page.evaluate((tabId) => {
    const staticControls = {
      addInstrumentRowButton: { canonical: "music.songs[].studioArrangement.lanes / previewLaneSettings", kind: "canonical-action", owner: "Instruments", wired: "wired" },
      addSongButton: { canonical: "music.songs[] / tools.midi-studio-v2.activeSongId", kind: "canonical-action", owner: "Song Setup", wired: "wired" },
      clearStatusButton: { canonical: "diagnostic status log", kind: "action", owner: "Diagnostics", wired: "wired" },
      closeInstrumentPanelButton: { canonical: "accordion view state", kind: "view-state", owner: "Instruments", wired: "wired" },
      duplicateInstrumentRowButton: { canonical: "music.songs[].studioArrangement.lanes / previewLaneSettings", kind: "canonical-action", owner: "Octave Timeline", wired: "wired" },
      duplicateInstrumentPresetButton: { canonical: "Instruments tab instrument preset library", kind: "workflow-state", owner: "Instruments", wired: "wired" },
      futureAutosaveButton: { canonical: "future editing history", kind: "unwired", owner: "Song Setup", wired: "unwired" },
      futureEnableMidiInputButton: { canonical: "future MIDI input", kind: "unwired", owner: "MIDI Import", wired: "unwired" },
      futureMidiDeviceSelect: { canonical: "future MIDI input", kind: "unwired", owner: "MIDI Import", wired: "unwired" },
      futureRecordMidiButton: { canonical: "future MIDI input", kind: "unwired", owner: "MIDI Import", wired: "unwired" },
      futureRedoButton: { canonical: "future editing history", kind: "unwired", owner: "Song Setup", wired: "unwired" },
      futureRevertToSavedButton: { canonical: "future editing history", kind: "unwired", owner: "Song Setup", wired: "unwired" },
      futureRevisionHistoryButton: { canonical: "future editing history", kind: "unwired", owner: "Song Setup", wired: "unwired" },
      futureRenderQualitySelect: { canonical: "future export rendering", kind: "unwired", owner: "Export", wired: "unwired" },
      futureSampleRateSelect: { canonical: "future export rendering", kind: "unwired", owner: "Export", wired: "unwired" },
      futureSnapshotsButton: { canonical: "future editing history", kind: "unwired", owner: "Song Setup", wired: "unwired" },
      futureSoundFontSelect: { canonical: "future export rendering", kind: "unwired", owner: "Export", wired: "unwired" },
      futureUndoButton: { canonical: "future editing history", kind: "unwired", owner: "Song Setup", wired: "unwired" },
      generateArpeggioFromChordsButton: { canonical: "music.songs[].studioArrangement.lanes.lead", kind: "canonical-action", owner: "Auto-Create Parts", wired: "wired" },
      generateBasicDrumsButton: { canonical: "music.songs[].studioArrangement.lanes.drums", kind: "canonical-action", owner: "Auto-Create Parts", wired: "wired" },
      generateBassFromChordsButton: { canonical: "music.songs[].studioArrangement.lanes.bass", kind: "canonical-action", owner: "Auto-Create Parts", wired: "wired" },
      generatePadFromChordsButton: { canonical: "music.songs[].studioArrangement.lanes.pad", kind: "canonical-action", owner: "Auto-Create Parts", wired: "wired" },
      importMidiSourceButton: { canonical: "music.songs[].studioArrangement / source MIDI normalization", kind: "canonical-action", owner: "MIDI Import", wired: "wired" },
      inspectMidiSourceButton: { canonical: "MIDI import diagnostics", kind: "action", owner: "MIDI Import", wired: "wired" },
      instrumentGridBeatsInput: { canonical: "music.songs[].studioArrangement.beatsPerBar", kind: "canonical", owner: "Auto-Create Parts", wired: "wired" },
      instrumentGridChordsInput: { canonical: "music.songs[].studioArrangement.lanes.chords", kind: "canonical", owner: "Auto-Create Parts", wired: "wired" },
      instrumentGridDrumsInput: { canonical: "music.songs[].studioArrangement.lanes.drums", kind: "canonical", owner: "Auto-Create Parts", wired: "wired" },
      instrumentGridBassInput: { canonical: "music.songs[].studioArrangement.lanes.bass", kind: "canonical", owner: "Auto-Create Parts", wired: "wired" },
      instrumentGridLaneTypeSelect: { canonical: "helper workflow selection", kind: "workflow-state", owner: "Auto-Create Parts", wired: "wired" },
      instrumentGridLeadInput: { canonical: "music.songs[].studioArrangement.lanes.lead", kind: "canonical", owner: "Auto-Create Parts", wired: "wired" },
      instrumentGridLoopEndSelect: { canonical: "timing preview region state", kind: "workflow-state", owner: "Octave Timeline", wired: "wired" },
      instrumentGridLoopStartSelect: { canonical: "timing preview region state", kind: "workflow-state", owner: "Octave Timeline", wired: "wired" },
      instrumentGridPadInput: { canonical: "music.songs[].studioArrangement.lanes.pad", kind: "canonical", owner: "Auto-Create Parts", wired: "wired" },
      instrumentGridSectionSelect: { canonical: "timing preview section state", kind: "workflow-state", owner: "Octave Timeline", wired: "wired" },
      instrumentGridSectionsInput: { canonical: "derived from music.songs[].studioArrangement.sections", kind: "readonly", owner: "Auto-Create Parts", wired: "wired" },
      instrumentGridSubdivisionInput: { canonical: "music.songs[].studioArrangement.subdivision", kind: "canonical", owner: "Auto-Create Parts", wired: "wired" },
      instrumentGridZoomInButton: { canonical: "octave timeline view zoom state", kind: "view-state", owner: "Octave Timeline", wired: "wired" },
      instrumentGridZoomOutButton: { canonical: "octave timeline view zoom state", kind: "view-state", owner: "Octave Timeline", wired: "wired" },
      instrumentSetField: { canonical: "music.songs[].instrumentSet", kind: "readonly", owner: "MIDI Import", wired: "wired" },
      instrumentPresetSelect: { canonical: "Instruments tab instrument preset library", kind: "workflow-state", owner: "Instruments", wired: "wired" },
      instrumentPresetSummary: { canonical: "derived from Instruments tab instrument preset library", kind: "readonly", owner: "Instruments", wired: "wired" },
      jumpToSectionButton: { canonical: "timing preview section state", kind: "workflow-state", owner: "Octave Timeline", wired: "wired" },
      loadInstrumentPresetButton: { canonical: "Instruments tab instrument preset library", kind: "workflow-state", owner: "Instruments", wired: "wired" },
      loopToggle: { canonical: "playback loop state", kind: "workflow-state", owner: "Octave Timeline", wired: "wired" },
      moveInstrumentDownButton: { canonical: "music.songs[].studioArrangement.lanes order", kind: "canonical-action", owner: "Octave Timeline", wired: "wired" },
      moveInstrumentUpButton: { canonical: "music.songs[].studioArrangement.lanes order", kind: "canonical-action", owner: "Octave Timeline", wired: "wired" },
      normalizeInstrumentGridButton: { canonical: "music.songs[].studioArrangement", kind: "canonical-action", owner: "Auto-Create Parts", wired: "wired" },
      parseSongSheetButton: { canonical: "music.songs[].studioArrangement", kind: "canonical-action", owner: "Song Setup", wired: "wired" },
      playButton: { canonical: "playback from selected canonical song model", kind: "action", owner: "Global NAV", wired: "wired" },
      playLoopButton: { canonical: "timing preview playback state", kind: "workflow-state", owner: "Octave Timeline", wired: "wired" },
      playSectionButton: { canonical: "timing preview playback state", kind: "workflow-state", owner: "Octave Timeline", wired: "wired" },
      playSequenceButton: { canonical: "timing preview playback state from Song Sequence order", kind: "workflow-state", owner: "Octave Timeline", wired: "wired" },
      regenerateArrangementButton: { canonical: "music.songs[].studioArrangement generated lanes from Song Sheet sequence", kind: "canonical-action", owner: "Song Setup", wired: "wired" },
      renderedExportSaveButton: { canonical: "future rendered audio renderer", kind: "unwired", owner: "Export", wired: "unwired" },
      renderedExportTargetTypeSelect: { canonical: "future rendered audio renderer", kind: "unwired", owner: "Export", wired: "unwired" },
      resetSongEditsButton: { canonical: "music.songs[] reset baseline", kind: "canonical-action", owner: "Global NAV", wired: "wired" },
      returnToWorkspaceButton: { canonical: "workspace navigation", kind: "action", owner: "Workspace NAV", wired: "wired" },
      saveInstrumentPresetButton: { canonical: "Instruments tab instrument preset library", kind: "workflow-state", owner: "Instruments", wired: "wired" },
      saveProjectButton: { canonical: "serialized midi-studio-v2 tool state", kind: "canonical-action", owner: "Global NAV", wired: "wired" },
      songSheetAddSectionToSequenceButton: { canonical: "music.songs[].studioArrangement.songSheet.sequence", kind: "canonical-action", owner: "Song Setup", wired: "wired" },
      songSheetAddCustomSectionButton: { canonical: "music.songs[].studioArrangement.songSheet.sections", kind: "canonical-action", owner: "Song Setup", wired: "wired" },
      songSheetApplyArrangementTemplateButton: { canonical: "music.songs[].studioArrangement.songSheet.sequence", kind: "canonical-action", owner: "Song Setup", wired: "wired" },
      songSheetApplyBassInput: { canonical: "music.songs[].studioArrangement.songSheet.applyTargets.bass", kind: "canonical", owner: "Song Setup", wired: "wired" },
      songSheetApplyChordsPadInput: { canonical: "music.songs[].studioArrangement.songSheet.applyTargets.chordsPad", kind: "canonical", owner: "Song Setup", wired: "wired" },
      songSheetApplyDrumsInput: { canonical: "music.songs[].studioArrangement.songSheet.applyTargets.drums", kind: "canonical", owner: "Song Setup", wired: "wired" },
      songSheetApplyLeadInput: { canonical: "music.songs[].studioArrangement.songSheet.applyTargets.lead", kind: "canonical", owner: "Song Setup", wired: "wired" },
      songSheetAvailableSectionsList: { canonical: "derived from populated Song Sheet section inputs", kind: "readonly", owner: "Song Setup", wired: "wired" },
      songSheetArrangementTemplateSelect: { canonical: "Song Sheet arrangement template library", kind: "workflow-state", owner: "Song Setup", wired: "wired" },
      songSheetArrangementTemplateSummary: { canonical: "derived from Song Sheet arrangement template library", kind: "readonly", owner: "Song Setup", wired: "wired" },
      songSheetClassificationGuide: { canonical: "derived from music.songs[].classification defaults", kind: "readonly", owner: "Song Setup", wired: "wired" },
      songSheetCustomSectionsInput: { canonical: "music.songs[].studioArrangement.songSheet.sections", kind: "canonical", owner: "Song Setup", wired: "wired" },
      songSheetCustomSectionMetrics: { canonical: "derived from populated custom Song Sheet sections", kind: "readonly", owner: "Song Setup", wired: "wired" },
      songSheetDragDropSequenceButton: { canonical: "future Song Sequence drag/drop", kind: "unwired", owner: "Song Setup", wired: "unwired" },
      songSheetDuplicateSectionButton: { canonical: "Song Sheet reusable section library", kind: "workflow-state", owner: "Song Setup", wired: "wired" },
      songSheetDuplicateSequenceButton: { canonical: "music.songs[].studioArrangement.songSheet.sequence", kind: "canonical-action", owner: "Song Setup", wired: "wired" },
      songSheetKeyInput: { canonical: "music.songs[].studioArrangement.key", kind: "canonical", owner: "Song Setup", wired: "wired" },
      songSheetLoadSectionButton: { canonical: "Song Sheet reusable section library", kind: "workflow-state", owner: "Song Setup", wired: "wired" },
      songSheetSaveSectionButton: { canonical: "Song Sheet reusable section library", kind: "workflow-state", owner: "Song Setup", wired: "wired" },
      songSheetSectionBridgeInput: { canonical: "music.songs[].studioArrangement.songSheet.sections.Bridge", kind: "canonical", owner: "Song Setup", wired: "wired" },
      songSheetSectionBridgeMetrics: { canonical: "derived from Song Sheet section Bridge", kind: "readonly", owner: "Song Setup", wired: "wired" },
      songSheetSectionChorusInput: { canonical: "music.songs[].studioArrangement.songSheet.sections.Chorus", kind: "canonical", owner: "Song Setup", wired: "wired" },
      songSheetSectionChorusMetrics: { canonical: "derived from Song Sheet section Chorus", kind: "readonly", owner: "Song Setup", wired: "wired" },
      songSheetSectionIntroInput: { canonical: "music.songs[].studioArrangement.songSheet.sections.Intro", kind: "canonical", owner: "Song Setup", wired: "wired" },
      songSheetSectionIntroMetrics: { canonical: "derived from Song Sheet section Intro", kind: "readonly", owner: "Song Setup", wired: "wired" },
      songSheetSectionOutroInput: { canonical: "music.songs[].studioArrangement.songSheet.sections.Outro", kind: "canonical", owner: "Song Setup", wired: "wired" },
      songSheetSectionOutroMetrics: { canonical: "derived from Song Sheet section Outro", kind: "readonly", owner: "Song Setup", wired: "wired" },
      songSheetSectionVerseInput: { canonical: "music.songs[].studioArrangement.songSheet.sections.Verse", kind: "canonical", owner: "Song Setup", wired: "wired" },
      songSheetSectionVerseMetrics: { canonical: "derived from Song Sheet section Verse", kind: "readonly", owner: "Song Setup", wired: "wired" },
      songSheetSectionLibrarySelect: { canonical: "Song Sheet reusable section library", kind: "workflow-state", owner: "Song Setup", wired: "wired" },
      songSheetSectionLibrarySummary: { canonical: "derived from Song Sheet reusable section library", kind: "readonly", owner: "Song Setup", wired: "wired" },
      songSheetSequenceInput: { canonical: "music.songs[].studioArrangement.songSheet.sequence", kind: "canonical", owner: "Song Setup", wired: "wired" },
      songSheetSequenceList: { canonical: "music.songs[].studioArrangement.songSheet.sequence", kind: "canonical", owner: "Song Setup", wired: "wired" },
      songSheetSequenceMoveDownButton: { canonical: "music.songs[].studioArrangement.songSheet.sequence", kind: "canonical-action", owner: "Song Setup", wired: "wired" },
      songSheetSequenceMoveUpButton: { canonical: "music.songs[].studioArrangement.songSheet.sequence", kind: "canonical-action", owner: "Song Setup", wired: "wired" },
      songSheetSequenceRemoveButton: { canonical: "music.songs[].studioArrangement.songSheet.sequence", kind: "canonical-action", owner: "Song Setup", wired: "wired" },
      songSheetSequenceSummary: { canonical: "derived from music.songs[].studioArrangement.songSheet.sequence", kind: "readonly", owner: "Song Setup", wired: "wired" },
      songSheetSectionsInput: { canonical: "music.songs[].studioArrangement.songSheet.sections", kind: "canonical", owner: "Song Setup", wired: "wired" },
      songSheetStyleInput: { canonical: "music.songs[].studioArrangement.style", kind: "canonical", owner: "Song Setup", wired: "wired" },
      songSheetApplySectionTemplateButton: { canonical: "music.songs[].studioArrangement.songSheet.sections", kind: "canonical-action", owner: "Song Setup", wired: "wired" },
      songSheetTemplatePreview: { canonical: "built-in Song Sheet section templates", kind: "readonly", owner: "Song Setup", wired: "wired" },
      songSheetTemplateSectionSelect: { canonical: "built-in Song Sheet section templates", kind: "workflow-state", owner: "Song Setup", wired: "wired" },
      songSheetTempoInput: { canonical: "music.songs[].studioArrangement.tempo", kind: "canonical", owner: "Song Setup", wired: "wired" },
      songSourceField: { canonical: "music.songs[].sourceMidi", kind: "readonly", owner: "MIDI Import", wired: "wired" },
      statusLog: { canonical: "diagnostic status log", kind: "readonly", owner: "Diagnostics", wired: "wired" },
      stopAllAudioButton: { canonical: "preview/playback audio state", kind: "action", owner: "Global NAV", wired: "wired" },
      stopButton: { canonical: "playback state", kind: "action", owner: "Global NAV", wired: "wired" },
      stopTimingPreviewButton: { canonical: "timing preview playback state", kind: "workflow-state", owner: "Octave Timeline", wired: "wired" },
      toolCopyJsonButton: { canonical: "serialized midi-studio-v2 tool state", kind: "action", owner: "Diagnostics", wired: "wired" },
      toolExportToolStateButton: { canonical: "serialized midi-studio-v2 tool state", kind: "action", owner: "Export", wired: "wired" },
      toolImportManifestButton: { canonical: "imported game manifest / midi-studio-v2 payload", kind: "canonical-action", owner: "Global NAV", wired: "wired" },
      timelineAddInstrumentRowButton: { canonical: "music.songs[].studioArrangement.lanes / previewLaneSettings", kind: "canonical-action", owner: "Octave Timeline", wired: "wired" },
      timelineCloseInstrumentPanelButton: { canonical: "accordion view state", kind: "view-state", owner: "Octave Timeline", wired: "wired" },
      workspaceCopyManifestButton: { canonical: "workspace manifest proxy", kind: "unwired", owner: "Workspace NAV", wired: "unwired" },
      workspaceExportManifestButton: { canonical: "workspace manifest proxy", kind: "unwired", owner: "Workspace NAV", wired: "unwired" },
      workspaceImportManifestButton: { canonical: "workspace manifest proxy", kind: "unwired", owner: "Workspace NAV", wired: "unwired" }
    };
    const selector = [
      "button",
      "input",
      "select",
      "textarea",
      "output",
      "summary",
      "canvas[data-octave-timeline-canvas='true']",
      "[role='button']",
      "[role='tab']",
      "[contenteditable='true']",
      ".accordion-v2__header"
    ].join(",");
    const isVisible = (element) => {
      if (element.hidden || element.type === "hidden" || element.closest("[hidden]")) {
        return false;
      }
      const style = getComputedStyle(element);
      if (style.display === "none" || style.visibility === "hidden") {
        return false;
      }
      const rect = element.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    };
    const panelName = (element) => {
      const panel = element.closest("[data-midi-studio-tab-panel]")?.dataset.midiStudioTabPanel || "";
      if (panel.includes("song-setup")) {
        return "Song Setup";
      }
      if (panel.includes("studio")) {
        return "Octave Timeline";
      }
      if (panel.includes("instruments")) {
        return "Instruments";
      }
      if (panel.includes("auto-create-parts")) {
        return "Auto-Create Parts";
      }
      if (panel.includes("midi-import")) {
        return "MIDI Import";
      }
      if (panel.includes("diagnostics")) {
        return "Diagnostics";
      }
      if (panel.includes("export")) {
        return "Export";
      }
      if (element.closest("#workspaceNav")) {
        return "Workspace NAV";
      }
      if (element.closest("#toolNav")) {
        return "Global NAV";
      }
      return "Shell";
    };
    const controlText = (element) => (element.getAttribute("aria-label")
      || element.title
      || element.placeholder
      || element.textContent
      || element.value
      || element.id
      || element.tagName).trim().replace(/\s+/g, " ");
    const stateForUnwired = (element, owner = panelName(element)) => ({
      canonical: element.dataset.midiStudioFutureDetail || element.dataset.midiStudioUnwiredStatus || "not implemented",
      kind: "unwired",
      owner,
      wired: "unwired"
    });
    const classify = (element) => {
      if (element.dataset.midiStudioFutureControl !== undefined || element.dataset.midiStudioUnwired) {
        return stateForUnwired(element);
      }
      if (element.id && staticControls[element.id]) {
        return staticControls[element.id];
      }
      if (element.dataset.midiStudioTab) {
        return { canonical: "active tab view state", kind: "view-state", owner: "Tabs", wired: "wired" };
      }
      if (element.matches("summary, .accordion-v2__header")) {
        return { canonical: "accordion view state", kind: "view-state", owner: panelName(element), wired: "wired" };
      }
      if (element.dataset.songId) {
        return { canonical: "tools.midi-studio-v2.activeSongId", kind: "canonical-action", owner: "Song Setup", wired: "wired" };
      }
      if (element.dataset.songDetailField) {
        const field = element.dataset.songDetailField;
        const fields = {
          classification: "music.songs[].classification",
          id: "music.songs[].id (read-only derived from name and classification)",
          loopEnabled: "music.songs[].loop.enabled",
          loopEndSeconds: "music.songs[].loop.endSeconds",
          loopStartSeconds: "music.songs[].loop.startSeconds",
          name: "music.songs[].name",
          notes: "music.songs[].director.notes"
        };
        return { canonical: fields[field] || `music.songs[].${field}`, kind: field === "id" ? "readonly" : "canonical", owner: "Song Setup", wired: "wired" };
      }
      if (element.dataset.renderedTargetFormat) {
        return { canonical: `music.songs[].rendered.${element.dataset.renderedTargetFormat}`, kind: "canonical", owner: "Export", wired: "wired" };
      }
      if (element.dataset.quickInstrumentLane) {
        return { canonical: "tools.midi-studio-v2.selectedInstrumentId", kind: "canonical-action", owner: "Octave Timeline", wired: "wired" };
      }
      if (element.dataset.timelineQuickMute) {
        return { canonical: "music.songs[].studioArrangement.previewLaneSettings.muted", kind: "canonical-action", owner: "Octave Timeline", wired: "wired" };
      }
      if (element.dataset.timelineQuickSolo) {
        return { canonical: "music.songs[].studioArrangement.previewLaneSettings.soloed", kind: "canonical-action", owner: "Octave Timeline", wired: "wired" };
      }
      if (element.dataset.toggleInstrumentVisibility) {
        return { canonical: "music.songs[].studioArrangement.previewLaneSettings.visible", kind: "canonical-action", owner: "Octave Timeline", wired: "wired" };
      }
      if (element.dataset.lane) {
        return { canonical: "tools.midi-studio-v2.selectedInstrumentId", kind: "canonical-action", owner: "Instruments", wired: "wired" };
      }
      if (element.dataset.deleteInstrumentRow) {
        return { canonical: "music.songs[].studioArrangement.lanes / previewLaneSettings", kind: "canonical-action", owner: "Instruments", wired: "wired" };
      }
      if (element.dataset.instrumentDisplayNameLane) {
        return { canonical: "music.songs[].studioArrangement.previewLaneSettings.displayNames", kind: "canonical", owner: "Instruments", wired: "wired" };
      }
      if (element.dataset.laneInstrumentTypeSelect) {
        return { canonical: "music.songs[].studioArrangement.previewLaneSettings.instrumentTypes", kind: "canonical", owner: "Instruments", wired: "wired" };
      }
      if (element.dataset.laneInstrumentSelect) {
        return { canonical: "music.songs[].studioArrangement.previewLaneSettings.instruments", kind: "canonical", owner: "Instruments", wired: "wired" };
      }
      if (element.dataset.previewVolumeLane) {
        return { canonical: "music.songs[].studioArrangement.previewLaneSettings.volumes", kind: "canonical", owner: "Instruments", wired: "wired" };
      }
      if (element.dataset.previewPanLane) {
        return { canonical: "music.songs[].studioArrangement.previewLaneSettings.pans", kind: "canonical", owner: "Instruments", wired: "wired" };
      }
      if (element.dataset.previewMuteLane) {
        return { canonical: "music.songs[].studioArrangement.previewLaneSettings.muted", kind: "canonical", owner: "Instruments", wired: "wired" };
      }
      if (element.dataset.previewSoloLane) {
        return { canonical: "music.songs[].studioArrangement.previewLaneSettings.soloed", kind: "canonical", owner: "Instruments", wired: "wired" };
      }
      if (element.dataset.instrumentOctaveLowLane || element.dataset.instrumentOctaveHighLane) {
        return { canonical: "music.songs[].studioArrangement.previewLaneSettings.octaveRanges", kind: "canonical", owner: "Instruments", wired: "wired" };
      }
      if (element.dataset.instrumentTransposeLane) {
        return { canonical: "music.songs[].studioArrangement.previewLaneSettings.transposes", kind: "canonical", owner: "Instruments", wired: "wired" };
      }
      if (element.dataset.instrumentVelocityLane) {
        return { canonical: "music.songs[].studioArrangement.previewLaneSettings.velocities", kind: "canonical", owner: "Instruments", wired: "wired" };
      }
      if (element.dataset.instrumentDurationLane) {
        return { canonical: "music.songs[].studioArrangement.previewLaneSettings.durations", kind: "canonical", owner: "Instruments", wired: "wired" };
      }
      if (element.dataset.instrumentDerivedField) {
        return { canonical: "derived from selected instrument preview mapping", kind: "readonly", owner: "Instruments", wired: "wired" };
      }
      if (element.dataset.auditionRangeSummary) {
        return { canonical: "derived from selected instrument octave range", kind: "readonly", owner: "Instruments", wired: "wired" };
      }
      if (element.dataset.auditionNote) {
        return { canonical: "Preview Synth audition action", kind: "action", owner: "Instruments", wired: "wired" };
      }
      if (element.dataset.sectionPreset) {
        return { canonical: "timing preview section state", kind: "workflow-state", owner: "Octave Timeline", wired: "wired" };
      }
      if (element.dataset.octaveTimelineCanvas) {
        return { canonical: "music.songs[].studioArrangement.lanes", kind: "canonical", owner: "Octave Timeline", wired: "wired" };
      }
      return { canonical: "", kind: "unclassified", owner: panelName(element), wired: "unknown" };
    };
    const editableTag = (element) => {
      if (element.isContentEditable) {
        return true;
      }
      if (!element.matches("input, select, textarea")) {
        return false;
      }
      return !element.disabled && !element.readOnly && element.type !== "file" && element.type !== "hidden";
    };
    return Array.from(document.querySelectorAll(selector))
      .filter(isVisible)
      .map((element) => {
        const ownership = classify(element);
        const unwired = element.dataset.midiStudioFutureControl !== undefined || element.dataset.midiStudioUnwired;
        return {
          activeTabId: tabId,
          ariaLabel: element.getAttribute("aria-label") || "",
          canonical: ownership.canonical,
          control: element.id ? `#${element.id}` : controlText(element),
          editable: editableTag(element),
          kind: ownership.kind,
          owner: ownership.owner,
          tag: element.tagName.toLowerCase(),
          text: controlText(element),
          title: element.title || "",
          unwired,
          unwiredClass: element.classList.contains("midi-studio-v2__unwired-control"),
          unwiredStatus: element.dataset.midiStudioUnwired || "",
          wired: ownership.wired
        };
      });
  }, activeTabId);
}

async function prepareInstrumentScrollSentinel(page) {
  await page.evaluate(() => {
    const leftPanel = document.querySelector(".tool-starter__panel--left");
    const instrumentPanel = document.querySelector(".midi-studio-v2__instrument-list-panel");
    if (leftPanel) {
      leftPanel.style.maxHeight = "260px";
      leftPanel.style.overflow = "auto";
      leftPanel.scrollLeft = 0;
    }
    if (instrumentPanel) {
      instrumentPanel.style.maxHeight = "170px";
      instrumentPanel.style.overflow = "auto";
      instrumentPanel.scrollLeft = 0;
    }
  });
}

async function expectInstrumentClickKeepsScroll(page, locator) {
  await prepareInstrumentScrollSentinel(page);
  await locator.evaluate((element) => element.scrollIntoView({ block: "center", inline: "nearest" }));
  const before = await instrumentScrollSnapshot(page);
  await locator.click();
  await page.waitForTimeout(50);
  await expect.poll(() => instrumentScrollSnapshot(page)).toEqual(before);
}

async function timelineScrollSnapshot(page) {
  return page.locator("#instrumentGridOutput").evaluate((output) => {
    const firstHeader = output.querySelector(".midi-studio-v2__grid-cell--timing-header");
    const firstNoteCell = output.querySelector(".midi-studio-v2__octave-note-cell");
    const topScrollbar = output.querySelector(".midi-studio-v2__timeline-scroll-proxy");
    return {
      headerLeft: Math.round(firstHeader?.getBoundingClientRect().left || 0),
      noteLeft: Math.round(firstNoteCell?.getBoundingClientRect().left || 0),
      scrollDataset: output.dataset.timelineScrollLeft || "",
      scrollLeft: Math.round(output.scrollLeft),
      scrollTop: Math.round(output.scrollTop),
      topScrollLeft: Math.round(topScrollbar?.scrollLeft || 0)
    };
  });
}

function laneHeader(page, lane) {
  return page.locator(`.midi-studio-v2__lane-header-cell[data-lane="${lane}"]`);
}

function laneInstrumentSelect(page, lane) {
  return laneHeader(page, lane).locator("[data-lane-instrument-select]");
}

function laneInstrumentTypeSelect(page, lane) {
  return laneHeader(page, lane).locator("[data-lane-instrument-type-select]");
}

async function setSpreadsheetRowToggle(page, laneLabel, kind, checked) {
  const labelKind = kind.charAt(0).toUpperCase() + kind.slice(1);
  const toggle = page.locator(`.midi-studio-v2__lane-header-cell [aria-label="${labelKind} ${laneLabel}"]`);
  await expect(toggle).toHaveCount(1);
  await toggle.evaluate(
    (input, nextChecked) => {
      input.checked = nextChecked;
      input.dispatchEvent(new Event("change", { bubbles: true }));
    },
    checked
  );
  if (checked) {
    await expect(toggle).toBeChecked();
  } else {
    await expect(toggle).not.toBeChecked();
  }
}

test.describe("MIDI Studio V2", () => {
  test.afterAll(async () => {
    await workspaceV2CoverageReporter.writeReport();
  });

  test("octave timeline remains editable and playable after Song Setup default tab", async ({ page }) => {
    const server = await openMidiStudioForImport(page);
    try {
      await page.locator("#toolImportManifestInput").setInputFiles(uatManifestPath);
      expect(await page.locator("[data-midi-studio-tab]").evaluateAll((tabs) => tabs.map((tab) => tab.textContent.trim()))).toEqual([
        "Song Setup",
        "Octave Timeline",
        "Instruments",
        "Auto-Create Parts",
        "MIDI Import",
        "Diagnostics"
      ]);
      await expect(page.locator('[data-midi-studio-tab="song-setup"]')).toHaveAttribute("aria-selected", "true");
      await expect(page.locator('[data-midi-studio-tab="studio"]')).toHaveText("Octave Timeline");
      await selectMidiStudioTab(page, "studio");
      await expect(page.locator('[data-midi-studio-tab="studio"]')).toHaveAttribute("aria-selected", "true");
      await expect(page.locator('[data-midi-studio-tab="midi-import"]')).toHaveCount(1);
      await expect(page.locator('[data-midi-studio-tab="export"]')).toHaveCount(0);
      await expect(page.locator("#instrumentGridHeading")).toHaveText("Octave Timeline");
      await expect(page.locator("#instrumentGridOutput")).toBeVisible();
      await expect(page.locator(".midi-studio-v2__octave-timeline")).toBeVisible();
      await expect(page.locator(".midi-studio-v2__advanced-lane-source")).toBeHidden();
      await expect(page.locator("#songList [data-song-id]")).toHaveCount(3);
      await expect(page.locator("#songList")).toContainText("Camptown Races UAT Reel");
      await expect(page.locator("#songList")).toContainText("Frog Hop Nursery Rhyme UAT");
      await expect(page.locator("#songList")).toContainText("Coal Mine Descent");
      await expect(page.locator(".midi-studio-v2__instrument-list-panel")).toBeVisible();
      await expect(instrumentRow(page, "lead")).toBeVisible();
      await expect(instrumentRow(page, "bass")).toBeVisible();
      await expect(instrumentRow(page, "chords")).toBeVisible();
      await expect(instrumentRow(page, "pad")).toBeVisible();
      await expect(instrumentRow(page, "drums")).toBeVisible();
      await expect(instrumentTypeSelect(page, "lead")).toHaveValue("Synth Lead");
      await expect(instrumentTypeSelect(page, "drums")).toHaveValue("Percussive");
      await instrumentTypeSelect(page, "lead").selectOption("Piano");
      await expect(instrumentSelect(page, "lead")).toHaveValue("preview-acoustic-grand-piano");
      expect(await instrumentSelect(page, "lead").locator("option").evaluateAll((options) => options.map((option) => option.textContent))).toContain("Acoustic Grand Piano");
      expect(await instrumentTypeSelect(page, "lead").locator("option").evaluateAll((options) => options.map((option) => option.textContent))).toEqual([
        "Piano",
        "Chromatic Percussion",
        "Organ",
        "Guitar",
        "Bass",
        "Strings",
        "Ensemble",
        "Brass",
        "Reed",
        "Pipe",
        "Synth Lead",
        "Synth Pad",
        "Synth Effects",
        "Ethnic",
        "Percussive",
        "Sound Effects"
      ]);
      await instrumentTypeSelect(page, "lead").selectOption("Synth Lead");
      await instrumentSelect(page, "lead").selectOption("retro-pulse-lead");
      await selectInstrumentRow(page, "lead");
      await expect(octaveNoteBlock(page, "lead").first()).toHaveClass(/midi-studio-v2__grid-cell--lane-selected/);
      await expect(octaveNoteBlock(page, "chords").first()).toHaveClass(/midi-studio-v2__grid-cell--lane-dimmed/);
      await expect(page.locator(".midi-studio-v2__octave-row-label[data-octave='5']")).not.toHaveCount(0);
      await expect(octaveCell(page, "G4", 0)).toHaveText("");
      await expect(octaveCell(page, "G4", 0)).toHaveAttribute("data-note-lanes", /lead/);
      await selectInstrumentRow(page, "bass");
      await expect(octaveCell(page, "G2", 0)).toHaveText("");
      await expect(octaveCell(page, "G2", 0)).toHaveAttribute("data-note-lanes", /bass/);
      await instrumentRow(page, "bass").locator("[data-toggle-instrument-visibility='bass']").click();
      await expect(octaveNoteBlock(page, "bass")).toHaveCount(0);
      await expect(page.locator("#statusLog")).toHaveValue(/INFO Lane hidden: Bass\./);
      await instrumentRow(page, "bass").locator("[data-toggle-instrument-visibility='bass']").click();
      await expect(octaveNoteBlock(page, "bass").first()).toBeVisible();
      await selectInstrumentRow(page, "lead");
      await octaveCell(page, "C5", 1).click();
      await expect(octaveCell(page, "C5", 1)).toHaveText("");
      await expect(octaveCell(page, "C5", 1)).toHaveAttribute("data-note-lanes", /lead/);
      expect(await page.evaluate(() => window.__midiStudioV2App.lastInstrumentGridResult.timeline.some((event) => event.lane === "lead" && event.value === "C5" && event.stepIndex === 1))).toBe(true);

      await page.locator("#playButton").click();
      await expect(page.locator("#playButton")).toBeDisabled();
      await expect(page.locator("#stopButton")).toBeEnabled();
      await expect(page.locator("#statusLog")).toHaveValue(/OK Audible preview playback started for Camptown Races UAT Reel\./);
      await expect(page.locator(".midi-studio-v2__grid-cell--timing-header.midi-studio-v2__grid-cell--playhead-active")).toHaveCount(2);
      await expect(page.locator(".midi-studio-v2__note-table-cell.midi-studio-v2__grid-cell--playhead-active")).toHaveCount(0);
      await page.waitForFunction(() => window.__midiStudioV2App.instrumentGrid.playheadStep > 0);
      const activeStep = await page.evaluate(() => window.__midiStudioV2App.instrumentGrid.playheadStep);
      expect(activeStep).toBeGreaterThan(0);
      await expect(page.locator(`.midi-studio-v2__grid-cell--timing-header.midi-studio-v2__grid-cell--playhead-active[data-step-index="${activeStep}"]`)).toHaveCount(2);
      await expect(page.locator(`.midi-studio-v2__note-table-cell.midi-studio-v2__grid-cell--playhead-active[data-step-index="${activeStep}"]`)).toHaveCount(0);
      expect(await page.evaluate(() => window.__midiStudioPreviewSynthEvents.some((event) => event.action === "oscillator-start"))).toBe(true);
      expect(await page.evaluate(() => window.__midiStudioPreviewSynthEvents.some((event) => event.action === "buffer-start"))).toBe(true);
      await page.locator("#stopButton").click();
      await expect(page.locator("#stopButton")).toBeDisabled();
      await expect(page.locator("#playButton")).toBeEnabled();

      await page.locator('[data-song-id="frog-hop-nursery-rhyme"]').click();
      await expect(octaveCell(page, "C5", 0)).toHaveText("");
      await expect(octaveCell(page, "C5", 0)).toHaveAttribute("data-note-lanes", /lead/);
      await page.locator('[data-song-id="quiet-village-pad"]').click();
      await expect(octaveCell(page, "D5", 0)).toHaveText("");
      await expect(octaveCell(page, "D5", 0)).toHaveAttribute("data-note-lanes", /lead/);

      await selectMidiStudioTab(page, "midi-import");
      await page.locator("#midiSourceFileInput").setInputFiles({
        buffer: validMidiBytes,
        mimeType: "audio/midi",
        name: "local-import.midi"
      });
      await expect(page.locator("#statusLog")).toHaveValue(/OK Normalized 1 MIDI note into editable octave timeline data\./);
      await expect(page.locator("#songList")).toContainText("Local Import");
      await selectMidiStudioTab(page, "studio");
      await expect(instrumentRow(page, "track-2-ch-1")).toBeVisible();
      await expect(octaveCell(page, "C4", 0)).toHaveText("");
      await expect(octaveCell(page, "C4", 0)).toHaveAttribute("data-note-lanes", /track-2-ch-1/);
      await octaveCell(page, "D4", 1).click();
      await expect(octaveCell(page, "D4", 1)).toHaveText("");
      await expect(octaveCell(page, "D4", 1)).toHaveAttribute("data-note-lanes", /track-2-ch-1/);
      expect(await page.evaluate(() => window.__midiStudioV2App.selectedSong().studioArrangement.lanes["track-2-ch-1"])).toContain("D4");
      await page.evaluate(() => {
        window.__midiStudioPreviewSynthEvents = [];
      });
      await page.locator("#playButton").click();
      await expect(page.locator("#stopButton")).toBeEnabled();
      expect(await page.evaluate(() => window.__midiStudioPreviewSynthEvents.some((event) => event.action === "oscillator-start"))).toBe(true);
      await page.locator("#stopButton").click();
      await expect(page.locator("#playButton")).toBeEnabled();
    } finally {
      await workspaceV2CoverageReporter.stop(page);
      await server.close();
    }
  });

  test("canvas octave timeline edits canonical data and drives playback without DOM grid repaint", async ({ page }) => {
    const server = await openMidiStudioForImport(page);
    try {
      await page.locator("#toolImportManifestInput").setInputFiles(uatManifestPath);
      await selectMidiStudioTab(page, "studio");
      await expect(page.locator('[data-midi-studio-tab="studio"]')).toHaveAttribute("aria-selected", "true");
      await expect(page.locator("#instrumentGridHeading")).toHaveText("Octave Timeline");
      await expect(page.locator("#instrumentGridOutput")).toHaveAttribute("data-timeline-renderer", "canvas");
      await expect(octaveTimelineCanvas(page)).toBeVisible();
      await expect(page.locator(".midi-studio-v2__octave-note-cell")).toHaveCount(0);
      await expect(page.locator(".midi-studio-v2__grid-cell--timing-header")).toHaveCount(0);
      await expect(page.locator(".midi-studio-v2__instrument-list-panel")).toBeHidden();
      await selectMidiStudioTab(page, "instruments");
      await expect(instrumentTypeSelect(page, "lead")).toHaveJSProperty("tagName", "SELECT");
      await expect(instrumentSelect(page, "lead")).toHaveJSProperty("tagName", "SELECT");
      await expect(page.locator("#playButton")).toHaveJSProperty("tagName", "BUTTON");
      await expect(page.locator("#toolImportManifestInput")).toHaveJSProperty("tagName", "INPUT");

      await selectInstrumentRow(page, "lead");
      await selectMidiStudioTab(page, "studio");
      await waitForCanvasRender(page);
      const initialCanvasState = await canvasTimelineState(page);
      expect(initialCanvasState.rows.some((row) => row.value === "C6")).toBe(true);
      expect(initialCanvasState.rows.some((row) => row.keyKind === "black")).toBe(true);
      expect(initialCanvasState.rows.some((row) => row.keyKind === "white")).toBe(true);
      expect(initialCanvasState.totalSteps).toBeGreaterThan(0);
      expect(initialCanvasState.noteCount).toBeGreaterThan(0);

      const keyboardAxisPixel = await page.evaluate(() => {
        const canvas = document.querySelector("[data-octave-timeline-canvas='true']");
        const state = window.__midiStudioV2App.instrumentGrid.timelineCanvasState();
        const rowIndex = state.rows.findIndex((row) => row.value === "C6");
        const ratio = canvas.width / canvas.clientWidth;
        const sample = canvas.getContext("2d").getImageData(
          Math.round(10 * ratio),
          Math.round((state.headerHeight + rowIndex * state.cellSize + state.cellSize / 2) * ratio),
          1,
          1
        ).data;
        return Array.from(sample);
      });
      expect(keyboardAxisPixel[3]).toBeGreaterThan(0);
      expect(keyboardAxisPixel.slice(0, 3).some((channel) => channel > 0)).toBe(true);

      const editableTarget = await emptyCanvasRun(page, { lane: "lead", length: 1 });
      expect(editableTarget).toBeTruthy();
      await clickCanvasCell(page, editableTarget.rowToken, editableTarget.stepIndex);
      await expect(page.locator("#statusLog")).toHaveValue(/OK Painted .* for Lead across the timeline; playback data updated\./);
      const canonicalEdit = await page.evaluate((target) => {
        const app = window.__midiStudioV2App;
        return {
          gridHasEdit: app.lastInstrumentGridResult.timeline.some((event) => event.lane === "lead" && event.stepIndex === target.stepIndex && event.value === target.rowToken),
          leadLane: app.selectedSong().studioArrangement.lanes.lead,
          selectedCell: app.instrumentGrid.timelineCanvasState().selectedCell
        };
      }, editableTarget);
      expect(canonicalEdit.gridHasEdit).toBe(true);
      expect(canonicalEdit.leadLane).toContain(editableTarget.rowToken);
      expect(canonicalEdit.selectedCell).toEqual({ rowToken: editableTarget.rowToken, stepIndex: editableTarget.stepIndex });

      await page.locator("#instrumentGridOutput").evaluate((output) => {
        window.__midiStudioGridClassMutations = [];
        window.__midiStudioGridClassObserver = new MutationObserver((records) => {
          records.forEach((record) => {
            window.__midiStudioGridClassMutations.push(record.target.className || "");
          });
        });
        window.__midiStudioGridClassObserver.observe(output, {
          attributeFilter: ["class"],
          attributes: true,
          subtree: true
        });
      });
      await page.evaluate(() => {
        const app = window.__midiStudioV2App;
        const originalPlayGridRange = app.previewSynth.playGridRange.bind(app.previewSynth);
        app.__lastPreviewGridValues = [];
        app.previewSynth.playGridRange = async (options) => {
          app.__lastPreviewGridValues = options.grid.timeline
            .filter((event) => event.lane === "lead")
            .map((event) => event.value);
          return originalPlayGridRange(options);
        };
        window.__midiStudioPreviewSynthEvents = [];
      });
      await page.locator("#playButton").click();
      await expect(page.locator("#stopButton")).toBeEnabled();
      await expect(page.locator("#playButton")).toBeDisabled();
      expect(await page.evaluate(() => window.__midiStudioV2App.__lastPreviewGridValues)).toContain(editableTarget.rowToken);
      expect(await page.evaluate(() => window.__midiStudioPreviewSynthEvents.some((event) => event.action === "oscillator-start"))).toBe(true);
      await page.waitForFunction(() => window.__midiStudioV2App.instrumentGrid.playheadStep > 0);
      const playbackCanvasState = await canvasTimelineState(page);
      expect(playbackCanvasState.playheadStep).toBeGreaterThan(0);
      await expect(octaveTimelineCanvas(page)).toHaveAttribute("data-playhead-step", String(playbackCanvasState.playheadStep));
      await expect(page.locator(".midi-studio-v2__grid-cell--playhead-active")).toHaveCount(0);
      expect(await page.evaluate(() => window.__midiStudioGridClassMutations.filter((className) => String(className).includes("midi-studio-v2__grid-cell")).length)).toBe(0);

      const scrollEvidence = await page.locator("#instrumentGridOutput").evaluate((output) => {
        output.style.width = "320px";
        output.style.maxWidth = "320px";
        output.scrollLeft = 240;
        output.scrollTop = 190;
        output.dispatchEvent(new Event("scroll"));
        const topScrollbar = output.querySelector(".midi-studio-v2__timeline-scroll-proxy");
        return {
          canScrollHorizontal: output.scrollWidth > output.clientWidth,
          canScrollVertical: output.scrollHeight > output.clientHeight,
          datasetScrollLeft: output.dataset.timelineScrollLeft,
          scrollLeft: Math.round(output.scrollLeft),
          scrollTop: Math.round(output.scrollTop),
          topScrollLeft: Math.round(topScrollbar?.scrollLeft || 0)
        };
      });
      expect(scrollEvidence.canScrollHorizontal).toBe(true);
      expect(scrollEvidence.canScrollVertical).toBe(true);
      expect(scrollEvidence.scrollLeft).toBeGreaterThan(0);
      expect(scrollEvidence.scrollTop).toBeGreaterThan(0);
      expect(scrollEvidence.datasetScrollLeft).toBe(String(scrollEvidence.scrollLeft));
      expect(Math.abs(scrollEvidence.topScrollLeft - scrollEvidence.scrollLeft)).toBeLessThanOrEqual(1);
      await expect(octaveTimelineCanvas(page)).toHaveAttribute("data-frozen-header", "true");
      const frozenHeaderState = await canvasTimelineState(page);
      expect(Math.abs(Math.round(frozenHeaderState.frozenHeaderScrollLeft) - scrollEvidence.scrollLeft)).toBeLessThanOrEqual(1);
      expect(Math.round(frozenHeaderState.frozenHeaderScrollTop)).toBeGreaterThan(0);
      expect(frozenHeaderState.frozenHeaderVisible).toBe(true);

      const zoomBefore = (await canvasTimelineState(page)).cellSize;
      await page.locator("#instrumentGridZoomInButton").click();
      await expect.poll(() => canvasTimelineState(page).then((state) => state.cellSize)).toBeGreaterThan(zoomBefore);
      await page.locator("#instrumentGridZoomOutButton").click();
      await expect.poll(() => canvasTimelineState(page).then((state) => state.cellSize)).toBe(zoomBefore);

      await page.locator("#stopButton").click();
      await expect(page.locator("#stopButton")).toBeDisabled();
      await expect(page.locator("#playButton")).toBeEnabled();
      await expect(page.locator("#playbackState")).toContainText("Stopped audible preview");
    } finally {
      await workspaceV2CoverageReporter.stop(page);
      await server.close();
    }
  });

  test("canvas note editing flow supports hover click drag paint erase and playback", async ({ page }) => {
    const server = await openMidiStudioForImport(page);
    try {
      await page.locator("#toolImportManifestInput").setInputFiles(uatManifestPath);
      await selectMidiStudioTab(page, "instruments");
      await selectInstrumentRow(page, "lead");
      await selectMidiStudioTab(page, "studio");
      await waitForCanvasRender(page);
      await expect(octaveTimelineCanvas(page)).toBeVisible();
      await expect(page.locator(".midi-studio-v2__octave-note-cell")).toHaveCount(0);

      const target = await emptyCanvasRun(page, { lane: "lead", length: 4 });
      expect(target).toBeTruthy();
      const hoverBefore = await canvasCellPixel(page, target.rowToken, target.stepIndex);
      await hoverCanvasCell(page, target.rowToken, target.stepIndex);
      await expect(octaveTimelineCanvas(page)).toHaveAttribute("data-hover-row-token", target.rowToken);
      await expect(octaveTimelineCanvas(page)).toHaveAttribute("data-hover-step-index", String(target.stepIndex));
      await expect.poll(() => canvasTimelineState(page).then((state) => state.hoverCell)).toEqual({
        rowToken: target.rowToken,
        stepIndex: target.stepIndex
      });
      const hoverAfter = await canvasCellPixel(page, target.rowToken, target.stepIndex);
      expect(hoverAfter).not.toEqual(hoverBefore);

      await page.evaluate(() => {
        window.__midiStudioPreviewSynthEvents = [];
      });
      await clickCanvasCell(page, target.rowToken, target.stepIndex);
      await expect(page.locator("#statusLog")).toHaveValue(/OK Painted .* for Lead across the timeline; playback data updated\./);
      expect(await hasCanvasNote(page, "lead", target.rowToken, target.stepIndex)).toBe(true);
      await expect(octaveTimelineCanvas(page)).toHaveAttribute("data-selected-row-token", target.rowToken);
      await expect(octaveTimelineCanvas(page)).toHaveAttribute("data-selected-step-index", String(target.stepIndex));
      await expect(page.locator("#timelineSelectionDetails")).toContainText("Selected cell");
      await expect(page.locator("#timelineSelectionDetails")).toContainText(`${target.rowToken} / step ${target.stepIndex + 1}`);
      await expect.poll(() => page.evaluate(() => window.__midiStudioPreviewSynthEvents.some((event) => event.action === "oscillator-start"))).toBe(true);

      await clickCanvasCell(page, target.rowToken, target.stepIndex);
      await expect(page.locator("#statusLog")).toHaveValue(/OK Erased .* for Lead across the timeline; playback data updated\./);
      expect(await hasCanvasNote(page, "lead", target.rowToken, target.stepIndex)).toBe(false);

      await page.evaluate(() => {
        window.__midiStudioPreviewSynthEvents = [];
      });
      await dragCanvasCells(page, target.rowToken, target.stepIndex, target.rowToken, target.stepIndex + 2);
      await expect(page.locator("#statusLog")).toHaveValue(/OK Painted .* for Lead across the timeline; playback data updated\./);
      for (let stepIndex = target.stepIndex; stepIndex <= target.stepIndex + 2; stepIndex += 1) {
        expect(await hasCanvasNote(page, "lead", target.rowToken, stepIndex)).toBe(true);
      }
      await expect(octaveTimelineCanvas(page)).toHaveAttribute("data-selected-row-token", target.rowToken);
      await expect(octaveTimelineCanvas(page)).toHaveAttribute("data-selected-step-index", String(target.stepIndex + 2));
      await expect.poll(() => page.evaluate(() => window.__midiStudioPreviewSynthEvents.some((event) => event.action === "oscillator-start"))).toBe(true);

      const canonicalPainted = await page.evaluate((paintTarget) => {
        const app = window.__midiStudioV2App;
        return [paintTarget.stepIndex, paintTarget.stepIndex + 1, paintTarget.stepIndex + 2].map((stepIndex) => ({
          stepIndex,
          token: app.instrumentGrid.tokenForLaneStep("lead", stepIndex),
          visibleInGrid: app.lastInstrumentGridResult.timeline.some((event) => event.lane === "lead"
            && event.stepIndex === stepIndex
            && app.instrumentGrid.rowsForEvent(event).includes(paintTarget.rowToken))
        }));
      }, target);
      expect(canonicalPainted.every((entry) => entry.visibleInGrid && entry.token.includes(target.rowToken))).toBe(true);

      await page.evaluate((paintTarget) => {
        const app = window.__midiStudioV2App;
        const originalPlayGridRange = app.previewSynth.playGridRange.bind(app.previewSynth);
        app.__lastPreviewGridValues = [];
        app.previewSynth.playGridRange = async (options) => {
          app.__lastPreviewGridValues = options.grid.timeline
            .filter((event) => event.lane === "lead"
              && event.stepIndex >= paintTarget.stepIndex
              && event.stepIndex <= paintTarget.stepIndex + 2)
            .map((event) => event.value);
          return originalPlayGridRange(options);
        };
        window.__midiStudioPreviewSynthEvents = [];
      }, target);
      await page.locator("#playButton").click();
      await expect(page.locator("#stopButton")).toBeEnabled();
      await expect(page.locator("#playButton")).toBeDisabled();
      await expect.poll(() => page.evaluate(() => window.__midiStudioV2App.__lastPreviewGridValues)).toContain(target.rowToken);
      await expect.poll(() => page.evaluate(() => window.__midiStudioPreviewSynthEvents.some((event) => event.action === "oscillator-start"))).toBe(true);
      await page.locator("#stopButton").click();
      await expect(page.locator("#stopButton")).toBeDisabled();
      await expect(page.locator("#playButton")).toBeEnabled();

      await dragCanvasCells(page, target.rowToken, target.stepIndex, target.rowToken, target.stepIndex + 2);
      await expect(page.locator("#statusLog")).toHaveValue(/OK Erased .* for Lead across the timeline; playback data updated\./);
      for (let stepIndex = target.stepIndex; stepIndex <= target.stepIndex + 2; stepIndex += 1) {
        expect(await hasCanvasNote(page, "lead", target.rowToken, stepIndex)).toBe(false);
      }
    } finally {
      await workspaceV2CoverageReporter.stop(page);
      await server.close();
    }
  });

  test("canvas note editing warns when note audition audio is unavailable without blocking edits", async ({ page }) => {
    const server = await openMidiStudioForImport(page, { webAudio: false });
    try {
      await page.locator("#toolImportManifestInput").setInputFiles(uatManifestPath);
      await selectMidiStudioTab(page, "instruments");
      await selectInstrumentRow(page, "lead");
      await selectMidiStudioTab(page, "studio");
      await waitForCanvasRender(page);

      const target = await emptyCanvasRun(page, { lane: "lead", length: 2 });
      expect(target).toBeTruthy();
      await clickCanvasCell(page, target.rowToken, target.stepIndex);
      await expect(page.locator("#statusLog")).toHaveValue(/OK Painted .* for Lead across the timeline; playback data updated\./);
      await expect(page.locator("#statusLog")).toHaveValue(/WARN Preview Synth note audition unavailable: Preview Synth audio unavailable: Web Audio AudioContext is not available\. Use a browser with Web Audio support\. Editing was kept\./);
      expect(await hasCanvasNote(page, "lead", target.rowToken, target.stepIndex)).toBe(true);
      await expect(octaveTimelineCanvas(page)).toHaveAttribute("data-selected-row-token", target.rowToken);
      await expect(octaveTimelineCanvas(page)).toHaveAttribute("data-selected-step-index", String(target.stepIndex));
    } finally {
      await workspaceV2CoverageReporter.stop(page);
      await server.close();
    }
  });

  test("octave grid density supports icon controls and simultaneous chord editing", async ({ page }) => {
    const server = await openMidiStudioForImport(page);
    try {
      await page.locator("#toolImportManifestInput").setInputFiles(uatManifestPath);
      await selectInstrumentRow(page, "lead");

      const leadVisibility = instrumentRow(page, "lead").locator("[data-toggle-instrument-visibility='lead']");
      await expect(leadVisibility).toHaveText("");
      await expect(leadVisibility).toHaveAttribute("aria-pressed", "true");
      await expect(leadVisibility).toHaveAttribute("aria-label", /Hide Lead/);
      await expect(leadVisibility).toHaveAttribute("title", "Hide Lead");
      await expect(instrumentToggle(page, "lead", "mute")).toHaveText("");
      await expect(instrumentToggle(page, "lead", "solo")).toHaveText("");
      await expect(instrumentToggle(page, "lead", "mute")).toHaveAttribute("title", "Mute Lead");
      await expect(instrumentToggle(page, "lead", "solo")).toHaveAttribute("title", "Solo Lead");
      await expect(instrumentToggle(page, "lead", "mute").locator(".midi-studio-v2__lane-toggle-icon")).toHaveCount(1);
      await expect(instrumentToggle(page, "lead", "solo").locator(".midi-studio-v2__lane-toggle-icon")).toHaveCount(1);
      await expect(instrumentRow(page, "lead").locator("[data-delete-instrument-row='lead']")).toHaveAttribute("aria-label", "Delete instrument row Lead");
      await expect(instrumentRow(page, "lead").locator("[data-delete-instrument-row='lead']")).toHaveAttribute("title", "Delete instrument row Lead");
      await expect(page.locator("#addInstrumentRowButton")).toHaveAttribute("aria-label", "Add instrument");
      await expect(page.locator("#addInstrumentRowButton")).toHaveAttribute("title", "Add instrument");
      const instrumentHeaderLayout = await page.locator(".midi-studio-v2__instrument-accordion-header").evaluate((header) => {
        const title = header.querySelector("span:first-child").getBoundingClientRect();
        const add = header.querySelector("#addInstrumentRowButton").getBoundingClientRect();
        const close = header.querySelector("#closeInstrumentPanelButton").getBoundingClientRect();
        return {
          addAfterTitle: add.left > title.right,
          addText: header.querySelector("#addInstrumentRowButton").textContent,
          closeAfterAdd: close.left > add.right,
          closeText: header.querySelector("#closeInstrumentPanelButton").textContent,
          sameRow: Math.abs(title.top - add.top) <= 2 && Math.abs(add.top - close.top) <= 2,
          titleText: header.querySelector("span:first-child").textContent
        };
      });
      expect(instrumentHeaderLayout).toEqual({
        addAfterTitle: true,
        addText: "Add",
        closeAfterAdd: true,
        closeText: "X",
        sameRow: true,
        titleText: "Instruments"
      });
      await expect(instrumentRow(page, "lead").locator('[aria-label="Mute Lead"]')).not.toBeChecked();
      await instrumentToggle(page, "lead", "mute").click();
      await expect(instrumentRow(page, "lead").locator('[aria-label="Mute Lead"]')).toBeChecked();
      await instrumentToggle(page, "lead", "mute").click();
      await expect(instrumentRow(page, "lead").locator('[aria-label="Mute Lead"]')).not.toBeChecked();
      const compactIconSizes = await instrumentRow(page, "lead").locator(".midi-studio-v2__instrument-control-row").evaluate((row) => Array.from(row.children).map((control) => {
        const rect = control.getBoundingClientRect();
        return { height: rect.height, width: rect.width };
      }));
      expect(compactIconSizes.every((size) => size.width <= 32 && size.height <= 32)).toBe(true);
      const controlAlignment = await instrumentRow(page, "lead").locator(".midi-studio-v2__instrument-control-row").evaluate((row) => {
        const controls = [
          row.querySelector('[aria-label="Mute Lead"]')?.closest("label"),
          row.querySelector('[aria-label="Solo Lead"]')?.closest("label"),
          row.querySelector("[data-toggle-instrument-visibility='lead']"),
          row.querySelector("[data-delete-instrument-row='lead']")
        ];
        if (controls.some((control) => !control)) {
          return { maxCenterDelta: 999, missing: true };
        }
        const centers = controls.map((control) => {
          const rect = control.getBoundingClientRect();
          return rect.top + rect.height / 2;
        });
        return {
          maxCenterDelta: Math.max(...centers) - Math.min(...centers),
          missing: false
        };
      });
      expect(controlAlignment.missing).toBe(false);
      expect(controlAlignment.maxCenterDelta).toBeLessThanOrEqual(4);
      const leftColumnFit = await instrumentRow(page, "lead").evaluate((instrumentRowElement) => {
        const leftPanel = document.querySelector(".tool-starter__panel--left");
        const controlRow = instrumentRowElement.querySelector(".midi-studio-v2__instrument-control-row");
        const selectors = instrumentRowElement.querySelector(".midi-studio-v2__instrument-selectors");
        const selectElements = Array.from(selectors.querySelectorAll("select"));
        const leftPanelRect = leftPanel.getBoundingClientRect();
        const controlRowRect = controlRow.getBoundingClientRect();
        const controls = Array.from(controlRow.children).map((control) => control.getBoundingClientRect());
        const selectorRect = selectors.getBoundingClientRect();
        const selectRects = selectElements.map((select) => select.getBoundingClientRect());
        return {
          controlsFit: controls.every((rect) => rect.left >= controlRowRect.left - 1 && rect.right <= controlRowRect.right + 1 && rect.right <= leftPanelRect.right + 1),
          controlTopDelta: Math.max(...controls.map((rect) => rect.top)) - Math.min(...controls.map((rect) => rect.top)),
          leftClientWidth: leftPanel.clientWidth,
          leftScrollWidth: leftPanel.scrollWidth,
          leftWidth: Math.round(leftPanelRect.width),
          rowClientWidth: instrumentRowElement.clientWidth,
          rowScrollWidth: instrumentRowElement.scrollWidth,
          selectCount: selectElements.length,
          selectsFit: selectRects.every((rect) => rect.left >= selectorRect.left - 1 && rect.right <= selectorRect.right + 1 && rect.right <= leftPanelRect.right + 1),
          selectorsWrap: selectRects.length === 2 && Math.abs(selectRects[0].top - selectRects[1].top) <= 1
        };
      });
      expect(leftColumnFit.leftWidth).toBe(350);
      expect(leftColumnFit.leftScrollWidth).toBeLessThanOrEqual(leftColumnFit.leftClientWidth + 1);
      expect(leftColumnFit.controlsFit).toBe(true);
      expect(leftColumnFit.controlTopDelta).toBeLessThanOrEqual(2);
      expect(leftColumnFit.rowScrollWidth).toBeLessThanOrEqual(leftColumnFit.rowClientWidth + 1);
      expect(leftColumnFit.selectCount).toBe(2);
      expect(leftColumnFit.selectsFit).toBe(true);
      expect(leftColumnFit.selectorsWrap).toBe(true);

      const gmFamilyOptions = await instrumentTypeSelect(page, "lead").locator("option").evaluateAll((options) => options.map((option) => option.value));
      for (const family of gmFamilyOptions) {
        await instrumentTypeSelect(page, "lead").selectOption(family);
        const instrumentOptionCount = await instrumentSelect(page, "lead").locator("option").evaluateAll((options) => options.filter((option) => option.value).length);
        expect(instrumentOptionCount, `${family} should expose at least 3 GM instruments`).toBeGreaterThanOrEqual(3);
      }
      await instrumentTypeSelect(page, "lead").selectOption("Synth Effects");
      await page.waitForTimeout(80);
      await page.evaluate(() => {
        window.__midiStudioPreviewSynthEvents = [];
      });
      await instrumentSelect(page, "lead").selectOption("gm-fx-atmosphere");
      await expect(page.locator("#statusLog")).toHaveValue(/WARN Preview Synth mapping: FX 4 \(Atmosphere\) maps to FX 1 \(Rain\)/);
      await expect.poll(() => page.evaluate(() => ({
        audibleRamp: window.__midiStudioPreviewSynthEvents.some((event) => event.action === "param-ramp" && event.value >= 0.1),
        oscillatorStart: window.__midiStudioPreviewSynthEvents.some((event) => event.action === "oscillator-start")
      }))).toEqual({ audibleRamp: true, oscillatorStart: true });

      await instrumentTypeSelect(page, "drums").selectOption("Percussive");
      await page.waitForTimeout(80);
      await page.evaluate(() => {
        window.__midiStudioPreviewSynthEvents = [];
      });
      await instrumentSelect(page, "drums").selectOption("gm-room-drum-kit");
      await expect(page.locator("#statusLog")).toHaveValue(/WARN Preview Synth mapping: Room Drum Kit maps to Standard Drum Kit/);
      await expect.poll(() => page.evaluate(() => ({
        bufferStart: window.__midiStudioPreviewSynthEvents.some((event) => event.action === "buffer-start"),
        oscillatorStart: window.__midiStudioPreviewSynthEvents.some((event) => event.action === "oscillator-start")
      }))).toEqual({ bufferStart: true, oscillatorStart: false });

      await instrumentTypeSelect(page, "lead").selectOption("Synth Lead");
      await instrumentSelect(page, "lead").selectOption("retro-square-lead");
      await selectInstrumentRow(page, "lead");

      const octaveCellHeight = await octaveCell(page, "C5", 0).evaluate((cell) => cell.getBoundingClientRect().height);
      expect(octaveCellHeight).toBeLessThanOrEqual(32);
      await expect(page.locator(".midi-studio-v2__octave-timeline .midi-studio-v2__note-block")).toHaveCount(0);

      const chordStep = await page.evaluate(() => {
        const result = window.__midiStudioV2App.lastInstrumentGridResult;
        const target = new Set(["C5", "E5", "G5"]);
        for (let stepIndex = 0; stepIndex < result.totalSteps; stepIndex += 1) {
          const leadValues = result.timeline
            .filter((event) => event.lane === "lead" && event.kind === "note" && event.stepIndex === stepIndex)
            .map((event) => event.value);
          if (leadValues.length && leadValues.every((value) => !target.has(value))) {
            return stepIndex;
          }
        }
        return 0;
      });
      const initialLeadValues = await page.evaluate((stepIndex) => window.__midiStudioV2App.lastInstrumentGridResult.timeline
        .filter((event) => event.lane === "lead" && event.kind === "note" && event.stepIndex === stepIndex)
        .map((event) => event.value), chordStep);
      await octaveCell(page, "C5", chordStep).click();
      await octaveCell(page, "E5", chordStep).click();
      await expect(octaveCell(page, "C5", chordStep)).toHaveText("");
      await expect(octaveCell(page, "E5", chordStep)).toHaveText("");
      await octaveCell(page, "G5", chordStep).click();
      const leadChordValues = await page.evaluate((stepIndex) => window.__midiStudioV2App.lastInstrumentGridResult.timeline
        .filter((event) => event.lane === "lead" && event.kind === "note" && event.stepIndex === stepIndex)
        .map((event) => event.value)
        .sort(), chordStep);
      expect(leadChordValues).toEqual(expect.arrayContaining(["C5", "E5", "G5"]));
      expect(leadChordValues).toEqual(expect.arrayContaining(initialLeadValues));
      await expect(octaveCell(page, "C5", chordStep)).toHaveClass(/midi-studio-v2__grid-cell--lane-selected/);
      await expect(octaveNoteBlock(page, "chords").first()).toHaveClass(/midi-studio-v2__grid-cell--lane-dimmed/);
      const noteLayering = await page.evaluate(() => {
        const selected = document.querySelector('.midi-studio-v2__octave-note-cell[data-row-token="C5"].midi-studio-v2__grid-cell--lane-selected');
        const dimmed = document.querySelector(".midi-studio-v2__octave-note-cell.midi-studio-v2__grid-cell--lane-dimmed");
        const selectedStyles = getComputedStyle(selected);
        const dimmedStyles = getComputedStyle(dimmed);
        return {
          dimmedBackground: dimmedStyles.backgroundColor,
          dimmedColor: dimmedStyles.color,
          dimmedZ: Number(dimmedStyles.zIndex),
          selectedZ: Number(selectedStyles.zIndex)
        };
      });
      expect(noteLayering.dimmedColor).toBe("rgb(148, 163, 184)");
      expect(noteLayering.dimmedBackground).toMatch(/rgba?\(71,\s*85,\s*105/);
      expect(noteLayering.selectedZ).toBeGreaterThan(noteLayering.dimmedZ);

      await expectInstrumentClickKeepsScroll(page, instrumentToggle(page, "lead", "mute"));
      await expectInstrumentClickKeepsScroll(page, instrumentToggle(page, "lead", "mute"));
      await expectInstrumentClickKeepsScroll(page, instrumentToggle(page, "lead", "solo"));
      await expectInstrumentClickKeepsScroll(page, instrumentToggle(page, "lead", "solo"));
      await expectInstrumentClickKeepsScroll(page, leadVisibility);
      await expectInstrumentClickKeepsScroll(page, leadVisibility);
      await page.locator("#addInstrumentRowButton").click();
      await expect(instrumentRow(page, "instrument-1")).toBeVisible();
      await page.locator("#closeInstrumentPanelButton").click();
      await expect(page.locator(".midi-studio-v2__instrument-accordion-header")).toHaveAttribute("aria-expanded", "false");
      await expect(page.locator("#instrumentListContent")).toBeHidden();
      await expect(instrumentRow(page, "instrument-1")).toHaveCount(1);
      await page.locator(".midi-studio-v2__instrument-accordion-header").click();
      await expect(page.locator(".midi-studio-v2__instrument-accordion-header")).toHaveAttribute("aria-expanded", "true");
      await expect(instrumentRow(page, "instrument-1")).toBeVisible();
      await expectInstrumentClickKeepsScroll(page, instrumentRow(page, "instrument-1").locator("[data-delete-instrument-row='instrument-1']"));
      await expect(instrumentRow(page, "instrument-1")).toHaveCount(0);
      await selectInstrumentRow(page, "lead");

      await leadVisibility.click();
      await expect(octaveNoteBlock(page, "lead")).toHaveCount(0);
      await leadVisibility.click();
      await expect(octaveCell(page, "C5", chordStep)).toHaveAttribute("data-note-lanes", /lead/);

      await selectInstrumentRow(page, "drums");
      const drumPlan = await page.evaluate(() => {
        const result = window.__midiStudioV2App.lastInstrumentGridResult;
        const target = ["kick", "snare", "hat"];
        for (let stepIndex = 0; stepIndex < result.totalSteps; stepIndex += 1) {
          const values = result.timeline
            .filter((event) => event.lane === "drums" && event.kind === "drum" && event.stepIndex === stepIndex)
            .map((event) => event.value);
          const missing = target.filter((value) => !values.includes(value));
          if (missing.length) {
            return { missing, stepIndex };
          }
        }
        return { missing: [], stepIndex: 0 };
      });
      for (const rowToken of drumPlan.missing) {
        await octaveCell(page, rowToken, drumPlan.stepIndex).click();
      }
      const drumValues = await page.evaluate((stepIndex) => window.__midiStudioV2App.lastInstrumentGridResult.timeline
        .filter((event) => event.lane === "drums" && event.kind === "drum" && event.stepIndex === stepIndex)
        .map((event) => event.value)
        .sort(), drumPlan.stepIndex);
      expect(drumValues).toEqual(expect.arrayContaining(["hat", "kick", "snare"]));

      await page.evaluate(() => {
        window.__midiStudioPreviewSynthEvents = [];
      });
      await page.locator("#playButton").click();
      await expect(page.locator("#stopButton")).toBeEnabled();
      await expect(page.locator(".midi-studio-v2__grid-cell--timing-header.midi-studio-v2__grid-cell--playhead-active")).toHaveCount(2);
      await expect(page.locator(".midi-studio-v2__note-table-cell.midi-studio-v2__grid-cell--playhead-active")).toHaveCount(0);
      const playbackEvidence = await page.evaluate(() => {
        const maxSameTime = (action) => {
          const counts = new Map();
          window.__midiStudioPreviewSynthEvents
            .filter((event) => event.action === action)
            .forEach((event) => {
              const key = Number(event.time).toFixed(3);
              counts.set(key, (counts.get(key) || 0) + 1);
            });
          return Math.max(0, ...counts.values());
        };
        return {
          bufferStartsAtSameTime: maxSameTime("buffer-start"),
          oscillatorStartsAtSameTime: maxSameTime("oscillator-start")
        };
      });
      expect(playbackEvidence.oscillatorStartsAtSameTime).toBeGreaterThanOrEqual(3);
      expect(playbackEvidence.bufferStartsAtSameTime).toBeGreaterThanOrEqual(2);
      await page.waitForFunction(() => window.__midiStudioV2App.instrumentGrid.playheadStep > 0);
      await expect(page.locator(".midi-studio-v2__grid-cell--timing-header.midi-studio-v2__grid-cell--playhead-active")).toHaveCount(2);
      await expect(page.locator(".midi-studio-v2__note-table-cell.midi-studio-v2__grid-cell--playhead-active")).toHaveCount(0);
      await expect(page.locator(".midi-studio-v2__grid-cell--lane-active")).toHaveCount(0);
      expect(Number(await page.locator(".midi-studio-v2__grid-cell--beat-header.midi-studio-v2__grid-cell--playhead-active").getAttribute("data-step-index"))).toBeGreaterThan(0);
      await page.locator("#stopButton").click();
      await expect(page.locator("#playButton")).toBeEnabled();
      await page.locator("#playButton").click();
      await expect(page.locator("#stopButton")).toBeEnabled();
      await page.locator("#stopAllAudioButton").click();
      await expect(page.locator("#stopButton")).toBeDisabled();
      await expect(page.locator("#playButton")).toBeEnabled();
    } finally {
      await workspaceV2CoverageReporter.stop(page);
      await server.close();
    }
  });

  test("fast octave note editing supports drag painting keyboard shortcuts selection and timeline scroll sync", async ({ page }) => {
    const server = await openMidiStudioForImport(page);
    try {
      await page.locator("#toolImportManifestInput").setInputFiles(uatManifestPath);
      await selectInstrumentRow(page, "lead");
      await expect(octaveCell(page, "C6", 2)).not.toHaveAttribute("data-note-lanes", /lead/);

      await octaveCell(page, "C6", 2).click();
      await expect(octaveCell(page, "C6", 2)).toHaveText("");
      await expect(octaveCell(page, "C6", 2)).toHaveAttribute("data-note-lanes", /lead/);
      await expect(octaveCell(page, "C6", 2)).toHaveClass(/midi-studio-v2__grid-cell--note-selected/);
      const gridEffects = await page.locator("#instrumentGridOutput").evaluate((element) => {
        const surfaceSelectors = [
          ".midi-studio-v2__octave-timeline",
          ".midi-studio-v2__note-table",
          ".midi-studio-v2__note-table-cell",
          ".midi-studio-v2__grid-cell--note-selected",
          ".midi-studio-v2__grid-cell--lane-selected"
        ];
        const nodes = surfaceSelectors.flatMap((selector) => Array.from(element.querySelectorAll(selector)));
        const firstNoteCell = element.querySelector(".midi-studio-v2__note-table-cell");
        const firstNoteCellStyle = getComputedStyle(firstNoteCell);
        return {
          borderBottomWidth: firstNoteCellStyle.borderBottomWidth,
          borderRightWidth: firstNoteCellStyle.borderRightWidth,
          effects: nodes.map((node) => {
            const style = getComputedStyle(node);
            return {
              boxShadow: style.boxShadow,
              outlineStyle: style.outlineStyle,
              outlineWidth: style.outlineWidth
            };
          })
        };
      });
      expect(gridEffects.effects.length).toBeGreaterThan(0);
      expect(gridEffects.effects.every((effect) => effect.boxShadow === "none")).toBe(true);
      expect(gridEffects.effects.every((effect) => effect.outlineStyle === "none" || effect.outlineWidth === "0px")).toBe(true);
      expect(Number.parseFloat(gridEffects.borderBottomWidth)).toBeGreaterThanOrEqual(0.8);
      expect(Number.parseFloat(gridEffects.borderBottomWidth)).toBeLessThanOrEqual(1);
      expect(Number.parseFloat(gridEffects.borderRightWidth)).toBeGreaterThanOrEqual(0.8);
      expect(Number.parseFloat(gridEffects.borderRightWidth)).toBeLessThanOrEqual(1);
      await octaveCell(page, "C6", 2).click();
      await expect(octaveCell(page, "C6", 2)).not.toHaveAttribute("data-note-lanes", /lead/);
      await octaveCell(page, "C6", 2).click();

      await octaveCell(page, "C6", 3).dragTo(octaveCell(page, "C6", 5));
      for (const stepIndex of [3, 4, 5]) {
        await expect(octaveCell(page, "C6", stepIndex)).toHaveText("");
        await expect(octaveCell(page, "C6", stepIndex)).toHaveAttribute("data-note-lanes", /lead/);
      }
      await octaveCell(page, "C6", 5).dragTo(octaveCell(page, "C6", 7));
      for (const stepIndex of [5, 6, 7]) {
        await expect(octaveCell(page, "C6", stepIndex)).toHaveAttribute("data-note-lanes", /lead/);
      }

      const chordStep = await page.evaluate(() => {
        const result = window.__midiStudioV2App.lastInstrumentGridResult;
        for (let stepIndex = 0; stepIndex < result.totalSteps; stepIndex += 1) {
          const values = result.timeline
            .filter((event) => event.lane === "lead" && event.stepIndex === stepIndex)
            .map((event) => event.value);
          if (!values.includes("D6") && !values.includes("F6")) {
            return stepIndex;
          }
        }
        return 0;
      });
      await octaveCell(page, "D6", chordStep).click();
      await octaveCell(page, "F6", chordStep).click();
      const chordValues = await page.evaluate((stepIndex) => window.__midiStudioV2App.lastInstrumentGridResult.timeline
        .filter((event) => event.lane === "lead" && event.stepIndex === stepIndex)
        .map((event) => event.value)
        .sort(), chordStep);
      expect(chordValues).toEqual(expect.arrayContaining(["D6", "F6"]));
      expect(chordValues.length).toBeGreaterThanOrEqual(2);

      await octaveCell(page, "C6", 7).click();
      await page.keyboard.press("ArrowRight");
      await expect(octaveCell(page, "C6", 8)).toHaveClass(/midi-studio-v2__grid-cell--note-selected/);
      await page.keyboard.press("Control+D");
      await expect(octaveCell(page, "C6", 9)).toHaveAttribute("data-note-lanes", /lead/);
      await expect(octaveCell(page, "C6", 9)).toHaveClass(/midi-studio-v2__grid-cell--note-selected/);
      await page.keyboard.press("Delete");
      await expect(octaveCell(page, "C6", 9)).not.toHaveAttribute("data-note-lanes", /lead/);
      await expect(octaveCell(page, "C6", 9)).toHaveClass(/midi-studio-v2__grid-cell--note-selected/);
      await page.keyboard.press("ArrowLeft");
      await page.keyboard.press("Backspace");
      await expect(octaveCell(page, "C6", 8)).not.toHaveAttribute("data-note-lanes", /lead/);

      const output = page.locator("#instrumentGridOutput");
      await output.evaluate((element) => {
        element.scrollLeft = 180;
        element.scrollTop = 90;
        element.dispatchEvent(new Event("scroll"));
      });
      const beforeScroll = await timelineScrollSnapshot(page);
      expect(beforeScroll.scrollDataset).toBe(String(beforeScroll.scrollLeft));
      await page.evaluate(() => {
        document.querySelector('.midi-studio-v2__octave-note-cell[data-row-token="A6"][data-step-index="11"]').click();
      });
      await expect.poll(() => timelineScrollSnapshot(page)).toEqual(expect.objectContaining({
        scrollLeft: beforeScroll.scrollLeft,
        scrollTop: beforeScroll.scrollTop
      }));
      const afterScroll = await timelineScrollSnapshot(page);
      expect(afterScroll.headerLeft).toBe(afterScroll.noteLeft);
      expect(afterScroll.scrollDataset).toBe(String(afterScroll.scrollLeft));

      await page.keyboard.press("Space");
      await expect(page.locator("#stopButton")).toBeEnabled();
      await expect(page.locator("#playButton")).toBeDisabled();
      await page.keyboard.press("Space");
      await expect(page.locator("#stopButton")).toBeDisabled();
      await expect(page.locator("#playButton")).toBeEnabled();
    } finally {
      await workspaceV2CoverageReporter.stop(page);
      await server.close();
    }
  });

  test("persists octave note edits into canonical song data, playback, save, and reset", async ({ page }) => {
    const server = await openMidiStudioForImport(page);
    try {
      await page.locator("#toolImportManifestInput").setInputFiles(uatManifestPath);
      await selectInstrumentRow(page, "lead");
      await expect(page.locator("#projectDirtyState")).toHaveText("Saved");
      await expect(page.locator("body")).toHaveAttribute("data-midi-studio-dirty", "false");
      const originalLeadLane = await page.evaluate(() => window.__midiStudioV2App.selectedSong().studioArrangement.lanes.lead);
      await expect(octaveCell(page, "C6", 2)).not.toHaveAttribute("data-note-lanes", /lead/);

      await octaveCell(page, "C6", 2).click();
      await expect(octaveCell(page, "C6", 2)).toHaveAttribute("data-note-lanes", /lead/);
      await expect(page.locator("#projectDirtyState")).toHaveText("Unsaved changes");
      await expect(page.locator("body")).toHaveAttribute("data-midi-studio-dirty", "true");
      const editedState = await page.evaluate(() => {
        const app = window.__midiStudioV2App;
        return {
          currentGridHasEdit: app.lastInstrumentGridResult.timeline.some((event) => event.lane === "lead" && event.stepIndex === 2 && event.value === "C6"),
          json: document.querySelector("#inspectorOutput").textContent,
          leadLane: app.selectedSong().studioArrangement.lanes.lead
        };
      });
      expect(editedState.currentGridHasEdit).toBe(true);
      expect(editedState.leadLane).toContain("C6");
      expect(editedState.json).toContain('"lead"');
      expect(editedState.json).toContain("C6");

      await page.locator('[data-song-id="frog-hop-nursery-rhyme"]').click();
      await page.locator('[data-song-id="camptown-races-uat-reel"]').click();
      await selectInstrumentRow(page, "lead");
      await expect(octaveCell(page, "C6", 2)).toHaveAttribute("data-note-lanes", /lead/);
      expect(await page.evaluate(() => window.__midiStudioV2App.selectedSong().studioArrangement.lanes.lead)).toContain("C6");

      await page.evaluate(() => {
        const app = window.__midiStudioV2App;
        const originalPlayGridRange = app.previewSynth.playGridRange.bind(app.previewSynth);
        app.__lastPreviewGridValues = [];
        app.previewSynth.playGridRange = async (options) => {
          app.__lastPreviewGridValues = options.grid.timeline
            .filter((event) => event.lane === "lead" && event.stepIndex === 2)
            .map((event) => event.value);
          return originalPlayGridRange(options);
        };
      });
      await page.locator("#playButton").click();
      await expect(page.locator("#stopButton")).toBeEnabled();
      expect(await page.evaluate(() => window.__midiStudioV2App.__lastPreviewGridValues)).toContain("C6");
      await page.locator("#stopButton").click();
      await expect(page.locator("#playButton")).toBeEnabled();

      await page.locator("#saveProjectButton").click();
      await expect(page.locator("#statusLog")).toHaveValue(/OK Save Project completed: 3 songs saved with \d+ editable note events\./);
      await expect(page.locator("#projectDirtyState")).toHaveText("Saved");
      await expect(page.locator("body")).toHaveAttribute("data-midi-studio-dirty", "false");
      await expect(page.locator("#inspectorOutput")).toContainText('"schema": "html-js-gaming.tool-state"');
      await expect(page.locator("#inspectorOutput")).toContainText("C6");

      await page.locator("#resetSongEditsButton").click();
      await expect(page.locator("#statusLog")).toHaveValue(/OK Reset Song Edits restored Camptown Races UAT Reel to imported manifest state\./);
      await expect(octaveCell(page, "C6", 2)).not.toHaveAttribute("data-note-lanes", /lead/);
      await expect(page.locator("#projectDirtyState")).toHaveText("Saved");
      expect(await page.evaluate(() => window.__midiStudioV2App.selectedSong().studioArrangement.lanes.lead)).toBe(originalLeadLane);
    } finally {
      await workspaceV2CoverageReporter.stop(page);
      await server.close();
    }
  });

  test("separates Workspace launch save ownership from Tool Mode standalone save", async ({ page }) => {
    const manifest = JSON.parse(await fs.readFile(uatManifestPath, "utf8"));
    const server = await openMidiStudioFromWorkspace(page, manifest);
    try {
      await expect(page.locator("#launchModeIndicator")).toHaveCount(0);
      await expect(page.getByText("Tool Mode", { exact: true })).toHaveCount(0);
      await expect(page.getByText("Workspace Mode", { exact: true })).toHaveCount(0);
      await expect(page.locator("body")).toHaveAttribute("data-midi-studio-launch-mode", "workspace");
      await expect(page.locator('[data-launch-mode-nav="workspace"]')).toBeVisible();
      await expect(page.locator('[data-launch-mode-nav="tool"]')).toBeHidden();
      await expect(page.locator("#returnToWorkspaceButton")).toBeVisible();
      await expect(page.locator('[data-launch-mode-nav="workspace"] button:not([hidden])')).toHaveText(["Return to Workspace"]);
      await expect(page.locator("#saveProjectButton")).toBeHidden();
      await expect(page.locator("#toolImportManifestButton")).toBeHidden();
      await expect(page.locator("#renderedExportSaveButton")).toBeHidden();
      await expect(page.locator("#workspaceImportManifestButton")).toBeHidden();
      await expect(page.locator("#workspaceCopyManifestButton")).toBeHidden();
      await expect(page.locator("#workspaceExportManifestButton")).toBeHidden();

      await selectInstrumentRow(page, "lead");
      await octaveCell(page, "C6", 2).click();
      await expect(octaveCell(page, "C6", 2)).toHaveAttribute("data-note-lanes", /lead/);
      const workspaceState = await page.evaluate(() => {
        const session = JSON.parse(window.sessionStorage.getItem("workspace.tools.midi-studio-v2"));
        const context = JSON.parse(window.sessionStorage.getItem("midi-studio-v2-workspace-context"));
        const sessionSong = session.data.songs.find((song) => song.id === session.data.activeSongId);
        const contextSong = context.tools["midi-studio-v2"].songs.find((song) => song.id === context.tools["midi-studio-v2"].activeSongId);
        return {
          contextLead: contextSong.studioArrangement.lanes.lead,
          dirty: session.dirty,
          sessionLead: sessionSong.studioArrangement.lanes.lead
        };
      });
      expect(workspaceState.sessionLead).toContain("C6");
      expect(workspaceState.contextLead).toContain("C6");
      expect(workspaceState.dirty).toMatchObject({
        isDirty: true,
        reason: "midi-studio-note-grid-edited"
      });
      expect(workspaceState.dirty.changedKeys).toEqual(expect.arrayContaining(["data.songs.studioArrangement"]));

      await page.locator("#returnToWorkspaceButton").click();
      await expect(page).toHaveURL(/workspace-manager-v2\/index\.html.*hostContextId=midi-studio-v2-workspace-context/);
      await expect(page).toHaveURL(/workspace=uat/);
    } finally {
      await workspaceV2CoverageReporter.stop(page);
      await server.close();
    }
  });

  test("octave timeline freezes compact headers and note labels while active cells stay textless", async ({ page }) => {
    const server = await openMidiStudioForImport(page);
    try {
      await page.locator("#toolImportManifestInput").setInputFiles(uatManifestPath);
      await selectInstrumentRow(page, "lead");

      await expect(page.locator(".midi-studio-v2__timing-header-row-1.midi-studio-v2__timing-axis-header")).toHaveText("Bar");
      await expect(page.locator(".midi-studio-v2__timing-header-row-2.midi-studio-v2__timing-axis-header")).toHaveText("Beat");
      expect(await page.locator(".midi-studio-v2__timing-header-row-1").evaluateAll((cells) => cells.map((cell) => cell.textContent).join("|"))).not.toContain("Octave");
      expect(await page.locator(".midi-studio-v2__timing-header-row-2").evaluateAll((cells) => cells.map((cell) => cell.textContent).join("|"))).not.toContain("Octave");
      await expect(page.locator('.midi-studio-v2__timing-header-row-1.midi-studio-v2__note-table-column-header[data-step-index="0"]')).toHaveText("1");
      await expect(page.locator('.midi-studio-v2__timing-header-row-2.midi-studio-v2__note-table-column-header[data-step-index="0"]')).toHaveText("1");
      await expect(page.locator('.midi-studio-v2__timing-header-row-2.midi-studio-v2__note-table-column-header[data-step-index="1"]')).toHaveText("2");
      await expect(page.locator('.midi-studio-v2__timing-header-row-2.midi-studio-v2__note-table-column-header[data-step-index="2"]')).toHaveText("3");
      await expect(page.locator('.midi-studio-v2__timing-header-row-2.midi-studio-v2__note-table-column-header[data-step-index="3"]')).toHaveText("4");
      await expect(page.locator("#instrumentGridSnapIndicator")).toContainText("Snap:");
      await expect(page.locator("#instrumentGridZoomOutButton")).toHaveAttribute("aria-label", "Zoom out octave grid");
      await expect(page.locator("#instrumentGridZoomInButton")).toHaveAttribute("aria-label", "Zoom in octave grid");
      await expect(page.locator("#instrumentGridHeading")).toHaveCount(1);
      await expect(page.locator("#instrumentGridOutput")).toHaveCount(1);
      await expect(page.locator(".midi-studio-v2__octave-timeline")).toHaveCount(1);
      await expect(page.locator("#instrumentGridOutput")).toBeVisible();
      await expect(page.locator(".midi-studio-v2__octave-timeline")).toBeVisible();
      expect(await page.locator("#instrumentGridOutput").evaluate((element) => element.dataset.midiStudioTabPanel)).toBe("studio");
      await selectMidiStudioTab(page, "auto-create-parts");
      await expect(page.locator("#instrumentGridOutput")).toBeHidden();
      await expect(page.locator(".midi-studio-v2__octave-timeline")).toBeHidden();
      await expect(page.locator(".midi-studio-v2__timeline-title")).toBeHidden();
      await selectMidiStudioTab(page, "instruments");
      await expect(page.locator("#instrumentGridOutput")).toBeHidden();
      await expect(page.locator(".midi-studio-v2__octave-timeline")).toBeHidden();
      await selectMidiStudioTab(page, "studio");
      await expect(page.locator("#instrumentGridOutput")).toBeVisible();
      await expect(page.locator(".midi-studio-v2__octave-timeline")).toBeVisible();
      const zoomControlsLayout = await page.locator(".midi-studio-v2__timeline-title").evaluate((header) => {
        const snap = header.querySelector("#instrumentGridSnapIndicator").getBoundingClientRect();
        const zoomOut = header.querySelector("#instrumentGridZoomOutButton").getBoundingClientRect();
        const zoomIn = header.querySelector("#instrumentGridZoomInButton").getBoundingClientRect();
        return {
          zoomInAfterZoomOut: zoomIn.left > zoomOut.right,
          zoomOutAfterSnap: zoomOut.left > snap.right,
          zoomText: [
            header.querySelector("#instrumentGridZoomOutButton").textContent,
            header.querySelector("#instrumentGridZoomInButton").textContent
          ]
        };
      });
      expect(zoomControlsLayout).toEqual({
        zoomInAfterZoomOut: true,
        zoomOutAfterSnap: true,
        zoomText: ["-", "+"]
      });

      const output = page.locator("#instrumentGridOutput");
      const gridLayout = await output.evaluate((element) => {
        const firstNote = element.querySelector('.midi-studio-v2__octave-note-cell[data-step-index="0"]');
        const firstRow = element.querySelector('.midi-studio-v2__octave-note-cell[data-octave-row-index="0"][data-step-index="0"]');
        const secondRow = element.querySelector('.midi-studio-v2__octave-note-cell[data-octave-row-index="1"][data-step-index="0"]');
        const topScrollbar = element.querySelector(".midi-studio-v2__timeline-scroll-proxy");
        const grid = element.querySelector(".midi-studio-v2__octave-timeline");
        const firstLabel = element.querySelector(".midi-studio-v2__octave-row-label");
        const whiteLabel = element.querySelector('.midi-studio-v2__octave-row-label[data-octave-row="C5"]');
        const blackLabel = element.querySelector('.midi-studio-v2__octave-row-label[data-octave-row="C#5"]');
        const whiteCell = element.querySelector('.midi-studio-v2__octave-note-cell[data-row-token="C5"][data-step-index="0"]');
        const blackCell = element.querySelector('.midi-studio-v2__octave-note-cell[data-row-token="C#5"][data-step-index="0"]');
        const outputStyle = getComputedStyle(element);
        const whiteLabelStyle = getComputedStyle(whiteLabel);
        const blackLabelStyle = getComputedStyle(blackLabel);
        const whiteText = whiteLabel.querySelector(".midi-studio-v2__octave-row-label-text");
        const blackText = blackLabel.querySelector(".midi-studio-v2__octave-row-label-text");
        const whiteTextStyle = getComputedStyle(whiteText);
        const blackTextStyle = getComputedStyle(blackText);
        const barHeaderStyle = getComputedStyle(element.querySelector('.midi-studio-v2__timing-header-row-1.midi-studio-v2__note-table-column-header[data-step-index="1"]'));
        const beatHeaderStyle = getComputedStyle(element.querySelector('.midi-studio-v2__timing-header-row-2.midi-studio-v2__note-table-column-header[data-step-index="1"]'));
        const barAxisStyle = getComputedStyle(element.querySelector(".midi-studio-v2__timing-header-row-1.midi-studio-v2__timing-axis-header"));
        const beatAxisStyle = getComputedStyle(element.querySelector(".midi-studio-v2__timing-header-row-2.midi-studio-v2__timing-axis-header"));
        const whiteKeyStyle = getComputedStyle(whiteLabel, "::before");
        const blackKeyStyle = getComputedStyle(blackLabel, "::before");
        const whiteLabelRect = whiteLabel.getBoundingClientRect();
        const blackLabelRect = blackLabel.getBoundingClientRect();
        const whiteCellRect = whiteCell.getBoundingClientRect();
        const blackCellRect = blackCell.getBoundingClientRect();
        const labelWidth = firstLabel.getBoundingClientRect().width;
        const blackKeyRight = Number.parseFloat(blackKeyStyle.right);
        const blackKeyWidth = Number.parseFloat(blackKeyStyle.width);
        return {
          alternatingRowsDiffer: getComputedStyle(firstRow).backgroundColor !== getComputedStyle(secondRow).backgroundColor,
          blackBedBackground: blackLabelStyle.backgroundImage || blackLabelStyle.backgroundColor,
          blackBackground: blackKeyStyle.backgroundImage || blackKeyStyle.backgroundColor,
          blackClass: blackLabel.className,
          blackColor: blackLabelStyle.color,
          blackJustifyItems: blackLabelStyle.justifyItems,
          blackKeyInsetLeft: labelWidth - blackKeyWidth - blackKeyRight,
          blackKeyRight,
          blackKeyTop: Number.parseFloat(blackKeyStyle.top),
          blackKeyWidth,
          blackKind: blackLabel.dataset.keyKind,
          blackLabelHeight: blackLabelRect.height,
          blackLabelRight: blackLabelRect.right,
          blackLabelText: blackLabel.textContent,
          blackTextColor: blackTextStyle.color,
          blackTextLeft: blackText.getBoundingClientRect().left,
          blackTextRight: blackText.getBoundingClientRect().right,
          blackTextVisible: blackText.getBoundingClientRect().width > 0,
          blackTextAlign: blackLabelStyle.textAlign,
          borderRightWidth: getComputedStyle(firstNote).borderRightWidth,
          canScrollVertically: element.scrollHeight > element.clientHeight,
          cellCssWidth: getComputedStyle(firstNote).width,
          cellHeight: firstNote.getBoundingClientRect().height,
          columnWidth: firstNote.getBoundingClientRect().width,
          columnTemplate: getComputedStyle(grid).gridTemplateColumns,
          containsGrid: grid?.parentElement === element,
          expectedViewportHeight: window.innerHeight * 0.5,
          headerBackgrounds: [
            barHeaderStyle.backgroundColor,
            beatHeaderStyle.backgroundColor,
            barAxisStyle.backgroundColor,
            beatAxisStyle.backgroundColor
          ],
          overflowY: outputStyle.overflowY,
          viewportHeight: element.getBoundingClientRect().height,
          whiteBackground: whiteKeyStyle.backgroundImage || whiteKeyStyle.backgroundColor,
          whiteClass: whiteLabel.className,
          whiteColor: whiteLabelStyle.color,
          whiteJustifyItems: whiteLabelStyle.justifyItems,
          whiteKeyLeft: Number.parseFloat(whiteKeyStyle.left),
          whiteKeyTop: Number.parseFloat(whiteKeyStyle.top),
          whiteKeyWidth: Number.parseFloat(whiteKeyStyle.width),
          whiteKind: whiteLabel.dataset.keyKind,
          whiteLabelHeight: whiteLabelRect.height,
          whiteLabelText: whiteLabel.textContent,
          whiteTextColor: whiteTextStyle.color,
          whiteTextLeft: whiteText.getBoundingClientRect().left,
          whiteTextVisible: whiteText.getBoundingClientRect().width > 0,
          whiteTextAlign: whiteLabelStyle.textAlign,
          whiteRowDelta: Math.abs(whiteLabelRect.top - whiteCellRect.top),
          whiteRowHeightDelta: Math.abs(whiteLabelRect.height - whiteCellRect.height),
          blackRowDelta: Math.abs(blackLabelRect.top - blackCellRect.top),
          blackRowHeightDelta: Math.abs(blackLabelRect.height - blackCellRect.height),
          labelWidth,
          topScrollbarHeight: topScrollbar.getBoundingClientRect().height
        };
      });
      expect(gridLayout.containsGrid).toBe(true);
      expect(gridLayout.alternatingRowsDiffer).toBe(true);
      expect(Number.parseFloat(gridLayout.borderRightWidth)).toBeGreaterThanOrEqual(0.8);
      expect(Number.parseFloat(gridLayout.borderRightWidth)).toBeLessThanOrEqual(1);
      expect(gridLayout.columnWidth).toBeGreaterThan(1);
      expect(Math.abs(gridLayout.columnWidth - gridLayout.cellHeight)).toBeLessThanOrEqual(1);
      expect(Number.parseFloat(gridLayout.cellCssWidth)).toBeGreaterThan(1);
      expect(gridLayout.columnTemplate).toContain("22px");
      expect(gridLayout.labelWidth).toBeGreaterThan(40);
      expect(gridLayout.topScrollbarHeight).toBeGreaterThanOrEqual(12);
      expect(Math.abs(gridLayout.viewportHeight - gridLayout.expectedViewportHeight)).toBeLessThanOrEqual(2);
      expect(gridLayout.overflowY).toMatch(/auto|scroll/);
      expect(gridLayout.canScrollVertically).toBe(true);
      expect(gridLayout.whiteKind).toBe("white");
      expect(gridLayout.blackKind).toBe("black");
      expect(gridLayout.whiteClass).toContain("midi-studio-v2__octave-row-label--white-key");
      expect(gridLayout.blackClass).toContain("midi-studio-v2__octave-row-label--black-key");
      expect(gridLayout.whiteLabelText).toBe("C5");
      expect(gridLayout.blackLabelText).toBe("C#5");
      expect(gridLayout.whiteBackground).not.toBe(gridLayout.blackBackground);
      expect(gridLayout.blackBedBackground).toBe(gridLayout.whiteBackground);
      expect(gridLayout.whiteColor).not.toBe(gridLayout.blackColor);
      expect(gridLayout.whiteTextVisible).toBe(true);
      expect(gridLayout.blackTextVisible).toBe(true);
      expect(gridLayout.whiteTextColor).toBe("rgb(15, 23, 42)");
      expect(gridLayout.blackTextColor).toBe("rgb(248, 250, 252)");
      expect(gridLayout.headerBackgrounds).toEqual([
        "rgb(54, 0, 175)",
        "rgb(54, 0, 175)",
        "rgb(54, 0, 175)",
        "rgb(54, 0, 175)"
      ]);
      expect(gridLayout.whiteTextAlign).toBe("left");
      expect(gridLayout.blackTextAlign).toBe("left");
      expect(gridLayout.whiteJustifyItems).toBe("start");
      expect(gridLayout.blackJustifyItems).toBe("start");
      expect(gridLayout.whiteKeyLeft).toBe(0);
      expect(gridLayout.whiteKeyTop).toBe(0);
      expect(Math.abs(gridLayout.whiteKeyWidth - gridLayout.labelWidth)).toBeLessThanOrEqual(1);
      expect(gridLayout.blackKeyRight).toBe(0);
      expect(gridLayout.blackKeyInsetLeft).toBeGreaterThan(0);
      expect(gridLayout.blackKeyTop).toBeLessThan(0);
      expect(gridLayout.blackKeyWidth).toBeLessThan(gridLayout.whiteKeyWidth);
      expect(gridLayout.whiteTextLeft).toBeGreaterThanOrEqual(gridLayout.whiteKeyLeft);
      expect(gridLayout.blackTextLeft).toBeGreaterThan(gridLayout.blackKeyInsetLeft);
      expect(gridLayout.blackTextRight).toBeLessThanOrEqual(gridLayout.blackLabelRight);
      expect(gridLayout.whiteRowDelta).toBeLessThanOrEqual(1);
      expect(gridLayout.blackRowDelta).toBeLessThanOrEqual(1);
      expect(gridLayout.whiteRowHeightDelta).toBeLessThanOrEqual(1);
      expect(gridLayout.blackRowHeightDelta).toBeLessThanOrEqual(1);

      await page.locator("#instrumentGridZoomInButton").click();
      const zoomedInLayout = await output.evaluate((element) => {
        const firstNote = element.querySelector('.midi-studio-v2__octave-note-cell[data-step-index="0"]');
        const header = element.querySelector('.midi-studio-v2__grid-cell--beat-header[data-step-index="6"]').getBoundingClientRect();
        const bodyCell = element.querySelector('.midi-studio-v2__octave-note-cell[data-row-token="C5"][data-step-index="6"]').getBoundingClientRect();
        const label = element.querySelector('.midi-studio-v2__octave-row-label[data-octave-row="C5"]').getBoundingClientRect();
        return {
          bodyHeaderDelta: Math.abs(header.left - bodyCell.left),
          height: firstNote.getBoundingClientRect().height,
          labelHeight: label.height,
          width: firstNote.getBoundingClientRect().width
        };
      });
      expect(zoomedInLayout.width).toBeGreaterThan(gridLayout.columnWidth);
      expect(Math.abs(zoomedInLayout.width - zoomedInLayout.height)).toBeLessThanOrEqual(1);
      expect(zoomedInLayout.labelHeight).toBeGreaterThan(gridLayout.whiteLabelHeight);
      expect(Math.abs(zoomedInLayout.labelHeight - zoomedInLayout.height)).toBeLessThanOrEqual(1);
      expect(zoomedInLayout.bodyHeaderDelta).toBeLessThanOrEqual(1);

      await page.locator("#instrumentGridZoomOutButton").click();
      await page.locator("#instrumentGridZoomOutButton").click();
      const zoomedOutLayout = await output.evaluate((element) => {
        const firstNote = element.querySelector('.midi-studio-v2__octave-note-cell[data-step-index="0"]');
        const header = element.querySelector('.midi-studio-v2__grid-cell--beat-header[data-step-index="6"]').getBoundingClientRect();
        const bodyCell = element.querySelector('.midi-studio-v2__octave-note-cell[data-row-token="C5"][data-step-index="6"]').getBoundingClientRect();
        const label = element.querySelector('.midi-studio-v2__octave-row-label[data-octave-row="C5"]').getBoundingClientRect();
        return {
          bodyHeaderDelta: Math.abs(header.left - bodyCell.left),
          height: firstNote.getBoundingClientRect().height,
          labelHeight: label.height,
          width: firstNote.getBoundingClientRect().width
        };
      });
      expect(zoomedOutLayout.width).toBeLessThan(zoomedInLayout.width);
      expect(zoomedOutLayout.width).toBeGreaterThan(1);
      expect(Math.abs(zoomedOutLayout.width - zoomedOutLayout.height)).toBeLessThanOrEqual(1);
      expect(zoomedOutLayout.labelHeight).toBeLessThan(zoomedInLayout.labelHeight);
      expect(Math.abs(zoomedOutLayout.labelHeight - zoomedOutLayout.height)).toBeLessThanOrEqual(1);
      expect(zoomedOutLayout.bodyHeaderDelta).toBeLessThanOrEqual(1);

      await output.evaluate((element) => {
        element.style.maxWidth = "80px";
        element.dispatchEvent(new Event("scroll"));
      });
      const scrollbars = await output.evaluate((element) => {
        const topScrollbar = element.querySelector(".midi-studio-v2__timeline-scroll-proxy");
        const grid = element.querySelector(".midi-studio-v2__octave-timeline");
        const topRect = topScrollbar.getBoundingClientRect();
        return {
          bottomCanScroll: element.scrollWidth > element.clientWidth,
          bottomOverflowX: getComputedStyle(element).overflowX,
          gridOverflowsOutput: grid.scrollWidth > element.clientWidth,
          topCanScroll: topScrollbar.scrollWidth > topScrollbar.clientWidth,
          topOverflowX: getComputedStyle(topScrollbar).overflowX,
          topVisible: topRect.height >= 12 && topRect.width > 0
        };
      });
      expect(scrollbars.bottomCanScroll).toBe(true);
      expect(scrollbars.bottomOverflowX).toMatch(/auto|scroll/);
      expect(scrollbars.gridOverflowsOutput).toBe(true);
      expect(scrollbars.topCanScroll).toBe(true);
      expect(scrollbars.topOverflowX).toMatch(/auto|scroll/);
      expect(scrollbars.topVisible).toBe(true);

      await output.evaluate((element) => {
        const topScrollbar = element.querySelector(".midi-studio-v2__timeline-scroll-proxy");
        topScrollbar.scrollLeft = Math.min(14, topScrollbar.scrollWidth - topScrollbar.clientWidth);
        topScrollbar.dispatchEvent(new Event("scroll"));
      });
      await expect.poll(() => timelineScrollSnapshot(page)).toEqual(expect.objectContaining({
        scrollLeft: await output.evaluate((element) => Math.round(element.querySelector(".midi-studio-v2__timeline-scroll-proxy").scrollLeft))
      }));
      await output.evaluate((element) => {
        element.scrollLeft = Math.min(9, element.scrollWidth - element.clientWidth);
        element.dispatchEvent(new Event("scroll"));
      });
      await expect.poll(() => timelineScrollSnapshot(page)).toEqual(expect.objectContaining({
        topScrollLeft: await output.evaluate((element) => Math.round(element.scrollLeft))
      }));

      await output.evaluate((element) => {
        element.style.maxHeight = "150px";
        element.scrollTop = 140;
        element.dispatchEvent(new Event("scroll"));
      });
      const verticalFreeze = await output.evaluate((element) => {
        const outputRect = element.getBoundingClientRect();
        const row1 = element.querySelector(".midi-studio-v2__timing-header-row-1.midi-studio-v2__note-table-column-header").getBoundingClientRect();
        const row2 = element.querySelector(".midi-studio-v2__timing-header-row-2.midi-studio-v2__note-table-column-header").getBoundingClientRect();
        const topScrollbar = element.querySelector(".midi-studio-v2__timeline-scroll-proxy").getBoundingClientRect();
        return {
          headerGap: Math.round(row2.top - row1.bottom),
          row1BelowTopScrollbar: Math.abs(row1.top - topScrollbar.bottom),
          row2BelowRow1: row2.top >= row1.bottom - 1,
          scrollTop: Math.round(element.scrollTop)
        };
      });
      expect(verticalFreeze.scrollTop).toBeGreaterThan(0);
      expect(verticalFreeze.row1BelowTopScrollbar).toBeLessThanOrEqual(2);
      expect(verticalFreeze.headerGap).toBeLessThanOrEqual(1);
      expect(verticalFreeze.row2BelowRow1).toBe(true);

      await output.evaluate((element) => {
        element.scrollLeft = 220;
        element.dispatchEvent(new Event("scroll"));
      });
      const horizontalFreeze = await output.evaluate((element) => {
        const outputRect = element.getBoundingClientRect();
        const header = element.querySelector('.midi-studio-v2__grid-cell--beat-header[data-step-index="6"]').getBoundingClientRect();
        const bodyCell = element.querySelector('.midi-studio-v2__octave-note-cell[data-row-token="C5"][data-step-index="6"]').getBoundingClientRect();
        const label = element.querySelector('.midi-studio-v2__octave-row-label[data-octave-row="C5"]').getBoundingClientRect();
        return {
          headerBodyDelta: Math.abs(header.left - bodyCell.left),
          labelVisibleInViewport: label.right > outputRect.left && label.left < outputRect.right,
          labelRowDelta: Math.abs(label.top - bodyCell.top),
          scrollLeft: Math.round(element.scrollLeft)
        };
      });
      expect(horizontalFreeze.scrollLeft).toBeGreaterThan(0);
      expect(horizontalFreeze.headerBodyDelta).toBeLessThanOrEqual(1);
      expect(horizontalFreeze.labelVisibleInViewport).toBe(true);
      expect(horizontalFreeze.labelRowDelta).toBeLessThanOrEqual(1);

      await output.evaluate((element) => {
        element.style.maxWidth = "";
        element.scrollLeft = 0;
        element.dispatchEvent(new Event("scroll"));
      });
      await octaveCell(page, "C6", 10).click();
      await expect(octaveCell(page, "C6", 10)).toHaveText("");
      await expect(octaveCell(page, "C6", 10)).toHaveAttribute("data-note-lanes", /lead/);
      await expect(octaveCell(page, "C6", 10)).toHaveAttribute("data-note-values", /C6/);
      await expect(octaveCell(page, "C6", 10)).toHaveClass(/midi-studio-v2__grid-cell--lane-selected/);
      const activeHighlight = await octaveCell(page, "C6", 10).evaluate((cell) => {
        const marker = getComputedStyle(cell, "::before");
        return {
          content: marker.content,
          width: marker.width
        };
      });
      expect(activeHighlight.content).not.toBe("none");
      expect(Number.parseFloat(activeHighlight.width)).toBeGreaterThan(1);

      await page.locator("#playButton").click();
      await expect(page.locator("#stopButton")).toBeEnabled();
      await expect(page.locator("#playButton")).toBeDisabled();
      await page.locator("#stopButton").click();
      await expect(page.locator("#stopButton")).toBeDisabled();
      await expect(page.locator("#playButton")).toBeEnabled();
    } finally {
      await workspaceV2CoverageReporter.stop(page);
      await server.close();
    }
  });

  test("imports UAT manifest and plays the upbeat multi-instrument studio arrangement", async ({ page }) => {
    const server = await openMidiStudioForImport(page);
    try {
      await expect(page.locator("#toolImportManifestButton")).toHaveText("Import JSON Manifest");
      await expect(page.locator("#loadExampleAndPlayButton")).toHaveCount(0);
      await expect(page.locator("#useExampleButton")).toHaveCount(0);
      await page.locator("#toolImportManifestInput").setInputFiles(uatManifestPath);

      await expect(page.locator("#statusLog")).toHaveValue(/OK Loaded 3 MIDI songs from Import JSON Manifest:.*uat-midi-studio-v2\.game\.manifest\.json via manifest\.music\./);
      await expect(page.locator('[data-midi-studio-tab="midi-import"]')).toHaveCount(1);
      await expect(page.locator('[data-midi-studio-tab="export"]')).toHaveCount(0);
      await expect(page.locator(".midi-studio-v2__advanced-song-sheet")).toHaveCount(0);
      await expect(page.locator("#songSheetInput")).toHaveCount(0);
      await expect(page.locator("#parseRawSongSheetButton")).toHaveCount(0);
      await expect(page.locator("#midiSourceFileInput")).toHaveAttribute("accept", /\.mid,.midi/);
      await selectMidiStudioTab(page, "midi-import");
      await expect(page.locator("#midiImportContent")).toBeVisible();
      await expect(page.locator("#songDetailsContent #midiImportContent")).toHaveCount(0);
      await expect(page.locator("#midiSourceDetails")).toContainText("No MIDI source inspected.");
      await selectMidiStudioTab(page, "song-setup");
      await expect(page.locator("#midiImportContent")).toBeHidden();
      await expect(page.locator("#statusLog")).not.toHaveValue(/HTTP 404/);
      await expect(page.locator("#songList [data-song-id]")).toHaveCount(3);
      await expect(page.locator("#songList")).toContainText("Camptown Races UAT Reel");
      await expect(page.locator("#songList")).toContainText("Frog Hop Nursery Rhyme UAT");
      await expect(page.locator("#songList")).toContainText("Coal Mine Descent");
      await page.locator('[data-song-id="frog-hop-nursery-rhyme"]').click();
      await expect(page.locator("#nowPlayingLabel")).toHaveText("Selected: Frog Hop Nursery Rhyme UAT");
      await expect(page.locator("#directorPanel")).toContainText("frog-hop");
      await expect(page.locator("#songSheetStyleInput")).toHaveValue("chip");
      await expect(page.locator("#instrumentGridSectionsInput")).toHaveValue("hop:2, home:2");
      await expect(spreadsheetCell(page, "lead", 0).locator(".midi-studio-v2__note-block")).toHaveText("C5");
      await page.locator('[data-song-id="quiet-village-pad"]').click();
      await expect(page.locator("#nowPlayingLabel")).toHaveText("Selected: Coal Mine Descent");
      await expect(page.locator("#directorPanel")).toContainText("Quiet Village Pad placeholder");
      await expect(page.locator("#songSheetKeyInput")).toHaveValue("D minor");
      await expect(page.locator("#instrumentGridSectionsInput")).toHaveValue("shaft:2, descent:2");
      await expect(spreadsheetCell(page, "lead", 0).locator(".midi-studio-v2__note-block")).toHaveText("D5");
      await page.locator('[data-song-id="camptown-races-uat-reel"]').click();

      await expect(page.locator("#nowPlayingLabel")).toHaveText("Selected: Camptown Races UAT Reel");
      await expect(page.locator("#directorPanel")).toContainText("upbeat");
      await expect(page.locator("#songSheetKeyInput")).toHaveValue("G major");
      await expect(page.locator("#songSheetStyleInput")).toHaveValue("public-domain-reel");
      await expect(page.locator("#instrumentGridSectionsInput")).toHaveValue("verse:2, chorus:2");

      await selectMidiStudioTab(page, "studio");
      await expect(page.locator('[data-midi-studio-tab="studio"]')).toHaveAttribute("aria-selected", "true");
      await expect(page.locator(".midi-studio-v2__instrument-list-panel")).toHaveCount(0);
      await expect(page.locator(".midi-studio-v2__instrument-row")).toHaveCount(0);
      await expect(page.locator("#instrumentGridContent")).toBeVisible();
      await expect(page.locator('.accordion-v2__header[aria-controls="instrumentGridContent"]')).toHaveCount(0);
      await expect(page.locator(".midi-studio-v2__timeline-title")).toContainText("Timeline");
      await expect(page.locator(".midi-studio-v2__timeline-title")).toContainText("Edit Notes Here");
      await expect(page.locator(".midi-studio-v2__note-table")).toHaveCount(1);
      await expect(laneHeader(page, "lead")).toBeVisible();
      await expect(laneHeader(page, "bass")).toBeVisible();
      await expect(laneHeader(page, "chords")).toBeVisible();
      await expect(laneHeader(page, "pad")).toBeVisible();
      await expect(laneHeader(page, "drums")).toBeVisible();
      await expect(laneHeader(page, "mallets")).toBeVisible();
      const manifestLaneCount = await page.evaluate(() => Object.keys(window.__midiStudioV2App.selectedSong().studioArrangement.lanes).length);
      await expect(page.locator(".midi-studio-v2__lane-header-cell")).toHaveCount(manifestLaneCount);
      await expect(laneInstrumentSelect(page, "lead")).toHaveValue("retro-pulse-lead");
      await expect(laneInstrumentSelect(page, "bass")).toHaveValue("synth-bass");
      await expect(laneInstrumentSelect(page, "chords")).toHaveValue("warm-pad");
      await expect(laneInstrumentSelect(page, "pad")).toHaveValue("ambient-pad");
      await expect(laneInstrumentSelect(page, "drums")).toHaveValue("basic-drums");
      await expect(laneInstrumentSelect(page, "mallets")).toHaveValue("retro-square-lead");
      await expect(laneInstrumentTypeSelect(page, "lead")).toHaveValue("Synth");
      await expect(laneInstrumentTypeSelect(page, "drums")).toHaveValue("Percussion");
      await laneInstrumentTypeSelect(page, "lead").selectOption("Keyboard");
      await expect(laneInstrumentSelect(page, "lead")).toHaveValue("preview-electric-piano");
      await expect(laneHeader(page, "lead").locator("[data-lane-label='lead']")).toHaveText("Preview Electric Piano");
      expect(await laneInstrumentSelect(page, "lead").locator("option").evaluateAll((options) => options.map((option) => option.textContent))).toEqual([
        "Choose instrument",
        "Preview Electric Piano",
        "Warm Pad"
      ]);
      await expect(page.locator("#statusLog")).toHaveValue(/OK Instrument type selected for Lead: Keyboard; instrument options updated to Preview Electric Piano\./);
      await laneInstrumentSelect(page, "lead").selectOption("warm-pad");
      await expect(laneHeader(page, "lead").locator("[data-lane-label='lead']")).toHaveText("Warm Pad");
      await expect(page.locator("#statusLog")).toHaveValue(/OK Preview instrument selected for Lead: Warm Pad\./);
      await expect(page.locator(".midi-studio-v2__lane-role")).toHaveCount(0);
      await expect(laneHeader(page, "lead")).not.toContainText("Volume");
      await expect(laneHeader(page, "lead")).not.toContainText("Pan");
      await expect(laneHeader(page, "lead").locator('[aria-label="Mute Lead"]')).toHaveCount(1);
      await expect(laneHeader(page, "lead").locator('[aria-label="Solo Lead"]')).toHaveCount(1);
      await expect(laneHeader(page, "lead").locator('[data-lane-control-toggle="volume"]')).toHaveCount(1);
      await expect(laneHeader(page, "lead").locator('[data-lane-control-toggle="pan"]')).toHaveCount(1);
      expect(await laneHeader(page, "lead").evaluate((row) => Math.round(row.getBoundingClientRect().height))).toBeLessThanOrEqual(120);
      await expect(page.locator("#previewVolumeLeadInput")).toBeHidden();
      await laneHeader(page, "lead").locator('[data-lane-control-toggle="volume"]').click();
      await expect(page.locator("#previewVolumeLeadInput")).toBeVisible();
      await laneHeader(page, "lead").locator('[data-lane-control-toggle="volume"]').click();
      await expect(page.locator("#previewVolumeLeadInput")).toBeHidden();
      await expect(page.locator("#previewPanLeadInput")).toBeHidden();
      await laneHeader(page, "lead").locator('[data-lane-control-toggle="pan"]').click();
      await expect(page.locator("#previewPanLeadInput")).toBeVisible();
      const laneCountBeforeAdd = await page.locator(".midi-studio-v2__lane-header-cell").count();
      await page.locator("#addInstrumentRowButton").click();
      await expect(laneHeader(page, "instrument-1")).toBeVisible();
      await expect(laneInstrumentTypeSelect(page, "instrument-1")).toHaveValue("Synth");
      expect(await page.evaluate(() => Object.hasOwn(window.__midiStudioV2App.selectedSong().studioArrangement.lanes, "instrument-1"))).toBe(true);
      expect(await page.locator(".midi-studio-v2__lane-header-cell").count()).toBe(laneCountBeforeAdd + 1);
      await expect(page.locator("#statusLog")).toHaveValue(/OK Added instrument row Instrument 1; playback data updated\./);
      await laneHeader(page, "instrument-1").locator('[data-delete-instrument-row="instrument-1"]').click();
      await expect(laneHeader(page, "instrument-1")).toHaveCount(0);
      expect(await page.evaluate(() => Object.hasOwn(window.__midiStudioV2App.selectedSong().studioArrangement.lanes, "instrument-1"))).toBe(false);
      await expect(page.locator(".midi-studio-v2__lane-header-cell")).toHaveCount(laneCountBeforeAdd);
      await expect(page.locator("#statusLog")).toHaveValue(/OK Deleted instrument row Instrument 1; playback data updated\./);
      await expect(page.locator(".midi-studio-v2__note-block")).not.toHaveCount(0);
      await expect(page.locator('.midi-studio-v2__note-table-cell[data-lane="lead"] .midi-studio-v2__note-block').first()).toHaveText("G4");
      await expect(page.locator('.midi-studio-v2__note-table-cell[data-lane="bass"] .midi-studio-v2__note-block').first()).toHaveText("G2");
      await expect(page.locator('.midi-studio-v2__note-table-cell[data-lane="chords"] .midi-studio-v2__note-block').first()).toHaveText("G");
      await expect(page.locator('.midi-studio-v2__note-table-cell[data-lane="pad"] .midi-studio-v2__note-block').first()).toHaveText("G");
      await expect(page.locator('.midi-studio-v2__note-table-cell[data-lane="drums"] .midi-studio-v2__note-block').first()).toHaveText("kick");
      await expect(page.locator('.midi-studio-v2__note-table-cell[data-lane="mallets"] .midi-studio-v2__note-block').first()).toHaveText("B4");
      await laneHeader(page, "lead").evaluate((cell) => cell.click());
      await expect(laneHeader(page, "lead")).toHaveClass(/is-selected/);
      await expect(page.locator('.midi-studio-v2__note-table-cell[data-lane="lead"].midi-studio-v2__grid-cell--lane-selected')).not.toHaveCount(0);
      await expect(page.locator("#audioDiagnosticsContent")).toBeHidden();
      await expect(page.locator("#inspectorContent")).toBeHidden();
      await spreadsheetCell(page, "lead", 0).fill("C5");
      await expect(spreadsheetCell(page, "lead", 0)).toHaveText("C5");
      await expect(page.locator("#instrumentGridLeadInput")).toHaveValue(/C5 G4 E4 G4/);
      expect(await page.evaluate(() => window.__midiStudioV2App.lastInstrumentGridResult.timeline.some((event) => (
        event.lane === "lead" && event.stepIndex === 0 && event.value === "C5"
      )))).toBe(true);

      await page.locator("#playButton").click();
      const firstPlayheadStep = Number(await page.locator(".midi-studio-v2__grid-cell--beat-header.midi-studio-v2__grid-cell--playhead-active").getAttribute("data-step-index"));
      await expect(page.locator(".midi-studio-v2__grid-cell--timing-header.midi-studio-v2__grid-cell--playhead-active")).toHaveCount(2);
      await expect(page.locator(".midi-studio-v2__note-table-cell.midi-studio-v2__grid-cell--playhead-active")).toHaveCount(0);
      await expect(page.locator("#playbackState")).toContainText("Playing audible preview: Camptown Races UAT Reel");
      await expect(page.locator("#nowPlayingLabel")).toHaveText("Playing: Camptown Races UAT Reel");
      await expect(page.locator("#statusLog")).toHaveValue(/OK Audible preview playback started for Camptown Races UAT Reel\./);
      expect(await page.evaluate(() => window.__midiStudioPreviewSynthEvents.some((event) => event.action === "oscillator-start"))).toBe(true);
      expect(await page.evaluate(() => window.__midiStudioPreviewSynthEvents.some((event) => event.action === "buffer-start"))).toBe(true);
      expect(await page.evaluate(() => window.__midiStudioV2App.previewSynth.getSnapshot().playing)).toBe(true);
      expect(await page.evaluate(() => window.__midiStudioV2App.lastInstrumentGridResult.timeline.some((event) => (
        event.lane === "lead" && event.stepIndex === 0 && event.value === "C5"
      )))).toBe(true);
      await page.waitForTimeout(520);
      const nextPlayheadStep = Number(await page.locator(".midi-studio-v2__grid-cell--beat-header.midi-studio-v2__grid-cell--playhead-active").getAttribute("data-step-index"));
      expect(nextPlayheadStep).toBeGreaterThan(firstPlayheadStep);
      expect(nextPlayheadStep - firstPlayheadStep).toBeLessThanOrEqual(2);

      await page.locator("#stopAllAudioButton").click();
      await expect(page.locator("#playbackState")).toContainText("Stopped audible preview: Camptown Races UAT Reel");
      await expect(page.locator("#stopButton")).toBeDisabled();
      await expect(page.locator("#playButton")).toBeEnabled();
      await expect(page.locator("#nowPlayingLabel")).toHaveText("Selected: Camptown Races UAT Reel");
      expect(await page.evaluate(() => window.__midiStudioV2App.previewSynth.getSnapshot().playing)).toBe(false);
      expect(await page.locator(".midi-studio-v2__grid-cell--lane-active").count()).toBe(0);
    } finally {
      await workspaceV2CoverageReporter.stop(page);
      await server.close();
    }
  });

  test("imports a local MIDI source from the MIDI Import tab without default HTTP 404 noise", async ({ page }) => {
    const server = await openMidiStudioForImport(page);
    try {
      await expect(page.locator('[data-midi-studio-tab="midi-import"]')).toHaveCount(1);
      await expect(page.locator('[data-midi-studio-tab="export"]')).toHaveCount(0);
      await selectMidiStudioTab(page, "midi-import");
      await expect(page.locator("#midiImportContent")).toBeVisible();
      await expect(page.locator("#songDetailsContent #midiImportContent")).toHaveCount(0);
      await expect(page.locator("#songDetails input[data-song-detail-field='sourceMidi']")).toHaveCount(0);
      await expect(page.locator("#songDetails input[data-song-detail-field='instrumentSet']")).toHaveCount(0);
      await expect(page.locator("#midiSourceFileInput")).toHaveAttribute("accept", /\.mid,.midi/);
      await expect(page.locator("#statusLog")).not.toHaveValue(/HTTP 404/);

      await page.locator("#midiSourceFileInput").setInputFiles({
        buffer: validMidiBytes,
        mimeType: "audio/midi",
        name: "local-import.midi"
      });

      await expect(page.locator("#midiSourceDetails")).toContainText("local-import.midi");
      await expect(page.locator("#midiSourceDetails")).toContainText("Format");
      await expect(page.locator("#songList [data-song-id]")).toHaveCount(1);
      await expect(page.locator("#songList")).toContainText("Local Import");
      await expect(page.locator("#songSourceField")).toHaveValue("local-import.midi");
      await expect(page.locator("#statusLog")).toHaveValue(/OK Imported MIDI source local-import\.midi: format 1, 2 tracks\./);
      await expect(page.locator("#statusLog")).toHaveValue(/OK Normalized 1 MIDI note into editable octave timeline data\./);
      await expect(page.locator("#statusLog")).not.toHaveValue(/HTTP 404/);
      expect(await page.evaluate(() => {
        const song = window.__midiStudioV2App.selectedSong();
        return {
          activeSongId: window.__midiStudioV2App.payload.activeSongId,
          hasArrangement: Boolean(song.studioArrangement),
          importedNoteCount: song.studioArrangement?.importedNoteCount,
          name: song.name,
          sourceMidi: song.sourceMidi
        };
      })).toEqual({
        activeSongId: "local-import",
        hasArrangement: true,
        importedNoteCount: 1,
        name: "Local Import",
        sourceMidi: "local-import.midi"
      });
    } finally {
      await workspaceV2CoverageReporter.stop(page);
      await server.close();
    }
  });

  test("consolidates existing tab buckets without duplicate editable fields", async ({ page }) => {
    const server = await openMidiStudioForImport(page);
    try {
      await page.locator("#toolImportManifestInput").setInputFiles(uatManifestPath);
      const tabs = await page.locator("[data-midi-studio-tab]").evaluateAll((tabButtons) => tabButtons.map((tab) => ({
        id: tab.dataset.midiStudioTab,
        text: tab.textContent.trim()
      })));
      expect(tabs.slice(0, 2)).toEqual([
        { id: "song-setup", text: "Song Setup" },
        { id: "studio", text: "Octave Timeline" }
      ]);
      expect(tabs).toHaveLength(7);
      expect(tabs.map((tab) => tab.text)).toEqual([
        "Song Setup",
        "Octave Timeline",
        "Instruments",
        "Auto-Create Parts",
        "MIDI Import",
        "Diagnostics",
        "Export"
      ]);
      expect(tabs.map((tab) => tab.text)).not.toContain("Studio");
      await expect(page.locator('[data-midi-studio-tab="song-setup"]')).toHaveAttribute("aria-selected", "true");
      await expect(page.locator('.accordion-v2__header[aria-controls="songListContent"]')).toContainText("Songs");
      await expect(page.locator('.accordion-v2__header[aria-controls="songDetailsContent"]')).toContainText("Song Details");
      await expect(page.locator('.accordion-v2__header[aria-controls="songSheetContent"]')).toContainText("Song Sheet");
      await expect(page.locator('.accordion-v2__header[aria-controls="songSectionsLoopContent"]')).toContainText("Sections / Loop");
      await expect(page.locator("#songDetailsContent")).toBeVisible();
      await expect(page.locator("#songSheetContent")).toBeVisible();
      await expect(page.locator("#songSectionsLoopContent")).toBeVisible();
      await expect(page.locator("#songSheetSummaryContent")).toHaveCount(0);
      await expect(page.locator("#songSheetContent #songSheetSummary")).toHaveCount(1);
      expect(await page.locator("#songDetailsContent").evaluate((details) => {
        const sheet = document.querySelector("#songSheetContent");
        return Boolean(sheet && details.compareDocumentPosition(sheet) & Node.DOCUMENT_POSITION_FOLLOWING);
      })).toBe(true);
      await expect(page.locator("#songDetails [data-song-detail-field='name']")).toHaveValue("Camptown Races UAT Reel");
      await expect(page.locator("#songDetails [data-song-detail-field='id']")).toHaveValue("camptown-races-uat-reel");
      await expect(page.locator("#songSheetTempoInput")).toHaveValue("144");
      await expect(page.locator("#songSheetKeyInput")).toHaveJSProperty("tagName", "SELECT");
      await expect(page.locator("#songSheetKeyInput")).toHaveValue("G major");
      await expect(page.locator("#songSheetStyleInput")).toHaveJSProperty("tagName", "SELECT");
      await expect(page.locator("#songSheetStyleInput")).toHaveValue("public-domain-reel");
      await expect(page.locator("#songDetails [data-song-detail-field='tags']")).toHaveCount(0);
      await expect(page.locator("#songDetails [data-song-detail-field='usage']")).toHaveCount(0);
      await expect(page.locator("#songDetailNotes [data-song-detail-field='notes']")).toHaveValue("Traditional Camptown Races style public-domain test arrangement with lead, bass, chords/pad, and drums.");
      await expect(page.locator("#songSectionsLoopDetails [data-song-detail-field='sections']")).toHaveCount(0);
      await expect(page.locator("#songSheetSectionsInput")).toHaveValue(/intro: G C G D/);
      await expect(page.locator("#songSheetLoopSectionsInput")).toHaveValue("loop");
      await expect(page.locator("#songSectionsLoopDetails [data-song-detail-field='loopEnabled']")).toBeChecked();
      await expect(page.locator("#directorContent")).toBeHidden();
      await expect(page.locator("#renderedTargetsContent")).toBeHidden();
      await expect(page.locator("#playbackContent")).toBeHidden();
      await expect(page.locator("#audioDiagnosticsContent")).toBeHidden();
      await expect(page.locator("#instrumentGridSummaryContent")).toBeHidden();
      await expect(page.locator("#midiImportContent")).toBeHidden();
      await expect(page.locator("#instrumentListContent")).toBeHidden();
      await expect(page.locator("#statusLogContent")).toBeHidden();
      await expect(page.locator("#songDetailsContent #midiImportContent")).toHaveCount(0);
      await expect(page.locator("#songDetails [data-song-detail-field='sourceMidi']")).toHaveCount(0);
      await expect(page.locator("#songDetails [data-song-detail-field='instrumentSet']")).toHaveCount(0);

      await page.locator("#songDetails [data-song-detail-field='name']").fill("Edited UAT Reel");
      await expect(page.locator("#songDetails [data-song-detail-field='id']")).toHaveJSProperty("readOnly", true);
      await expect(page.locator("#songDetails [data-song-detail-field='id']")).toHaveValue("editedUatReel");
      await page.locator("#songSheetTempoInput").fill("156");
      await page.locator("#songSheetKeyInput").selectOption("C major");
      await page.locator("#songSheetStyleInput").selectOption("chip");
      await page.locator("#songDetailNotes [data-song-detail-field='notes']").fill("Edited notes from Song Setup.");
      await page.locator("#songSectionsLoopDetails [data-song-detail-field='loopEnabled']").setChecked(false);
      expect(await page.evaluate(() => {
        const song = window.__midiStudioV2App.selectedSong();
        return {
          activeSongId: window.__midiStudioV2App.payload.activeSongId,
          id: song.id,
          key: song.studioArrangement.key,
          loopEnabled: song.loop.enabled,
          name: song.name,
          notes: song.director.notes,
          style: song.studioArrangement.style,
          tempo: song.studioArrangement.tempo
        };
      })).toEqual({
        activeSongId: "editedUatReel",
        id: "editedUatReel",
        key: "C major",
        loopEnabled: false,
        name: "Edited UAT Reel",
        notes: "Edited notes from Song Setup.",
        style: "chip",
        tempo: "156"
      });

      await page.locator('[data-song-id="frog-hop-nursery-rhyme"]').click();
      await expect(page.locator("#songDetails [data-song-detail-field='name']")).toHaveValue("Frog Hop Nursery Rhyme UAT");
      await expect(page.locator("#songDetails [data-song-detail-field='id']")).toHaveValue("frog-hop-nursery-rhyme");
      await expect(page.locator("#songSheetTempoInput")).toHaveValue("132");
      await expect(page.locator("#songSheetKeyInput")).toHaveValue("C major");
      await expect(page.locator("#songSheetStyleInput")).toHaveValue("chip");
      await expect(page.locator("#songDetails [data-song-detail-field='usage']")).toHaveCount(0);

      await selectMidiStudioTab(page, "instruments");
      await expect(page.locator("#instrumentListContent")).toBeVisible();
      await expect(instrumentTypeSelect(page, "lead")).toBeVisible();
      await expect(instrumentSelect(page, "lead")).toBeVisible();
      await expect(page.locator("#addInstrumentRowButton")).toBeVisible();
      await selectInstrumentRow(page, "lead");
      await expect(page.locator("#selectedInstrumentEditor .midi-studio-v2__lane-toggle--mute")).toBeVisible();
      await expect(page.locator("#selectedInstrumentEditor .midi-studio-v2__lane-toggle--solo")).toBeVisible();
      await expect(page.locator("#selectedInstrumentEditor #previewVolumeLeadInput")).toBeVisible();
      await expect(page.locator("#selectedInstrumentEditor #previewPanLeadInput")).toBeVisible();
      await expect(timelineQuickInstrumentRow(page, "lead").locator("[data-toggle-instrument-visibility='lead']")).toHaveCount(1);
      await expect(instrumentRow(page, "lead").locator("[data-delete-instrument-row='lead']")).toBeVisible();
      await expect(page.locator("#songListContent")).toBeHidden();
      await expect(page.locator("#songDetailsContent")).toBeHidden();
      await expect(page.locator("#songSheetContent")).toBeHidden();
      await expect(page.locator("#midiImportContent")).toBeHidden();
      await expect(page.locator("#instrumentGridOutput")).toBeHidden();
      await expect(page.locator("#timelineSelectionContent")).toBeHidden();
      await expect(page.locator("#audioDiagnosticsContent")).toBeHidden();
      await selectInstrumentRow(page, "lead");

      await selectMidiStudioTab(page, "auto-create-parts");
      await expect(page.locator("#generateBassFromChordsButton")).toBeVisible();
      await expect(page.locator("#generatePadFromChordsButton")).toBeVisible();
      await expect(page.locator("#generateArpeggioFromChordsButton")).toBeVisible();
      await expect(page.locator("#generateBasicDrumsButton")).toBeVisible();
      await expect(page.locator("#normalizeInstrumentGridButton")).toBeVisible();
      await expect(page.locator("#instrumentGridSectionsInput")).toBeVisible();
      await expect(page.locator("#instrumentGridOutput")).toBeHidden();
      await expect(page.locator("#loopToggle")).toBeHidden();
      await expect(page.locator("#songDetailsContent")).toBeHidden();
      await expect(page.locator("#instrumentListContent")).toBeHidden();
      await expect(page.locator("#midiImportContent")).toBeHidden();

      await selectMidiStudioTab(page, "midi-import");
      await expect(page.locator("#midiImportContent")).toBeVisible();
      await expect(page.locator("#songSourceField")).toBeVisible();
      await expect(page.locator("#instrumentSetField")).toBeVisible();
      await expect(page.locator("#importMidiSourceButton")).toBeVisible();
      await expect(page.locator("#inspectMidiSourceButton")).toBeVisible();
      await expect(page.locator("#midiSourceDetails")).toBeVisible();
      await expect(page.locator("#songListContent")).toBeHidden();
      await expect(page.locator("#songDetailsContent")).toBeHidden();
      await expect(page.locator("#songSheetContent")).toBeHidden();
      await expect(page.locator("#instrumentListContent")).toBeHidden();
      await expect(page.locator("#audioDiagnosticsContent")).toBeHidden();

      await selectMidiStudioTab(page, "diagnostics");
      await expect(page.locator("#inspectorContent")).toBeVisible();
      await expect(page.locator("#instrumentGridSummaryContent")).toBeVisible();
      await expect(page.locator("#audioDiagnosticsContent")).toBeVisible();
      await expect(page.locator("#playbackContent")).toBeVisible();
      await expect(page.locator("#renderedTargetsContent")).toBeHidden();
      await expect(page.locator("#directorContent")).toBeVisible();
      await expect(page.locator("#statusLogContent")).toBeVisible();
      await expect(page.locator("#songListContent")).toBeHidden();
      await expect(page.locator("#songDetailsContent")).toBeHidden();
      await expect(page.locator("#songSheetContent")).toBeHidden();
      await expect(page.locator("#midiImportContent")).toBeHidden();
      await expect(page.locator("#instrumentListContent")).toBeHidden();
      await expect(page.locator("#loopToggle")).toBeHidden();
      const diagnosticEditableControls = await page.locator('[data-midi-studio-tab-panel="diagnostics"] input:not([type="hidden"]), [data-midi-studio-tab-panel="diagnostics"] select, [data-midi-studio-tab-panel="diagnostics"] textarea:not([readonly])').count();
      expect(diagnosticEditableControls).toBe(0);
      await expect(page.locator("#toolCopyJsonButton")).toBeVisible();
      await expect(page.locator("#clearStatusButton")).toBeVisible();

      await selectMidiStudioTab(page, "export");
      await expect(page.locator("#exportWorkflowContent")).toBeVisible();
      await expect(page.locator("#renderedTargetsContent")).toBeVisible();
      await expect(page.locator("#renderedExportTargetTypeSelect")).toBeVisible();
      await expect(page.locator("#renderedExportSaveButton")).toBeVisible();
      await expect(page.locator("#inspectorContent")).toBeHidden();
      await expect(page.locator("#instrumentGridSummaryContent")).toBeHidden();

      await selectMidiStudioTab(page, "studio");
      await waitForCanvasRender(page);
      await expect(octaveTimelineCanvas(page)).toBeVisible();
      await expect(page.locator("#instrumentGridOutput")).toBeVisible();
      await expect(page.locator("#timelineSelectionContent")).toBeVisible();
      await expect(page.locator("#loopToggle")).toBeVisible();
      await expect(page.locator("#songListContent")).toBeHidden();
      await expect(page.locator("#songDetailsContent")).toBeHidden();
      await expect(page.locator("#songSheetContent")).toBeHidden();
      await expect(page.locator("#instrumentListContent")).toBeHidden();
      await expect(page.locator("#midiImportContent")).toBeHidden();
      await expect(page.locator("#instrumentGridSummaryContent")).toBeHidden();
      const editableTarget = await emptyCanvasRun(page, { lane: "lead", length: 1 });
      expect(editableTarget).toBeTruthy();
      await clickCanvasCell(page, editableTarget.rowToken, editableTarget.stepIndex);
      expect(await page.evaluate((target) => window.__midiStudioV2App.selectedSong().studioArrangement.lanes.lead.includes(target.rowToken), editableTarget)).toBe(true);
      await page.locator("#playButton").click();
      await expect(page.locator("#playButton")).toBeDisabled();
      await expect(page.locator("#stopButton")).toBeEnabled();
      await page.locator("#stopButton").click();
      await expect(page.locator("#stopButton")).toBeDisabled();
      await expect(page.locator("#playButton")).toBeEnabled();
    } finally {
      await workspaceV2CoverageReporter.stop(page);
      await server.close();
    }
  });

  test("enforces SSoT export ownership and future control honesty", async ({ page }) => {
    const server = await openMidiStudioForImport(page);
    try {
      await page.locator("#toolImportManifestInput").setInputFiles(uatManifestPath);
      const tabs = await page.locator("[data-midi-studio-tab]").evaluateAll((tabButtons) => tabButtons.map((tab) => ({
        id: tab.dataset.midiStudioTab,
        text: tab.textContent.trim()
      })));
      expect(tabs).toEqual([
        { id: "song-setup", text: "Song Setup" },
        { id: "studio", text: "Octave Timeline" },
        { id: "instruments", text: "Instruments" },
        { id: "auto-create-parts", text: "Auto-Create Parts" },
        { id: "midi-import", text: "MIDI Import" },
        { id: "diagnostics", text: "Diagnostics" },
        { id: "export", text: "Export" }
      ]);
      await expect(page.locator('.midi-studio-v2__tool-menu #renderedExportTargetTypeSelect')).toHaveCount(0);
      await expect(page.locator('.midi-studio-v2__tool-menu #renderedExportSaveButton')).toHaveCount(0);
      await expect(page.locator('.midi-studio-v2__tool-menu #toolExportToolStateButton')).toHaveCount(0);

      const ownedControlSelectors = {
        exportType: "#renderedExportTargetTypeSelect",
        saveExport: "#renderedExportSaveButton",
        toolStateExport: "#toolExportToolStateButton",
        instrumentType: "#previewInstrumentTypeLeadSelect",
        instrumentPatch: "#previewInstrumentLeadSelect",
        volume: "#previewVolumeLeadInput",
        pan: "#previewPanLeadInput",
        songName: "#songDetails [data-song-detail-field='name']",
        songId: "#songDetails [data-song-detail-field='id']",
        songTempo: "#songSheetTempoInput",
        songKey: "#songSheetKeyInput",
        songStyle: "#songSheetStyleInput",
        songNotes: "#songDetailNotes [data-song-detail-field='notes']"
      };
      const ownership = await page.evaluate((selectors) => Object.fromEntries(Object.entries(selectors).map(([name, selector]) => {
        const elements = Array.from(document.querySelectorAll(selector));
        return [name, {
          count: elements.length,
          panels: elements.map((element) => element.closest("[data-midi-studio-tab-panel]")?.dataset.midiStudioTabPanel || "")
        }];
      })), ownedControlSelectors);
      expect(ownership.exportType).toEqual({ count: 1, panels: ["export"] });
      expect(ownership.saveExport).toEqual({ count: 1, panels: ["export"] });
      expect(ownership.toolStateExport).toEqual({ count: 1, panels: ["export"] });
      expect(ownership.instrumentType).toEqual({ count: 1, panels: ["instruments"] });
      expect(ownership.instrumentPatch).toEqual({ count: 1, panels: ["instruments"] });
      expect(ownership.volume).toEqual({ count: 1, panels: ["instruments"] });
      expect(ownership.pan).toEqual({ count: 1, panels: ["instruments"] });
      expect(ownership.songName).toEqual({ count: 1, panels: ["song-setup"] });
      expect(ownership.songId).toEqual({ count: 1, panels: ["song-setup"] });
      expect(ownership.songTempo).toEqual({ count: 1, panels: ["song-setup"] });
      expect(ownership.songKey).toEqual({ count: 1, panels: ["song-setup"] });
      expect(ownership.songStyle).toEqual({ count: 1, panels: ["song-setup"] });
      expect(ownership.songNotes).toEqual({ count: 1, panels: ["song-setup"] });

      await page.locator("#songDetails [data-song-detail-field='name']").fill("SSoT Edited Reel");
      await page.locator("#songSheetTempoInput").fill("150");
      await page.locator("#songSheetKeyInput").selectOption("C major");
      await page.locator("#songSheetStyleInput").selectOption("chip");
      expect(await page.evaluate(() => {
        const song = window.__midiStudioV2App.selectedSong();
        return {
          key: song.studioArrangement.key,
          name: song.name,
          style: song.studioArrangement.style,
          tempo: song.studioArrangement.tempo
        };
      })).toEqual({
        key: "C major",
        name: "SSoT Edited Reel",
        style: "chip",
        tempo: "150"
      });

      await selectMidiStudioTab(page, "export");
      await expect(page.locator("#exportWorkflowContent")).toBeVisible();
      await expect(page.locator("#renderedTargetsContent")).toBeVisible();
      await expect(page.locator("#renderedExportTargetTypeSelect option")).toContainText(["WAV", "MP3", "OGG"]);
      await expect(page.locator("#renderedExportSaveButton")).toHaveText("Save WAV");
      await expect(page.locator("#renderedExportTargetTypeSelect")).toHaveAttribute("data-midi-studio-unwired", "not-implemented");
      await expect(page.locator("#renderedExportSaveButton")).toHaveAttribute("data-midi-studio-unwired", "not-implemented");
      await expect(page.locator("#renderedExportSaveButton")).toHaveAttribute("title", /Not implemented: Rendered audio export generation is not implemented yet/);
      const exportFutureControls = await page.locator('[data-midi-studio-tab-panel="export"] [data-midi-studio-future-control]').evaluateAll((controls) => controls.map((control) => ({
        disabled: control.disabled,
        status: control.dataset.midiStudioUnwired,
        text: control.textContent.trim(),
        title: control.title
      })));
      expect(exportFutureControls).toHaveLength(6);
      expect(exportFutureControls.every((control) => control.disabled && control.status === "not-implemented" && control.title.includes("Not implemented:"))).toBe(true);
      expect(exportFutureControls.map((control) => control.text)).toEqual(expect.arrayContaining([
        "SoundFont",
        "Render Quality",
        "Sample Rate",
        "Normalize Volume",
        "Export Stems",
        "Loop Export"
      ]));

      await selectMidiStudioTab(page, "midi-import");
      const midiInputFutureControls = await page.locator("#futureEnableMidiInputButton, #futureMidiDeviceSelect, #futureRecordMidiButton").evaluateAll((controls) => controls.map((control) => ({
        disabled: control.disabled,
        panel: control.closest("[data-midi-studio-tab-panel]")?.dataset.midiStudioTabPanel,
        status: control.dataset.midiStudioUnwired,
        title: control.title
      })));
      expect(midiInputFutureControls).toEqual([
        expect.objectContaining({ disabled: true, panel: "midi-import", status: "not-implemented" }),
        expect.objectContaining({ disabled: true, panel: "midi-import", status: "not-implemented" }),
        expect.objectContaining({ disabled: true, panel: "midi-import", status: "not-implemented" })
      ]);
      expect(midiInputFutureControls.every((control) => control.title.includes("Not implemented:"))).toBe(true);

      await selectMidiStudioTab(page, "diagnostics");
      await expect(page.locator("#inspectorContent")).toBeVisible();
      await expect(page.locator("#renderedTargetsContent")).toBeHidden();
      await expect(page.locator("#exportWorkflowContent")).toBeHidden();
      expect(await page.locator('[data-midi-studio-tab-panel="diagnostics"] input:not([type="hidden"]):not([readonly]), [data-midi-studio-tab-panel="diagnostics"] select, [data-midi-studio-tab-panel="diagnostics"] textarea:not([readonly])').count()).toBe(0);

      await selectMidiStudioTab(page, "instruments");
      await expect(page.locator("#instrumentSettingsContent")).toBeVisible();
      await expect(page.locator("#instrumentAuditionKeyboard")).toBeVisible();
      await expect(page.locator("#instrumentAuditionKeyboard")).not.toHaveAttribute("data-midi-studio-unwired");
      await expect(page.locator("#previewVolumeLeadInput")).toBeVisible();
      await expect(page.locator("#previewPanLeadInput")).toBeVisible();
      await expect(page.locator("#previewOctaveLowLeadInput")).toBeVisible();
      await expect(page.locator("#previewTransposeLeadInput")).toBeVisible();
      const instrumentFutureControls = await page.locator('[data-midi-studio-tab-panel="instruments"] [data-midi-studio-future-control]').evaluateAll((controls) => controls.map((control) => ({
        label: (control.getAttribute("aria-label") || control.placeholder || control.textContent).replace(/\s*\(Not implemented\)$/, "").trim(),
        disabled: control.disabled,
        status: control.dataset.midiStudioUnwired,
        text: control.textContent.trim(),
        title: control.title
      })));
      expect(instrumentFutureControls).toHaveLength(8);
      expect(instrumentFutureControls.every((control) => control.disabled && control.status === "not-implemented" && control.title.includes("Not implemented:"))).toBe(true);
      expect(instrumentFutureControls.map((control) => control.label)).toEqual(expect.arrayContaining([
        "Reverb",
        "Chorus",
        "Delay",
        "Filter",
        "Brightness/Tone",
        "MIDI Channel",
        "GM Program",
        "Controller Values"
      ]));
      await selectInstrumentRow(page, "lead");
      await page.evaluate(() => {
        window.__midiStudioPreviewSynthEvents = [];
      });
      await page.locator("#instrumentAuditionKeyboard [data-audition-note='C4']").click();
      await expect(page.locator("#statusLog")).toHaveValue(/Auditioned C4 for Lead/);
      expect(await page.evaluate(() => window.__midiStudioPreviewSynthEvents.some((event) => event.action === "oscillator-start"))).toBe(true);

      await selectMidiStudioTab(page, "studio");
      await waitForCanvasRender(page);
      const editableTarget = await emptyCanvasRun(page, { lane: "lead", length: 1 });
      expect(editableTarget).toBeTruthy();
      await clickCanvasCell(page, editableTarget.rowToken, editableTarget.stepIndex);
      expect(await hasCanvasNote(page, "lead", editableTarget.rowToken, editableTarget.stepIndex)).toBe(true);
      await page.locator("#playButton").click();
      await expect(page.locator("#playButton")).toBeDisabled();
      await expect(page.locator("#stopButton")).toBeEnabled();
      await page.locator("#stopButton").click();
      await expect(page.locator("#stopButton")).toBeDisabled();
      await expect(page.locator("#playButton")).toBeEnabled();
    } finally {
      await workspaceV2CoverageReporter.stop(page);
      await server.close();
    }
  });

  test("keeps Export tab usable while rendered audio export remains planned", async ({ page }) => {
    let server = await openMidiStudio(page);
    try {
      await expect(page.locator('.midi-studio-v2__tool-menu #renderedExportTargetTypeSelect')).toHaveCount(0);
      await expect(page.locator('.midi-studio-v2__tool-menu #renderedExportSaveButton')).toHaveCount(0);
      await selectMidiStudioTab(page, "export");
      await expect(page.locator("#exportOutputTypeSection")).toContainText("Output Type");
      await expect(page.locator("#exportRenderSourceSection")).toContainText("Render Source");
      await expect(page.locator('.accordion-v2__header[aria-controls="renderedTargetsContent"]')).toContainText("Output Targets");
      await expect(page.locator("#futureExportOptionsSection")).toContainText("Future Rendering Options");
      await expect(page.locator("#exportStatusSection")).toContainText("Export Status");
      await expect(page.locator("#renderedExportTargetTypeSelect option")).toContainText(["WAV", "MP3", "OGG"]);
      await expect(page.locator("#renderedExportSaveButton")).toHaveText("Save WAV");
      const exportControlOwners = await page.locator("#renderedExportTargetTypeSelect, #renderedExportSaveButton").evaluateAll((controls) => controls.map((control) => control.closest("[data-midi-studio-tab-panel]")?.dataset.midiStudioTabPanel));
      expect(exportControlOwners).toEqual(["export", "export"]);

      await expect(page.locator("#exportRenderSource")).toContainText("Main Theme");
      await expect(page.locator("#exportRenderSource")).toContainText("Target output formats");
      await expect(page.locator("#exportRenderSource")).toContainText("canonical song model / octave timeline data");
      await expect(page.locator("#exportRenderSource")).toContainText("Playable event count");
      expect(await page.locator("#exportRenderSource [data-export-field='playable-event-count'] dd").textContent()).toMatch(/^\d+$/);
      expect(Number.isFinite(await page.evaluate(() => window.__midiStudioV2App.playableEventSummary().count))).toBe(true);

      const targetOwnership = await page.locator("#renderedTargetWavInput, #renderedTargetMp3Input, #renderedTargetOggInput").evaluateAll((inputs) => inputs.map((input) => ({
        disabled: input.disabled,
        id: input.id,
        panel: input.closest("[data-midi-studio-tab-panel]")?.dataset.midiStudioTabPanel,
        value: input.value
      })));
      expect(targetOwnership).toEqual([
        { disabled: false, id: "renderedTargetWavInput", panel: "export", value: "assets/music/rendered/theme-main.wav" },
        { disabled: false, id: "renderedTargetMp3Input", panel: "export", value: "assets/music/rendered/theme-main.mp3" },
        { disabled: false, id: "renderedTargetOggInput", panel: "export", value: "assets/music/rendered/theme-main.ogg" }
      ]);
      await page.locator("#renderedTargetMp3Input").fill("assets/music/rendered/custom-main.mp3");
      expect(await page.evaluate(() => window.__midiStudioV2App.selectedSong().rendered.mp3)).toBe("assets/music/rendered/custom-main.mp3");

      await selectMidiStudioTab(page, "diagnostics");
      await expect(page.locator("#renderedTargetDiagnosticsContent")).toBeVisible();
      await expect(page.locator("#renderedTargetDiagnostics")).toContainText("assets/music/rendered/custom-main.mp3");
      await expect(page.locator("#renderedTargetDiagnostics input, #renderedTargetDiagnostics textarea, #renderedTargetDiagnostics select")).toHaveCount(0);
      await expect(page.locator("#renderedTargetsContent")).toBeHidden();

      await selectMidiStudioTab(page, "export");
      const futureControls = await page.locator("#futureExportOptionsSection [data-midi-studio-future-control]").evaluateAll((controls) => controls.map((control) => ({
        disabled: control.disabled,
        status: control.dataset.midiStudioUnwired,
        text: control.textContent.trim(),
        title: control.title
      })));
      expect(futureControls).toHaveLength(6);
      expect(futureControls.every((control) => control.disabled && control.status === "not-implemented" && control.title.includes("Not implemented:"))).toBe(true);
      expect(futureControls.map((control) => control.text)).toEqual(expect.arrayContaining([
        "SoundFont",
        "Render Quality",
        "Sample Rate",
        "Normalize Volume",
        "Export Stems",
        "Loop Export"
      ]));

      await page.locator("#renderedExportTargetTypeSelect").selectOption("mp3");
      await expect(page.locator("#renderedExportSaveButton")).toHaveText("Save MP3");
      await page.locator("#renderedExportSaveButton").click();
      await expect(page.locator("#statusLog")).toHaveValue(/WARN Export rendering not implemented for MP3\. Planned target: assets\/music\/rendered\/custom-main\.mp3\./);
      await expect(page.locator("#statusLog")).not.toHaveValue(/created .*custom-main\.mp3|wrote .*custom-main\.mp3|saved .*custom-main\.mp3/i);
      await expect(page.locator("#exportStatusDetails")).toContainText("WARN: Export rendering not implemented for MP3. Planned target: assets/music/rendered/custom-main.mp3.");
      expect(await controlColors(page, "#renderedExportSaveButton")).toMatchObject({
        borderTopColor: "rgb(248, 113, 113)",
        color: "rgb(254, 202, 202)"
      });

      await selectMidiStudioTab(page, "studio");
      await page.locator("#playButton").click();
      await expect(page.locator("#playButton")).toBeDisabled();
      await expect(page.locator("#stopButton")).toBeEnabled();
      await page.locator("#stopButton").click();
      await expect(page.locator("#stopButton")).toBeDisabled();
      await expect(page.locator("#playButton")).toBeEnabled();
    } finally {
      await workspaceV2CoverageReporter.stop(page);
      await server.close();
    }

    server = await openMidiStudio(page, {
      music: {
        version: 1,
        songs: [{ name: "Broken Song" }]
      }
    });
    try {
      await selectMidiStudioTab(page, "export");
      await page.locator("#renderedExportTargetTypeSelect").selectOption("wav");
      await page.locator("#renderedExportSaveButton").click();
      await expect(page.locator("#statusLog")).toHaveValue(/FAIL Missing MIDI song for WAV export\. Load or select a song before exporting\./);
      await expect(page.locator("#exportStatusDetails")).toContainText("FAIL: Missing MIDI song for WAV export. Load or select a song before exporting.");
    } finally {
      await workspaceV2CoverageReporter.stop(page);
      await server.close();
    }
  });

  test("keeps JSON wording and Song Setup editing history placeholders honest", async ({ page }) => {
    const server = await openMidiStudioForImport(page);
    try {
      await expect(page.locator("#toolImportManifestButton")).toHaveText("Import JSON Manifest");
      await page.locator("#toolImportManifestInput").setInputFiles(uatManifestPath);

      await selectMidiStudioTab(page, "export");
      await expect(page.locator("#toolExportToolStateButton")).toHaveText("Export JSON");
      await expect(page.locator("#renderedExportSaveButton")).toHaveText("Save WAV");
      await page.locator("#renderedExportTargetTypeSelect").selectOption("mp3");
      await expect(page.locator("#renderedExportSaveButton")).toHaveText("Save MP3");
      await page.locator("#renderedExportTargetTypeSelect").selectOption("ogg");
      await expect(page.locator("#renderedExportSaveButton")).toHaveText("Save OGG");
      await expect(page.locator("body")).not.toContainText(/\bExport WAV\b|\bExport MP3\b|\bExport OGG\b/);

      await selectMidiStudioTab(page, "song-setup");
      await expect(page.locator("#editingHistoryContent")).toBeVisible();
      await expect(page.locator('[data-midi-studio-tab-panel="song-setup"] #editingHistoryContent')).toHaveCount(1);
      await expect(page.locator('[data-midi-studio-tab-panel="export"] #editingHistoryContent, [data-midi-studio-tab-panel="diagnostics"] #editingHistoryContent, [data-midi-studio-tab-panel="instruments"] #editingHistoryContent, [data-midi-studio-tab-panel="midi-import"] #editingHistoryContent')).toHaveCount(0);
      const songBeforeHistoryClicks = await page.evaluate(() => JSON.stringify(window.__midiStudioV2App.selectedSong()));
      const historyControls = await page.locator("#editingHistoryContent [data-midi-studio-future-control]").evaluateAll((controls) => controls.map((control) => ({
        disabled: control.disabled,
        status: control.dataset.midiStudioUnwired,
        text: control.textContent.trim(),
        title: control.title
      })));
      expect(historyControls).toEqual([
        expect.objectContaining({ disabled: true, status: "not-implemented", text: "Undo" }),
        expect.objectContaining({ disabled: true, status: "not-implemented", text: "Redo" }),
        expect.objectContaining({ disabled: true, status: "not-implemented", text: "Snapshots" }),
        expect.objectContaining({ disabled: true, status: "not-implemented", text: "Revision History" }),
        expect.objectContaining({ disabled: true, status: "not-implemented", text: "Revert To Saved" }),
        expect.objectContaining({ disabled: true, status: "not-implemented", text: "Autosave" })
      ]);
      expect(historyControls.every((control) => control.title.includes("Not implemented:"))).toBe(true);
      await page.locator("#editingHistoryContent [data-midi-studio-future-control]").evaluateAll((controls) => {
        controls.forEach((control) => control.dispatchEvent(new MouseEvent("click", { bubbles: true })));
      });
      expect(await page.evaluate(() => JSON.stringify(window.__midiStudioV2App.selectedSong()))).toBe(songBeforeHistoryClicks);

      await selectMidiStudioTab(page, "studio");
      await page.locator("#playButton").click();
      await expect(page.locator("#playButton")).toBeDisabled();
      await expect(page.locator("#stopButton")).toBeEnabled();
      await page.locator("#stopButton").click();
      await expect(page.locator("#stopButton")).toBeDisabled();
      await expect(page.locator("#playButton")).toBeEnabled();
    } finally {
      await workspaceV2CoverageReporter.stop(page);
      await server.close();
    }
  });

  test("syncs PR060 song fields instrument selection and audition keyboard", async ({ page }) => {
    const server = await openMidiStudioForImport(page);
    try {
      await page.locator("#toolImportManifestInput").setInputFiles(uatManifestPath);

      await selectMidiStudioTab(page, "song-setup");
      await expect(page.locator("#songDetails [data-song-detail-field='tags']")).toHaveCount(0);
      await expect(page.locator("#songDetails [data-song-detail-field='usage']")).toHaveCount(0);
      await expect(page.locator("#songDetailsContent")).not.toContainText(/\bTags\b|\bUsage\b/);
      await expect(page.locator("#songDetails [data-song-detail-field='id']")).toHaveJSProperty("readOnly", true);
      await page.locator("#songDetails [data-song-detail-field='name']").fill("Camptown Races UAT Reel");
      await expect(page.locator("#songDetails [data-song-detail-field='id']")).toHaveValue("camptownRacesUatReel");
      await page.locator("#songDetails [data-song-detail-field='name']").fill("New Song 4");
      await expect(page.locator("#songDetails [data-song-detail-field='id']")).toHaveValue("newSong4");
      expect(await page.evaluate(() => ({
        activeSongId: window.__midiStudioV2App.payload.activeSongId,
        id: window.__midiStudioV2App.selectedSong().id,
        name: window.__midiStudioV2App.selectedSong().name
      }))).toEqual({
        activeSongId: "newSong4",
        id: "newSong4",
        name: "New Song 4"
      });

      await page.locator("#songSheetSectionsInput").fill("intro: C Am F G\nloop: F G C C");
      await page.locator("#songSheetLoopSectionsInput").fill("loop");
      await expect(page.locator("#songSheetSectionsInput")).toHaveValue("intro: C Am F G\nloop: F G C C");
      await expect(page.locator("#songSheetLoopSectionsInput")).toHaveValue("loop");
      const songSheetLayout = await page.locator("#songSheetContent .midi-studio-v2__song-sheet-grid").evaluate((grid) => ({
        columns: getComputedStyle(grid).gridTemplateColumns.split(" ").filter(Boolean).length,
        disabledFields: Array.from(grid.querySelectorAll("input, textarea, select")).filter((field) => field.disabled || field.readOnly).length
      }));
      expect(songSheetLayout.columns).toBeGreaterThan(1);
      expect(songSheetLayout.disabledFields).toBe(0);

      await selectMidiStudioTab(page, "studio");
      await waitForCanvasRender(page);
      await expect(page.locator("#timelineInstrumentQuickList")).toBeVisible();
      await expect(timelineQuickInstrumentRow(page, "lead")).toBeVisible();
      await expect(timelineQuickInstrumentRow(page, "lead").locator("[data-timeline-quick-mute='lead']")).toBeVisible();
      await expect(timelineQuickInstrumentRow(page, "lead").locator("[data-timeline-quick-solo='lead']")).toBeVisible();
      await expect(timelineQuickInstrumentRow(page, "lead").locator("[data-toggle-instrument-visibility='lead']")).toBeVisible();
      await expect(page.locator("#timelineInstrumentQuickList select")).toHaveCount(0);

      await timelineQuickInstrumentRow(page, "bass").click();
      expect(await page.evaluate(() => ({
        hasOwnSelectedLane: Object.hasOwn(window.__midiStudioV2App.instrumentGrid, "selectedLane"),
        selectedInstrumentId: window.__midiStudioV2App.instrumentGrid.selectedInstrumentId
      }))).toEqual({
        hasOwnSelectedLane: false,
        selectedInstrumentId: "bass"
      });
      await selectMidiStudioTab(page, "instruments");
      await expect(instrumentRow(page, "bass")).toHaveClass(/is-selected/);
      await expect(instrumentTypeSelect(page, "bass")).toBeVisible();
      await expect(instrumentSelect(page, "bass")).toBeVisible();
      expect(await instrumentTypeSelect(page, "bass").evaluate((select) => select.closest("[data-midi-studio-tab-panel]")?.dataset.midiStudioTabPanel)).toBe("instruments");
      expect(await instrumentSelect(page, "bass").evaluate((select) => select.closest("[data-midi-studio-tab-panel]")?.dataset.midiStudioTabPanel)).toBe("instruments");

      const keyboard = page.locator("#instrumentAuditionKeyboard");
      await expect(keyboard).toBeVisible();
      await expect(keyboard).not.toHaveAttribute("data-midi-studio-unwired");
      await expect(keyboard).toHaveAttribute("data-selected-lane", "bass");
      await expect(keyboard).toHaveAttribute("data-octave-min", "1");
      await expect(keyboard).toHaveAttribute("data-octave-max", "3");
      expect(await keyboard.locator("[data-audition-note]").count()).toBe(36);
      await page.evaluate(() => {
        window.__midiStudioPreviewSynthEvents = [];
      });
      await keyboard.locator("[data-audition-note='C2']").click();
      await expect(page.locator("#statusLog")).toHaveValue(/Auditioned C2 for Bass/);
      expect(await page.evaluate(() => window.__midiStudioPreviewSynthEvents.some((event) => event.action === "oscillator-start"))).toBe(true);

      await selectInstrumentRow(page, "lead");
      expect(await page.evaluate(() => window.__midiStudioV2App.instrumentGrid.selectedInstrumentId)).toBe("lead");
      await selectMidiStudioTab(page, "studio");
      await expect(timelineQuickInstrumentRow(page, "lead")).toHaveClass(/is-selected/);

      await page.locator("#playButton").click();
      await expect(page.locator("#playButton")).toBeDisabled();
      await expect(page.locator("#stopButton")).toBeEnabled();
      await page.locator("#stopButton").click();
      await expect(page.locator("#stopButton")).toBeDisabled();
      await expect(page.locator("#playButton")).toBeEnabled();
    } finally {
      await workspaceV2CoverageReporter.stop(page);
      await server.close();
    }
  });

  test("builds PR061 instrument editor buckets from selectedInstrumentId", async ({ page }) => {
    const server = await openMidiStudioForImport(page);
    try {
      await page.locator("#toolImportManifestInput").setInputFiles(uatManifestPath);

      await selectMidiStudioTab(page, "studio");
      await waitForCanvasRender(page);
      await expect(page.locator("#timelineInstrumentQuickList")).toBeVisible();
      await expect(timelineQuickInstrumentRow(page, "bass")).toBeVisible();
      await expect(timelineQuickInstrumentRow(page, "bass").locator("[data-timeline-quick-mute='bass']")).toBeVisible();
      await expect(timelineQuickInstrumentRow(page, "bass").locator("[data-timeline-quick-solo='bass']")).toBeVisible();
      await expect(timelineQuickInstrumentRow(page, "bass").locator("[data-toggle-instrument-visibility='bass']")).toBeVisible();
      await expect(page.locator("#timelineInstrumentQuickList select, #timelineInstrumentQuickList input:not([type='checkbox'])")).toHaveCount(0);
      await timelineQuickInstrumentRow(page, "bass").click();
      expect(await page.evaluate(() => window.__midiStudioV2App.instrumentGrid.selectedInstrumentId)).toBe("bass");

      await selectMidiStudioTab(page, "instruments");
      await expect(instrumentRow(page, "bass")).toHaveClass(/is-selected/);
      const editor = page.locator("#selectedInstrumentEditor");
      await expect(editor).toHaveAttribute("data-selected-instrument-id", "bass");
      await expect(editor.locator("[data-instrument-editor-bucket='identity']")).toContainText("Identity");
      await expect(editor.locator("[data-instrument-editor-bucket='mix']")).toContainText("Mix");
      await expect(editor.locator("[data-instrument-editor-bucket='playback']")).toContainText("Playback");
      await expect(editor.locator("[data-instrument-editor-bucket='effects']")).toContainText("Effects");
      await expect(editor.locator("[data-instrument-editor-bucket='advanced']")).toContainText("Advanced");

      await page.locator("#previewDisplayNameBassInput").fill("Bass Anchor");
      await instrumentTypeSelect(page, "bass").selectOption("Bass");
      await instrumentSelect(page, "bass").selectOption("gm-electric-bass-finger");
      await setInputValue(page, "#previewVolumeBassInput", "0.65");
      await setInputValue(page, "#previewPanBassInput", "-0.4");
      await expect(editor).not.toContainText("Mute default");
      await expect(editor).not.toContainText("Solo default");
      await expect(editor.locator("#previewMuteBassToggle, #previewSoloBassToggle")).toHaveCount(0);
      await setInputValue(page, "#previewOctaveLowBassInput", "2");
      await setInputValue(page, "#previewOctaveHighBassInput", "4");
      await setInputValue(page, "#previewTransposeBassInput", "12");
      await setInputValue(page, "#previewVelocityBassInput", "96");
      await setInputValue(page, "#previewDurationBassInput", "1.5");

      expect(await page.evaluate(() => {
        const app = window.__midiStudioV2App;
        const settings = app.selectedSong().studioArrangement.previewLaneSettings;
        return {
          displayName: settings.displayNames.bass,
          duration: settings.durations.bass,
          instrument: settings.instruments.bass,
          instrumentType: settings.instrumentTypes.bass,
          octaveRange: settings.octaveRanges.bass,
          pan: settings.pans.bass,
          selectedInstrumentId: app.instrumentGrid.selectedInstrumentId,
          transpose: settings.transposes.bass,
          velocity: settings.velocities.bass,
          volume: settings.volumes.bass
        };
      })).toEqual({
        displayName: "Bass Anchor",
        duration: 1.5,
        instrument: "gm-electric-bass-finger",
        instrumentType: "Bass",
        octaveRange: { high: 4, low: 2 },
        pan: -0.4,
        selectedInstrumentId: "bass",
        transpose: 12,
        velocity: 96,
        volume: 0.65
      });

      const keyboard = page.locator("#instrumentAuditionKeyboard");
      await expect(keyboard).toBeVisible();
      await expect(keyboard).toHaveAttribute("data-selected-lane", "bass");
      await expect(keyboard).toHaveAttribute("data-octave-min", "2");
      await expect(keyboard).toHaveAttribute("data-octave-max", "4");
      expect(await keyboard.locator("[data-audition-note]").count()).toBe(36);
      await expect(keyboard.locator("[data-audition-note='C1']")).toHaveCount(0);
      await expect(keyboard.locator("[data-audition-note='C4']")).toHaveCount(1);

      const effectControls = await editor.locator("[data-instrument-editor-bucket='effects'] [data-midi-studio-future-control]").evaluateAll((controls) => controls.map((control) => ({
        label: (control.getAttribute("aria-label") || control.placeholder).replace(/\s*\(Not implemented\)$/, "").trim(),
        status: control.dataset.midiStudioUnwired,
        title: control.title
      })));
      expect(effectControls).toHaveLength(5);
      expect(effectControls.map((control) => control.label)).toEqual(["Reverb", "Chorus", "Delay", "Filter", "Brightness/Tone"]);
      expect(effectControls.every((control) => control.status === "not-implemented" && control.title.includes("Not implemented:"))).toBe(true);
      const advancedControls = await editor.locator("[data-instrument-editor-bucket='advanced'] [data-midi-studio-future-control]").evaluateAll((controls) => controls.map((control) => ({
        label: (control.getAttribute("aria-label") || control.placeholder).replace(/\s*\(Not implemented\)$/, "").trim(),
        status: control.dataset.midiStudioUnwired,
        title: control.title
      })));
      expect(advancedControls).toHaveLength(3);
      expect(advancedControls.map((control) => control.label)).toEqual(["MIDI Channel", "GM Program", "Controller Values"]);
      expect(advancedControls.every((control) => control.status === "not-implemented" && control.title.includes("Not implemented:"))).toBe(true);

      await selectInstrumentRow(page, "lead");
      expect(await page.evaluate(() => window.__midiStudioV2App.instrumentGrid.selectedInstrumentId)).toBe("lead");
      await selectMidiStudioTab(page, "studio");
      await expect(timelineQuickInstrumentRow(page, "lead")).toHaveClass(/is-selected/);

      await page.locator("#playButton").click();
      await expect(page.locator("#playButton")).toBeDisabled();
      await expect(page.locator("#stopButton")).toBeEnabled();
      await page.locator("#stopButton").click();
      await expect(page.locator("#stopButton")).toBeDisabled();
      await expect(page.locator("#playButton")).toBeEnabled();
    } finally {
      await workspaceV2CoverageReporter.stop(page);
      await server.close();
    }
  });

  test("keeps PR062 Song Sheet structure-only under Song Details metadata SSoT", async ({ page }) => {
    const server = await openMidiStudioForImport(page);
    try {
      await page.locator("#toolImportManifestInput").setInputFiles(uatManifestPath);
      await selectMidiStudioTab(page, "song-setup");

      await expect(page.locator("#songDetailsContent #songSheetTempoInput")).toBeVisible();
      await expect(page.locator("#songDetailsContent #songSheetKeyInput")).toBeVisible();
      await expect(page.locator("#songDetailsContent #songSheetStyleInput")).toBeVisible();
      await expect(page.locator("#songSheetContent #songSheetTempoInput, #songSheetContent #songSheetKeyInput, #songSheetContent #songSheetStyleInput")).toHaveCount(0);
      await expect(page.locator("#songSheetContent")).not.toContainText("Tempo/BPM");
      await expect(page.locator("#songSheetContent")).not.toContainText(/^Key$/);
      await expect(page.locator("#songSheetContent")).not.toContainText(/^Style$/);

      await expect(page.locator("#songSheetSectionsInput")).toBeVisible();
      await expect(page.locator("#songSheetLoopSectionsInput")).toBeVisible();
      await expect(page.locator("#songSheetSummary [data-song-sheet-summary-field='sections']")).toContainText("Sections");
      await expect(page.locator("#songSheetSummary [data-song-sheet-summary-field='bars']")).toContainText("Bars");
      await expect(page.locator("#songSheetSummary [data-song-sheet-summary-field='chord-count']")).toContainText("Chord count");
      await expect(page.locator("#songSheetSummary [data-song-sheet-summary-field='estimated-duration']")).toContainText("Estimated duration");
      await expect(page.locator("#songSheetSummary [data-song-sheet-summary-field='loop-sections']")).toContainText("Loop sections");
      await expect(page.locator("#songSheetSummary [data-song-sheet-summary-field='warnings']")).toContainText("Warnings");
      await expect(page.locator("#songSheetSummary [data-song-sheet-summary-field='bars'] input, #songSheetSummary [data-song-sheet-summary-field='chord-count'] input, #songSheetSummary [data-song-sheet-summary-field='estimated-duration'] input")).toHaveCount(0);
      await expect(page.locator("[data-song-sheet-summary-field='bars'] [data-song-sheet-computed='true']")).toHaveCount(1);
      await expect(page.locator("[data-song-sheet-summary-field='chord-count'] [data-song-sheet-computed='true']")).toHaveCount(1);
      await expect(page.locator("[data-song-sheet-summary-field='estimated-duration'] [data-song-sheet-computed='true']")).toHaveCount(1);
      await expect(page.locator("[data-song-sheet-summary-field='warnings'] [data-song-sheet-diagnostics='true']")).toHaveCount(1);

      await page.locator("#songSheetTempoInput").fill("150");
      await page.locator("#songSheetKeyInput").selectOption("C major");
      await page.locator("#songSheetStyleInput").selectOption("chip");
      expect(await page.evaluate(() => {
        const arrangement = window.__midiStudioV2App.selectedSong().studioArrangement;
        return {
          key: arrangement.key,
          style: arrangement.style,
          tempo: arrangement.tempo
        };
      })).toEqual({ key: "C major", style: "chip", tempo: "150" });

      await page.locator("#songSheetSectionsInput").fill("intro: C F\nbridge: Dm G\nloop: F G C C");
      await page.locator("#songSheetLoopSectionsInput").fill("bridge, loop");
      await expect(page.locator("#songSheetSummary [data-song-sheet-summary-field='sections']")).toContainText("intro: 2 bars, 2 chords");
      await expect(page.locator("#songSheetSummary [data-song-sheet-summary-field='sections']")).toContainText("bridge: 2 bars, 2 chords, loop");
      await expect(page.locator("#songSheetSummary [data-song-sheet-summary-field='sections']")).toContainText("loop: 4 bars, 4 chords, loop");
      await expect(page.locator("#songSheetSummary [data-song-sheet-summary-field='bars'] dd")).toHaveText("8");
      await expect(page.locator("#songSheetSummary [data-song-sheet-summary-field='chord-count'] dd")).toHaveText("8");
      await expect(page.locator("#songSheetSummary [data-song-sheet-summary-field='estimated-duration'] dd")).toHaveText("12.8 seconds");
      await expect(page.locator("#songSheetSummary [data-song-sheet-summary-field='loop-sections'] dd")).toHaveText("bridge, loop");
      await expect(page.locator("#songSheetSummary [data-song-sheet-summary-field='warnings'] dd")).toHaveText("none");

      const canonical = await page.evaluate(() => {
        const app = window.__midiStudioV2App;
        const song = app.selectedSong();
        const gridResult = app.currentInstrumentGridResult();
        return {
          chords: song.studioArrangement.lanes.chords,
          json: document.querySelector("#inspectorOutput").textContent,
          sectionLabels: gridResult.sections.map((section) => section.label),
          sections: song.studioArrangement.sections,
          songSheet: song.studioArrangement.songSheet
        };
      });
      expect(canonical.songSheet).toEqual({
        loopSections: "bridge, loop",
        sections: "intro: C F\nbridge: Dm G\nloop: F G C C"
      });
      expect(canonical.sections).toBe("intro:2, bridge:2, loop:4");
      expect(canonical.chords).toContain("Dm Dm Dm Dm");
      expect(canonical.sectionLabels).toEqual(["intro", "bridge", "loop"]);
      expect(canonical.json).toContain('"loopSections": "bridge, loop"');
      expect(canonical.json).toContain('"sections": "intro: C F\\nbridge: Dm G\\nloop: F G C C"');
      await expect(page.locator("#songSectionsLoopDetails [data-song-detail-field='sections']")).toHaveCount(0);
      await expect(page.locator("#instrumentGridSectionsInput")).toHaveJSProperty("readOnly", true);
      await expect(page.locator('[data-midi-studio-tab-panel]:not([data-midi-studio-tab-panel="song-setup"]) #songSheetSectionsInput, [data-midi-studio-tab-panel]:not([data-midi-studio-tab-panel="song-setup"]) #songSheetLoopSectionsInput')).toHaveCount(0);

      await selectMidiStudioTab(page, "studio");
      await waitForCanvasRender(page);
      expect(await page.evaluate(() => window.__midiStudioV2App.currentInstrumentGridResult().sections.map((section) => section.label))).toEqual(["intro", "bridge", "loop"]);
      await page.locator("#playButton").click();
      await expect(page.locator("#playButton")).toBeDisabled();
      await expect(page.locator("#stopButton")).toBeEnabled();
      await page.locator("#stopButton").click();
      await expect(page.locator("#stopButton")).toBeDisabled();
      await expect(page.locator("#playButton")).toBeEnabled();
    } finally {
      await workspaceV2CoverageReporter.stop(page);
      await server.close();
    }
  });

  test("keeps PR063 notes layout and Octave Timeline quick instruments scoped to the left column", async ({ page }) => {
    const server = await openMidiStudioForImport(page);
    try {
      await page.locator("#toolImportManifestInput").setInputFiles(uatManifestPath);
      await selectMidiStudioTab(page, "song-setup");

      const notesLayout = await page.locator("#songDetailsContent").evaluate((container) => {
        const editor = container.querySelector(".midi-studio-v2__song-detail-editor");
        const core = container.querySelector(".midi-studio-v2__song-detail-core-fields");
        const notesList = container.querySelector("#songDetailNotes");
        const notesRow = notesList?.querySelector(".midi-studio-v2__editable-detail");
        const notesField = notesList?.querySelector("[data-song-detail-field='notes']");
        const detailRows = Array.from(container.querySelectorAll("#songDetails .midi-studio-v2__editable-detail, .midi-studio-v2__song-detail-core-fields .tool-starter__field, #songDetailNotes .midi-studio-v2__editable-detail"));
        const editorRect = editor.getBoundingClientRect();
        const coreRect = core.getBoundingClientRect();
        const notesRect = notesRow.getBoundingClientRect();
        const notesFieldRect = notesField.getBoundingClientRect();
        const laterRows = detailRows.filter((row) => row.getBoundingClientRect().top > notesRect.top + 1);
        const sameRowPeers = detailRows.filter((row) => {
          const rect = row.getBoundingClientRect();
          return row !== notesRow && Math.abs(rect.top - notesRect.top) <= 2;
        });
        return {
          editorWidth: editorRect.width,
          laterRows: laterRows.length,
          notesAfterCore: notesRect.top >= coreRect.bottom - 2,
          notesFieldWidth: notesFieldRect.width,
          notesListWidth: notesList.getBoundingClientRect().width,
          notesRowWidth: notesRect.width,
          sameRowPeers: sameRowPeers.length
        };
      });
      expect(notesLayout.laterRows).toBe(0);
      expect(notesLayout.notesAfterCore).toBe(true);
      expect(notesLayout.sameRowPeers).toBe(0);
      expect(notesLayout.notesListWidth).toBeGreaterThanOrEqual(notesLayout.editorWidth - 2);
      expect(notesLayout.notesRowWidth).toBeGreaterThanOrEqual(notesLayout.editorWidth - 4);
      expect(notesLayout.notesFieldWidth).toBeGreaterThan(notesLayout.editorWidth * 0.85);

      await expect(page.locator("#songDetailsContent #songSheetTempoInput")).toBeVisible();
      await expect(page.locator("#songDetailsContent #songSheetKeyInput")).toBeVisible();
      await expect(page.locator("#songDetailsContent #songSheetStyleInput")).toBeVisible();
      expect(await page.locator("#songSheetTempoInput").evaluate((input) => input.readOnly || input.disabled)).toBe(false);
      expect(await page.locator("#songSheetKeyInput").evaluate((select) => select.disabled)).toBe(false);
      expect(await page.locator("#songSheetStyleInput").evaluate((select) => select.disabled)).toBe(false);
      await page.locator("#songSheetTempoInput").fill("151");
      await page.locator("#songSheetKeyInput").selectOption("C major");
      await page.locator("#songSheetStyleInput").selectOption("chip");
      expect(await page.evaluate(() => {
        const arrangement = window.__midiStudioV2App.selectedSong().studioArrangement;
        return {
          key: arrangement.key,
          style: arrangement.style,
          tempo: arrangement.tempo
        };
      })).toEqual({ key: "C major", style: "chip", tempo: "151" });

      await expect(page.locator("#songSheetContent #songSheetTempoInput, #songSheetContent #songSheetKeyInput, #songSheetContent #songSheetStyleInput")).toHaveCount(0);
      await expect(page.locator("#songSheetSectionsInput")).toBeVisible();
      await expect(page.locator("#songSheetLoopSectionsInput")).toBeVisible();
      await expect(page.locator("#songSheetSummary [data-song-sheet-summary-field='bars'] [data-song-sheet-computed='true']")).toHaveCount(1);
      await expect(page.locator("#songSheetSummary [data-song-sheet-summary-field='warnings'] [data-song-sheet-diagnostics='true']")).toHaveCount(1);

      await selectMidiStudioTab(page, "studio");
      await waitForCanvasRender(page);
      const quickAccordion = page.locator('.tool-starter__panel--left [aria-controls="timelineInstrumentQuickContent"]');
      await expect(quickAccordion).toBeVisible();
      await expect(quickAccordion).toContainText("Instruments");
      await expect(page.locator('.tool-starter__panel--left #timelineInstrumentQuickContent')).toBeVisible();
      await expect(page.locator(".tool-starter__panel--center #timelineInstrumentQuickList")).toHaveCount(0);
      await expect(timelineQuickInstrumentRow(page, "lead")).toBeVisible();
      await expect(timelineQuickInstrumentRow(page, "lead").locator("[data-timeline-quick-mute='lead']")).toBeVisible();
      await expect(timelineQuickInstrumentRow(page, "lead").locator("[data-timeline-quick-solo='lead']")).toBeVisible();
      await expect(timelineQuickInstrumentRow(page, "lead").locator("[data-toggle-instrument-visibility='lead']")).toBeVisible();
      await expect(page.locator("#timelineInstrumentQuickList select, #timelineInstrumentQuickList input:not([type='checkbox']), #timelineInstrumentQuickList [data-lane-instrument-type-select], #timelineInstrumentQuickList [data-lane-instrument-select]")).toHaveCount(0);

      await timelineQuickInstrumentRow(page, "bass").click();
      expect(await page.evaluate(() => window.__midiStudioV2App.instrumentGrid.selectedInstrumentId)).toBe("bass");
      await selectMidiStudioTab(page, "instruments");
      await expect(instrumentRow(page, "bass")).toHaveClass(/is-selected/);
      await expect(instrumentTypeSelect(page, "bass")).toBeVisible();
      await expect(instrumentSelect(page, "bass")).toBeVisible();
      expect(await instrumentTypeSelect(page, "bass").evaluate((select) => select.closest("[data-midi-studio-tab-panel]")?.dataset.midiStudioTabPanel)).toBe("instruments");
      expect(await instrumentSelect(page, "bass").evaluate((select) => select.closest("[data-midi-studio-tab-panel]")?.dataset.midiStudioTabPanel)).toBe("instruments");

      await selectInstrumentRow(page, "lead");
      expect(await page.evaluate(() => window.__midiStudioV2App.instrumentGrid.selectedInstrumentId)).toBe("lead");
      await selectMidiStudioTab(page, "studio");
      await expect(timelineQuickInstrumentRow(page, "lead")).toHaveClass(/is-selected/);

      await page.locator("#playButton").click();
      await expect(page.locator("#playButton")).toBeDisabled();
      await expect(page.locator("#stopButton")).toBeEnabled();
      await page.locator("#stopButton").click();
      await expect(page.locator("#stopButton")).toBeDisabled();
      await expect(page.locator("#playButton")).toBeEnabled();
    } finally {
      await workspaceV2CoverageReporter.stop(page);
      await server.close();
    }
  });

  test("keeps PR064 Song Sheet and Instrument Settings fields in responsive editable/read-only grids", async ({ page }) => {
    await page.setViewportSize({ width: 1600, height: 900 });
    const server = await openMidiStudioForImport(page);
    try {
      await page.locator("#toolImportManifestInput").setInputFiles(uatManifestPath);
      await selectMidiStudioTab(page, "song-setup");

      await page.locator("#songSheetSectionsInput").fill("intro: C F\nbridge: Dm G\nloop: F G C C");
      await page.locator("#songSheetLoopSectionsInput").fill("bridge, loop");
      await expect(page.locator("#songSheetSummary [data-song-sheet-summary-field='bars'] dd")).toHaveText("8");
      const songSheetLayout = await page.locator("#songSheetContent").evaluate((content) => {
        const columnCount = (element) => getComputedStyle(element).gridTemplateColumns.split(" ").filter(Boolean).length;
        const fieldRows = (fields) => new Set(fields.map((field) => Math.round(field.getBoundingClientRect().top))).size;
        const editableGrid = content.querySelector(".midi-studio-v2__song-sheet-grid");
        const summary = content.querySelector("#songSheetSummary");
        const editableFields = Array.from(editableGrid.querySelectorAll("[data-midi-studio-field-state='editable']"));
        const readonlyFields = Array.from(summary.querySelectorAll("[data-midi-studio-field-state='readonly']"));
        return {
          editableBackgrounds: editableFields.map((field) => getComputedStyle(field).backgroundColor),
          editableBorderStyles: editableFields.map((field) => getComputedStyle(field).borderStyle),
          editableColumns: columnCount(editableGrid),
          editableControls: editableGrid.querySelectorAll("textarea:not([readonly]):not([disabled])").length,
          editableFieldRows: fieldRows(editableFields),
          readonlyAria: readonlyFields.every((field) => field.getAttribute("aria-readonly") === "true"),
          readonlyBorderStyles: readonlyFields.map((field) => getComputedStyle(field).borderStyle),
          readonlyControls: summary.querySelectorAll("input, select, textarea").length,
          readonlyFields: readonlyFields.length,
          summaryColumns: columnCount(summary),
          summaryFieldRows: fieldRows(readonlyFields)
        };
      });
      expect(songSheetLayout.editableColumns).toBeGreaterThan(1);
      expect(songSheetLayout.summaryColumns).toBeGreaterThan(1);
      expect(songSheetLayout.editableFieldRows).toBe(1);
      expect(songSheetLayout.summaryFieldRows).toBeLessThan(songSheetLayout.readonlyFields);
      expect(songSheetLayout.editableControls).toBe(2);
      expect(songSheetLayout.readonlyControls).toBe(0);
      expect(songSheetLayout.readonlyFields).toBeGreaterThanOrEqual(6);
      expect(songSheetLayout.readonlyAria).toBe(true);
      expect(songSheetLayout.editableBorderStyles.every((style) => style === "solid")).toBe(true);
      expect(songSheetLayout.readonlyBorderStyles.every((style) => style === "dashed")).toBe(true);
      expect(new Set(songSheetLayout.editableBackgrounds).size).toBe(1);

      const songSheetCanonical = await page.evaluate(() => window.__midiStudioV2App.selectedSong().studioArrangement.songSheet);
      expect(songSheetCanonical).toEqual({
        loopSections: "bridge, loop",
        sections: "intro: C F\nbridge: Dm G\nloop: F G C C"
      });

      await selectMidiStudioTab(page, "instruments");
      const editor = page.locator("#selectedInstrumentEditor");
      await expect(editor).toHaveAttribute("data-selected-instrument-id", "lead");
      const instrumentLayout = await editor.evaluate((instrumentEditor) => {
        const columnCount = (element) => getComputedStyle(element).gridTemplateColumns.split(" ").filter(Boolean).length;
        const buckets = Array.from(instrumentEditor.querySelectorAll(".midi-studio-v2__instrument-editor-bucket"));
        const bucketRows = new Set(buckets.map((bucket) => Math.round(bucket.getBoundingClientRect().top))).size;
        const identityBucket = instrumentEditor.querySelector("[data-instrument-editor-bucket='identity']");
        const editableFields = Array.from(instrumentEditor.querySelectorAll("[data-midi-studio-field-state='editable']"));
        const readonlyFields = Array.from(instrumentEditor.querySelectorAll("[data-midi-studio-field-state='readonly']"));
        const unwiredFields = Array.from(instrumentEditor.querySelectorAll("[data-midi-studio-field-state='unwired']"));
        const readonlyOutput = instrumentEditor.querySelector("[data-instrument-derived-field='audible-preview']");
        return {
          bucketRows,
          buckets: buckets.length,
          editorColumns: columnCount(instrumentEditor),
          editableBorderStyles: editableFields.map((field) => getComputedStyle(field).borderStyle),
          editableControls: editableFields.map((field) => field.querySelector("input, select, textarea")?.disabled === false),
          identityColumns: columnCount(identityBucket),
          readonlyBorderStyles: readonlyFields.map((field) => getComputedStyle(field).borderStyle),
          readonlyOutputText: readonlyOutput?.textContent || "",
          readonlyOutputs: readonlyFields.filter((field) => field.querySelector("output[aria-readonly='true']")).length,
          unwiredControls: unwiredFields.map((field) => {
            const control = field.querySelector("[data-midi-studio-future-control]");
            return {
              borderStyle: getComputedStyle(field).borderStyle,
              controlClass: control?.classList.contains("midi-studio-v2__unwired-control") || false,
              disabled: control?.disabled || false,
              status: control?.dataset.midiStudioUnwired || "",
              title: control?.title || ""
            };
          }),
          unwiredFields: unwiredFields.length
        };
      });
      expect(instrumentLayout.editorColumns).toBeGreaterThan(1);
      expect(instrumentLayout.identityColumns).toBeGreaterThan(1);
      expect(instrumentLayout.bucketRows).toBeLessThan(instrumentLayout.buckets);
      expect(instrumentLayout.editableControls.every(Boolean)).toBe(true);
      expect(instrumentLayout.editableBorderStyles.every((style) => style === "solid")).toBe(true);
      expect(instrumentLayout.readonlyOutputs).toBeGreaterThanOrEqual(1);
      expect(instrumentLayout.readonlyOutputText).toContain("Lead");
      expect(instrumentLayout.readonlyBorderStyles.every((style) => style === "dashed")).toBe(true);
      expect(instrumentLayout.unwiredFields).toBeGreaterThanOrEqual(8);
      expect(instrumentLayout.unwiredControls.every((control) => control.borderStyle === "solid" && control.controlClass && control.disabled && control.status === "not-implemented" && control.title.includes("Not implemented:"))).toBe(true);

      await page.locator("#previewDisplayNameLeadInput").fill("Lead Grid Voice");
      await setInputValue(page, "#previewVolumeLeadInput", "0.75");
      await instrumentTypeSelect(page, "lead").selectOption("Bass");
      await instrumentSelect(page, "lead").selectOption("gm-electric-bass-finger");
      await expect(editor.locator("[data-instrument-derived-field='audible-preview']")).toHaveText("Synth Bass 1");
      expect(await page.evaluate(() => {
        const settings = window.__midiStudioV2App.selectedSong().studioArrangement.previewLaneSettings;
        return {
          displayName: settings.displayNames.lead,
          instrument: settings.instruments.lead,
          instrumentType: settings.instrumentTypes.lead,
          volume: settings.volumes.lead
        };
      })).toEqual({
        displayName: "Lead Grid Voice",
        instrument: "gm-electric-bass-finger",
        instrumentType: "Bass",
        volume: 0.75
      });

      await selectMidiStudioTab(page, "studio");
      await page.locator("#playButton").click();
      await expect(page.locator("#playButton")).toBeDisabled();
      await expect(page.locator("#stopButton")).toBeEnabled();
      await page.locator("#stopButton").click();
      await expect(page.locator("#stopButton")).toBeDisabled();
      await expect(page.locator("#playButton")).toBeEnabled();
    } finally {
      await workspaceV2CoverageReporter.stop(page);
      await server.close();
    }
  });

  test("audits PR065 visible control ownership and canonical editable mapping", async ({ page }) => {
    await page.setViewportSize({ width: 1600, height: 900 });
    const server = await openMidiStudioForImport(page);
    try {
      await page.locator("#toolImportManifestInput").setInputFiles(uatManifestPath);
      const auditTabs = [
        "song-setup",
        "studio",
        "instruments",
        "auto-create-parts",
        "midi-import",
        "diagnostics",
        "export"
      ];
      const controls = [];
      for (const tabId of auditTabs) {
        await selectMidiStudioTab(page, tabId);
        if (tabId === "studio") {
          await waitForCanvasRender(page);
        }
        controls.push(...await visibleMidiStudioControlOwnership(page, tabId));
      }
      const uniqueControls = Array.from(new Map(controls.map((control) => [
        `${control.activeTabId}|${control.control}|${control.text}|${control.owner}`,
        control
      ])).values());
      const unclassifiedControls = uniqueControls
        .filter((control) => control.kind === "unclassified")
        .map(({ activeTabId, control, owner, tag, text }) => ({ activeTabId, control, owner, tag, text }));
      expect(unclassifiedControls).toEqual([]);

      const editableOwnershipGaps = uniqueControls
        .filter((control) => control.editable && !["canonical", "readonly", "unwired", "workflow-state"].includes(control.kind))
        .map(({ activeTabId, canonical, control, kind, owner, text }) => ({ activeTabId, canonical, control, kind, owner, text }));
      expect(editableOwnershipGaps).toEqual([]);

      const unwiredStateGaps = uniqueControls
        .filter((control) => control.unwired)
        .filter((control) => !["not-implemented", "incomplete"].includes(control.unwiredStatus) || !control.unwiredClass || !/Not implemented:|Incomplete:/.test(control.title))
        .map(({ activeTabId, control, owner, text, title, unwiredClass, unwiredStatus }) => ({
          activeTabId,
          control,
          owner,
          text,
          title,
          unwiredClass,
          unwiredStatus
        }));
      expect(unwiredStateGaps).toEqual([]);

      const editableCanonicalFields = new Set(uniqueControls
        .filter((control) => control.editable && control.kind === "canonical")
        .map((control) => control.canonical));
      expect(editableCanonicalFields).toEqual(new Set([
        "music.songs[].classification",
        "music.songs[].director.notes",
        "music.songs[].loop.enabled",
        "music.songs[].loop.endSeconds",
        "music.songs[].loop.startSeconds",
        "music.songs[].rendered.mp3",
        "music.songs[].rendered.ogg",
        "music.songs[].rendered.wav",
        "music.songs[].studioArrangement.beatsPerBar",
        "music.songs[].studioArrangement.key",
        "music.songs[].studioArrangement.lanes.bass",
        "music.songs[].studioArrangement.lanes.chords",
        "music.songs[].studioArrangement.lanes.drums",
        "music.songs[].studioArrangement.lanes.lead",
        "music.songs[].studioArrangement.lanes.pad",
        "music.songs[].studioArrangement.previewLaneSettings.displayNames",
        "music.songs[].studioArrangement.previewLaneSettings.durations",
        "music.songs[].studioArrangement.previewLaneSettings.instruments",
        "music.songs[].studioArrangement.previewLaneSettings.instrumentTypes",
        "music.songs[].studioArrangement.previewLaneSettings.octaveRanges",
        "music.songs[].studioArrangement.previewLaneSettings.pans",
        "music.songs[].studioArrangement.previewLaneSettings.transposes",
        "music.songs[].studioArrangement.previewLaneSettings.velocities",
        "music.songs[].studioArrangement.previewLaneSettings.volumes",
        "music.songs[].studioArrangement.songSheet.applyTargets.bass",
        "music.songs[].studioArrangement.songSheet.applyTargets.chordsPad",
        "music.songs[].studioArrangement.songSheet.applyTargets.drums",
        "music.songs[].studioArrangement.songSheet.applyTargets.lead",
        "music.songs[].studioArrangement.songSheet.sections",
        "music.songs[].studioArrangement.songSheet.sections.Bridge",
        "music.songs[].studioArrangement.songSheet.sections.Chorus",
        "music.songs[].studioArrangement.songSheet.sections.Intro",
        "music.songs[].studioArrangement.songSheet.sections.Outro",
        "music.songs[].studioArrangement.songSheet.sections.Verse",
        "music.songs[].studioArrangement.songSheet.sequence",
        "music.songs[].studioArrangement.style",
        "music.songs[].studioArrangement.subdivision",
        "music.songs[].studioArrangement.tempo",
        "music.songs[].name"
      ]));

      await selectMidiStudioTab(page, "song-setup");
      await page.locator("#songDetails [data-song-detail-field='name']").fill("UAT Gap Audit Reel");
      await expect(page.locator("#songDetails [data-song-detail-field='id']")).toHaveValue("uatGapAuditReel");
      await fillSongSheetSectionBuilder(page, "Intro: C F\nVerse: G C");
      await addSongSheetSequenceLabels(page, ["Intro", "Verse"]);
      expect(await page.evaluate(() => {
        const song = window.__midiStudioV2App.selectedSong();
        return {
          id: song.id,
          name: song.name,
          songSheet: {
            sections: song.studioArrangement.songSheet.sections,
            sequence: song.studioArrangement.songSheet.sequence
          }
        };
      })).toEqual({
        id: "uatGapAuditReel",
        name: "UAT Gap Audit Reel",
        songSheet: {
          sections: "Intro: C F\nVerse: G C",
          sequence: "Intro, Verse"
        }
      });

      await selectMidiStudioTab(page, "export");
      await page.locator("#renderedTargetOggInput").fill("assets/music/rendered/uat-gap-audit.ogg");
      expect(await page.evaluate(() => window.__midiStudioV2App.selectedSong().rendered.ogg)).toBe("assets/music/rendered/uat-gap-audit.ogg");

      await selectMidiStudioTab(page, "instruments");
      await setInputValue(page, "#previewVolumeLeadInput", "0.8");
      expect(await page.evaluate(() => {
        const settings = window.__midiStudioV2App.selectedSong().studioArrangement.previewLaneSettings;
        return {
          volume: settings.volumes.lead
        };
      })).toEqual({ volume: 0.8 });

      await selectMidiStudioTab(page, "studio");
      await waitForCanvasRender(page);
      await timelineQuickInstrumentRow(page, "lead").locator("[data-timeline-quick-mute='lead']").click();
      await timelineQuickInstrumentRow(page, "lead").locator("[data-timeline-quick-solo='lead']").click();
      await expect(timelineQuickInstrumentRow(page, "lead").locator("[data-timeline-quick-mute='lead']")).toHaveAttribute("aria-pressed", "true");
      await expect(timelineQuickInstrumentRow(page, "lead").locator("[data-timeline-quick-solo='lead']")).toHaveAttribute("aria-pressed", "true");
      await timelineQuickInstrumentRow(page, "lead").locator("[data-timeline-quick-mute='lead']").click();
      await timelineQuickInstrumentRow(page, "lead").locator("[data-timeline-quick-solo='lead']").click();
      expect(await page.evaluate(() => {
        const settings = window.__midiStudioV2App.selectedSong().studioArrangement.previewLaneSettings;
        return {
          muted: settings.muted.lead,
          soloed: settings.soloed.lead
        };
      })).toEqual({ muted: false, soloed: false });

      const editableTarget = await emptyCanvasRun(page, { lane: "lead", length: 1 });
      expect(editableTarget).toBeTruthy();
      await clickCanvasCell(page, editableTarget.rowToken, editableTarget.stepIndex);
      expect(await hasCanvasNote(page, "lead", editableTarget.rowToken, editableTarget.stepIndex)).toBe(true);
      await page.locator("#playButton").click();
      await expect(page.locator("#playButton")).toBeDisabled();
      await expect(page.locator("#stopButton")).toBeEnabled();
      await page.locator("#stopButton").click();
      await expect(page.locator("#stopButton")).toBeDisabled();
      await expect(page.locator("#playButton")).toBeEnabled();
    } finally {
      await workspaceV2CoverageReporter.stop(page);
      await server.close();
    }
  });

  test("keeps PR066 timeline Instruments compact and duplicates selected instruments", async ({ page }) => {
    await page.setViewportSize({ width: 1600, height: 900 });
    const server = await openMidiStudioForImport(page);
    try {
      await page.locator("#toolImportManifestInput").setInputFiles(uatManifestPath);

      await selectMidiStudioTab(page, "instruments");
      await selectInstrumentRow(page, "lead");
      await page.locator("#previewDisplayNameLeadInput").fill("Lead Copy Source");
      await instrumentTypeSelect(page, "lead").selectOption("Bass");
      await instrumentSelect(page, "lead").selectOption("gm-electric-bass-finger");
      await setInputValue(page, "#previewVolumeLeadInput", "0.6");
      await setInputValue(page, "#previewPanLeadInput", "-0.3");
      await expect(page.locator("#selectedInstrumentEditor")).not.toContainText("Mute default");
      await expect(page.locator("#selectedInstrumentEditor")).not.toContainText("Solo default");
      await expect(page.locator("#selectedInstrumentEditor [id^='previewMute'], #selectedInstrumentEditor [id^='previewSolo']")).toHaveCount(0);

      const beforeDuplicate = await page.evaluate(() => {
        const app = window.__midiStudioV2App;
        const song = app.selectedSong();
        const settings = song.studioArrangement.previewLaneSettings;
        return {
          leadLane: song.studioArrangement.lanes.lead,
          settings: {
            displayName: settings.displayNames.lead,
            instrument: settings.instruments.lead,
            instrumentType: settings.instrumentTypes.lead,
            pan: settings.pans.lead,
            volume: settings.volumes.lead
          }
        };
      });
      expect(beforeDuplicate.settings).toEqual({
        displayName: "Lead Copy Source",
        instrument: "gm-electric-bass-finger",
        instrumentType: "Bass",
        pan: -0.3,
        volume: 0.6
      });

      await selectMidiStudioTab(page, "studio");
      await waitForCanvasRender(page);
      await expect(page.locator(".midi-studio-v2__timeline-instrument-accordion")).toBeVisible();
      const timelineInstrumentLayout = await page.locator(".midi-studio-v2__timeline-instrument-accordion").evaluate((section) => {
        const content = section.querySelector("#timelineInstrumentQuickContent");
        const rows = Array.from(section.querySelectorAll(".midi-studio-v2__quick-instrument-row"));
        const header = section.querySelector(".midi-studio-v2__timeline-instrument-accordion-header");
        const duplicate = header.querySelector("#duplicateInstrumentRowButton");
        const add = header.querySelector("#timelineAddInstrumentRowButton");
        const close = header.querySelector("#timelineCloseInstrumentPanelButton");
        const duplicateRect = duplicate.getBoundingClientRect();
        const addRect = add.getBoundingClientRect();
        const closeRect = close.getBoundingClientRect();
        const rowRects = rows.map((row) => row.getBoundingClientRect());
        return {
          addAfterDuplicate: addRect.left > duplicateRect.right,
          closeAfterAdd: closeRect.left > addRect.right,
          contentMarginBottom: getComputedStyle(content).marginBottom,
          contentMarginTop: getComputedStyle(content).marginTop,
          duplicateText: duplicate.textContent.trim(),
          rowHeights: rowRects.map((rect) => rect.height),
          sectionMarginBottom: getComputedStyle(section).marginBottom,
          sectionMarginTop: getComputedStyle(section).marginTop
        };
      });
      expect(timelineInstrumentLayout.sectionMarginTop).toBe("10px");
      expect(timelineInstrumentLayout.sectionMarginBottom).toBe("10px");
      expect(timelineInstrumentLayout.contentMarginTop).toBe("10px");
      expect(timelineInstrumentLayout.contentMarginBottom).toBe("10px");
      expect(timelineInstrumentLayout.duplicateText).toBe("");
      expect(timelineInstrumentLayout.addAfterDuplicate).toBe(true);
      expect(timelineInstrumentLayout.closeAfterAdd).toBe(true);
      expect(timelineInstrumentLayout.rowHeights.every((height) => height <= 28)).toBe(true);
      await expect(page.locator("#duplicateInstrumentRowButton")).toHaveAttribute("aria-label", "Duplicate selected instrument");
      await expect(page.locator("#duplicateInstrumentRowButton")).toHaveAttribute("title", "Duplicate selected instrument");

      await timelineQuickInstrumentRow(page, "lead").locator("[data-timeline-quick-mute='lead']").click();
      await timelineQuickInstrumentRow(page, "lead").locator("[data-timeline-quick-solo='lead']").click();
      await timelineQuickInstrumentRow(page, "lead").locator("[data-toggle-instrument-visibility='lead']").click();
      await page.locator("#duplicateInstrumentRowButton").click();
      await expect(page.locator("#statusLog")).toHaveValue(/OK Duplicated instrument row Lead as Lead 1; playback data updated\./);

      const duplicateState = await page.evaluate((leadLaneSource) => {
        const app = window.__midiStudioV2App;
        const song = app.selectedSong();
        const settings = song.studioArrangement.previewLaneSettings;
        const selected = app.instrumentGrid.selectedInstrumentId;
        return {
          copiedLaneData: song.studioArrangement.lanes[selected] === leadLaneSource,
          duplicateDisplayName: settings.displayNames[selected],
          duplicateInstrument: settings.instruments[selected],
          duplicateInstrumentType: settings.instrumentTypes[selected],
          duplicatePan: settings.pans[selected],
          duplicateVisible: settings.visible[selected],
          duplicateMuted: settings.muted[selected],
          duplicateSoloed: settings.soloed[selected],
          duplicateVolume: settings.volumes[selected],
          hasUniqueId: selected !== "lead" && Object.hasOwn(song.studioArrangement.lanes, selected),
          selected
        };
      }, beforeDuplicate.leadLane);
      expect(duplicateState).toEqual({
        copiedLaneData: true,
        duplicateDisplayName: "Lead 1",
        duplicateInstrument: "gm-electric-bass-finger",
        duplicateInstrumentType: "Bass",
        duplicatePan: -0.3,
        duplicateVisible: false,
        duplicateMuted: true,
        duplicateSoloed: true,
        duplicateVolume: 0.6,
        hasUniqueId: true,
        selected: "lead-1"
      });
      await expect(timelineQuickInstrumentRow(page, "lead-1")).toHaveClass(/is-selected/);

      await selectMidiStudioTab(page, "instruments");
      await expect(instrumentRow(page, "lead-1")).toHaveClass(/is-selected/);
      await expect(page.locator("#selectedInstrumentEditor")).not.toContainText("Mute default");
      await expect(page.locator("#selectedInstrumentEditor")).not.toContainText("Solo default");

      await selectMidiStudioTab(page, "studio");
      await timelineQuickInstrumentRow(page, "lead-1").locator("[data-timeline-quick-mute='lead-1']").click();
      await timelineQuickInstrumentRow(page, "lead-1").locator("[data-toggle-instrument-visibility='lead-1']").click();
      await page.locator("#playButton").click();
      await expect(page.locator("#playButton")).toBeDisabled();
      await expect(page.locator("#stopButton")).toBeEnabled();
      await page.locator("#stopButton").click();
      await expect(page.locator("#stopButton")).toBeDisabled();
      await expect(page.locator("#playButton")).toBeEnabled();
    } finally {
      await workspaceV2CoverageReporter.stop(page);
      await server.close();
    }
  });

  test("manages PR067 instrument duplication ordering and guarded deletion", async ({ page }) => {
    await page.setViewportSize({ width: 1600, height: 900 });
    const server = await openMidiStudioForImport(page);
    try {
      await page.locator("#toolImportManifestInput").setInputFiles(uatManifestPath);

      await selectMidiStudioTab(page, "instruments");
      await selectInstrumentRow(page, "lead");
      await instrumentTypeSelect(page, "lead").selectOption("Bass");
      await instrumentSelect(page, "lead").selectOption("gm-electric-bass-finger");
      await setInputValue(page, "#previewVolumeLeadInput", "0.62");
      await setInputValue(page, "#previewPanLeadInput", "-0.25");
      await setInputValue(page, "#previewTransposeLeadInput", "7");
      await setInputValue(page, "#previewVelocityLeadInput", "91");
      await setInputValue(page, "#previewDurationLeadInput", "1.4");
      await page.evaluate(() => {
        const app = window.__midiStudioV2App;
        const state = app.instrumentGrid.previewLaneState.lead;
        state.effects = { ...state.effects, reverb: "future-room" };
        state.advanced = { ...state.advanced, midiChannel: 3 };
        app.syncSelectedArrangementFromGridInput(app.instrumentGrid.readInput());
      });
      const leadState = await page.evaluate(() => {
        const app = window.__midiStudioV2App;
        const song = app.selectedSong();
        const settings = song.studioArrangement.previewLaneSettings;
        return {
          advanced: settings.advanced.lead,
          effects: settings.effects.lead,
          laneText: song.studioArrangement.lanes.lead,
          settings: {
            duration: settings.durations.lead,
            instrument: settings.instruments.lead,
            instrumentType: settings.instrumentTypes.lead,
            pan: settings.pans.lead,
            transpose: settings.transposes.lead,
            velocity: settings.velocities.lead,
            volume: settings.volumes.lead
          }
        };
      });

      await selectMidiStudioTab(page, "studio");
      await waitForCanvasRender(page);
      await page.locator("#duplicateInstrumentRowButton").click();
      await expect(page.locator("#statusLog")).toHaveValue(/OK Duplicated instrument row Lead as Lead 1; playback data updated\./);
      await expect(timelineQuickInstrumentRow(page, "lead-1")).toHaveClass(/is-selected/);
      await expect(timelineQuickInstrumentRow(page, "lead-1")).toHaveAttribute("data-duplicate-confirmation", "true");

      const duplicateState = await page.evaluate((expectedLeadState) => {
        const app = window.__midiStudioV2App;
        const song = app.selectedSong();
        const settings = song.studioArrangement.previewLaneSettings;
        const selected = app.instrumentGrid.selectedInstrumentId;
        return {
          copiedAdvanced: settings.advanced[selected],
          copiedEffects: settings.effects[selected],
          copiedLaneText: song.studioArrangement.lanes[selected] === expectedLeadState.laneText,
          copiedSettings: {
            duration: settings.durations[selected],
            instrument: settings.instruments[selected],
            instrumentType: settings.instrumentTypes[selected],
            pan: settings.pans[selected],
            transpose: settings.transposes[selected],
            velocity: settings.velocities[selected],
            volume: settings.volumes[selected]
          },
          displayName: settings.displayNames[selected],
          hasUniqueId: selected === "lead-1" && Object.hasOwn(song.studioArrangement.lanes, selected),
          order: Object.keys(song.studioArrangement.lanes),
          selected
        };
      }, leadState);
      expect(duplicateState).toEqual({
        copiedAdvanced: leadState.advanced,
        copiedEffects: leadState.effects,
        copiedLaneText: true,
        copiedSettings: leadState.settings,
        displayName: "Lead 1",
        hasUniqueId: true,
        order: expect.arrayContaining(["lead", "lead-1"]),
        selected: "lead-1"
      });
      const duplicateOrder = duplicateState.order;
      const duplicateIndex = duplicateOrder.indexOf("lead-1");
      expect(duplicateIndex).toBeGreaterThan(0);
      expect(duplicateOrder[duplicateIndex - 1]).toBe("lead");

      await selectMidiStudioTab(page, "instruments");
      await expect(instrumentRow(page, "lead-1")).toHaveClass(/is-selected/);
      await selectMidiStudioTab(page, "studio");
      await page.locator("#moveInstrumentUpButton").click();
      await expect(page.locator("#statusLog")).toHaveValue(/OK Moved instrument row Lead 1 up; canonical order updated\./);
      const orderAfterMoveUp = await page.evaluate(() => Object.keys(window.__midiStudioV2App.selectedSong().studioArrangement.lanes));
      expect(orderAfterMoveUp.indexOf("lead-1")).toBe(duplicateIndex - 1);
      await page.locator("#moveInstrumentDownButton").click();
      await expect(page.locator("#statusLog")).toHaveValue(/OK Moved instrument row Lead 1 down; canonical order updated\./);
      const orderAfterMoveDown = await page.evaluate(() => Object.keys(window.__midiStudioV2App.selectedSong().studioArrangement.lanes));
      expect(orderAfterMoveDown).toEqual(duplicateOrder);
      await expect(timelineQuickInstrumentRow(page, "lead-1")).toHaveClass(/is-selected/);
      const expectedSelectionAfterDelete = orderAfterMoveDown[orderAfterMoveDown.indexOf("lead-1") + 1]
        || orderAfterMoveDown[orderAfterMoveDown.indexOf("lead-1") - 1]
        || "";

      await page.locator("#playButton").click();
      await expect(page.locator("#playButton")).toBeDisabled();
      await expect(page.locator("#stopButton")).toBeEnabled();
      await page.locator("#stopButton").click();
      await expect(page.locator("#stopButton")).toBeDisabled();
      await expect(page.locator("#playButton")).toBeEnabled();

      await selectMidiStudioTab(page, "instruments");
      await instrumentRow(page, "lead-1").locator("[data-delete-instrument-row='lead-1']").click();
      await expect(page.locator("[data-delete-confirmation-lane='lead-1']")).toBeVisible();
      expect(await page.evaluate(() => Object.hasOwn(window.__midiStudioV2App.selectedSong().studioArrangement.lanes, "lead-1"))).toBe(true);
      await page.locator("[data-confirm-delete-instrument-row='lead-1']").click();
      await expect(instrumentRow(page, "lead-1")).toHaveCount(0);
      const afterDelete = await page.evaluate(() => {
        const app = window.__midiStudioV2App;
        return {
          hasDeletedLane: Object.hasOwn(app.selectedSong().studioArrangement.lanes, "lead-1"),
          selected: app.instrumentGrid.selectedInstrumentId
        };
      });
      expect(afterDelete).toEqual({ hasDeletedLane: false, selected: expectedSelectionAfterDelete });

      await page.evaluate(() => {
        const app = window.__midiStudioV2App;
        const song = app.selectedSong();
        const settings = song.studioArrangement.previewLaneSettings;
        song.studioArrangement.lanes = { lead: song.studioArrangement.lanes.lead };
        Object.keys(settings).forEach((key) => {
          if (settings[key] && typeof settings[key] === "object" && !Array.isArray(settings[key])) {
            settings[key] = { lead: settings[key].lead };
          }
        });
        song.studioArrangement.previewInstruments = { lead: settings.instruments.lead };
        app.applySelectedSongArrangement("final instrument delete guard");
      });
      await selectMidiStudioTab(page, "instruments");
      await expect(instrumentRow(page, "lead")).toHaveCount(1);
      await instrumentRow(page, "lead").locator("[data-delete-instrument-row='lead']").click();
      await expect(page.locator("[data-delete-blocked-lane='lead']")).toBeVisible();
      await expect(page.locator("[data-delete-blocked-lane='lead']")).toContainText("Final instrument cannot be deleted");
      expect(await page.evaluate(() => Object.keys(window.__midiStudioV2App.selectedSong().studioArrangement.lanes))).toEqual(["lead"]);
      await expect(page.locator("#statusLog")).toHaveValue(/WARN Final instrument cannot be deleted: Lead\./);
    } finally {
      await workspaceV2CoverageReporter.stop(page);
      await server.close();
    }
  });

  test("repairs PR068 accordion controls trashcan delete piano-key audition and frozen canvas header", async ({ page }) => {
    await page.setViewportSize({ width: 1600, height: 900 });
    const server = await openMidiStudioForImport(page);
    try {
      await page.locator("#toolImportManifestInput").setInputFiles(uatManifestPath);

      await selectMidiStudioTab(page, "instruments");
      const instrumentsHeader = page.locator('.accordion-v2__header[aria-controls="instrumentListContent"]');
      await expect(instrumentsHeader).toHaveAttribute("aria-expanded", "true");
      await expect(instrumentsHeader.locator(".accordion-v2__icon")).toHaveText("X");
      await page.locator("#closeInstrumentPanelButton").click();
      await expect(instrumentsHeader).toHaveAttribute("aria-expanded", "false");
      await expect(instrumentsHeader.locator(".accordion-v2__icon")).toHaveText("+");
      await expect(page.locator("#instrumentListContent")).toBeHidden();
      await instrumentsHeader.click({ position: { x: 8, y: 8 } });
      await expect(instrumentsHeader).toHaveAttribute("aria-expanded", "true");
      await expect(instrumentsHeader.locator(".accordion-v2__icon")).toHaveText("X");
      await expect(page.locator("#instrumentListContent")).toBeVisible();

      const deleteButton = instrumentRow(page, "lead").locator("[data-delete-instrument-row='lead']");
      await expect(deleteButton).toHaveAttribute("data-delete-icon", "trashcan");
      await expect(deleteButton).toHaveText("");
      await expect(deleteButton.locator(".midi-studio-v2__trashcan-icon")).toHaveCount(1);
      const trashLayout = await instrumentRow(page, "lead").evaluate((row) => {
        const titleRow = row.querySelector(".midi-studio-v2__instrument-title-row");
        const title = row.querySelector("[data-lane-label='lead']");
        const summary = row.querySelector("[data-lane-summary='lead']");
        const trash = row.querySelector("[data-delete-instrument-row='lead']");
        const rowRect = row.getBoundingClientRect();
        const titleRect = title.getBoundingClientRect();
        const titleRowRect = titleRow.getBoundingClientRect();
        const summaryRect = summary.getBoundingClientRect();
        const trashRect = trash.getBoundingClientRect();
        return {
          rightSide: trashRect.right >= rowRect.right - 10,
          sameHeaderRow: Math.abs((trashRect.top + trashRect.height / 2) - (titleRowRect.top + titleRowRect.height / 2)) <= 3,
          titleBeforeTrash: titleRect.right < trashRect.left,
          upFromSummary: trashRect.bottom <= summaryRect.top + 2
        };
      });
      expect(trashLayout).toEqual({
        rightSide: true,
        sameHeaderRow: true,
        titleBeforeTrash: true,
        upFromSummary: true
      });

      await selectInstrumentRow(page, "lead");
      await selectMidiStudioTab(page, "studio");
      const timelineHeader = page.locator('.accordion-v2__header[aria-controls="timelineInstrumentQuickContent"]');
      await expect(timelineHeader).toHaveAttribute("aria-expanded", "true");
      await expect(timelineHeader.locator(".accordion-v2__icon")).toHaveText("X");
      await page.locator("#timelineCloseInstrumentPanelButton").click();
      await expect(timelineHeader).toHaveAttribute("aria-expanded", "false");
      await expect(timelineHeader.locator(".accordion-v2__icon")).toHaveText("+");
      await expect(page.locator("#timelineInstrumentQuickContent")).toBeHidden();
      await timelineHeader.click({ position: { x: 8, y: 8 } });
      await expect(timelineHeader).toHaveAttribute("aria-expanded", "true");
      await expect(timelineHeader.locator(".accordion-v2__icon")).toHaveText("X");
      await waitForCanvasRender(page);

      await page.evaluate(() => {
        window.__midiStudioPreviewSynthEvents = [];
      });
      const auditionRow = await page.evaluate(() => {
        const state = window.__midiStudioV2App.instrumentGrid.timelineCanvasState();
        return state.rows.find((row) => row.value === "C6")?.value || state.rows.find((row) => row.keyKind === "white")?.value;
      });
      expect(auditionRow).toBeTruthy();
      await clickCanvasKeyboardKey(page, auditionRow);
      await expect(page.locator("#statusLog")).toHaveValue(/INFO Auditioned .* for Lead with/);
      expect(await page.evaluate(() => window.__midiStudioPreviewSynthEvents.some((event) => event.action === "oscillator-start"))).toBe(true);
      const selectedKeyCell = await canvasTimelineState(page);
      expect(selectedKeyCell.selectedCell).toEqual({ rowToken: auditionRow, stepIndex: 0 });

      const scrollEvidence = await page.locator("#instrumentGridOutput").evaluate((output) => {
        output.style.width = "330px";
        output.style.maxWidth = "330px";
        output.scrollLeft = 260;
        output.scrollTop = 210;
        output.dispatchEvent(new Event("scroll"));
        const topScrollbar = output.querySelector(".midi-studio-v2__timeline-scroll-proxy");
        return {
          datasetScrollLeft: output.dataset.timelineScrollLeft,
          scrollLeft: Math.round(output.scrollLeft),
          scrollTop: Math.round(output.scrollTop),
          topScrollLeft: Math.round(topScrollbar?.scrollLeft || 0)
        };
      });
      await expect(octaveTimelineCanvas(page)).toHaveAttribute("data-frozen-header", "true");
      const frozenHeaderState = await canvasTimelineState(page);
      expect(frozenHeaderState.frozenHeaderVisible).toBe(true);
      expect(Math.abs(Math.round(frozenHeaderState.frozenHeaderScrollLeft) - scrollEvidence.scrollLeft)).toBeLessThanOrEqual(1);
      expect(Math.round(frozenHeaderState.frozenHeaderScrollTop)).toBeGreaterThan(0);
      expect(scrollEvidence.datasetScrollLeft).toBe(String(scrollEvidence.scrollLeft));
      expect(Math.abs(scrollEvidence.topScrollLeft - scrollEvidence.scrollLeft)).toBeLessThanOrEqual(1);

      await page.locator("#playButton").click();
      await expect(page.locator("#playButton")).toBeDisabled();
      await expect(page.locator("#stopButton")).toBeEnabled();
      await page.locator("#stopButton").click();
      await expect(page.locator("#stopButton")).toBeDisabled();
      await expect(page.locator("#playButton")).toBeEnabled();
    } finally {
      await workspaceV2CoverageReporter.stop(page);
      await server.close();
    }
  });

  test("warns when PR068 canvas piano-key audition audio is unavailable", async ({ page }) => {
    const server = await openMidiStudioForImport(page, { webAudio: false });
    try {
      await page.locator("#toolImportManifestInput").setInputFiles(uatManifestPath);
      await selectMidiStudioTab(page, "instruments");
      await selectInstrumentRow(page, "lead");
      await selectMidiStudioTab(page, "studio");
      await waitForCanvasRender(page);
      const beforeLane = await page.evaluate(() => window.__midiStudioV2App.selectedSong().studioArrangement.lanes.lead);
      await clickCanvasKeyboardKey(page, "C6");
      await expect(page.locator("#statusLog")).toHaveValue(/WARN Preview Synth keyboard audition unavailable: Preview Synth audio unavailable: Web Audio AudioContext is not available\. Use a browser with Web Audio support\./);
      expect(await page.evaluate(() => window.__midiStudioV2App.selectedSong().studioArrangement.lanes.lead)).toBe(beforeLane);
      await expect(octaveTimelineCanvas(page)).toHaveAttribute("data-selected-row-token", "C6");
    } finally {
      await workspaceV2CoverageReporter.stop(page);
      await server.close();
    }
  });

  test("color-codes PR069 octave timeline sections and matching section buttons", async ({ page }) => {
    await page.setViewportSize({ width: 1600, height: 900 });
    const server = await openMidiStudio(page);
    try {
      await fillGuidedSongSheet(page, {
        loopSections: "loop, bridge",
        sections: "intro: C F\nloop: G C\nbridge: Dm G"
      });
      await page.locator("#parseSongSheetButton").click();
      await selectMidiStudioTab(page, "studio");
      await waitForCanvasRender(page);

      const sectionState = await canvasTimelineState(page);
      expect(sectionState.sections.map((section) => section.label)).toEqual(["Intro", "loop", "Bridge"]);
      expect(new Set(sectionState.sections.map((section) => section.color)).size).toBe(3);

      const canvasSectionPixels = await page.evaluate(() => {
        const canvas = document.querySelector("[data-octave-timeline-canvas='true']");
        const state = window.__midiStudioV2App.instrumentGrid.timelineCanvasState();
        const ratio = canvas.width / canvas.clientWidth;
        const context = canvas.getContext("2d");
        const sampleBody = (sectionLabel) => {
          const section = state.sections.find((entry) => entry.label === sectionLabel);
          const x = Math.round((state.axisWidth + section.startStep * state.cellSize + state.cellSize / 2) * ratio);
          const y = Math.round((state.headerHeight + 4) * ratio);
          return Array.from(context.getImageData(x, y, 1, 1).data).slice(0, 3);
        };
        return {
          bridgeNamed: sampleBody("Bridge"),
          intro: sampleBody("Intro"),
          loop: sampleBody("loop")
        };
      });
      expect(canvasSectionPixels.intro).not.toEqual(canvasSectionPixels.loop);
      expect(canvasSectionPixels.loop).not.toEqual(canvasSectionPixels.bridgeNamed);

      const buttonState = await page.locator(".midi-studio-v2__section-preset").evaluateAll((buttons) => Object.fromEntries(buttons.map((button) => [
        button.dataset.sectionPreset,
        {
          color: button.dataset.sectionColor || "",
          disabled: button.disabled,
          loop: button.dataset.sectionLoop,
          selected: button.dataset.sectionSelected,
          title: button.title,
          unwired: button.classList.contains("midi-studio-v2__unwired-control")
        }
      ])));
      const colorsBySection = Object.fromEntries(sectionState.sections.map((section) => [section.label, section.color]));
      expect(buttonState.intro).toEqual(expect.objectContaining({
        color: colorsBySection.Intro,
        disabled: false,
        unwired: false
      }));
      expect(buttonState.loop).toEqual(expect.objectContaining({
        color: colorsBySection.loop,
        disabled: false,
        unwired: false
      }));
      expect(buttonState.bridge).toEqual(expect.objectContaining({
        color: colorsBySection.Bridge,
        disabled: false,
        unwired: false
      }));
      expect(buttonState.boss).toEqual(expect.objectContaining({
        disabled: true,
        title: expect.stringMatching(/Incomplete: Boss is not defined/),
        unwired: true
      }));
      await expect(page.locator("[data-section-preset='boss']")).toHaveClass(/midi-studio-v2__unwired-control/);

      await page.locator("[data-section-preset='intro']").click();
      await expect(page.locator("#instrumentGridSectionSelect")).toHaveValue("Intro");
      await expect(page.locator("[data-section-preset='intro']")).toHaveAttribute("data-section-selected", "true");
      await expect(page.locator("#instrumentGridOutput")).toHaveAttribute("data-playhead-section", "Intro");
      expect((await canvasTimelineState(page)).selectedSection).toEqual(expect.objectContaining({
        color: colorsBySection.Intro,
        label: "Intro"
      }));

      await page.locator("#playSectionButton").click();
      await expect(page.locator("#statusLog")).toHaveValue(/OK Preview Synth started for section Intro with \d+ playable events\./);
      await expect(page.locator("[data-section-preset='intro']")).toHaveClass(/is-selected-section/);
      await page.locator("#stopTimingPreviewButton").click();

      await page.locator("#instrumentGridLoopStartSelect").selectOption("loop");
      await page.locator("#instrumentGridLoopEndSelect").selectOption("Bridge");
      await expect(page.locator("[data-section-preset='loop']")).toHaveAttribute("data-section-loop", "true");
      await expect(page.locator("[data-section-preset='bridge']")).toHaveAttribute("data-section-loop", "true");
      await page.locator("#playLoopButton").click();
      await expect(page.locator("#statusLog")).toHaveValue(/OK Preview Synth started for loop loop to Bridge with \d+ playable events\./);
      const loopState = await canvasTimelineState(page);
      expect(loopState.loopBounds).toEqual(expect.objectContaining({
        endLabel: "Bridge",
        startLabel: "loop"
      }));
      await page.locator("#stopTimingPreviewButton").click();

      const scrollEvidence = await page.locator("#instrumentGridOutput").evaluate((output) => {
        output.style.width = "340px";
        output.style.maxWidth = "340px";
        output.scrollLeft = 220;
        output.scrollTop = 180;
        output.dispatchEvent(new Event("scroll"));
        return {
          scrollLeft: Math.round(output.scrollLeft),
          scrollTop: Math.round(output.scrollTop)
        };
      });
      await expect(octaveTimelineCanvas(page)).toHaveAttribute("data-frozen-header", "true");
      const scrolledState = await canvasTimelineState(page);
      expect(scrolledState.frozenHeaderVisible).toBe(true);
      expect(Math.round(scrolledState.frozenHeaderScrollLeft)).toBe(scrollEvidence.scrollLeft);
      expect(Math.round(scrolledState.frozenHeaderScrollTop)).toBe(scrollEvidence.scrollTop);

      await page.locator("#playButton").click();
      await expect(page.locator("#playButton")).toBeDisabled();
      await expect(page.locator("#stopButton")).toBeEnabled();
      await page.locator("#stopButton").click();
      await expect(page.locator("#stopButton")).toBeDisabled();
      await expect(page.locator("#playButton")).toBeEnabled();
    } finally {
      await workspaceV2CoverageReporter.stop(page);
      await server.close();
    }
  });

  test("separates PR070 classification from reusable musical sections and sequence", async ({ page }) => {
    await page.setViewportSize({ width: 1600, height: 900 });
    const server = await openMidiStudioForImport(page);
    try {
      await page.locator("#toolImportManifestInput").setInputFiles(uatManifestPath);
      await selectMidiStudioTab(page, "song-setup");

      const classificationInput = page.locator("#songDetails [data-song-detail-field='classification']");
      await expect(classificationInput).toBeVisible();
      await expect(classificationInput).toHaveAttribute("type", "text");
      const classificationHelp = page.locator("[data-song-detail-help='classification']");
      await expect(classificationHelp).toHaveText("?");
      const helpText = await classificationHelp.getAttribute("title");
      expect(helpText).toContain("Menu");
      expect(helpText).toContain("Game Over");
      expect(helpText).toContain("Flying");
      expect(helpText).toContain("Puzzle");
      expect(helpText).toContain("Chase");

      await classificationInput.fill("Loop");
      await page.locator("#songDetails [data-song-detail-field='name']").fill("Main Theme");
      await expect(page.locator("#songDetails [data-song-detail-field='id']")).toHaveValue("mainTheme-Loop");
      await classificationInput.fill("Flying");
      await page.locator("#songDetails [data-song-detail-field='name']").fill("Sky Battle");
      await expect(page.locator("#songDetails [data-song-detail-field='id']")).toHaveValue("skyBattle-Flying");

      const sequence = "Intro, Verse, Chorus, Verse, Chorus, Bridge, Chorus, Outro";
      await fillSongSheetSectionBuilder(page, "Intro: C F\nVerse: Am F\nChorus: G C\nBridge: Dm G\nOutro: C");
      await addSongSheetSequenceLabels(page, sequence.split(", "));
      await page.locator("#parseSongSheetButton").click();
      await expect(page.locator("#songSheetSummary [data-song-sheet-summary-field='sequence'] dd")).toHaveText(sequence);
      await expect(page.locator("#songSheetSummary [data-song-sheet-summary-field='sections']")).toContainText("Verse: 2 bars, 2 chords");
      await expect(page.locator("#songSheetSummary [data-song-sheet-summary-field='sections']")).toContainText("Chorus: 2 bars, 2 chords");
      await expect(page.locator("#songSheetSummary [data-song-sheet-summary-field='bars'] dd")).toHaveText("15");
      await expect(page.locator("#songSheetSummary [data-song-sheet-summary-field='chord-count'] dd")).toHaveText("15");

      const canonical = await page.evaluate(() => {
        const app = window.__midiStudioV2App;
        const song = app.selectedSong();
        const gridResult = app.currentInstrumentGridResult();
        return {
          classification: song.classification,
          id: song.id,
          sectionColors: gridResult.sections.map((section) => ({ colorIndex: section.colorIndex, label: section.label })),
          sectionLabels: gridResult.sections.map((section) => section.label),
          sections: song.studioArrangement.sections,
          sequence: song.studioArrangement.songSheet.sequence,
          songSheetSections: song.studioArrangement.songSheet.sections
        };
      });
      expect(canonical).toEqual(expect.objectContaining({
        classification: "Flying",
        id: "skyBattle-Flying",
        sectionLabels: ["Intro", "Verse", "Chorus", "Verse", "Chorus", "Bridge", "Chorus", "Outro"],
        sections: "Intro:2, Verse:2, Chorus:2, Verse:2, Chorus:2, Bridge:2, Chorus:2, Outro:1",
        sequence,
        songSheetSections: "Intro: C F\nVerse: Am F\nChorus: G C\nBridge: Dm G\nOutro: C"
      }));
      expect(canonical.sectionColors[1].colorIndex).toBe(canonical.sectionColors[3].colorIndex);
      expect(canonical.sectionColors[2].colorIndex).toBe(canonical.sectionColors[4].colorIndex);
      expect(canonical.sectionColors[2].colorIndex).toBe(canonical.sectionColors[6].colorIndex);

      await selectMidiStudioTab(page, "studio");
      await waitForCanvasRender(page);
      const canvasState = await canvasTimelineState(page);
      expect(canvasState.sections.map((section) => section.label)).toEqual(canonical.sectionLabels);
      expect(canvasState.sections[1].color).toBe(canvasState.sections[3].color);
      expect(canvasState.sections[2].color).toBe(canvasState.sections[4].color);
      expect(canvasState.sections[2].color).toBe(canvasState.sections[6].color);

      const buttonState = await page.locator(".midi-studio-v2__section-preset").evaluateAll((buttons) => Object.fromEntries(buttons.map((button) => [
        button.dataset.sectionPreset,
        {
          color: button.dataset.sectionColor || "",
          disabled: button.disabled,
          title: button.title,
          unwired: button.classList.contains("midi-studio-v2__unwired-control")
        }
      ])));
      expect(buttonState.verse).toEqual(expect.objectContaining({
        color: canvasState.sections[1].color,
        disabled: false,
        unwired: false
      }));
      expect(buttonState.chorus).toEqual(expect.objectContaining({
        color: canvasState.sections[2].color,
        disabled: false,
        unwired: false
      }));
      expect(buttonState.boss).toEqual(expect.objectContaining({
        disabled: true,
        title: expect.stringMatching(/Incomplete: Boss is not defined/),
        unwired: true
      }));
      expect(buttonState.victory).toEqual(expect.objectContaining({
        disabled: true,
        title: expect.stringMatching(/Incomplete: Victory is not defined/),
        unwired: true
      }));

      await page.locator("#playButton").click();
      await expect(page.locator("#playButton")).toBeDisabled();
      await expect(page.locator("#stopButton")).toBeEnabled();
      await page.locator("#stopButton").click();
      await expect(page.locator("#stopButton")).toBeDisabled();
      await expect(page.locator("#playButton")).toBeEnabled();
    } finally {
      await workspaceV2CoverageReporter.stop(page);
      await server.close();
    }
  });

  test("builds PR071 song sheet sequences from populated sections and selected targets", async ({ page }) => {
    await page.setViewportSize({ width: 1600, height: 900 });
    const server = await openMidiStudioForImport(page);
    try {
      await page.locator("#toolImportManifestInput").setInputFiles(uatManifestPath);
      await selectMidiStudioTab(page, "song-setup");

      await expect(page.locator("#songSheetLoopSectionsInput")).toHaveCount(0);
      await fillSongSheetSectionBuilder(page, "Intro: C F\nVerse: Am F\nChorus: G C\nBridge:\nOutro: C\nSolo: Dm G");

      await expect(page.locator("#songSheetAvailableSectionsList option")).toHaveText([
        "Intro - 2 bars / 2 chords",
        "Verse - 2 bars / 2 chords",
        "Chorus - 2 bars / 2 chords",
        "Outro - 1 bar / 1 chord",
        "Solo - 2 bars / 2 chords"
      ]);
      await expect(page.locator("#songSheetAvailableSectionsList option", { hasText: "Bridge" })).toHaveCount(0);

      await clearSongSheetSequence(page);
      await page.locator("#songSheetAvailableSectionsList").selectOption("Intro");
      await page.locator("#songSheetAddSectionToSequenceButton").click();
      await page.locator("#songSheetAvailableSectionsList").selectOption("Verse");
      await page.locator("#songSheetAddSectionToSequenceButton").click();
      await page.locator("#songSheetAvailableSectionsList").selectOption("Chorus");
      await page.locator("#songSheetAddSectionToSequenceButton").click();
      await expect(page.locator("#songSheetSequenceList option")).toHaveText(["Intro", "Verse", "Chorus"]);

      await page.locator("#songSheetSequenceList").selectOption({ index: 2 });
      await page.locator("#songSheetSequenceMoveUpButton").click();
      await expect(page.locator("#songSheetSequenceList option")).toHaveText(["Intro", "Chorus", "Verse"]);
      await page.locator("#songSheetSequenceMoveDownButton").click();
      await expect(page.locator("#songSheetSequenceList option")).toHaveText(["Intro", "Verse", "Chorus"]);

      await page.locator("#songSheetAvailableSectionsList").selectOption("Solo");
      await page.locator("#songSheetAddSectionToSequenceButton").click();
      await expect(page.locator("#songSheetSequenceList option")).toHaveText(["Intro", "Verse", "Chorus", "Solo"]);
      await page.locator("#songSheetSequenceList").selectOption({ index: 3 });
      await page.locator("#songSheetSequenceRemoveButton").click();
      await expect(page.locator("#songSheetSequenceList option")).toHaveText(["Intro", "Verse", "Chorus"]);

      await page.locator("#songSheetAvailableSectionsList").selectOption("Verse");
      await page.locator("#songSheetAddSectionToSequenceButton").click();
      await page.locator("#songSheetAvailableSectionsList").selectOption("Chorus");
      await page.locator("#songSheetAddSectionToSequenceButton").click();
      await page.locator("#songSheetAvailableSectionsList").selectOption("Outro");
      await page.locator("#songSheetAddSectionToSequenceButton").click();
      const sequence = "Intro, Verse, Chorus, Verse, Chorus, Outro";
      await expect(page.locator("#songSheetSequenceInput")).toHaveValue(sequence);

      await expect(page.locator("#songSheetApplyChordsPadInput")).toBeChecked();
      await expect(page.locator("#songSheetApplyBassInput")).toBeChecked();
      await expect(page.locator("#songSheetApplyDrumsInput")).toBeChecked();
      await expect(page.locator("#songSheetApplyLeadInput")).not.toBeChecked();
      await expect(page.locator("#songSheetDragDropSequenceButton")).toHaveClass(/midi-studio-v2__unwired-control/);
      await expect(page.locator("#songSheetDragDropSequenceButton")).toHaveAttribute("title", /Not implemented/);

      await page.locator("#parseSongSheetButton").click();
      await expect(page.locator("#songSheetSummary [data-song-sheet-summary-field='sequence'] dd")).toHaveText(sequence);
      await expect(page.locator("#songSheetSummary [data-song-sheet-summary-field='sections']")).toContainText("Intro: 2 bars, 2 chords");
      await expect(page.locator("#songSheetSummary [data-song-sheet-summary-field='sections']")).not.toContainText("Bridge");
      await expect(page.locator("#songSheetSummary [data-song-sheet-summary-field='bars'] dd")).toHaveText("11");
      await expect(page.locator("#songSheetSummary [data-song-sheet-summary-field='chord-count'] dd")).toHaveText("11");

      const canonical = await page.evaluate(() => {
        const app = window.__midiStudioV2App;
        const song = app.selectedSong();
        const gridResult = app.currentInstrumentGridResult();
        return {
          applyTargets: song.studioArrangement.songSheet.applyTargets,
          bassEvents: gridResult.timeline.filter((event) => event.lane === "bass").length,
          chordEvents: gridResult.timeline.filter((event) => event.lane === "chords").length,
          drumEvents: gridResult.timeline.filter((event) => event.lane === "drums").length,
          json: document.querySelector("#inspectorOutput").textContent,
          leadEvents: gridResult.timeline.filter((event) => event.lane === "lead").length,
          sectionColors: gridResult.sections.map((section) => ({ colorIndex: section.colorIndex, label: section.label })),
          sectionLabels: gridResult.sections.map((section) => section.label),
          sections: song.studioArrangement.sections,
          sequence: song.studioArrangement.songSheet.sequence,
          songSheetSections: song.studioArrangement.songSheet.sections
        };
      });
      expect(canonical).toEqual(expect.objectContaining({
        applyTargets: {
          bass: true,
          chordsPad: true,
          drums: true,
          lead: false
        },
        sectionLabels: ["Intro", "Verse", "Chorus", "Verse", "Chorus", "Outro"],
        sections: "Intro:2, Verse:2, Chorus:2, Verse:2, Chorus:2, Outro:1",
        sequence,
        songSheetSections: "Intro: C F\nVerse: Am F\nChorus: G C\nOutro: C\nSolo: Dm G"
      }));
      expect(canonical.chordEvents).toBeGreaterThan(0);
      expect(canonical.bassEvents).toBeGreaterThan(0);
      expect(canonical.drumEvents).toBeGreaterThan(0);
      expect(canonical.leadEvents).toBe(0);
      expect(canonical.json).toContain('"sequence": "Intro, Verse, Chorus, Verse, Chorus, Outro"');
      expect(canonical.json).toContain('"applyTargets"');
      expect(canonical.sectionColors[1].colorIndex).toBe(canonical.sectionColors[3].colorIndex);
      expect(canonical.sectionColors[2].colorIndex).toBe(canonical.sectionColors[4].colorIndex);

      await selectMidiStudioTab(page, "studio");
      await waitForCanvasRender(page);
      const canvasState = await canvasTimelineState(page);
      expect(canvasState.sections.map((section) => section.label)).toEqual(canonical.sectionLabels);
      expect(canvasState.sections[1].color).toBe(canvasState.sections[3].color);
      expect(canvasState.sections[2].color).toBe(canvasState.sections[4].color);

      await page.locator("#playButton").click();
      await expect(page.locator("#playButton")).toBeDisabled();
      await expect(page.locator("#stopButton")).toBeEnabled();
      await page.locator("#stopButton").click();
      await expect(page.locator("#stopButton")).toBeDisabled();
      await expect(page.locator("#playButton")).toBeEnabled();
    } finally {
      await workspaceV2CoverageReporter.stop(page);
      await server.close();
    }
  });

  test("validates PR072-075 sequence UX, section sync, instrument settings, audition, and canvas polish", async ({ page }) => {
    await page.setViewportSize({ width: 1600, height: 900 });
    const server = await openMidiStudioForImport(page);
    try {
      await page.locator("#toolImportManifestInput").setInputFiles(uatManifestPath);
      await selectMidiStudioTab(page, "song-setup");

      await fillSongSheetSectionBuilder(page, "Intro: C F\nVerse: Am F\nChorus: G C\nBridge:\nOutro: C\nSolo: Dm G");
      await expect(page.locator("#songSheetAvailableCount")).toHaveText("5 populated");
      await expect(page.locator("#songSheetAvailableCount")).toHaveAttribute("data-song-sheet-available-count", "5");
      await expect(page.locator("#songSheetSequenceCount")).toHaveAttribute("data-song-sheet-sequence-count", "0");
      await expect(page.locator("#songSheetAvailableSectionsList option")).toHaveText([
        "Intro - 2 bars / 2 chords",
        "Verse - 2 bars / 2 chords",
        "Chorus - 2 bars / 2 chords",
        "Outro - 1 bar / 1 chord",
        "Solo - 2 bars / 2 chords"
      ]);
      await expect(page.locator("#songSheetAvailableSectionsList option", { hasText: "Bridge" })).toHaveCount(0);

      const sequencePanelStyles = await page.locator(".midi-studio-v2__sequence-list-panel").evaluateAll((panels) => panels.map((panel) => {
        const style = getComputedStyle(panel);
        return {
          backgroundColor: style.backgroundColor,
          borderColor: style.borderColor,
          modifier: panel.className
        };
      }));
      expect(sequencePanelStyles).toHaveLength(2);
      expect(sequencePanelStyles[0].backgroundColor).not.toBe(sequencePanelStyles[1].backgroundColor);
      expect(sequencePanelStyles[0].borderColor).not.toBe(sequencePanelStyles[1].borderColor);
      expect(sequencePanelStyles[0].modifier).toContain("available");
      expect(sequencePanelStyles[1].modifier).toContain("sequence");

      await clearSongSheetSequence(page);
      await addSongSheetSequenceLabels(page, ["Intro", "Verse", "Chorus"]);
      await page.locator("#songSheetSequenceList").selectOption({ index: 1 });
      await page.locator("#songSheetDuplicateSequenceButton").click();
      await expect(page.locator("#songSheetSequenceList option")).toHaveText(["Intro", "Verse", "Verse", "Chorus"]);
      await expect(page.locator("#songSheetSequenceCount")).toHaveText("4 items");
      await page.locator("#songSheetSequenceMoveDownButton").click();
      await expect(page.locator("#songSheetSequenceList option")).toHaveText(["Intro", "Verse", "Chorus", "Verse"]);
      await page.locator("#songSheetSequenceMoveUpButton").click();
      await expect(page.locator("#songSheetSequenceList option")).toHaveText(["Intro", "Verse", "Verse", "Chorus"]);
      await page.locator("#songSheetSequenceRemoveButton").click();
      await expect(page.locator("#songSheetSequenceList option")).toHaveText(["Intro", "Verse", "Chorus"]);
      await addSongSheetSequenceLabels(page, ["Intro", "Verse", "Chorus", "Verse", "Chorus", "Outro"]);
      const sequence = "Intro, Verse, Chorus, Verse, Chorus, Outro";
      await expect(page.locator("#songSheetSequenceInput")).toHaveValue(sequence);
      await expect(page.locator("#songSheetSequenceCount")).toHaveText("6 items");

      const sequenceColors = await page.locator("#songSheetSequenceList option").evaluateAll((options) => options.map((option) => ({
        backgroundColor: option.style.backgroundColor,
        colorIndex: option.dataset.songSheetSectionColorIndex,
        label: option.value
      })));
      expect(sequenceColors.map((option) => option.label)).toEqual(["Intro", "Verse", "Chorus", "Verse", "Chorus", "Outro"]);
      expect(sequenceColors[1].colorIndex).toBe(sequenceColors[3].colorIndex);
      expect(sequenceColors[2].colorIndex).toBe(sequenceColors[4].colorIndex);
      expect(sequenceColors.every((option) => option.backgroundColor.includes("rgba"))).toBe(true);

      await page.locator("#parseSongSheetButton").click();
      await expect(page.locator("#songSheetSummary [data-song-sheet-summary-field='sequence'] dd")).toHaveText(sequence);
      const canonicalSequence = await page.evaluate(() => {
        const app = window.__midiStudioV2App;
        const gridResult = app.currentInstrumentGridResult();
        return {
          sectionColors: gridResult.sections.map((section) => ({ color: section.color, colorIndex: section.colorIndex, label: section.label })),
          sectionLabels: gridResult.sections.map((section) => section.label),
          sequence: app.selectedSong().studioArrangement.songSheet.sequence
        };
      });
      expect(canonicalSequence.sequence).toBe(sequence);
      expect(canonicalSequence.sectionLabels).toEqual(["Intro", "Verse", "Chorus", "Verse", "Chorus", "Outro"]);
      expect(canonicalSequence.sectionColors[1].colorIndex).toBe(Number(sequenceColors[1].colorIndex));
      expect(canonicalSequence.sectionColors[3].colorIndex).toBe(Number(sequenceColors[1].colorIndex));

      await selectMidiStudioTab(page, "studio");
      await waitForCanvasRender(page);
      const canvasSections = await canvasTimelineState(page);
      expect(canvasSections.sections.map((section) => section.label)).toEqual(canonicalSequence.sectionLabels);
      expect(canvasSections.sections[1].color).toBe(canvasSections.sections[3].color);
      expect(canvasSections.sections[2].color).toBe(canvasSections.sections[4].color);
      const sectionButtons = await page.locator(".midi-studio-v2__section-preset").evaluateAll((buttons) => Object.fromEntries(buttons.map((button) => [
        button.dataset.sectionPreset,
        {
          color: button.dataset.sectionColor || "",
          disabled: button.disabled,
          selected: button.dataset.sectionSelected,
          title: button.title,
          unwired: button.classList.contains("midi-studio-v2__unwired-control")
        }
      ])));
      expect(sectionButtons.verse).toEqual(expect.objectContaining({
        color: canvasSections.sections[1].color,
        disabled: false,
        unwired: false
      }));
      expect(sectionButtons.boss).toEqual(expect.objectContaining({
        disabled: true,
        unwired: true
      }));
      await page.locator('[data-section-preset="verse"]').click();
      await expect(page.locator("#instrumentGridSectionSelect")).toHaveValue("Verse");
      await expect(page.locator('[data-section-preset="verse"]')).toHaveAttribute("data-section-selected", "true");
      await page.locator("#playSectionButton").click();
      await expect(page.locator("#instrumentGridTransportState")).toContainText("Playing section: Verse");
      await page.waitForFunction(() => document.querySelector("[data-octave-timeline-canvas='true']")?.dataset.playheadSection === "Verse");
      await expect(octaveTimelineCanvas(page)).toHaveAttribute("data-playhead-render-loop", "raf");
      await page.locator("#stopTimingPreviewButton").click();

      await selectMidiStudioTab(page, "instruments");
      await selectInstrumentRow(page, "lead");
      await setInputValue(page, "#previewVolumeLeadInput", "0.7");
      await setInputValue(page, "#previewPanLeadInput", "-0.4");
      await setInputValue(page, "#previewOctaveLowLeadInput", "4");
      await setInputValue(page, "#previewOctaveHighLeadInput", "6");
      await setInputValue(page, "#previewTransposeLeadInput", "5");
      await expect(page.locator("#instrumentAuditionKeyboard")).toHaveAttribute("data-octave-min", "4");
      await expect(page.locator("#instrumentAuditionKeyboard")).toHaveAttribute("data-octave-max", "6");
      await expect(page.locator("#instrumentAuditionKeyboard")).toHaveAttribute("data-volume", "0.7");
      await expect(page.locator("#instrumentAuditionKeyboard")).toHaveAttribute("data-pan", "-0.4");
      await expect(page.locator("#instrumentAuditionKeyboard")).toHaveAttribute("data-transpose", "5");

      const instrumentSettings = await page.evaluate(() => {
        const app = window.__midiStudioV2App;
        const settings = app.selectedSong().studioArrangement.previewLaneSettings;
        return {
          octaveRange: settings.octaveRanges.lead,
          pan: settings.pans.lead,
          transpose: settings.transposes.lead,
          volume: settings.volumes.lead
        };
      });
      expect(instrumentSettings).toEqual({
        octaveRange: { high: 6, low: 4 },
        pan: -0.4,
        transpose: 5,
        volume: 0.7
      });

      await page.evaluate(() => {
        const app = window.__midiStudioV2App;
        if (!app.__pr072075OriginalPlayGridRange) {
          app.__pr072075OriginalPlayGridRange = app.previewSynth.playGridRange.bind(app.previewSynth);
          app.previewSynth.playGridRange = async (options) => {
            app.__lastKeyboardAuditionOptions = {
              laneSettings: options.laneSettings,
              timeline: options.grid?.timeline || []
            };
            return app.__pr072075OriginalPlayGridRange(options);
          };
        }
        window.__midiStudioPreviewSynthEvents = [];
      });
      await page.locator("#instrumentAuditionKeyboard [data-audition-note='C5']").click();
      await expect(page.locator("#statusLog")).toHaveValue(/INFO Auditioned C5 for Lead with/);
      const auditionEvidence = await page.evaluate(() => ({
        events: window.__midiStudioPreviewSynthEvents,
        options: window.__midiStudioV2App.__lastKeyboardAuditionOptions
      }));
      expect(auditionEvidence.events.some((event) => event.action === "oscillator-start")).toBe(true);
      expect(auditionEvidence.options.timeline[0]).toEqual(expect.objectContaining({
        lane: "lead",
        value: "C5"
      }));
      expect(auditionEvidence.options.laneSettings.volumes.lead).toBe(0.7);
      expect(auditionEvidence.options.laneSettings.pans.lead).toBe(-0.4);
      expect(auditionEvidence.options.laneSettings.octaveRanges.lead).toEqual({ high: 6, low: 4 });
      expect(auditionEvidence.options.laneSettings.transposes.lead).toBe(5);

      await selectMidiStudioTab(page, "studio");
      await expect(timelineQuickInstrumentRow(page, "lead")).toHaveClass(/is-selected/);
      await timelineQuickInstrumentRow(page, "bass").locator("[data-quick-instrument-label='bass']").click();
      await expect(timelineQuickInstrumentRow(page, "bass")).toHaveClass(/is-selected/);
      await selectMidiStudioTab(page, "instruments");
      await expect(instrumentRow(page, "bass")).toHaveClass(/is-selected/);
      expect(await page.evaluate(() => window.__midiStudioV2App.instrumentGrid.selectedInstrumentId)).toBe("bass");
      await selectInstrumentRow(page, "lead");
      await selectMidiStudioTab(page, "studio");
      await waitForCanvasRender(page);

      await scrollCanvasCellIntoView(page, "G4", 1);
      const hoverPoint = await page.evaluate(() => window.__midiStudioV2App.instrumentGrid.timelineCanvasCellCenter("G4", 1));
      expect(hoverPoint).toBeTruthy();
      await page.mouse.move(hoverPoint.x, hoverPoint.y);
      await expect(octaveTimelineCanvas(page)).toHaveAttribute("data-hover-active", "true");
      await expect(octaveTimelineCanvas(page)).toHaveAttribute("data-hover-row-token", "G4");
      await expect(octaveTimelineCanvas(page)).toHaveAttribute("data-hover-step-index", "1");
      await clickCanvasCell(page, "G4", 1);
      await expect(octaveTimelineCanvas(page)).toHaveAttribute("data-selected-active", "true");
      await expect(octaveTimelineCanvas(page)).toHaveAttribute("data-selected-row-token", "G4");
      await expect(octaveTimelineCanvas(page)).toHaveAttribute("data-selected-step-index", "1");

      await page.locator("#playButton").click();
      await expect(page.locator("#playButton")).toBeDisabled();
      await expect(page.locator("#stopButton")).toBeEnabled();
      await page.locator("#stopButton").click();
      await expect(page.locator("#stopButton")).toBeDisabled();
      await expect(page.locator("#playButton")).toBeEnabled();
    } finally {
      await workspaceV2CoverageReporter.stop(page);
      await server.close();
    }
  });

  test("validates PR076-079 export, section clarity, playback completion, loop state, and warnings ownership", async ({ page }) => {
    await page.setViewportSize({ width: 1600, height: 900 });
    const server = await openMidiStudioForImport(page);
    try {
      await page.locator("#toolImportManifestInput").setInputFiles(uatManifestPath);

      await selectMidiStudioTab(page, "export");
      await expect(page.locator("#renderedExportSaveButton")).toHaveText("Save WAV");
      await page.locator("#renderedExportTargetTypeSelect").selectOption("mp3");
      await expect(page.locator("#renderedExportSaveButton")).toHaveText("Save MP3");
      await page.locator("#renderedExportTargetTypeSelect").selectOption("ogg");
      await expect(page.locator("#renderedExportSaveButton")).toHaveText("Save OGG");
      await expect(page.locator("#exportWorkflowContent")).not.toContainText("Export WAV");
      await expect(page.locator("#exportWorkflowContent")).not.toContainText("Export MP3");
      await expect(page.locator("#exportWorkflowContent")).not.toContainText("Export OGG");
      await expect(page.locator("#toolImportManifestButton")).toHaveText("Import JSON Manifest");
      await expect(page.locator("#toolExportToolStateButton")).toHaveText("Export JSON");
      for (const selector of ["#futureSoundFontSelect", "#futureRenderQualitySelect", "#futureSampleRateSelect"]) {
        await expect(page.locator(selector)).toHaveAttribute("data-midi-studio-unwired", "not-implemented");
        await expect(page.locator(selector)).toHaveAttribute("title", /Not implemented:/);
      }
      await expect(page.locator("#exportStatusDetails")).toContainText("Export tab owns rendered audio output workflow");
      await expect(page.locator("#exportStatusDetails")).toContainText("SoundFont");
      await setInputValue(page, "#renderedTargetOggInput", "assets/music/rendered/camptown-races-uat-reel.ogg");
      await page.locator("#renderedExportSaveButton").click();
      await expect(page.locator("#exportStatusDetails")).toContainText("WARN: Export rendering not implemented for OGG.");

      await selectMidiStudioTab(page, "song-setup");
      await page.locator("#songSheetTempoInput").fill("600");
      await fillSongSheetSectionBuilder(page, "Intro: C\nVerse: Am\nChorus: F\nBridge:\nOutro: G");
      await expect(page.locator("#songSheetAvailableSectionsList option")).toHaveText([
        "Intro - 1 bar / 1 chord",
        "Verse - 1 bar / 1 chord",
        "Chorus - 1 bar / 1 chord",
        "Outro - 1 bar / 1 chord"
      ]);
      await expect(page.locator("#songSheetAvailableSectionsList option", { hasText: "Bridge" })).toHaveCount(0);
      await clearSongSheetSequence(page);
      await addSongSheetSequenceLabels(page, ["Intro", "Verse", "Chorus", "Verse", "Outro"]);
      await expect(page.locator("#songSheetSequenceList option")).toHaveText(["Intro", "Verse", "Chorus", "Verse", "Outro"]);
      await expect(page.locator("#songSheetSequenceCount")).toHaveText("5 items");
      await page.locator("#parseSongSheetButton").click();
      await expect(page.locator("#songSheetSummary [data-song-sheet-summary-field='sequence'] dd")).toHaveText("Intro, Verse, Chorus, Verse, Outro");
      await expect(page.locator("#songSheetContent [data-song-sheet-summary-field='warnings']")).toHaveCount(0);
      await expect(page.locator("#songSheetWarningsContent")).toBeVisible();
      await expect(page.locator("#songSheetWarningsDetails [data-song-sheet-warning-field='song-sheet-warnings']")).toContainText("none");
      await expect(page.locator("#songSheetWarningsDetails [data-song-sheet-warning-field='validation-warnings']")).toContainText("none");

      const sequenceColors = await page.locator("#songSheetSequenceList option").evaluateAll((options) => options.map((option) => ({
        colorIndex: option.dataset.songSheetSectionColorIndex,
        label: option.value
      })));
      expect(sequenceColors.map((entry) => entry.label)).toEqual(["Intro", "Verse", "Chorus", "Verse", "Outro"]);
      expect(sequenceColors[1].colorIndex).toBe(sequenceColors[3].colorIndex);

      await selectMidiStudioTab(page, "studio");
      await waitForCanvasRender(page);
      const canvasSections = await canvasTimelineState(page);
      expect(canvasSections.sectionHeaderLabels).toEqual(["Intro", "Verse", "Chorus", "Verse", "Outro"]);
      expect(canvasSections.sections.map((section) => section.label)).toEqual(["Intro", "Verse", "Chorus", "Verse", "Outro"]);
      expect(canvasSections.sections[1].color).toBe(canvasSections.sections[3].color);
      await expect(octaveTimelineCanvas(page)).toHaveAttribute("data-section-header-labels", "Intro|Verse|Chorus|Verse|Outro");

      const sectionButtons = await page.locator(".midi-studio-v2__section-preset").evaluateAll((buttons) => Object.fromEntries(buttons.map((button) => [
        button.dataset.sectionPreset,
        {
          color: button.dataset.sectionColor || "",
          disabled: button.disabled,
          title: button.title,
          unwired: button.dataset.midiStudioUnwired || ""
        }
      ])));
      expect(sectionButtons.verse).toEqual(expect.objectContaining({
        color: canvasSections.sections[1].color,
        disabled: false,
        unwired: ""
      }));
      expect(sectionButtons.boss).toEqual(expect.objectContaining({
        disabled: true,
        unwired: "incomplete"
      }));
      await expect(page.locator('[data-section-preset="boss"]')).toHaveAttribute("title", /Incomplete: Boss is not defined/);

      await page.locator('[data-section-preset="intro"]').click();
      await page.locator("#playSectionButton").click();
      await expect(page.locator("#instrumentGridTransportState")).toContainText("Playing section: Intro");
      await expect.poll(async () => page.locator("#instrumentGridTransportState").textContent(), { timeout: 4000 }).toContain("Timing preview complete: Intro");
      await expect(page.locator("#playButton")).toBeEnabled();
      await expect(page.locator("#stopButton")).toBeDisabled();
      expect(await page.evaluate(() => window.__midiStudioV2App.previewSynth.getSnapshot().playing)).toBe(false);

      await page.locator("#instrumentGridLoopStartSelect").selectOption("Intro");
      await page.locator("#instrumentGridLoopEndSelect").selectOption("Intro");
      await page.locator("#playLoopButton").click();
      await expect(page.locator("#instrumentGridTransportState")).toContainText("Playing loop: Intro to Intro");
      const loopSteps = await page.evaluate(async () => {
        const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay));
        const values = [window.__midiStudioV2App.instrumentGrid.playheadStep];
        for (let index = 0; index < 8; index += 1) {
          await sleep(90);
          values.push(window.__midiStudioV2App.instrumentGrid.playheadStep);
        }
        return values;
      });
      expect(new Set(loopSteps).size).toBeGreaterThan(1);
      expect(loopSteps).toContain(0);
      await expect(octaveTimelineCanvas(page)).toHaveAttribute("data-playhead-section", "Intro");
      await page.locator("#stopTimingPreviewButton").click();
      await expect(page.locator("#instrumentGridTransportState")).toContainText("Preview Synth timing preview stopped.");

      await page.locator("#loopToggle").setChecked(false);
      await page.locator("#playButton").click();
      await expect(page.locator("#playButton")).toBeDisabled();
      await expect(page.locator("#stopButton")).toBeEnabled();
      await expect.poll(async () => page.locator("#playButton").isEnabled(), { timeout: 4000 }).toBe(true);
      await expect(page.locator("#stopButton")).toBeDisabled();
      await expect(page.locator("#statusLog")).toHaveValue(/OK Preview Synth section playback complete: Intro\./);

      await page.locator("#loopToggle").setChecked(true);
      await page.locator("#playButton").click();
      await expect(page.locator("#playButton")).toBeDisabled();
      await expect(page.locator("#stopButton")).toBeEnabled();
      await page.waitForFunction(() => window.__midiStudioV2App.instrumentGrid.playheadStep > 0);
      await page.locator("#stopButton").click();
      await expect(page.locator("#stopButton")).toBeDisabled();
      await expect(page.locator("#playButton")).toBeEnabled();

      await selectMidiStudioTab(page, "song-setup");
      await expect(page.locator("#songSheetDragDropSequenceButton")).toHaveAttribute("data-midi-studio-unwired", "not-implemented");
      await expect(page.locator("#songSheetDragDropSequenceButton")).toHaveAttribute("title", /Not implemented:/);

      const controls = [];
      for (const tabId of ["song-setup", "studio", "instruments", "auto-create-parts", "midi-import", "diagnostics", "export"]) {
        await selectMidiStudioTab(page, tabId);
        if (tabId === "studio") {
          await waitForCanvasRender(page);
        }
        controls.push(...await visibleMidiStudioControlOwnership(page, tabId));
      }
      const editableOwnersByCanonical = new Map();
      controls
        .filter((control) => control.editable && control.kind === "canonical")
        .forEach((control) => {
          const owners = editableOwnersByCanonical.get(control.canonical) || new Set();
          owners.add(control.owner);
          editableOwnersByCanonical.set(control.canonical, owners);
        });
      const duplicateEditableOwners = Array.from(editableOwnersByCanonical.entries())
        .filter(([, owners]) => owners.size > 1)
        .map(([canonical, owners]) => ({ canonical, owners: Array.from(owners).sort() }));
      expect(duplicateEditableOwners).toEqual([]);
    } finally {
      await workspaceV2CoverageReporter.stop(page);
      await server.close();
    }
  });

  test("validates PR072-080 song architecture lane decisions", async ({ page }) => {
    await page.setViewportSize({ width: 1600, height: 900 });
    const server = await openMidiStudioForImport(page);
    try {
      await page.locator("#toolImportManifestInput").setInputFiles(uatManifestPath);
      await selectMidiStudioTab(page, "song-setup");

      const classificationInput = page.locator("#songDetails [data-song-detail-field='classification']");
      await expect(classificationInput).toHaveAttribute("type", "text");
      await expect(page.locator("[data-song-detail-help='classification']")).toHaveAttribute("title", /Underwater/);
      await expect(page.locator("[data-song-detail-help='classification']")).toHaveAttribute("title", /Chase/);
      await classificationInput.fill("Underwater");
      await page.locator("#songDetails [data-song-detail-field='name']").fill("Forest Theme");
      await expect(page.locator("#songDetails [data-song-detail-field='id']")).toHaveJSProperty("readOnly", true);
      await expect(page.locator("#songDetails [data-song-detail-field='id']")).toHaveValue("forestTheme-Underwater");
      await expect(page.locator("#songDetails [data-song-detail-field='tags']")).toHaveCount(0);
      await expect(page.locator("#songDetails [data-song-detail-field='usage']")).toHaveCount(0);

      await fillSongSheetSectionBuilder(page, "Intro: G C G D\nVerse: G Em C D\nChorus: C G Am F\nBridge:\nOutro: G");
      await page.locator("#songSheetAddCustomSectionButton").click();
      await expect(page.locator("#songSheetCustomSectionsInput")).toHaveValue(/Custom1: $/);
      await page.locator("#songSheetCustomSectionsInput").fill("Custom1: F G");
      await expect(page.locator("#songSheetAvailableSectionsList option")).toHaveText([
        "Intro - 4 bars / 4 chords",
        "Verse - 4 bars / 4 chords",
        "Chorus - 4 bars / 4 chords",
        "Outro - 1 bar / 1 chord",
        "Custom1 - 2 bars / 2 chords"
      ]);
      await expect(page.locator("#songSheetAvailableSectionsList option", { hasText: "Bridge" })).toHaveCount(0);
      const availableSections = await page.locator("#songSheetAvailableSectionsList option").evaluateAll((options) => options.map((option) => ({
        barCount: option.dataset.songSheetSectionBarCount,
        chordCount: option.dataset.songSheetSectionChordCount,
        colorIndex: option.dataset.songSheetSectionColorIndex,
        label: option.value,
        text: option.textContent
      })));
      expect(availableSections.find((section) => section.label === "Intro")).toEqual(expect.objectContaining({
        barCount: "4",
        chordCount: "4",
        colorIndex: "0",
        text: "Intro - 4 bars / 4 chords"
      }));
      expect(availableSections.find((section) => section.label === "Custom1")).toEqual(expect.objectContaining({
        barCount: "2",
        chordCount: "2"
      }));

      await expect(page.locator("#songSheetApplyChordsPadInput")).toBeChecked();
      await expect(page.locator("#songSheetApplyBassInput")).toBeChecked();
      await expect(page.locator("#songSheetApplyDrumsInput")).toBeChecked();
      await expect(page.locator("#songSheetApplyLeadInput")).not.toBeChecked();
      await clearSongSheetSequence(page);
      await addSongSheetSequenceLabels(page, ["Intro", "Verse", "Chorus"]);
      await page.locator("#songSheetSequenceList").selectOption({ index: 1 });
      await page.locator("#songSheetDuplicateSequenceButton").click();
      await expect(page.locator("#songSheetSequenceList option")).toHaveText(["Intro", "Verse", "Verse", "Chorus"]);
      await page.locator("#songSheetSequenceMoveDownButton").click();
      await expect(page.locator("#songSheetSequenceList option")).toHaveText(["Intro", "Verse", "Chorus", "Verse"]);
      await page.locator("#songSheetSequenceMoveUpButton").click();
      await page.locator("#songSheetSequenceRemoveButton").click();
      await addSongSheetSequenceLabels(page, ["Intro", "Verse", "Chorus", "Custom1", "Outro"]);
      const sequence = "Intro, Verse, Chorus, Custom1, Outro";
      await expect(page.locator("#songSheetSequenceInput")).toHaveValue(sequence);
      await expect(page.locator("#songSheetDragDropSequenceButton")).toHaveAttribute("data-midi-studio-unwired", "not-implemented");

      await page.locator("#parseSongSheetButton").click();
      await expect(page.locator("#songSheetSummary [data-song-sheet-summary-field='sequence'] dd")).toHaveText(sequence);
      await expect(page.locator("#songSheetContent [data-song-sheet-warning-field]")).toHaveCount(0);
      await expect(page.locator("#songSheetWarningsDetails [data-song-sheet-warning-field='song-sheet-warnings']")).toContainText("none");
      const canonical = await page.evaluate(() => {
        const app = window.__midiStudioV2App;
        const song = app.selectedSong();
        const gridResult = app.currentInstrumentGridResult();
        return {
          applyTargets: song.studioArrangement.songSheet.applyTargets,
          chordEvents: gridResult.timeline.filter((event) => event.lane === "chords").length,
          leadEvents: gridResult.timeline.filter((event) => event.lane === "lead").length,
          sectionColors: gridResult.sections.map((section) => ({ colorIndex: section.colorIndex, label: section.label })),
          sectionLabels: gridResult.sections.map((section) => section.label),
          sections: song.studioArrangement.sections,
          sequence: song.studioArrangement.songSheet.sequence,
          songSheetSections: song.studioArrangement.songSheet.sections
        };
      });
      expect(canonical).toEqual(expect.objectContaining({
        applyTargets: {
          bass: true,
          chordsPad: true,
          drums: true,
          lead: false
        },
        sectionLabels: ["Intro", "Verse", "Chorus", "Custom1", "Outro"],
        sections: "Intro:4, Verse:4, Chorus:4, Custom1:2, Outro:1",
        sequence,
        songSheetSections: "Intro: G C G D\nVerse: G Em C D\nChorus: C G Am F\nOutro: G\nCustom1: F G"
      }));
      expect(canonical.chordEvents).toBeGreaterThan(0);
      expect(canonical.leadEvents).toBe(0);

      await selectMidiStudioTab(page, "studio");
      await waitForCanvasRender(page);
      const canvasState = await canvasTimelineState(page);
      expect(canvasState.sections.map((section) => section.label)).toEqual(canonical.sectionLabels);
      expect(canvasState.sections.map((section) => section.colorIndex)).toEqual(canonical.sectionColors.map((section) => section.colorIndex));
      await timelineQuickInstrumentRow(page, "bass").locator("[data-quick-instrument-label='bass']").click();
      expect(await page.evaluate(() => window.__midiStudioV2App.instrumentGrid.selectedInstrumentId)).toBe("bass");
      await selectMidiStudioTab(page, "instruments");
      await expect(instrumentRow(page, "bass")).toHaveClass(/is-selected/);
      await expect(page.locator("#instrumentAuditionKeyboard")).not.toHaveAttribute("data-midi-studio-unwired");

      await selectMidiStudioTab(page, "export");
      await page.locator("#renderedExportTargetTypeSelect").selectOption("wav");
      await expect(page.locator("#renderedExportSaveButton")).toHaveText("Save WAV");
      await page.locator("#renderedExportTargetTypeSelect").selectOption("mp3");
      await expect(page.locator("#renderedExportSaveButton")).toHaveText("Save MP3");
      await page.locator("#renderedExportTargetTypeSelect").selectOption("ogg");
      await expect(page.locator("#renderedExportSaveButton")).toHaveText("Save OGG");
      await expect(page.locator("#futureSoundFontSelect")).toHaveAttribute("data-midi-studio-unwired", "not-implemented");
      await expect(page.locator("#futureUndoButton")).toHaveAttribute("data-midi-studio-unwired", "not-implemented");

      await selectMidiStudioTab(page, "song-setup");
      const warningsHeader = page.locator('.accordion-v2__header[aria-controls="songSheetWarningsContent"]');
      await warningsHeader.click();
      await expect(warningsHeader).toHaveAttribute("aria-expanded", "false");
      await expect(page.locator("#songSheetWarningsContent")).toBeHidden();
      await warningsHeader.click();
      await expect(warningsHeader).toHaveAttribute("aria-expanded", "true");
      await expect(page.locator("#songSheetWarningsContent")).toBeVisible();

      await selectMidiStudioTab(page, "studio");
      await page.locator("#playButton").click();
      await expect(page.locator("#playButton")).toBeDisabled();
      await expect(page.locator("#stopButton")).toBeEnabled();
      await page.locator("#stopButton").click();
      await expect(page.locator("#stopButton")).toBeDisabled();
      await expect(page.locator("#playButton")).toBeEnabled();
    } finally {
      await workspaceV2CoverageReporter.stop(page);
      await server.close();
    }
  });

  test("validates PR081-084 song builder generation and timeline section visibility", async ({ page }) => {
    await page.setViewportSize({ width: 1600, height: 900 });
    const server = await openMidiStudioForImport(page);
    try {
      await page.locator("#toolImportManifestInput").setInputFiles(uatManifestPath);
      await selectMidiStudioTab(page, "song-setup");

      await fillSongSheetSectionBuilder(page, "Intro: G C\nVerse: G Em C D\nChorus: C G\nBridge:\nOutro: D\nBreak: F G");
      await expect(page.locator("[data-song-sheet-section-metrics='Intro']")).toContainText("G C");
      await expect(page.locator("[data-song-sheet-section-metrics='Intro']")).toContainText("2 bars");
      await expect(page.locator("[data-song-sheet-section-metrics='Intro']")).toHaveAttribute("data-song-sheet-section-duration-seconds", /\d/);
      await expect(page.locator("[data-song-sheet-section-metrics='Bridge']")).toHaveText("Empty");
      await expect(page.locator("[data-song-sheet-section-metrics='Bridge']")).toHaveAttribute("data-song-sheet-section-populated", "false");
      await expect(page.locator("[data-song-sheet-custom-section-metrics]")).toContainText("Break: F G");
      await expect(page.locator("#songSheetAvailableSectionsList option")).toHaveText([
        "Intro - 2 bars / 2 chords",
        "Verse - 4 bars / 4 chords",
        "Chorus - 2 bars / 2 chords",
        "Outro - 1 bar / 1 chord",
        "Break - 2 bars / 2 chords"
      ]);
      await expect(page.locator("#songSheetAvailableSectionsList option", { hasText: "Bridge" })).toHaveCount(0);

      await clearSongSheetSequence(page);
      await addSongSheetSequenceLabels(page, ["Intro", "Verse", "Chorus"]);
      await page.locator("#songSheetSequenceList").selectOption({ index: 1 });
      await page.locator("#songSheetDuplicateSequenceButton").click();
      await expect(page.locator("#songSheetSequenceList option")).toHaveText(["Intro", "Verse", "Verse", "Chorus"]);
      await page.locator("#songSheetSequenceMoveDownButton").click();
      await expect(page.locator("#songSheetSequenceList option")).toHaveText(["Intro", "Verse", "Chorus", "Verse"]);
      await page.locator("#songSheetSequenceMoveUpButton").click();
      await page.locator("#songSheetSequenceRemoveButton").click();
      await addSongSheetSequenceLabels(page, ["Intro", "Verse", "Chorus", "Verse", "Outro"]);
      await page.locator("#songSheetSequenceList").selectOption({ index: 3 });
      await expect(page.locator("#songSheetSequenceList")).toHaveAttribute("data-song-sheet-selected-section", "Verse");
      await expect(page.locator("#songSheetSequenceList option").nth(3)).toHaveAttribute("data-song-sheet-sequence-selected", "true");
      const selectedSequenceColor = await page.locator("#songSheetSequenceList option").nth(3).getAttribute("data-song-sheet-section-color-index");
      expect(selectedSequenceColor).toBe(await page.locator("#songSheetSequenceList").getAttribute("data-song-sheet-selected-section-color-index"));

      const sequence = "Intro, Verse, Chorus, Verse, Outro";
      await expect(page.locator("#songSheetApplyChordsPadInput")).toBeChecked();
      await expect(page.locator("#songSheetApplyBassInput")).toBeChecked();
      await expect(page.locator("#songSheetApplyDrumsInput")).toBeChecked();
      await expect(page.locator("#songSheetApplyLeadInput")).not.toBeChecked();
      await page.locator("#parseSongSheetButton").click();
      await expect(page.locator("#songSheetSummary [data-song-sheet-summary-field='sequence'] dd")).toHaveText(sequence);
      await expect(page.locator("#songSheetSummary [data-song-sheet-summary-field='sections-used'] dd")).toHaveText(sequence);
      await expect(page.locator("#songSheetSummary [data-song-sheet-summary-field='bars-generated'] dd")).toHaveText("13");
      await expect(page.locator("#songSheetSummary [data-song-sheet-summary-field='notes-generated'] dd")).toHaveText(/\d+/);
      await expect(page.locator("#songSheetSummary [data-song-sheet-summary-field='target-lanes-affected'] dd")).toHaveText("Chords/Pad, Bass, Drums");

      const generated = await page.evaluate(() => {
        const app = window.__midiStudioV2App;
        const song = app.selectedSong();
        const gridResult = app.currentInstrumentGridResult();
        return {
          bars: gridResult.barCount,
          chordEvents: gridResult.timeline.filter((event) => event.lane === "chords").length,
          drumEvents: gridResult.timeline.filter((event) => event.lane === "drums").length,
          json: document.querySelector("#inspectorOutput").textContent,
          leadEvents: gridResult.timeline.filter((event) => event.lane === "lead").length,
          noteSummary: document.querySelector("[data-song-sheet-summary-field='notes-generated'] dd")?.textContent,
          sectionLabels: gridResult.sections.map((section) => section.label),
          sections: song.studioArrangement.sections,
          sequence: song.studioArrangement.songSheet.sequence,
          songSheetSections: song.studioArrangement.songSheet.sections
        };
      });
      expect(generated).toEqual(expect.objectContaining({
        bars: 13,
        sectionLabels: ["Intro", "Verse", "Chorus", "Verse", "Outro"],
        sections: "Intro:2, Verse:4, Chorus:2, Verse:4, Outro:1",
        sequence,
        songSheetSections: "Intro: G C\nVerse: G Em C D\nChorus: C G\nOutro: D\nBreak: F G"
      }));
      expect(Number(generated.noteSummary)).toBeGreaterThan(0);
      expect(generated.chordEvents).toBeGreaterThan(0);
      expect(generated.drumEvents).toBeGreaterThan(0);
      expect(generated.leadEvents).toBe(0);
      expect(generated.json).toContain('"sequence": "Intro, Verse, Chorus, Verse, Outro"');

      await selectMidiStudioTab(page, "studio");
      await waitForCanvasRender(page);
      const canvasState = await canvasTimelineState(page);
      expect(canvasState.sectionHeaderLabels).toEqual(["Intro", "Verse", "Chorus", "Verse", "Outro"]);
      expect(canvasState.sections.map((section) => section.label)).toEqual(generated.sectionLabels);
      expect(canvasState.sections[1].color).toBe(canvasState.sections[3].color);
      await expect(octaveTimelineCanvas(page)).toHaveAttribute("data-section-header-labels", "Intro|Verse|Chorus|Verse|Outro");
      expect(await page.evaluate(() => {
        const list = document.querySelector("#songSheetSequenceList");
        list.selectedIndex = 0;
        list.dispatchEvent(new Event("change", { bubbles: true }));
        return list.selectedIndex;
      })).toBe(0);
      await clickCanvasSectionHeader(page, "Verse", 3);
      await expect.poll(async () => page.evaluate(() => document.querySelector("#songSheetSequenceList").selectedIndex)).toBe(3);
      await expect(page.locator("#songSheetSequenceList")).toHaveAttribute("data-song-sheet-selected-section", "Verse");
      await expect(octaveTimelineCanvas(page)).toHaveAttribute("data-playback-section", "Verse");
      const selectedTimelineSection = await canvasTimelineState(page);
      expect(selectedTimelineSection.playbackSection).toEqual(expect.objectContaining({
        index: 3,
        label: "Verse"
      }));

      await page.locator("#playButton").click();
      await expect(page.locator("#playButton")).toBeDisabled();
      await expect(page.locator("#stopButton")).toBeEnabled();
      await page.locator("#stopButton").click();
      await expect(page.locator("#stopButton")).toBeDisabled();
      await expect(page.locator("#playButton")).toBeEnabled();
    } finally {
      await workspaceV2CoverageReporter.stop(page);
      await server.close();
    }
  });

  test("validates PR085-088 composition mapping regenerate sync audition and playback states", async ({ page }) => {
    await page.setViewportSize({ width: 1600, height: 900 });
    const server = await openMidiStudioForImport(page);
    try {
      await page.locator("#toolImportManifestInput").setInputFiles(uatManifestPath);
      await selectMidiStudioTab(page, "song-setup");
      await page.locator("#songSheetTempoInput").fill("960");
      await fillSongSheetSectionBuilder(page, "Intro: G C\nVerse: G Em\nChorus: C G\nBridge:\nOutro:\nBreak: F");
      await clearSongSheetSequence(page);
      await addSongSheetSequenceLabels(page, ["Intro", "Verse", "Chorus"]);
      await page.locator("#songSheetApplyChordsPadInput").setChecked(true);
      await page.locator("#songSheetApplyBassInput").setChecked(true);
      await page.locator("#songSheetApplyDrumsInput").setChecked(false);
      await page.locator("#songSheetApplyLeadInput").setChecked(false);
      await page.locator("#parseSongSheetButton").click();

      await expect(page.locator("#songSheetSummary [data-song-sheet-summary-field='generation-targets'] dd")).toHaveText("Chords/Pad, Bass");
      await expect(page.locator("#songSheetSummary [data-song-sheet-summary-field='lane-mapping'] dd")).toHaveText("Chords/Pad -> chords, pad; Bass -> bass; Drums -> skipped; Lead -> skipped");
      await expect(page.locator("#songSheetSummary [data-song-sheet-summary-field='target-lanes-affected'] dd")).toHaveText("Chords/Pad, Bass");
      await expect(page.locator("#songSheetSummary [data-song-sheet-summary-field='bars-generated'] dd")).toHaveText("6");

      await selectMidiStudioTab(page, "auto-create-parts");
      await page.locator(".midi-studio-v2__advanced-lane-source").evaluate((details) => {
        details.open = true;
      });
      const manualLead = "C5 - - - | D5 - - - | E5 - - - | F5 - - - | G5 - - - | A5 - - -";
      await page.locator("#instrumentGridLeadInput").fill(manualLead);
      await page.locator("#normalizeInstrumentGridButton").click();
      await selectMidiStudioTab(page, "song-setup");
      await page.locator("#regenerateArrangementButton").click();
      await expect(page.locator("#instrumentGridLeadInput")).toHaveValue(manualLead);
      await expect(page.locator("#songSheetSummary [data-song-sheet-summary-field='manual-lanes-preserved'] dd")).toContainText("kept lead");
      await expect(page.locator("#statusLog")).toHaveValue(/OK Regenerated arrangement for Chords\/Pad, Bass: 6 bars, \d+ notes\. Manual lanes .*kept lead/);

      await page.locator("#songSheetApplyLeadInput").setChecked(true);
      await page.locator("#regenerateArrangementButton").click();
      await expect(page.locator("#songSheetSummary [data-song-sheet-summary-field='generation-targets'] dd")).toHaveText("Chords/Pad, Bass, Lead");
      await expect(page.locator("#instrumentGridLeadInput")).not.toHaveValue(manualLead);

      await page.locator("#songSheetSectionIntroInput").fill("G C D");
      await expect(page.locator("#songSheetSummary [data-song-sheet-summary-field='bars-generated'] dd")).toHaveText("7");
      await expect(page.locator("#instrumentGridSectionsInput")).toHaveValue("Intro:3, Verse:2, Chorus:2");

      const synced = await page.evaluate(() => {
        const app = window.__midiStudioV2App;
        const song = app.selectedSong();
        const gridResult = app.currentInstrumentGridResult();
        return {
          applyTargets: song.studioArrangement.songSheet.applyTargets,
          barCount: gridResult.barCount,
          leadEvents: gridResult.timeline.filter((event) => event.lane === "lead").length,
          sections: song.studioArrangement.sections,
          sequence: song.studioArrangement.songSheet.sequence
        };
      });
      expect(synced).toEqual(expect.objectContaining({
        applyTargets: { bass: true, chordsPad: true, drums: false, lead: true },
        barCount: 7,
        sections: "Intro:3, Verse:2, Chorus:2",
        sequence: "Intro, Verse, Chorus"
      }));
      expect(synced.leadEvents).toBeGreaterThan(0);

      await selectMidiStudioTab(page, "studio");
      await waitForCanvasRender(page);
      expect((await canvasTimelineState(page)).sections.map((section) => section.label)).toEqual(["Intro", "Verse", "Chorus"]);
      await timelineQuickInstrumentRow(page, "lead").locator("[data-quick-instrument-label='lead']").click();
      await clickCanvasKeyboardKey(page, "C5");
      await expect(page.locator("#statusLog")).toHaveValue(/INFO Auditioned C5 for Lead/);

      await page.locator("#loopToggle").setChecked(false);
      await page.locator("#playButton").click();
      await expect(page.locator("#playbackState")).toContainText("Playing audible preview");
      await expect.poll(async () => (await page.locator("#playbackState").textContent()) || "", { timeout: 4000 }).toContain("Completed audible preview");
      await expect(page.locator("#playButton")).toBeEnabled();
      await expect(page.locator("#stopButton")).toBeDisabled();

      await page.locator("#loopToggle").setChecked(true);
      await page.locator("#playButton").click();
      await expect(page.locator("#playbackState")).toContainText("(looping)");
      await expect(page.locator("#stopButton")).toBeEnabled();
      await page.locator("#stopButton").click();
      await expect(page.locator("#playbackState")).toContainText("Stopped audible preview");
      await expect(page.locator("#playButton")).toBeEnabled();
    } finally {
      await workspaceV2CoverageReporter.stop(page);
      await server.close();
    }
  });

  test("validates PR089-096 production templates arrangement playback instruments and export readiness", async ({ page }) => {
    await page.setViewportSize({ width: 1600, height: 900 });
    const server = await openMidiStudioForImport(page);
    try {
      await page.locator("#toolImportManifestInput").setInputFiles(uatManifestPath);
      await selectMidiStudioTab(page, "song-setup");
      const classificationInput = page.locator("#songDetails [data-song-detail-field='classification']");
      await classificationInput.fill("Loop");
      await expect(page.locator("#songDetails [data-song-detail-field='id']")).toHaveValue("camptownRacesUatReel-Loop");

      await expect(page.locator("#songSheetTemplateSectionSelect option")).toContainText(["Intro", "Verse", "Chorus", "Bridge", "Outro"]);
      await fillSongSheetSectionBuilder(page, "Verse: G Em C D\nSolo: Dm G");
      await page.locator("#songSheetTemplateSectionSelect").selectOption("Verse");
      await expect(page.locator("#songSheetTemplatePreview")).toHaveText("Verse template: C Am F G");
      await page.locator("#songSheetApplySectionTemplateButton").click();
      await expect(page.locator("#songSheetSectionVerseInput")).toHaveValue("C Am F G");
      await expect(page.locator("#songSheetCustomSectionsInput")).toHaveValue("Solo: Dm G");
      await expect(page.locator("#songSheetAvailableSectionsList option")).toHaveCount(2);
      await expect(page.locator("#songSheetAvailableSectionsList option")).toContainText([
        "Verse - 4 bars / 4 chords",
        "Solo - 2 bars / 2 chords"
      ]);

      await addSongSheetSequenceLabels(page, ["Verse", "Solo"]);
      await page.locator("#songSheetApplyChordsPadInput").setChecked(true);
      await page.locator("#songSheetApplyBassInput").setChecked(true);
      await page.locator("#songSheetApplyDrumsInput").setChecked(false);
      await page.locator("#songSheetApplyLeadInput").setChecked(true);
      await page.locator("#parseSongSheetButton").click();
      await expect(page.locator("#songSheetSummary [data-song-sheet-summary-field='generation-targets'] dd")).toHaveText("Chords/Pad, Bass, Lead");
      await expect(page.locator("#instrumentGridSectionsInput")).toHaveValue("Verse:4, Solo:2");

      await selectMidiStudioTab(page, "auto-create-parts");
      await page.locator(".midi-studio-v2__advanced-lane-source").evaluate((details) => {
        details.open = true;
      });
      const manualLead = "F5 F5 F5 F5 | F5 F5 F5 F5 | F5 F5 F5 F5 | F5 F5 F5 F5 | F5 F5 F5 F5 | F5 F5 F5 F5";
      await page.locator("#instrumentGridLeadInput").fill(manualLead);
      await page.locator("#normalizeInstrumentGridButton").click();
      await selectMidiStudioTab(page, "studio");
      await waitForCanvasRender(page);
      const manualLeadCounts = page.locator("#timelineInstrumentQuickList [data-arrangement-source-counts='lead']");
      await expect(manualLeadCounts).toContainText("Generated 0 / Manual 24");
      await expect(manualLeadCounts).toHaveAttribute("data-generated-count", "0");
      await expect(manualLeadCounts).toHaveAttribute("data-manual-count", "24");
      await selectMidiStudioTab(page, "song-setup");
      await page.locator("#regenerateArrangementButton").click();
      await expect(page.locator("#regenerateArrangementButton")).toHaveAttribute("data-regeneration-pending", "true");
      await expect(page.locator("#instrumentGridLeadInput")).toHaveValue(manualLead);
      await expect.poll(async () => Number(await page.locator("#songSheetSummary [data-song-sheet-summary-field='generated-notes-before-regeneration'] dd").textContent())).toBeGreaterThan(0);
      await expect(page.locator("#songSheetSummary [data-song-sheet-summary-field='manual-notes-before-regeneration'] dd")).toHaveText("24");
      await expect(page.locator("#songSheetSummary [data-song-sheet-summary-field='regeneration-protection'] dd")).toContainText("Regeneration may overwrite 24 manual notes");
      await expect(page.locator("#statusLog")).toHaveValue(/WARN Regeneration may overwrite 24 manual notes/);
      await page.locator("#regenerateArrangementButton").click();
      await expect(page.locator("#regenerateArrangementButton")).toHaveAttribute("data-regeneration-pending", "false");
      await expect(page.locator("#instrumentGridLeadInput")).not.toHaveValue(manualLead);

      const canonical = await page.evaluate(() => {
        const app = window.__midiStudioV2App;
        const song = app.selectedSong();
        const grid = app.currentInstrumentGridResult();
        return {
          barCount: grid.barCount,
          classification: song.classification,
          generatedId: song.id,
          leadEvents: grid.timeline.filter((event) => event.lane === "lead").length,
          sequence: song.studioArrangement.songSheet.sequence,
          sections: song.studioArrangement.songSheet.sections
        };
      });
      expect(canonical).toEqual(expect.objectContaining({
        barCount: 6,
        classification: "Loop",
        generatedId: "camptownRacesUatReel-Loop",
        leadEvents: 24,
        sequence: "Verse, Solo"
      }));
      expect(canonical.sections).toContain("Solo: Dm G");

      await selectMidiStudioTab(page, "studio");
      await waitForCanvasRender(page);
      const generatedLeadCounts = page.locator("#timelineInstrumentQuickList [data-arrangement-source-counts='lead']");
      await expect(generatedLeadCounts).toContainText("Generated 24 / Manual 0");
      await expect(generatedLeadCounts).toHaveAttribute("data-generated-count", "24");
      await expect(generatedLeadCounts).toHaveAttribute("data-manual-count", "0");
      const canvasSourceState = await canvasTimelineState(page);
      expect(canvasSourceState.sourceCounts.generated).toBeGreaterThan(0);
      expect(canvasSourceState.sourceCounts.generated + canvasSourceState.sourceCounts.manual).toBeGreaterThan(0);
      await expect(octaveTimelineCanvas(page)).toHaveAttribute("data-generated-note-count", /\d+/);
      await expect(octaveTimelineCanvas(page)).toHaveAttribute("data-manual-note-count", /\d+/);

      await page.locator("#instrumentGridSectionSelect").selectOption("Verse");
      await page.locator("#playSectionButton").click();
      await expect(page.locator("#instrumentGridTransportState")).toContainText("Playing section: Verse");
      await expect(page.locator("#instrumentGridOutput")).toHaveAttribute("data-preview-playback-mode", "section");
      await expect(octaveTimelineCanvas(page)).toHaveAttribute("data-playback-section", "Verse");
      await expect(octaveTimelineCanvas(page)).toHaveAttribute("data-playback-section-color", /#/);
      await page.locator("#stopTimingPreviewButton").click();
      await expect(page.locator("#instrumentGridTransportState")).toContainText("Preview Synth timing preview stopped.");

      await page.locator("#playSequenceButton").click();
      await expect(page.locator("#instrumentGridTransportState")).toContainText("Playing sequence: Song Sequence");
      await expect(page.locator("#instrumentGridOutput")).toHaveAttribute("data-preview-playback-mode", "sequence");
      await expect(octaveTimelineCanvas(page)).toHaveAttribute("data-playback-section", "Verse");
      await page.locator("#stopTimingPreviewButton").click();

      await page.locator("#instrumentGridLoopStartSelect").selectOption("Verse");
      await page.locator("#instrumentGridLoopEndSelect").selectOption("Solo");
      await page.locator("#playLoopButton").click();
      await expect(page.locator("#instrumentGridTransportState")).toContainText("Playing loop: Verse to Solo");
      await expect(page.locator("#instrumentGridOutput")).toHaveAttribute("data-preview-playback-mode", "loop");
      await page.locator("#stopTimingPreviewButton").click();

      await page.locator("#duplicateInstrumentRowButton").click();
      await expect(timelineQuickInstrumentRow(page, "lead-1")).toHaveClass(/is-selected/);
      await expect(page.locator("#timelineInstrumentQuickList")).toHaveAttribute("data-selected-instrument-id", "lead-1");
      await page.locator("#moveInstrumentUpButton").click();
      await expect(page.locator("#timelineInstrumentQuickList")).toHaveAttribute("data-instrument-workflow-status", /Moved Lead 1 up/);
      await page.locator("#moveInstrumentDownButton").click();
      await expect(page.locator("#timelineInstrumentQuickList")).toHaveAttribute("data-selected-instrument-id", "lead-1");
      await selectMidiStudioTab(page, "instruments");
      await expect(instrumentRow(page, "lead-1")).toHaveClass(/is-selected/);
      await expect(page.locator("#instrumentAuditionKeyboard")).toHaveAttribute("data-selected-instrument-id", "lead-1");
      await expect(page.locator("#selectedInstrumentEditor [data-instrument-playable-range-lane='lead-1']")).toHaveText("C3 to B6");
      await expect(page.locator("#instrumentAuditionKeyboard")).toHaveAttribute("data-playable-range", "C3 to B6");
      await expect(page.locator("#instrumentAuditionKeyboard [data-audition-range-summary='lead-1']")).toHaveText("C3 to B6");
      await setInputValue(page, "#previewOctaveLowLead1Input", "4");
      await expect(page.locator("#selectedInstrumentEditor [data-instrument-playable-range-lane='lead-1']")).toHaveText("C4 to B6");
      await expect(page.locator("#instrumentAuditionKeyboard")).toHaveAttribute("data-playable-range", "C4 to B6");
      await expect(page.locator("#instrumentAuditionKeyboard [data-audition-note='C3']")).toHaveCount(0);
      await expect(page.locator("#instrumentAuditionKeyboard [data-audition-note='C4']")).toHaveCount(1);
      await page.locator("#instrumentAuditionKeyboard [data-audition-note='C5']").click();
      await expect(page.locator("#statusLog")).toHaveValue(/INFO Auditioned C5 for Lead 1/);

      await selectMidiStudioTab(page, "export");
      await expect(page.locator("#exportRenderSource [data-export-field='selected-song'] dd")).toHaveText("Camptown Races UAT Reel");
      await expect(page.locator("#exportRenderSource [data-export-field='classification'] dd")).toHaveText("Loop");
      await expect(page.locator("#exportRenderSource [data-export-field='generated-id'] dd")).toHaveText("camptownRacesUatReel-Loop");
      await expect(page.locator("#exportRenderSource [data-export-field='sequence-length'] dd")).toHaveText("2");
      await expect.poll(async () => Number(await page.locator("#exportRenderSource [data-export-field='note-count'] dd").textContent())).toBeGreaterThan(0);
      await expect.poll(async () => Number(await page.locator("#exportRenderSource [data-export-field='instrument-count'] dd").textContent())).toBeGreaterThan(4);
      await expect(page.locator("#exportRenderSource [data-export-field='target-output-formats'] dd")).toHaveText("WAV: missing; MP3: missing; OGG: missing");
      await expect(page.locator("#exportStatusDetails [data-export-field='status'] dd")).toContainText("WARN: Export source is ready with 2 sequence item(s)");
      await expect(page.locator("#exportStatusDetails [data-export-field='status'] dd")).toContainText("target paths are missing for WAV, MP3, OGG");
      await expect(page.locator("#futureSoundFontSelect")).toHaveAttribute("data-midi-studio-unwired", "not-implemented");
      await expect(page.locator("#renderedExportSaveButton")).toHaveText("Save WAV");
      await page.locator("#renderedExportTargetTypeSelect").selectOption("mp3");
      await expect(page.locator("#renderedExportSaveButton")).toHaveText("Save MP3");
      await page.locator("#renderedExportTargetTypeSelect").selectOption("ogg");
      await expect(page.locator("#renderedExportSaveButton")).toHaveText("Save OGG");

      await selectMidiStudioTab(page, "studio");
      await page.locator("#playButton").click();
      await expect(page.locator("#playButton")).toBeDisabled();
      await expect(page.locator("#stopButton")).toBeEnabled();
      await page.locator("#stopButton").click();
      await expect(page.locator("#playButton")).toBeEnabled();
      await expect(page.locator("#stopButton")).toBeDisabled();
    } finally {
      await workspaceV2CoverageReporter.stop(page);
      await server.close();
    }
  });

  test("validates PR097-100 classification templates section navigation and song builder summaries", async ({ page }) => {
    await page.setViewportSize({ width: 1600, height: 900 });
    const server = await openMidiStudioForImport(page);
    try {
      await page.locator("#toolImportManifestInput").setInputFiles(uatManifestPath);
      await selectMidiStudioTab(page, "song-setup");

      const classificationInput = page.locator("#songDetails [data-song-detail-field='classification']");
      await expect(classificationInput).toHaveAttribute("type", "text");
      await expect(page.locator("[data-song-detail-help='classification']")).toHaveAttribute("title", /seeds default section templates/);
      await classificationInput.fill("Underwater");
      await expect(page.locator("#songDetails [data-song-detail-field='id']")).toHaveValue("camptownRacesUatReel-Underwater");
      await expect(page.locator("#songSheetClassificationGuide")).toContainText("Underwater defaults");
      await expect(page.locator("#songSheetClassificationGuide")).toHaveAttribute("data-classification-instrument-suggestions", /Warm Pad/);
      await expect(page.locator("#songSheetClassificationGuide")).toHaveAttribute("data-classification-generation-hints", /Drums/);

      await page.locator("#songSheetSectionIntroInput").fill("Dm Gm");
      await page.locator("#songSheetSectionVerseInput").fill("G Em C D");
      await page.locator("#songSheetSectionChorusInput").fill("Bb C Dm Dm");
      await page.locator("#songSheetTemplateSectionSelect").selectOption("Verse");
      await expect(page.locator("#songSheetTemplatePreview")).toHaveText("Verse template: Dm Bb C Dm");
      await expect(page.locator("#songSheetTemplatePreview")).toHaveAttribute("data-song-sheet-template-classification", "Underwater");
      await page.locator("#songSheetApplySectionTemplateButton").click();
      await expect(page.locator("#songSheetSectionVerseInput")).toHaveValue("G Em C D Dm Bb C Dm");

      await addSongSheetSequenceLabels(page, ["Intro", "Verse", "Chorus"]);
      await expect(page.locator("#songSheetSequenceSummary")).toContainText("3 sections");
      await expect(page.locator("#songSheetSequenceSummary")).toContainText("14 bars");
      await expect(page.locator("#songSheetSequenceSummary")).toHaveAttribute("data-song-sheet-sequence-section-count", "3");
      await expect(page.locator("#songSheetSequenceSummary")).toHaveAttribute("data-song-sheet-sequence-bar-count", "14");
      await expect.poll(async () => Number(await page.locator("#songSheetSequenceSummary").getAttribute("data-song-sheet-sequence-duration-seconds"))).toBeGreaterThan(0);

      await page.locator("#parseSongSheetButton").click();
      await expect(page.locator("#songSheetSummary [data-song-sheet-summary-field='generated-bars'] dd")).toHaveText("14");
      await expect.poll(async () => Number(await page.locator("#songSheetSummary [data-song-sheet-summary-field='generated-notes'] dd").textContent())).toBeGreaterThan(0);
      await expect(page.locator("#songSheetSummary [data-song-sheet-summary-field='generated-instruments'] dd")).toContainText("Chords/Pad");
      await expect(page.locator("#songSheetSummary [data-song-sheet-summary-field='generated-instruments'] dd")).toContainText("Bass");

      await page.locator("#songSheetSequenceList").selectOption({ index: 1 });
      await expect(page.locator("#songSheetSequenceList")).toHaveAttribute("data-song-sheet-selected-section", "Verse");
      const selectedFromSequence = await page.evaluate(() => window.__midiStudioV2App.instrumentGrid.timelineCanvasState()?.selectedSection?.label || "");
      expect(selectedFromSequence).toBe("Verse");

      await selectMidiStudioTab(page, "studio");
      await waitForCanvasRender(page);
      await clickCanvasSectionHeader(page, "Chorus", 0);
      await expect(page.locator("#songSheetSequenceList")).toHaveAttribute("data-song-sheet-selected-section", "Chorus");
      const selectedOption = await page.locator("#songSheetSequenceList option").evaluateAll((options) => options.map((option) => ({
        label: option.value,
        selected: option.dataset.songSheetSequenceSelected
      })));
      expect(selectedOption).toEqual([
        { label: "Intro", selected: "false" },
        { label: "Verse", selected: "false" },
        { label: "Chorus", selected: "true" }
      ]);

      await expect(octaveTimelineCanvas(page)).toHaveAttribute("data-playback-section", "Chorus");
      await expect(octaveTimelineCanvas(page)).toHaveAttribute("data-active-playback-section-visible", "true");
      await expect(octaveTimelineCanvas(page)).toHaveAttribute("data-frozen-header", /true|false/);
      await page.locator("#playSectionButton").click();
      await expect(page.locator("#instrumentGridTransportState")).toContainText("Playing section: Chorus");
      await expect(octaveTimelineCanvas(page)).toHaveAttribute("data-playback-section", "Chorus");
      await page.locator("#stopTimingPreviewButton").click();
      await expect(page.locator("#instrumentGridTransportState")).toContainText("Preview Synth timing preview stopped.");

      await page.locator("#playButton").click();
      await expect(page.locator("#playButton")).toBeDisabled();
      await expect(page.locator("#stopButton")).toBeEnabled();
      await page.locator("#stopButton").click();
      await expect(page.locator("#playButton")).toBeEnabled();
      await expect(page.locator("#stopButton")).toBeDisabled();
    } finally {
      await workspaceV2CoverageReporter.stop(page);
      await server.close();
    }
  });

  test("validates PR101-104 reusable sections instrument presets arrangement templates and export readiness", async ({ page }) => {
    await page.setViewportSize({ width: 1600, height: 900 });
    const server = await openMidiStudioForImport(page);
    try {
      await page.locator("#toolImportManifestInput").setInputFiles(uatManifestPath);
      await selectMidiStudioTab(page, "song-setup");

      await page.locator("#songDetails [data-song-detail-field='classification']").fill("Loop");
      await page.locator("#songSheetSectionIntroInput").fill("C F");
      await page.locator("#songSheetSectionVerseInput").fill("G Em C D");
      await page.locator("#songSheetSectionChorusInput").fill("C G Am F");
      await page.locator("#songSheetSectionBridgeInput").fill("Dm G Em Am");
      await page.locator("#songSheetSectionOutroInput").fill("F G C");

      await page.locator("#songSheetAvailableSectionsList").selectOption("Verse");
      await page.locator("#songSheetSaveSectionButton").click();
      await expect(page.locator("#songSheetSectionLibrarySummary")).toContainText("Saved section asset: Verse");
      await expect(page.locator("#songSheetSectionLibrarySummary")).toHaveAttribute("data-song-sheet-section-library-count", "1");
      await expect(page.locator("#songSheetSectionLibrarySelect option")).toHaveCount(1);

      await page.locator("#songSheetSectionVerseInput").fill("");
      await expect(page.locator("#songSheetAvailableSectionsList")).not.toContainText("Verse - 4 bars");
      await page.locator("#songSheetLoadSectionButton").click();
      await expect(page.locator("#songSheetSectionVerseInput")).toHaveValue("G Em C D");
      await expect(page.locator("#songSheetSectionLibrarySummary")).toContainText("Loaded section asset: Verse");

      await page.locator("#songSheetDuplicateSectionButton").click();
      await expect(page.locator("#songSheetCustomSectionsInput")).toHaveValue(/VerseCopy1: G Em C D/);
      await expect(page.locator("#songSheetAvailableSectionsList")).toContainText("VerseCopy1 - 4 bars");
      await expect(page.locator("#songSheetSectionLibrarySummary")).toHaveAttribute("data-song-sheet-section-library-count", "2");

      await page.locator("#songSheetArrangementTemplateSelect").selectOption("intro-verse-chorus-bridge-chorus-outro");
      await expect(page.locator("#songSheetArrangementTemplateSummary")).toContainText("Intro, Verse, Chorus, Bridge, Chorus, Outro");
      await page.locator("#songSheetApplyArrangementTemplateButton").click();
      await expect(page.locator("#songSheetSequenceInput")).toHaveValue("Intro, Verse, Chorus, Bridge, Chorus, Outro");
      await expect(page.locator("#songSheetSequenceSummary")).toContainText("6 sections");
      await expect(page.locator("#songSheetSequenceSummary")).toContainText("21 bars");
      expect(await page.locator("#songSheetSequenceList option").evaluateAll((options) => options.map((option) => option.value))).toEqual([
        "Intro",
        "Verse",
        "Chorus",
        "Bridge",
        "Chorus",
        "Outro"
      ]);

      await page.locator("#parseSongSheetButton").click();
      await expect(page.locator("#songSheetSummary [data-song-sheet-summary-field='generated-bars'] dd")).toHaveText("21");
      await expect.poll(async () => Number(await page.locator("#songSheetSummary [data-song-sheet-summary-field='generated-notes'] dd").textContent())).toBeGreaterThan(0);

      await selectMidiStudioTab(page, "instruments");
      await selectInstrumentRow(page, "lead");
      const savedLeadInstrument = await instrumentSelect(page, "lead").inputValue();
      await page.locator("#saveInstrumentPresetButton").click();
      await expect(page.locator("#instrumentPresetSummary")).toContainText("Saved instrument preset");
      await expect(page.locator("#instrumentPresetSummary")).toHaveAttribute("data-instrument-preset-count", "1");
      await instrumentTypeSelect(page, "lead").selectOption("Piano");
      await expect(instrumentSelect(page, "lead")).not.toHaveValue(savedLeadInstrument);
      await page.locator("#loadInstrumentPresetButton").click();
      await expect(instrumentSelect(page, "lead")).toHaveValue(savedLeadInstrument);
      await expect(page.locator("#instrumentPresetSummary")).toContainText("Loaded instrument preset");
      await expect(page.locator("#statusLog")).toHaveValue(/OK Instrument preset loaded for Lead/);
      await page.locator("#duplicateInstrumentPresetButton").click();
      await expect(page.locator("#instrumentPresetSummary")).toHaveAttribute("data-instrument-preset-count", "2");

      const canonical = await page.evaluate(() => {
        const song = window.__midiStudioV2App.selectedSong();
        return {
          leadInstrument: song.studioArrangement.previewLaneSettings.instruments.lead,
          sections: song.studioArrangement.songSheet.sections,
          sequence: song.studioArrangement.songSheet.sequence
        };
      });
      expect(canonical.sequence).toBe("Intro, Verse, Chorus, Bridge, Chorus, Outro");
      expect(canonical.sections).toContain("VerseCopy1: G Em C D");
      expect(canonical.leadInstrument).toBe(savedLeadInstrument);

      await selectMidiStudioTab(page, "export");
      await expect(page.locator("#exportRenderSource [data-export-field='song-name'] dd")).toContainText("Camptown Races UAT Reel");
      await expect(page.locator("#exportRenderSource [data-export-field='classification'] dd")).toContainText("Loop");
      await expect(page.locator("#exportRenderSource [data-export-field='generated-id'] dd")).toContainText("camptownRacesUatReel-Loop");
      await expect(page.locator("#exportRenderSource [data-export-field='sequence-summary'] dd")).toContainText("6 sequence items");
      await expect(page.locator("#exportRenderSource [data-export-field='section-summary'] dd")).toContainText("7 populated sections / 25 bars");
      await expect(page.locator("#exportRenderSource [data-export-field='instrument-count'] dd")).toContainText("6");
      await expect.poll(async () => Number(await page.locator("#exportRenderSource [data-export-field='note-count'] dd").textContent())).toBeGreaterThan(0);
      await expect(page.locator("#renderedExportSaveButton")).toHaveText("Save WAV");
      await page.locator("#renderedExportTargetTypeSelect").selectOption("mp3");
      await expect(page.locator("#renderedExportSaveButton")).toHaveText("Save MP3");
      await page.locator("#renderedExportTargetTypeSelect").selectOption("ogg");
      await expect(page.locator("#renderedExportSaveButton")).toHaveText("Save OGG");
      await expect(page.locator("#futureSoundFontSelect")).toHaveAttribute("data-midi-studio-unwired", "not-implemented");

      await selectMidiStudioTab(page, "studio");
      await page.locator("#playButton").click();
      await expect(page.locator("#playButton")).toBeDisabled();
      await expect(page.locator("#stopButton")).toBeEnabled();
      await page.locator("#stopButton").click();
      await expect(page.locator("#playButton")).toBeEnabled();
      await expect(page.locator("#stopButton")).toBeDisabled();
    } finally {
      await workspaceV2CoverageReporter.stop(page);
      await server.close();
    }
  });

  test("derives primary song, instrument, grid, playback, and diagnostics views from the canonical selected song", async ({ page }) => {
    const server = await openMidiStudioForImport(page);
    try {
      await page.locator("#toolImportManifestInput").setInputFiles(uatManifestPath);
      await expect(page.locator("#songSheetSummary")).toHaveCount(0);
      await expect(page.locator("#songSheetSummaryContent")).toHaveCount(0);
      await expect(page.locator(".midi-studio-v2__advanced-song-sheet")).toHaveCount(0);
      await expect(page.locator("#songSheetInput")).toHaveCount(0);

      const initialState = await page.evaluate(() => {
        const app = window.__midiStudioV2App;
        const state = app.selectedSongState();
        return {
          activeSongId: app.payload.activeSongId,
          gridSongId: state.songId,
          hasOwnSelectedSongId: Object.hasOwn(app, "selectedSongId"),
          instrumentCount: Object.keys(state.arrangement.lanes).length,
          selectedSongId: app.selectedSongId,
          title: state.song.name,
          timelineCount: state.gridResult.timeline.length
        };
      });
      expect(initialState).toEqual(expect.objectContaining({
        activeSongId: "camptown-races-uat-reel",
        gridSongId: "camptown-races-uat-reel",
        hasOwnSelectedSongId: false,
        selectedSongId: "camptown-races-uat-reel",
        title: "Camptown Races UAT Reel"
      }));
      expect(initialState.instrumentCount).toBeGreaterThan(0);
      expect(initialState.timelineCount).toBeGreaterThan(0);
      await selectMidiStudioTab(page, "song-setup");
      await expect(page.locator("#songDetails input[data-song-detail-field]")).toHaveCount(0);
      await expect(page.locator("#songSheetTempoInput")).toHaveValue("144");
      await expect(page.locator("#songSheetKeyInput")).toHaveValue("G major");
      await expect(page.locator("#songSheetStyleInput")).toHaveValue("public-domain-reel");
      await expect(page.locator(".midi-studio-v2__instrument-row")).toHaveCount(initialState.instrumentCount);
      await expect(octaveCell(page, "G4", 0)).toHaveAttribute("data-note-lanes", /lead/);

      expect(await page.evaluate(() => {
        const app = window.__midiStudioV2App;
        app.selectSong("frog-hop-nursery-rhyme");
        return {
          activeSongId: app.payload.activeSongId,
          nowPlaying: document.querySelector("#nowPlayingLabel").textContent,
          selectedName: app.selectedSong()?.name || ""
        };
      })).toEqual({
        activeSongId: "frog-hop-nursery-rhyme",
        nowPlaying: "Selected: Frog Hop Nursery Rhyme UAT",
        selectedName: "Frog Hop Nursery Rhyme UAT"
      });
      await expect(page.locator("#nowPlayingLabel")).toHaveText("Selected: Frog Hop Nursery Rhyme UAT");
      await expect(page.locator("#songSheetKeyInput")).toHaveValue("C major");
      await expect(page.locator("#instrumentGridSectionsInput")).toHaveValue("hop:2, home:2");
      await expect(octaveCell(page, "C5", 0)).toHaveAttribute("data-note-lanes", /lead/);
      await expect(octaveCell(page, "G4", 0)).not.toHaveAttribute("data-note-lanes", /lead/);
      const frogState = await page.evaluate(() => {
        const app = window.__midiStudioV2App;
        const state = app.selectedSongState();
        return {
          activeSongId: app.payload.activeSongId,
          songSheetKey: document.querySelector("#songSheetKeyInput").value,
          instrumentRows: document.querySelectorAll(".midi-studio-v2__instrument-row").length,
          selectedSongId: app.selectedSongId,
          stateSongId: state.songId,
          timelineLeadZero: state.gridResult.timeline.some((event) => event.lane === "lead" && event.stepIndex === 0 && event.value === "C5")
        };
      });
      expect(frogState).toEqual({
        activeSongId: "frog-hop-nursery-rhyme",
        songSheetKey: "C major",
        instrumentRows: Object.keys(await page.evaluate(() => window.__midiStudioV2App.selectedSongState().arrangement.lanes)).length,
        selectedSongId: "frog-hop-nursery-rhyme",
        stateSongId: "frog-hop-nursery-rhyme",
        timelineLeadZero: true
      });

      const diagnostics = await audioDiagnosticsRows(page);
      expect(diagnostics["Selected song"]).toBe("Frog Hop Nursery Rhyme UAT");
      await expect(page.locator("#audioDiagnostics input, #audioDiagnostics textarea, #audioDiagnostics select, #audioDiagnostics button")).toHaveCount(0);
      expect(await page.evaluate(() => window.__midiStudioV2App.playableEventSummary().count)).toBeGreaterThan(0);
      await expect(page.locator("#playButton")).toBeEnabled();
      await expect(page.locator("#stopButton")).toBeDisabled();
      await expect(page.locator("#nowPlayingLabel")).toHaveText("Selected: Frog Hop Nursery Rhyme UAT");

      await selectMidiStudioTab(page, "export");
      await page.locator("#toolExportToolStateButton").click();
      await expect(page.locator("#inspectorOutput")).toContainText('"activeSongId": "frog-hop-nursery-rhyme"');
      expect(await fs.readFile(canonicalSongModelAuditPath, "utf8")).toContain("Canonical Model Fields");
    } finally {
      await workspaceV2CoverageReporter.stop(page);
      await server.close();
    }
  });

  test("roadmap and implementation audit exist with actual MIDI Studio V2 status markers", async () => {
    const roadmap = await fs.readFile(roadmapPath, "utf8");
    const audit = await fs.readFile(implementationAuditPath, "utf8");
    const validation = await fs.readFile(implementationAuditValidationPath, "utf8");
    expect(roadmap).toContain("[.] First priority: UAT manifest import");
    expect(roadmap).toContain("[x] UAT manifest import uses Import JSON Manifest");
    expect(roadmap).toContain("[x] Real UAT manifest fixture includes multiple MIDI Studio songs.");
    expect(roadmap).toContain("[x] Playable upbeat public-domain/traditional-style test song arrangement includes Lead, Bass, Chords/Pad, and Drums.");
    expect(roadmap).toContain("[x] Tabs organize Studio, Song Setup, Instruments, Auto-Create Parts, and Diagnostics; MIDI Import lives under Selected Song Details and export actions live in the action bar.");
    expect(roadmap).toContain("[x] Track volume, pan, mute, and solo controls live on instrument timeline rows.");
    expect(roadmap).toContain("[x] Song setup fields for tempo, key, style, intro, and loop.");
    expect(roadmap).toContain("[x] MIDI import conversion to editable tracks.");
    expect(roadmap).toContain("[ ] Rendered WAV/MP3/OGG export.");
    expect(roadmap).toContain("[ ] SoundFont and real instrument playback.");
    expect(roadmap).toContain("[.] Auto-Create Parts helpers for generated bass, pad, arpeggio, and drums.");
    expect(roadmap).toContain("[x] Diagnostics for audio state, selected song, selected section, active lanes, and warnings.");
    expect(roadmap).toContain("[ ] Optional piano roll.");
    expect(roadmap).toContain("[ ] Optional advanced MIDI event editor.");
    expect(roadmap).toContain("[.] Optional per-note velocity and duration editing.");
    expect(Array.from(roadmap.matchAll(/\[[^\]]+\]/g), ([match]) => match).every((marker) => ["[ ]", "[.]", "[x]"].includes(marker))).toBe(true);
    expect(audit).toContain("Highest Actually Applied MIDI Studio V2 PR");
    expect(audit).toContain("PR_26146_032-midi-studio-v2-fast-note-editing-and-keyboard-flow");
    expect(audit).toContain("Broken/UAT-Blocking");
    expect(audit).toContain("No current UAT-blocking MIDI Studio V2 runtime issues were found in the audited files.");
    expect(audit).toContain("UNKNOWN");
    expect(validation).toContain("Status: PASS");
  });

  test("launches and renders a valid multi-song manifest payload", async ({ page }) => {
    const server = await openMidiStudio(page);
    try {
      await expect(page.locator("body")).toHaveAttribute("data-tool-id", "midi-studio-v2");
      await expect(page.locator("body")).toHaveAttribute("data-midi-studio-launch-mode", "tool");
      await expect(page.locator("#launchModeIndicator")).toHaveCount(0);
      await expect(page.getByText("Tool Mode", { exact: true })).toHaveCount(0);
      await expect(page.locator('[data-launch-mode-nav="tool"]')).toBeVisible();
      await expect(page.locator('[data-launch-mode-nav="workspace"]')).toBeHidden();
      await expect(page.locator("#returnToWorkspaceButton")).toBeHidden();
      await expect(page.locator("[data-midi-studio-header]")).toContainText("MIDI Studio V2");
      await expect(page.locator("#songList [data-song-id]")).toHaveCount(3);
      await expect(page.locator('[data-song-id="theme-main"]')).toHaveAttribute("aria-pressed", "true");
      await expect(page.locator("#songSourceField")).toHaveValue("assets/music/midi/theme-main.mid");
      await expect(page.locator("#instrumentSetField")).toHaveValue("General MIDI");
      await expect(page.locator("#renderedTargets")).toContainText("theme-main.ogg");
      await expect(page.locator("#directorPanel")).toContainText("heroic");
      await expect(page.locator("#playButton")).toHaveText("Play");
      await expect(page.locator("#inspectMidiSourceButton")).toBeEnabled();
      const renderedHeader = page.locator('.accordion-v2__header[aria-controls="renderedTargetsContent"]');
      await expect(renderedHeader).toContainText("Output Targets");
      await expect(renderedHeader.locator("#exportWavButton")).toHaveCount(0);
      await expect(page.locator("#exportWavButton")).toHaveCount(0);
      await expect(page.locator("#exportMp3Button")).toHaveCount(0);
      await expect(page.locator("#exportOggButton")).toHaveCount(0);
      await expect(page.locator(".midi-studio-v2__tool-menu #toolImportManifestButton")).toBeVisible();
      await expect(page.locator(".midi-studio-v2__tool-menu #saveProjectButton")).toBeVisible();
      await expect(page.locator(".midi-studio-v2__tool-menu #loadExampleAndPlayButton")).toHaveCount(0);
      await expect(page.locator(".midi-studio-v2__tool-menu #stopAllAudioButton")).toBeVisible();
      await expect(page.locator('.midi-studio-v2__tool-menu label[for="renderedExportTargetTypeSelect"]')).toHaveCount(0);
      await expect(page.locator(".midi-studio-v2__tool-menu #renderedExportTargetTypeSelect")).toHaveCount(0);
      await expect(page.locator(".midi-studio-v2__tool-menu #renderedExportSaveButton")).toHaveCount(0);
      await selectMidiStudioTab(page, "export");
      await expect(page.locator('label[for="renderedExportTargetTypeSelect"]')).toContainText("Output Type");
      await expect(page.locator("#renderedExportTargetTypeSelect")).toBeVisible();
      await expect(page.locator("#renderedExportSaveButton")).toBeVisible();
      await expect(page.locator("#renderedExportSaveButton")).toHaveText("Save WAV");
      await selectMidiStudioTab(page, "song-setup");
      const navAndTabPresentation = await page.evaluate(() => {
        const readActionButton = (selector) => {
          const style = getComputedStyle(document.querySelector(selector));
          return {
            borderRadius: style.borderRadius,
            fontFamily: style.fontFamily,
            fontSize: style.fontSize,
            fontWeight: style.fontWeight,
            paddingBottom: style.paddingBottom,
            paddingLeft: style.paddingLeft,
            paddingRight: style.paddingRight,
            paddingTop: style.paddingTop
          };
        };
        const readTab = (tab) => {
          const style = getComputedStyle(tab);
          return {
            backgroundColor: style.backgroundColor,
            borderTopLeftRadius: style.borderTopLeftRadius,
            borderTopRightRadius: style.borderTopRightRadius,
            color: style.color,
            cursor: style.cursor,
            fontFamily: style.fontFamily,
            fontSize: style.fontSize,
            fontWeight: style.fontWeight
          };
        };
        const tabs = Array.from(document.querySelectorAll(".midi-studio-v2__tabs [role='tab']"));
        const activeTab = tabs.find((tab) => tab.classList.contains("is-active"));
        const inactiveTab = tabs.find((tab) => !tab.classList.contains("is-active"));
        return {
          activeTab: readTab(activeTab),
          importButton: readActionButton("#toolImportManifestButton"),
          inactiveTab: readTab(inactiveTab),
          stopAllButton: readActionButton("#stopAllAudioButton"),
          tabLabels: tabs.map((tab) => tab.textContent.trim())
        };
      });
      expect(navAndTabPresentation.importButton).toEqual(navAndTabPresentation.stopAllButton);
      expect(navAndTabPresentation.activeTab).toMatchObject({
        cursor: "pointer",
        fontFamily: navAndTabPresentation.stopAllButton.fontFamily,
        fontSize: navAndTabPresentation.stopAllButton.fontSize,
        fontWeight: navAndTabPresentation.stopAllButton.fontWeight
      });
      expect(navAndTabPresentation.inactiveTab).toMatchObject({
        cursor: "pointer",
        fontFamily: navAndTabPresentation.stopAllButton.fontFamily,
        fontSize: navAndTabPresentation.stopAllButton.fontSize,
        fontWeight: navAndTabPresentation.stopAllButton.fontWeight
      });
      expect(navAndTabPresentation.activeTab.backgroundColor).not.toBe(navAndTabPresentation.inactiveTab.backgroundColor);
      expect(navAndTabPresentation.activeTab.borderTopLeftRadius).not.toBe("0px");
      expect(navAndTabPresentation.activeTab.borderTopRightRadius).not.toBe("0px");
      expect(navAndTabPresentation.tabLabels).toEqual([
        "Song Setup",
        "Octave Timeline",
        "Instruments",
        "Auto-Create Parts",
        "MIDI Import",
        "Diagnostics"
      ]);
      await selectMidiStudioTab(page, "midi-import");
      await expect(page.locator('[data-midi-studio-tab="midi-import"]')).toHaveAttribute("aria-selected", "true");
      await expect(page.locator("#midiImportContent")).toBeVisible();
      await selectMidiStudioTab(page, "studio");
      await expect(page.locator('[data-midi-studio-tab="studio"]')).toHaveAttribute("aria-selected", "true");
      await expect(page.locator("#instrumentGridOutput")).toBeVisible();
      await expect(page.locator("#midiSourceDetails")).toContainText("No MIDI source inspected.");
      await expect(page.locator("#audioDiagnosticsContent")).toBeHidden();
      await expect(page.locator("#playbackState")).toContainText("Audible preview ready: Main Theme.");
      await expect(page.locator("#statusLog")).toHaveValue(/OK Loaded 3 MIDI songs/);
      await expect(page.locator("#statusLog")).toHaveValue(/INFO Next: select a MIDI Studio song, review the Octave Timeline tab, then press Play to audition the imported arrangement\./);
    } finally {
      await workspaceV2CoverageReporter.stop(page);
      await server.close();
    }
  });

  test("places Copy JSON in the JSON Details header and preserves copy behavior", async ({ page }) => {
    await page.addInitScript(() => {
      window.__midiStudioCopiedJson = "";
      Object.defineProperty(window.navigator, "clipboard", {
        configurable: true,
        value: {
          writeText: async (text) => {
            window.__midiStudioCopiedJson = text;
          }
        }
      });
    });
    const server = await openMidiStudio(page);
    try {
      await selectMidiStudioTab(page, "diagnostics");
      const header = page.locator(".midi-studio-v2__json-details-header");
      await expect(header).toContainText("JSON Details");
      await expect(header.locator("#toolCopyJsonButton")).toHaveCount(1);
      await expect(page.locator(".midi-studio-v2__tool-menu #toolCopyJsonButton")).toHaveCount(0);
      await expect(header.locator(".accordion-v2__icon")).toHaveCount(1);
      const headerLayout = await header.evaluate((element) => {
        const title = element.querySelector("span:first-child").getBoundingClientRect();
        const copy = element.querySelector("#toolCopyJsonButton").getBoundingClientRect();
        const close = element.querySelector(".accordion-v2__icon").getBoundingClientRect();
        return {
          closeAfterCopy: close.left > copy.right,
          copyAfterTitle: copy.left > title.right,
          copyText: element.querySelector("#toolCopyJsonButton").textContent,
          sameRow: Math.max(
            Math.abs((title.top + title.height / 2) - (copy.top + copy.height / 2)),
            Math.abs((copy.top + copy.height / 2) - (close.top + close.height / 2))
          ) <= 4,
          titleText: element.querySelector("span:first-child").textContent
        };
      });
      expect(headerLayout).toEqual({
        closeAfterCopy: true,
        copyAfterTitle: true,
        copyText: "Copy JSON",
        sameRow: true,
        titleText: "JSON Details"
      });

      await header.locator("#toolCopyJsonButton").click();
      await expect(page.locator("#statusLog")).toHaveValue(/OK MIDI Studio V2 toolState JSON copied\./);
      const copiedJson = await page.evaluate(() => window.__midiStudioCopiedJson);
      expect(JSON.parse(copiedJson)).toMatchObject({
        schema: "html-js-gaming.tool-state",
        toolId: "midi-studio-v2",
        payload: {
          activeSongId: "theme-main"
        }
      });
    } finally {
      await workspaceV2CoverageReporter.stop(page);
      await server.close();
    }
  });

  test("shows guided visible options and how-to-test steps", async ({ page }) => {
    const server = await openMidiStudio(page);
    try {
      await expect(page.locator("#songSheetKeyInput option")).toContainText(["Choose key", "A minor", "C major", "D minor", "E minor", "G major"]);
      await expect(page.locator("#songSheetStyleInput option")).toContainText(["Choose style", "retro-arcade", "chip", "orchestral-boss", "ambient-loop", "victory-fanfare"]);
      await expect(page.locator("#instrumentGridSubdivisionInput option")).toContainText(["1/1", "1/2", "1/4", "1/8", "1/16"]);
      await expect(page.locator("#instrumentGridLaneTypeSelect option")).toContainText(["Chords", "Bass", "Pad", "Lead", "Drums"]);
      await expect(page.locator("#renderedExportTargetTypeSelect option")).toContainText(["WAV", "MP3", "OGG"]);
      await expect(page.locator("#instrumentGridSectionSelect")).toContainText("No section selected");
      await expect(page.locator("#instrumentGridTransportState")).toContainText("No section selected. Normalize grid data before testing section timing.");
      await fillInstrumentGrid(page);
      await page.locator("#normalizeInstrumentGridButton").click();
      await expect(page.locator("#previewInstrumentLeadSelect option")).toContainText([
        "Choose preview instrument",
        "Retro Square Lead",
        "Retro Pulse Lead",
        "Synth Bass",
        "Warm Pad",
        "Basic Drums",
        "Ambient Pad"
      ]);
      await expect(page.locator("#previewInstrumentChordsSelect")).toHaveValue("warm-pad");
      await expect(page.locator("#previewInstrumentBassSelect")).toHaveValue("synth-bass");
      await expect(page.locator("#previewInstrumentPadSelect")).toHaveValue("warm-pad");
      await expect(page.locator("#previewInstrumentLeadSelect")).toHaveValue("retro-square-lead");
      await expect(page.locator("#previewInstrumentDrumsSelect")).toHaveValue("basic-drums");
      await expect(page.locator("#instrumentGridSectionSelect")).toContainText("intro");
      await expect(page.locator("#instrumentGridSectionSelect")).toContainText("loop");
      await expect(page.locator("#howToTestContent")).toContainText("Step 1: choose style/key/tempo");
      await expect(page.locator("#howToTestContent")).toContainText("Step 5: test Preview Synth playhead/loop timing preview");
      await expect(page.locator("#howToTestContent")).toContainText("Step 6: test export action status");
    } finally {
      await workspaceV2CoverageReporter.stop(page);
      await server.close();
    }
  });

  test("selects multiple songs and updates source, director, and rendered targets", async ({ page }) => {
    const server = await openMidiStudio(page);
    try {
      await page.locator('[data-song-id="combat-light"]').click();
      await expect(page.locator('[data-song-id="combat-light"]')).toHaveAttribute("aria-pressed", "true");
      await expect(page.locator("#songSourceField")).toHaveValue("No MIDI source declared.");
      await expect(page.locator("#instrumentSetField")).toHaveValue("Combat GM");
      await expect(page.locator("#renderedTargets")).toContainText("combat-light.mp3");
      await expect(page.locator("#directorPanel")).toContainText("Short encounter loop.");
      await page.locator('[data-song-id="theme-main"]').click();
      await expect(page.locator("#songSourceField")).toHaveValue("assets/music/midi/theme-main.mid");
    } finally {
      await workspaceV2CoverageReporter.stop(page);
      await server.close();
    }
  });

  test("saves output through Export tab Type dropdown without claiming project save", async ({ page }) => {
    const server = await openMidiStudio(page);
    try {
      await expect(page.locator("#exportWavButton")).toHaveCount(0);
      await expect(page.locator("#exportMp3Button")).toHaveCount(0);
      await expect(page.locator("#exportOggButton")).toHaveCount(0);
      await expect(page.locator(".midi-studio-v2__tool-menu #renderedExportTargetTypeSelect")).toHaveCount(0);
      await expect(page.locator(".midi-studio-v2__tool-menu #renderedExportSaveButton")).toHaveCount(0);
      await selectMidiStudioTab(page, "export");
      await expect(page.locator("#renderedExportTargetTypeSelect")).toBeVisible();
      await expect(page.locator("#renderedExportTargetTypeSelect option")).toContainText(["WAV", "MP3", "OGG"]);
      await expect(page.locator("#renderedExportSaveButton")).toBeVisible();
      await expect(page.locator("#renderedExportSaveButton")).toHaveText("Save WAV");
      const exportControlsFit = await page.locator("#exportWorkflowContent").evaluate((panel) => {
        const label = panel.querySelector('label[for="renderedExportTargetTypeSelect"]').getBoundingClientRect();
        const typeSelect = panel.querySelector("#renderedExportTargetTypeSelect").getBoundingClientRect();
        const saveButton = panel.querySelector("#renderedExportSaveButton").getBoundingClientRect();
        const menuRect = panel.getBoundingClientRect();
        return {
          fit: typeSelect.left >= menuRect.left - 1 && saveButton.right <= menuRect.right + 1,
          sameRow: label.right <= saveButton.left && label.bottom >= saveButton.top && saveButton.bottom >= label.top
        };
      });
      expect(exportControlsFit.fit).toBe(true);
      expect(exportControlsFit.sameRow).toBe(true);
      await page.locator("#renderedExportTargetTypeSelect").selectOption("wav");
      await expect(page.locator("#renderedExportSaveButton")).toHaveText("Save WAV");
      await page.locator("#renderedExportSaveButton").click();
      await page.locator("#renderedExportTargetTypeSelect").selectOption("mp3");
      await expect(page.locator("#renderedExportSaveButton")).toHaveText("Save MP3");
      await page.locator("#renderedExportSaveButton").click();
      await page.locator("#renderedExportTargetTypeSelect").selectOption("ogg");
      await expect(page.locator("#renderedExportSaveButton")).toHaveText("Save OGG");
      await page.locator("#renderedExportSaveButton").click();
      await expect(page.locator("#statusLog")).toHaveValue(/WARN Export rendering not implemented for WAV\. Planned target: assets\/music\/rendered\/theme-main\.wav\./);
      await expect(page.locator("#statusLog")).toHaveValue(/WARN Export rendering not implemented for MP3\. Planned target: assets\/music\/rendered\/theme-main\.mp3\./);
      await expect(page.locator("#statusLog")).toHaveValue(/WARN Export rendering not implemented for OGG\. Planned target: assets\/music\/rendered\/theme-main\.ogg\./);
      await expect(page.locator("#statusLog")).not.toHaveValue(/Save Project completed/);
      await page.locator('[data-song-id="source-only"]').click();
      await page.locator("#renderedExportTargetTypeSelect").selectOption("wav");
      await page.locator("#renderedExportSaveButton").click();
      await expect(page.locator("#statusLog")).toHaveValue(/FAIL Missing rendered WAV export target for Source Only\. Add music\.songs\[\]\.rendered\.wav before exporting\./);
    } finally {
      await workspaceV2CoverageReporter.stop(page);
      await server.close();
    }
  });

  test("marks unwired visible controls red with tooltips while working controls stay normal", async ({ page }) => {
    let server = await openMidiStudio(page);
    try {
      await selectMidiStudioTab(page, "export");
      const outputLabel = page.locator('label[for="renderedExportTargetTypeSelect"]');
      const outputTypeSelect = page.locator("#renderedExportTargetTypeSelect");
      const saveOutputButton = page.locator("#renderedExportSaveButton");
      const playButton = page.locator("#playButton");
      const stopButton = page.locator("#stopButton");
      const stopAllAudioButton = page.locator("#stopAllAudioButton");

      await expect(outputLabel).toHaveAttribute("data-midi-studio-unwired", "not-implemented");
      await expect(outputTypeSelect).toHaveAttribute("data-midi-studio-unwired", "not-implemented");
      await expect(saveOutputButton).toHaveAttribute("data-midi-studio-unwired", "not-implemented");
      await expect(saveOutputButton).toHaveAttribute("title", /Not implemented: Rendered audio export generation is not implemented yet/);
      await expect(saveOutputButton).toHaveAttribute("aria-label", /Save WAV \(Not implemented\)/);
      await expect(outputTypeSelect).toHaveAttribute("title", /Not implemented: Rendered audio export generation is not implemented yet/);
      expect(await controlColors(page, "#renderedExportSaveButton")).toMatchObject({
        borderTopColor: "rgb(248, 113, 113)",
        color: "rgb(254, 202, 202)"
      });
      expect(await controlColors(page, "#renderedExportTargetTypeSelect")).toMatchObject({
        borderTopColor: "rgb(248, 113, 113)",
        color: "rgb(254, 202, 202)"
      });

      await expect(stopAllAudioButton).not.toHaveAttribute("data-midi-studio-unwired");
      await expect(playButton).not.toHaveAttribute("data-midi-studio-unwired");
      expect((await controlColors(page, "#stopAllAudioButton")).borderTopColor).not.toBe("rgb(248, 113, 113)");

      await playButton.click();
      await expect(stopButton).toBeEnabled();
      await expect(playButton).not.toHaveAttribute("data-midi-studio-unwired");
      await stopButton.click();
      await expect(playButton).toBeEnabled();
      await expect(stopButton).toBeDisabled();

      await page.locator('[data-song-id="source-only"]').click();
      await expect(playButton).toHaveAttribute("data-midi-studio-unwired", "incomplete");
      await expect(playButton).toHaveAttribute("title", /Incomplete: Live MIDI playback is not implemented/);
      await expect(playButton).toHaveAttribute("aria-label", /Play \(Incomplete\)/);
      expect(await controlColors(page, "#playButton")).toMatchObject({
        borderTopColor: "rgb(248, 113, 113)",
        color: "rgb(254, 202, 202)"
      });
      await playButton.click();
      await expect(page.locator("#statusLog")).toHaveValue(/WARN Live MIDI synthesis not implemented\./);
      await expect(page.locator("#statusLog")).toHaveValue(/FAIL No rendered audio target is available for Source Only, and no live MIDI engine is available\./);
      await page.locator('[data-song-id="theme-main"]').click();
      await expect(playButton).not.toHaveAttribute("data-midi-studio-unwired");

      const visibleUnwired = await page.locator("[data-midi-studio-unwired]").evaluateAll((controls) => controls
        .filter((control) => {
          const rect = control.getBoundingClientRect();
          const style = getComputedStyle(control);
          return rect.width > 0 && rect.height > 0 && style.visibility !== "hidden" && style.display !== "none";
        })
        .map((control) => control.id || control.getAttribute("for") || control.textContent.trim()));
      expect(visibleUnwired).toEqual(expect.arrayContaining([
        "renderedExportTargetTypeSelect",
        "renderedExportSaveButton"
      ]));
    } finally {
      await workspaceV2CoverageReporter.stop(page);
      await server.close();
    }

    server = await openMidiStudioWorkspaceProxyNav(page);
    try {
      await expect(page.locator('[data-launch-mode-nav="workspace"]')).toBeVisible();
      for (const selector of ["#workspaceImportManifestButton", "#workspaceCopyManifestButton", "#workspaceExportManifestButton"]) {
        await expect(page.locator(selector)).toBeVisible();
        await expect(page.locator(selector)).toHaveAttribute("data-midi-studio-unwired", "incomplete");
        await expect(page.locator(selector)).toHaveAttribute("title", /Incomplete: Workspace Manager V2 owns this action/);
        expect(await controlColors(page, selector)).toMatchObject({
          borderTopColor: "rgb(248, 113, 113)",
          color: "rgb(254, 202, 202)"
        });
      }
    } finally {
      await workspaceV2CoverageReporter.stop(page);
      await server.close();
    }
  });

  test("loads selected MIDI source metadata on request", async ({ page }) => {
    const server = await openMidiStudio(page, validManifest, {
      "assets/music/midi/theme-main.mid": validMidiBytes
    });
    try {
      await page.locator("#inspectMidiSourceButton").click();
      await expect(page.locator("#midiSourceDetails")).toContainText("Valid Standard MIDI File header with 2 declared track chunks.");
      await expect(page.locator("#midiSourceDetails")).toContainText("Format");
      await expect(page.locator("#midiSourceDetails")).toContainText("1");
      await expect(page.locator("#midiSourceDetails")).toContainText("Track count");
      await expect(page.locator("#midiSourceDetails")).toContainText("2");
      await expect(page.locator("#midiSourceDetails")).toContainText("Ticks per quarter note");
      await expect(page.locator("#midiSourceDetails")).toContainText("480");
      await expect(page.locator("#midiSourceDetails")).toContainText("Estimated duration");
      await expect(page.locator("#midiSourceDetails")).toContainText("0.5 seconds");
      await expect(page.locator("#midiSourceDetails")).toContainText("Loop-safe duration");
      await expect(page.locator("#midiSourceDetails")).toContainText("Tempo summary");
      await expect(page.locator("#midiSourceDetails")).toContainText("120 BPM at tick 0");
      await expect(page.locator("#midiSourceDetails")).toContainText("Time signature summary");
      await expect(page.locator("#midiSourceDetails")).toContainText("4/4 at tick 0");
      await expect(page.locator("#midiSourceDetails")).toContainText("Note on events");
      await expect(page.locator("#midiSourceDetails")).toContainText("Note off events");
      await expect(page.locator("#midiSourceDetails")).toContainText("MIDI events");
      await expect(page.locator("#midiSourceDetails")).toContainText("Meta events");
      await expect(page.locator("#midiSourceDetails")).toContainText("Channel summary");
      await expect(page.locator("#midiSourceDetails")).toContainText("Instrument/program summary");
      await expect(page.locator("#midiSourceDetails")).toContainText("Bar/measure estimate");
      await expect(page.locator("#midiSourceDetails")).toContainText("Track activity summary");
      expect(await page.locator("#midiSourceDetails div").evaluateAll((rows) => Object.fromEntries(rows.map((row) => [
        row.querySelector("dt")?.textContent || "",
        row.querySelector("dd")?.textContent || ""
      ])))).toMatchObject({
        "Bar/measure estimate": "0.25 bars at 4/4",
        "Channel summary": "Ch 1: 1 notes, 3 events",
        "Estimated duration": "0.5 seconds",
        "Instrument/program summary": "Ch 1 program 5 at tick 0",
        "Loop-safe duration": "0.5 seconds",
        "Meta events": "4",
        "MIDI events": "3",
        "Note off events": "1",
        "Note on events": "1",
        "Normalized note count": "1",
        "Tempo summary": "120 BPM at tick 0",
        "Track activity summary": "Track 1: 0 notes, 3 events; Track 2: 1 notes, 4 events",
        "Time signature summary": "4/4 at tick 0"
      });
      await expect(page.locator("#statusLog")).toHaveValue(/OK MIDI source inspected for Main Theme: format 1, 2 tracks, 480 TPQN\./);
    } finally {
      await workspaceV2CoverageReporter.stop(page);
      await server.close();
    }
  });

  test("shows actionable failure for missing MIDI source inspection without stale details", async ({ page }) => {
    const server = await openMidiStudio(page, validManifest, {
      "assets/music/midi/theme-main.mid": validMidiBytes
    });
    try {
      await page.locator("#inspectMidiSourceButton").click();
      await expect(page.locator("#midiSourceDetails")).toContainText("480");
      await page.locator('[data-song-id="combat-light"]').click();
      await page.locator("#inspectMidiSourceButton").click();
      await expect(page.locator("#midiSourceDetails")).toContainText("Missing MIDI source for Light Combat.");
      await expect(page.locator("#midiSourceDetails")).not.toContainText("480");
      await expect(page.locator("#statusLog")).toHaveValue(/FAIL Missing MIDI source for Light Combat\. Add music\.songs\[\]\.sourceMidi in game\.manifest\.json\./);
    } finally {
      await workspaceV2CoverageReporter.stop(page);
      await server.close();
    }
  });

  test("shows parser warnings for malformed pairs, unsupported events, and empty tracks", async ({ page }) => {
    const server = await openMidiStudio(page, validManifest, {
      "assets/music/midi/theme-main.mid": warningMidiBytes
    });
    try {
      await page.locator("#inspectMidiSourceButton").click();
      await expect(page.locator("#midiSourceDetails")).toContainText("Warnings");
      await expect(page.locator("#midiSourceDetails")).toContainText("unsupported system/SysEx event");
      await expect(page.locator("#midiSourceDetails")).toContainText("note-off without matching note-on");
      await expect(page.locator("#midiSourceDetails")).toContainText("note-on without matching note-off");
      await expect(page.locator("#midiSourceDetails")).toContainText("Track 3 has no note, program, tempo, or time signature activity.");
      await expect(page.locator("#midiSourceDetails")).toContainText("Normalized note count");
      await expect(page.locator("#midiSourceDetails")).toContainText("0");
      await expect(page.locator("#statusLog")).toHaveValue(/OK MIDI source inspected for Main Theme/);
    } finally {
      await workspaceV2CoverageReporter.stop(page);
      await server.close();
    }
  });

  test("shows actionable failure for corrupt MIDI source bytes without partial render", async ({ page }) => {
    const server = await openMidiStudio(page, validManifest, {
      "assets/music/midi/theme-main.mid": corruptMidiBytes
    });
    try {
      await page.locator("#inspectMidiSourceButton").click();
      await expect(page.locator("#midiSourceDetails")).toContainText("MIDI source validation failed");
      await expect(page.locator("#midiSourceDetails")).not.toContainText("Ticks per quarter note");
      await expect(page.locator("#statusLog")).toHaveValue(/FAIL MIDI source validation failed for assets\/music\/midi\/theme-main\.mid: MIDI track 1 ended after delta time without an event\./);
    } finally {
      await workspaceV2CoverageReporter.stop(page);
      await server.close();
    }
  });

  test("parses guided Song Sheet fields into section summary metadata", async ({ page }) => {
    const server = await openMidiStudio(page);
    try {
      await fillGuidedSongSheet(page);
      await page.locator("#parseSongSheetButton").click();
      await expect(page.locator("#songSheetSummary")).toContainText("intro: 2 bars, 2 chords");
      await expect(page.locator("#songSheetSummary")).toContainText("loop: 4 bars, 4 chords, loop");
      await expect(page.locator("#instrumentGridSectionsInput")).toHaveValue("intro:2, loop:4");
      await expect(page.locator("#instrumentGridChordsInput")).toHaveValue("Am Am Am Am | F F F F | Am Am Am Am | F F F F | C C C C | G G G G");
      expect(await page.evaluate(() => {
        const result = window.__midiStudioV2App.currentInstrumentGridResult();
        return {
          bassHasA2: result.timeline.some((event) => event.lane === "bass" && event.stepIndex === 0 && event.value === "A2"),
          chordStep0: result.timeline.find((event) => event.lane === "chords" && event.stepIndex === 0)?.value,
          chordStep8: result.timeline.find((event) => event.lane === "chords" && event.stepIndex === 8)?.value
        };
      })).toEqual({
        bassHasA2: true,
        chordStep0: "Am",
        chordStep8: "Am"
      });
      expect(await page.locator("#songSheetSummary div").evaluateAll((rows) => Object.fromEntries(rows.map((row) => [
        row.querySelector("dt")?.textContent || "",
        row.querySelector("dd")?.textContent || ""
      ])))).toMatchObject({
        "Bars": "6",
        "Chord count": "6",
        "Estimated duration": "10.909 seconds",
        "Loop sections": "loop",
        "Warnings": "none"
      });
      await expect(page.locator("#statusLog")).toHaveValue(/OK Song Sheet parsed: 2 sections, 6 bars, 6 chords\./);
      await expect(page.locator("#statusLog")).toHaveValue(/OK Song Sheet updated the editable note grid for /);
    } finally {
      await workspaceV2CoverageReporter.stop(page);
      await server.close();
    }
  });

  test("shows guided Song Sheet warnings for invalid chords and empty intro loop fields", async ({ page }) => {
    const server = await openMidiStudio(page);
    try {
      await fillGuidedSongSheet(page, {
        intro: "",
        key: "C major",
        loop: "C Hm G",
        style: "chip",
        tempo: "120"
      });
      await page.locator("#parseSongSheetButton").click();
      await expect(page.locator("#songSheetSummary")).toContainText('Invalid chord "Hm"');
      await expect(page.locator("#songSheetSummary")).toContainText("Section intro is empty.");
      await expect(page.locator("#songSheetSummary")).toContainText("loop: 2 bars, 2 chords, loop");
      await expect(page.locator("#statusLog")).toHaveValue(/WARN Song Sheet parsed with warnings: Invalid chord "Hm" in section loop/);
      await expect(page.locator("#statusLog")).toHaveValue(/OK Song Sheet parsed: 2 sections, 2 bars, 2 chords\./);
      await page.locator("#songSheetSectionsInput").fill("intro: Am F\nloop:");
      await page.locator("#parseSongSheetButton").click();
      await expect(page.locator("#songSheetSummary")).toContainText("Section loop is empty.");
      await expect(page.locator("#statusLog")).toHaveValue(/WARN Song Sheet parsed with warnings: Section loop is empty\./);
    } finally {
      await workspaceV2CoverageReporter.stop(page);
      await server.close();
    }
  });

  test("rejects invalid guided Song Sheet tempo and missing key before parser render", async ({ page }) => {
    const server = await openMidiStudio(page);
    try {
      await fillGuidedSongSheet(page, { tempo: "-1" });
      await page.locator("#parseSongSheetButton").click();
      await expect(page.locator("#songSheetSummary")).toContainText("Invalid tempo/BPM. Enter a positive number in Song Details before parsing the Song Sheet.");
      await expect(page.locator("#songSheetSummary")).not.toContainText("intro:");
      await expect(page.locator("#statusLog")).toHaveValue(/FAIL Song Sheet rejected: Invalid tempo\/BPM\. Enter a positive number in Song Details before parsing the Song Sheet\./);
      await page.locator("#songSheetTempoInput").fill("132");
      await page.locator("#songSheetKeyInput").selectOption("");
      await page.locator("#parseSongSheetButton").click();
      await expect(page.locator("#songSheetSummary")).toContainText("Missing key. Enter a key in Song Details before parsing the Song Sheet.");
      await expect(page.locator("#songSheetSummary")).not.toContainText("loop:");
      await expect(page.locator("#statusLog")).toHaveValue(/FAIL Song Sheet rejected: Missing key\. Enter a key in Song Details before parsing the Song Sheet\./);
    } finally {
      await workspaceV2CoverageReporter.stop(page);
      await server.close();
    }
  });

  test("removes the Advanced Raw Song Sheet surface from the primary workflow", async ({ page }) => {
    const server = await openMidiStudio(page);
    try {
      await selectMidiStudioTab(page, "song-setup");
      await expect(page.locator(".midi-studio-v2__advanced-song-sheet")).toHaveCount(0);
      await expect(page.locator("#songSheetInput")).toHaveCount(0);
      await expect(page.locator("#parseRawSongSheetButton")).toHaveCount(0);
      await expect(page.locator("#songSheetContent")).toBeVisible();
      await expect(page.locator("#parseSongSheetButton")).toBeVisible();
    } finally {
      await workspaceV2CoverageReporter.stop(page);
      await server.close();
    }
  });

  test("keeps MIDI source inspection and rendered preview available after Song Sheet parsing", async ({ page }) => {
    const server = await openMidiStudio(page, validManifest, {
      "assets/music/midi/theme-main.mid": validMidiBytes
    });
    try {
      await fillGuidedSongSheet(page, { intro: "", loop: "Am F C G" });
      await page.locator("#parseSongSheetButton").click();
      await expect(page.locator("#songSheetSummary")).toContainText("loop: 4 bars, 4 chords, loop");
      await selectMidiStudioTab(page, "midi-import");
      await expect(page.locator("#midiImportContent")).toBeVisible();
      await page.locator("#inspectMidiSourceButton").click();
      await expect(page.locator("#midiSourceDetails")).toContainText("Tempo summary");
      await page.locator("#playButton").click();
      await expect(page.locator("#statusLog")).toHaveValue(/OK Rendered preview started for Main Theme: assets\/music\/rendered\/theme-main\.ogg\./);
      expect(await page.evaluate(() => window.__midiStudioAudioEvents)).toEqual([
        { action: "play", loop: false, src: "assets/music/rendered/theme-main.ogg" }
      ]);
    } finally {
      await workspaceV2CoverageReporter.stop(page);
      await server.close();
    }
  });

  test("renders an aligned multi-instrument grid and shared normalized timeline", async ({ page }) => {
    const server = await openMidiStudio(page);
    try {
      await fillInstrumentGrid(page);
      await page.locator("#normalizeInstrumentGridButton").click();
      await expect(page.locator("#instrumentGridSummary")).toContainText("intro: 1 bar; loop: 1 bar");
      await expect(page.locator("#instrumentGridSummary")).toContainText("30 normalized events");
      await expect(page.locator("#instrumentGridOutput")).not.toContainText("intro");
      await expect(page.locator("#instrumentGridOutput")).not.toContainText("loop");
      await expect(page.locator("#instrumentGridOutput")).toContainText("Am");
      await expect(page.locator("#instrumentGridOutput")).toContainText("A2");
      await expect(page.locator("#instrumentGridOutput")).toContainText("kick");
      const gridModel = await page.evaluate(() => window.__midiStudioV2App.lastInstrumentGridResult);
      expect(gridModel).toMatchObject({
        barCount: 2,
        beatCount: 8,
        eventCount: 30,
        ok: true,
        totalSteps: 8
      });
      expect(gridModel.timeline[0]).toMatchObject({
        bar: 1,
        beat: 1,
        kind: "chord",
        lane: "chords",
        section: "intro",
        value: "Am"
      });
      expect(gridModel.timeline.some((event) => event.lane === "lead" && event.value === "C5" && event.bar === 2)).toBe(true);
      await expect(page.locator("#statusLog")).toHaveValue(/OK Instrument grid normalized: 2 sections, 2 bars, 30 events\./);
    } finally {
      await workspaceV2CoverageReporter.stop(page);
      await server.close();
    }
  });

  test("edits spreadsheet note cells into playable timeline data", async ({ page }) => {
    const server = await openMidiStudio(page);
    try {
      await fillInstrumentGrid(page);
      await page.locator("#normalizeInstrumentGridButton").click();
      const beforeDiagnostics = await audioDiagnosticsRows(page);
      const beforeCount = Number(beforeDiagnostics["Playable note count"]);
      await spreadsheetCell(page, "lead", 3).fill("B4");
      await expect(page.locator("#instrumentGridLeadInput")).toHaveValue("E4 G4 A4 B4 | C5 B4 G4 -");
      await page.locator("#normalizeInstrumentGridButton").click();
      await expect(spreadsheetCell(page, "lead", 3)).toHaveText("B4");
      await expect(spreadsheetCell(page, "lead", 3).locator(".midi-studio-v2__note-block")).toHaveText("B4");
      const editedModel = await page.evaluate(() => window.__midiStudioV2App.lastInstrumentGridResult);
      expect(editedModel.timeline.some((event) => event.lane === "lead" && event.value === "B4" && event.bar === 1)).toBe(true);
      expect(Number((await audioDiagnosticsRows(page))["Playable note count"])).toBeGreaterThan(beforeCount);
      await page.locator("#playSectionButton").click();
      await expect(page.locator("#statusLog")).toHaveValue(/OK Preview Synth started for section intro with \d+ playable events\./);

      await spreadsheetCell(page, "lead", 1).fill("BAD");
      await page.locator("#normalizeInstrumentGridButton").click();
      await expect(page.locator("#instrumentGridSummary")).toContainText('Invalid note token "BAD"');
      await expect(page.locator("#statusLog")).toHaveValue(/FAIL Instrument grid rejected: Invalid note token "BAD" in lead at bar 1, beat 2\./);
    } finally {
      await workspaceV2CoverageReporter.stop(page);
      await server.close();
    }
  });

  test("keeps beat bar alignment consistent across grid lanes", async ({ page }) => {
    const server = await openMidiStudio(page);
    try {
      await fillInstrumentGrid(page, {
        bass: "A2 E2 F2 C2 | C3 B2 G2 E2",
        lead: "E4 G4 A4 B4 | C5 B4 G4 E4"
      });
      await page.locator("#normalizeInstrumentGridButton").click();
      expect(await page.locator(".midi-studio-v2__instrument-grid").evaluate((grid) => getComputedStyle(grid).gridTemplateColumns.split(" ").length)).toBe(9);
      await expect(page.locator(".midi-studio-v2__grid-cell").first()).toHaveText("Instrument");
      expect(await page.locator(".midi-studio-v2__grid-cell--timing-header").evaluateAll((cells) => cells.map((cell) => cell.textContent))).toEqual([
        "Bar 1Beat 1",
        "Bar 1Beat 2",
        "Bar 1Beat 3",
        "Bar 1Beat 4",
        "Bar 2Beat 1",
        "Bar 2Beat 2",
        "Bar 2Beat 3",
        "Bar 2Beat 4"
      ]);
      await expect(spreadsheetCell(page, "chords", 0)).toHaveText("Am");
      await expect(spreadsheetCell(page, "bass", 0)).toHaveText("A2");
    } finally {
      await workspaceV2CoverageReporter.stop(page);
      await server.close();
    }
  });

  test("reports grid note, subdivision, bar count, and drum validation states", async ({ page }) => {
    const server = await openMidiStudio(page);
    try {
      await fillInstrumentGrid(page, { lead: "E4 BAD A4 - | C5 B4 G4 -" });
      await page.locator("#normalizeInstrumentGridButton").click();
      await expect(page.locator("#instrumentGridSummary")).toContainText('Invalid note token "BAD"');
      await expect(page.locator("#instrumentGridOutput")).not.toContainText("intro");
      await expect(page.locator("#statusLog")).toHaveValue(/FAIL Instrument grid rejected: Invalid note token "BAD" in lead at bar 1, beat 2\./);
      expect(await page.evaluate(() => window.__midiStudioV2App.lastInstrumentGridResult)).toBeNull();

      await fillInstrumentGrid(page);
      await page.locator("#instrumentGridSubdivisionInput").evaluate((select) => {
        const option = document.createElement("option");
        option.value = "3";
        option.textContent = "3";
        select.append(option);
        select.value = "3";
        select.dispatchEvent(new Event("change", { bubbles: true }));
      });
      await page.locator("#normalizeInstrumentGridButton").click();
      await expect(page.locator("#instrumentGridSummary")).toContainText("Unsupported timing subdivision: 3");
      await expect(page.locator("#statusLog")).toHaveValue(/FAIL Instrument grid rejected: Unsupported timing subdivision: 3\. Use 1, 2, 4, 8, or 16\./);

      await fillInstrumentGrid(page, { chords: "Am F C G" });
      await page.locator("#normalizeInstrumentGridButton").click();
      await expect(page.locator("#instrumentGridSummary")).toContainText("Malformed bar counts for chords");
      await expect(page.locator("#statusLog")).toHaveValue(/FAIL Instrument grid rejected: Malformed bar counts for chords\. Expected 2 bars from the section map, received 1\./);

      await fillInstrumentGrid(page, { drums: "kick zap snare hat | kick hat snare hat" });
      await page.locator("#normalizeInstrumentGridButton").click();
      await expect(page.locator("#instrumentGridSummary")).toContainText('Invalid drum token "zap"');
      await expect(page.locator("#instrumentGridSummary")).toContainText("intro: 1 bar; loop: 1 bar");
      await expect(page.locator("#instrumentGridOutput")).not.toContainText("intro");
      await expect(page.locator("#statusLog")).toHaveValue(/WARN Instrument grid normalized with warnings: Invalid drum token "zap" at bar 1, beat 2; token was skipped\./);
      await expect(page.locator("#statusLog")).toHaveValue(/OK Instrument grid normalized: 2 sections, 2 bars, 29 events\./);
    } finally {
      await workspaceV2CoverageReporter.stop(page);
      await server.close();
    }
  });

  test("switches snap subdivisions and keeps beat bar alignment consistent", async ({ page }) => {
    const server = await openMidiStudio(page);
    try {
      await fillInstrumentGrid(page, {
        bass: "",
        beats: "2",
        chords: "Am - F -",
        drums: "",
        lead: "",
        pad: "",
        sections: "intro:1",
        subdivision: "2"
      });
      await expect(page.locator("#instrumentGridSnapIndicator")).toContainText("Snap: 1 bar / 2 beats / 1/2");
      await page.locator("#normalizeInstrumentGridButton").click();
      expect(await page.locator(".midi-studio-v2__instrument-grid").evaluate((grid) => getComputedStyle(grid).gridTemplateColumns.split(" ").length)).toBe(5);
      expect(await page.locator(".midi-studio-v2__grid-cell--timing-header").evaluateAll((cells) => cells.map((cell) => cell.textContent))).toEqual([
        "Bar 1Beat 1Subdivision 1",
        "Bar 1Beat 1Subdivision 2",
        "Bar 1Beat 2Subdivision 1",
        "Bar 1Beat 2Subdivision 2"
      ]);
      await page.locator("#instrumentGridSubdivisionInput").selectOption("16");
      await expect(page.locator("#instrumentGridSnapIndicator")).toContainText("Snap: 1 bar / 2 beats / 1/16");
    } finally {
      await workspaceV2CoverageReporter.stop(page);
      await server.close();
    }
  });

  test("renders timing ruler, section navigation, and loop region visualization", async ({ page }) => {
    const server = await openMidiStudio(page);
    try {
      await fillInstrumentGrid(page, {
        bass: "",
        chords: "Am F C G | Dm G C Am | F G Am C | C G F Am | G F C Am",
        drums: "",
        lead: "",
        pad: "",
        sections: "intro:1, loop:1, bridge:1, boss:1, victory:1"
      });
      await page.locator("#normalizeInstrumentGridButton").click();
      await expect(page.locator('.midi-studio-v2__grid-cell--bar-header[data-step-index="0"]')).toHaveText("1");
      await expect(page.locator('.midi-studio-v2__grid-cell--bar-header[data-step-index="16"]')).toHaveText("5");
      const sectionButtonLayout = await page.locator(".midi-studio-v2__section-preset").evaluateAll((buttons) => buttons.map((button) => {
        const style = getComputedStyle(button);
        return {
          marginBottom: Number.parseFloat(style.marginBottom),
          marginLeft: Number.parseFloat(style.marginLeft),
          marginRight: Number.parseFloat(style.marginRight),
          marginTop: Number.parseFloat(style.marginTop),
          paddingBottom: Number.parseFloat(style.paddingBottom),
          paddingLeft: Number.parseFloat(style.paddingLeft),
          paddingRight: Number.parseFloat(style.paddingRight),
          paddingTop: Number.parseFloat(style.paddingTop)
        };
      }));
      expect(sectionButtonLayout).toHaveLength(5);
      expect(sectionButtonLayout.every((button) => button.marginBottom === 0 && button.marginLeft === 0 && button.marginRight === 0 && button.marginTop === 0)).toBe(true);
      expect(sectionButtonLayout.every((button) => button.paddingBottom <= 4 && button.paddingTop <= 4 && button.paddingLeft <= 8 && button.paddingRight <= 8)).toBe(true);
      await expect(page.locator(".midi-studio-v2__grid-cell--bar")).toHaveCount(5);
      await expect(page.locator(".midi-studio-v2__grid-cell--ruler").first()).toContainText("1");
      await expect(page.locator(".midi-studio-v2__grid-cell--beat-header.midi-studio-v2__grid-cell--playhead-active")).toHaveAttribute("data-section", "intro");
      await expect(page.locator("#instrumentGridSectionAvailability")).toHaveText("Quick sections available.");
      await expect(page.locator(".midi-studio-v2__section-preset:disabled")).toHaveCount(0);
      await expect(page.locator("#instrumentGridSectionSelect")).toContainText("bridge");
      await page.locator("#instrumentGridLoopStartSelect").selectOption("loop");
      await page.locator("#instrumentGridLoopEndSelect").selectOption("boss");
      expect(await page.locator(".midi-studio-v2__grid-cell--loop-region").count()).toBeGreaterThan(0);
      await expect(page.locator("#instrumentGridTransportState")).toContainText("Loop region set: loop -> boss");
      await expect(page.locator("#statusLog")).toHaveValue(/INFO Loop region set: loop -> boss\./);
      await page.locator("#instrumentGridSectionSelect").selectOption("bridge");
      const bridgeRegion = await page.locator(".midi-studio-v2__grid-cell--section-region").evaluateAll((cells) => ({
        count: cells.length,
        sections: Array.from(new Set(cells.map((cell) => cell.dataset.section)))
      }));
      expect(bridgeRegion.count).toBeGreaterThan(0);
      expect(bridgeRegion.sections).toEqual(["bridge"]);
      await expect(page.locator("#instrumentGridTransportState")).toContainText("Selected section: bridge");
      await expect(page.locator("#statusLog")).toHaveValue(/INFO Timing section selected: bridge\./);
      await page.locator("#playSectionButton").click();
      await expect(page.locator("#instrumentGridTransportState")).toContainText("Playing section: bridge");
      await expect(page.locator("#statusLog")).toHaveValue(/INFO Playing section: bridge\./);
      await expect(page.locator("#statusLog")).toHaveValue(/OK Preview Synth started for section bridge with \d+ playable events\./);
      expect(await page.evaluate(() => window.__midiStudioV2App.previewSynth.getSnapshot())).toMatchObject({
        lastPlayback: {
          label: "bridge",
          mode: "section"
        },
        loopActive: false,
        playing: true
      });
      await expect(page.locator(".midi-studio-v2__grid-cell--beat-header.midi-studio-v2__grid-cell--playhead-active")).toHaveAttribute("data-section", "bridge");
      await page.locator("#stopTimingPreviewButton").click();
      await page.evaluate(() => {
        window.__midiStudioPreviewSynthEvents = [];
      });
      await page.locator("#playLoopButton").click();
      await expect(page.locator("#instrumentGridTransportState")).toContainText("Playing loop: loop to boss");
      await expect(page.locator("#statusLog")).toHaveValue(/INFO Playing loop: loop to boss\./);
      await expect(page.locator("#statusLog")).toHaveValue(/OK Preview Synth started for loop loop to boss with \d+ playable events\./);
      expect(await page.evaluate(() => window.__midiStudioV2App.previewSynth.getSnapshot())).toMatchObject({
        lastPlayback: {
          label: "loop to boss",
          mode: "loop"
        },
        loopActive: true,
        playing: true
      });
      await expect(page.locator(".midi-studio-v2__grid-cell--beat-header.midi-studio-v2__grid-cell--playhead-active")).toHaveAttribute("data-section", "loop");
      await page.locator("#stopTimingPreviewButton").click();
      await page.locator('[data-section-preset="boss"]').click();
      await expect(page.locator("#instrumentGridSectionSelect")).toHaveValue("boss");
      await page.locator("#jumpToSectionButton").click();
      await expect(page.locator(".midi-studio-v2__grid-cell--beat-header.midi-studio-v2__grid-cell--playhead-active")).toHaveAttribute("data-section", "boss");
      await expect(page.locator("#statusLog")).toHaveValue(/OK Timing playhead jumped to section boss\./);
    } finally {
      await workspaceV2CoverageReporter.stop(page);
      await server.close();
    }
  });

  test("animates Preview Synth playhead by subdivision and preserves generated manual cells", async ({ page }) => {
    const server = await openMidiStudio(page);
    try {
      await fillInstrumentGrid(page, {
        bass: "",
        beats: "2",
        chords: "Am - F - | C - G -",
        drums: "",
        lead: "",
        pad: "",
        subdivision: "2"
      });
      await page.locator("#generateBassFromChordsButton").click();
      await page.locator("#instrumentGridBassInput").fill("A2 E2 F2 - | C2 - G2 -");
      await page.locator("#normalizeInstrumentGridButton").click();
      await expect(page.locator('[data-lane="bass"][data-source="generated"]')).toHaveCount(4);
      await expect(page.locator('[data-lane="bass"][data-source="manual"]')).toHaveCount(1);
      await page.locator("#instrumentGridSectionSelect").selectOption("intro");
      const beforeStep = await page.locator(".midi-studio-v2__grid-cell--beat-header.midi-studio-v2__grid-cell--playhead-active").getAttribute("data-step-index");
      await page.locator("#playSectionButton").click();
      await expect(page.locator("#statusLog")).toHaveValue(/OK Preview Synth started for section intro with \d+ playable events\./);
      await expect(page.locator(".midi-studio-v2__grid-cell--beat-header.midi-studio-v2__grid-cell--playhead-active")).not.toHaveAttribute("data-step-index", beforeStep || "");
      await expect(page.locator(".midi-studio-v2__grid-cell--beat-header.midi-studio-v2__grid-cell--playhead-active")).toHaveAttribute("data-beat", /1|2/);
      await expect(page.locator(".midi-studio-v2__grid-cell--beat-header.midi-studio-v2__grid-cell--playhead-active")).toHaveAttribute("data-subdivision-step", /1|2/);
      expect(await page.evaluate(() => window.__midiStudioPreviewSynthEvents.some((event) => event.action === "oscillator-start"))).toBe(true);
      await page.locator("#stopTimingPreviewButton").click();
      await expect(page.locator("#instrumentGridTransportState")).toContainText("Preview Synth timing preview stopped.");
      await expect(page.locator("#statusLog")).toHaveValue(/OK Preview playback stopped\. Cleared \d+ scheduled oscillators\./);
      expect(await page.evaluate(() => window.__midiStudioV2App.previewSynth.getSnapshot().playing)).toBe(false);
    } finally {
      await workspaceV2CoverageReporter.stop(page);
      await server.close();
    }
  });

  test("reports no playable notes before starting Preview Synth playback", async ({ page }) => {
    const server = await openMidiStudio(page);
    try {
      await fillInstrumentGrid(page, {
        bass: "",
        chords: "",
        drums: "",
        lead: "",
        pad: ""
      });
      await page.locator("#normalizeInstrumentGridButton").click();
      const beforeStep = await page.locator(".midi-studio-v2__grid-cell--beat-header.midi-studio-v2__grid-cell--playhead-active").getAttribute("data-step-index");
      await page.locator("#playSectionButton").click();
      await expect(page.locator("#statusLog")).toHaveValue(/FAIL No playable Preview Synth notes found for section intro\. Generate or enter chords, bass, pad, lead, or drum cells before playing\./);
      await expect(page.locator("#audioDiagnostics")).toContainText("No playable Preview Synth notes found for section intro.");
      await expect(page.locator(".midi-studio-v2__grid-cell--beat-header.midi-studio-v2__grid-cell--playhead-active")).toHaveAttribute("data-step-index", beforeStep || "0");
      expect(await page.evaluate(() => window.__midiStudioPreviewSynthEvents.some((event) => event.action === "oscillator-start"))).toBe(false);
    } finally {
      await workspaceV2CoverageReporter.stop(page);
      await server.close();
    }
  });

  test("reports browser audio unavailable before Preview Synth playback", async ({ page }) => {
    const server = await openMidiStudio(page, validManifest, {}, { webAudio: false });
    try {
      await fillInstrumentGrid(page);
      await page.locator("#normalizeInstrumentGridButton").click();
      await page.locator("#playSectionButton").click();
      await expect(page.locator("#statusLog")).toHaveValue(/FAIL Preview Synth audio unavailable: Web Audio AudioContext is not available\. Use a browser with Web Audio support\./);
      await expect(page.locator("#audioDiagnostics")).toContainText("Preview Synth audio unavailable");
      expect(await page.evaluate(() => window.__midiStudioV2App.previewSynth.getSnapshot())).toMatchObject({
        playing: false,
        supported: false
      });
    } finally {
      await workspaceV2CoverageReporter.stop(page);
      await server.close();
    }
  });

  test("applies Preview Synth instruments, mute, solo, and missing-instrument warnings", async ({ page }) => {
    const server = await openMidiStudio(page);
    try {
      await fillInstrumentGrid(page, {
        bass: "A2 E2 F2 C2 | C3 B2 G2 E2",
        lead: "E4 G4 A4 B4 | C5 B4 G4 E4"
      });
      await page.locator("#normalizeInstrumentGridButton").click();
      await page.locator("#previewInstrumentLeadSelect").selectOption("retro-pulse-lead");
      await expect(page.locator("#statusLog")).toHaveValue(/OK Preview instrument selected for Lead: Retro Pulse Lead\./);

      await setSpreadsheetRowToggle(page, "Bass", "mute", true);
      await expect(page.locator("#statusLog")).toHaveValue(/WARN Lane muted: Bass\./);
      await page.locator("#playSectionButton").click();
      await expect(page.locator("#statusLog")).toHaveValue(/OK Preview Synth started for section intro with \d+ playable events\./);
      await expect(page.locator('.midi-studio-v2__grid-cell--lane-active[data-lane="bass"]')).toHaveCount(0);
      expect((await audioDiagnosticsRows(page))["Muted lanes"]).toBe("bass");
      await page.locator("#stopTimingPreviewButton").click();

      await setSpreadsheetRowToggle(page, "Bass", "mute", false);
      await setSpreadsheetRowToggle(page, "Lead", "solo", true);
      await expect(page.locator("#statusLog")).toHaveValue(/OK Lane soloed: Lead\./);
      await page.locator("#playSectionButton").click();
      await expect(page.locator(".midi-studio-v2__grid-cell--lane-active")).toHaveCount(0);
      await expect(page.locator(".midi-studio-v2__note-table-cell.midi-studio-v2__grid-cell--playhead-active")).toHaveCount(0);
      await expect(page.locator(".midi-studio-v2__grid-cell--timing-header.midi-studio-v2__grid-cell--playhead-active")).toHaveCount(2);
      const soloDiagnostics = await audioDiagnosticsRows(page);
      expect(soloDiagnostics["Active lanes"]).toBe("lead");
      expect(soloDiagnostics["Soloed lanes"]).toBe("lead");
      await page.locator("#stopTimingPreviewButton").click();

      await setSpreadsheetRowToggle(page, "Lead", "solo", false);
      await page.evaluate(() => {
        window.__midiStudioPreviewSynthEvents = [];
      });
      await setSpreadsheetRowToggle(page, "Drums", "solo", true);
      await page.locator("#playSectionButton").click();
      await expect(page.locator("#statusLog")).toHaveValue(/OK Preview Synth started for section intro with \d+ playable events\./);
      expect((await audioDiagnosticsRows(page))["Active lanes"]).toBe("drums");
      expect(await page.evaluate(() => window.__midiStudioPreviewSynthEvents.some((event) => event.action === "buffer-start"))).toBe(true);
      expect(await page.evaluate(() => window.__midiStudioPreviewSynthEvents.some((event) => event.action === "oscillator-start"))).toBe(false);
      await page.locator("#stopTimingPreviewButton").click();
      await setSpreadsheetRowToggle(page, "Drums", "solo", false);

      await page.locator("#previewInstrumentLeadSelect").selectOption("");
      await expect(page.locator("#statusLog")).toHaveValue(/WARN Missing preview instrument selection for Lead\. Choose a Preview Synth instrument before playback\./);
      await page.locator("#playSectionButton").click();
      await expect(page.locator("#statusLog")).toHaveValue(/WARN Preview Synth warnings: Missing preview instrument selection for lead\. Choose a Preview Synth instrument before playback\./);
      await expect(page.locator("#statusLog")).toHaveValue(/OK Preview Synth started for section intro with \d+ playable events\./);
      expect(await page.evaluate(() => window.__midiStudioPreviewSynthEvents.some((event) => event.action === "oscillator-start"))).toBe(true);
    } finally {
      await workspaceV2CoverageReporter.stop(page);
      await server.close();
    }
  });

  test("reports invalid section and invalid loop handling", async ({ page }) => {
    const server = await openMidiStudio(page);
    try {
      await fillInstrumentGrid(page);
      await page.locator("#normalizeInstrumentGridButton").click();
      await expect(page.locator('[data-section-preset="bridge"]')).toBeDisabled();
      await expect(page.locator('[data-section-preset="bridge"]')).toHaveClass(/is-unavailable/);
      await expect(page.locator("#instrumentGridSectionAvailability")).toContainText("Section not available: Bridge, Boss, Victory.");
      const warningCountBefore = await page.locator("#statusLog").evaluate((log) => (log.value.match(/WARN section Bridge does not exist/g) || []).length);
      await page.locator('[data-section-preset="bridge"]').evaluate((button) => {
        button.click();
        button.click();
        button.click();
      });
      await expect(page.locator("#instrumentGridTransportState")).not.toContainText("Section not available: Bridge");
      const warningCountAfter = await page.locator("#statusLog").evaluate((log) => (log.value.match(/WARN section Bridge does not exist/g) || []).length);
      expect(warningCountAfter).toBe(warningCountBefore);
      await page.locator("#instrumentGridLoopStartSelect").selectOption("loop");
      await page.locator("#instrumentGridLoopEndSelect").selectOption("intro");
      await page.locator("#playLoopButton").click();
      await expect(page.locator("#statusLog")).toHaveValue(/WARN Loop region unavailable: Invalid loop region: loop starts after intro\./);
    } finally {
      await workspaceV2CoverageReporter.stop(page);
      await server.close();
    }
  });

  test("generates bass pad arpeggio and drum lanes from chord grid", async ({ page }) => {
    const server = await openMidiStudio(page);
    try {
      await fillInstrumentGrid(page, {
        bass: "",
        chords: "Am F C G | Am F C G",
        drums: "",
        lead: "",
        pad: ""
      });
      await page.locator("#generateBassFromChordsButton").click();
      await expect(page.locator("#instrumentGridBassInput")).toHaveValue("A2 F2 C2 G2 | A2 F2 C2 G2");
      await page.locator("#generatePadFromChordsButton").click();
      await expect(page.locator("#instrumentGridPadInput")).toHaveValue("Am F C G | Am F C G");
      await page.locator("#generateArpeggioFromChordsButton").click();
      await expect(page.locator("#instrumentGridLeadInput")).toHaveValue("A4 A4 G4 G4 | A4 A4 G4 G4");
      await page.locator("#generateBasicDrumsButton").click();
      await expect(page.locator("#instrumentGridDrumsInput")).toHaveValue("kick hat snare hat | kick hat snare hat");
      await expect(page.locator("#instrumentGridSummary")).toContainText("Generated cells");
      const gridModel = await page.evaluate(() => window.__midiStudioV2App.lastInstrumentGridResult);
      expect(gridModel.timeline.some((event) => event.lane === "bass" && event.source === "generated" && event.value === "A2")).toBe(true);
      expect(gridModel.timeline.some((event) => event.lane === "pad" && event.kind === "chord" && event.source === "generated")).toBe(true);
      expect(gridModel.timeline.some((event) => event.lane === "lead" && event.source === "generated")).toBe(true);
      expect(gridModel.timeline.some((event) => event.lane === "drums" && event.source === "generated")).toBe(true);
      await expect(page.locator("#statusLog")).toHaveValue(/OK Generated Basic Drums for 2 bars\./);
    } finally {
      await workspaceV2CoverageReporter.stop(page);
      await server.close();
    }
  });

  test("marks manual cell overrides without hidden regeneration", async ({ page }) => {
    const server = await openMidiStudio(page);
    try {
      await fillInstrumentGrid(page, {
        bass: "",
        chords: "Am F C G | Am F C G",
        drums: "",
        lead: "",
        pad: ""
      });
      await page.locator("#generateBassFromChordsButton").click();
      await page.locator("#instrumentGridBassInput").fill("A2 E2 C2 G2 | A2 F2 C2 G2");
      await page.locator("#normalizeInstrumentGridButton").click();
      const sourceCells = await page.locator('[data-lane="bass"]').evaluateAll((cells) => cells.map((cell) => ({
        source: cell.dataset.source,
        text: cell.textContent
      })));
      expect(sourceCells.slice(0, 4)).toEqual([
        { source: "generated", text: "A2" },
        { source: "manual", text: "E2" },
        { source: "generated", text: "C2" },
        { source: "generated", text: "G2" }
      ]);
      const gridModel = await page.evaluate(() => window.__midiStudioV2App.lastInstrumentGridResult);
      expect(gridModel.timeline.some((event) => event.lane === "bass" && event.value === "E2" && event.source === "manual")).toBe(true);
      expect(await page.locator("#instrumentGridBassInput").inputValue()).toContain("E2");
    } finally {
      await workspaceV2CoverageReporter.stop(page);
      await server.close();
    }
  });

  test("reports invalid chord generation warnings and skipped empty bars", async ({ page }) => {
    const server = await openMidiStudio(page);
    try {
      await fillInstrumentGrid(page, {
        bass: "",
        chords: "Am Cmaj7 Bb G | - - - -",
        drums: "",
        lead: "",
        pad: ""
      });
      await page.locator("#generateBassFromChordsButton").click();
      await expect(page.locator("#statusLog")).toHaveValue(/WARN Instrument grid generation warnings: Unsupported chord pattern "Cmaj7" for lane generation/);
      await expect(page.locator("#statusLog")).toHaveValue(/Invalid note generation for chord "Bb"/);
      await expect(page.locator("#statusLog")).toHaveValue(/WARN Instrument grid generation skipped 1 empty bar\./);
      await expect(page.locator("#instrumentGridBassInput")).toHaveValue("A2 - - G2 | - - - -");
      const gridModel = await page.evaluate(() => window.__midiStudioV2App.lastInstrumentGridResult);
      expect(gridModel.timeline.some((event) => event.lane === "bass" && event.value === "A2" && event.source === "generated")).toBe(true);
      expect(gridModel.timeline.some((event) => event.lane === "bass" && event.value === "Bb")).toBe(false);
    } finally {
      await workspaceV2CoverageReporter.stop(page);
      await server.close();
    }
  });

  test("opens and closes every MIDI Studio accordion with matching icon state", async ({ page }) => {
    const server = await openMidiStudio(page);
    try {
      const tabIds = await page.locator("[data-midi-studio-tab]").evaluateAll((tabs) => tabs.map((tab) => tab.dataset.midiStudioTab).filter(Boolean));
      let auditedHeaders = 0;
      for (const tabId of tabIds) {
        await selectMidiStudioTab(page, tabId);
        const headers = page.locator(`.accordion-v2[data-midi-studio-tab-panel~="${tabId}"] .accordion-v2__header`);
        const headerCount = await headers.count();
        auditedHeaders += headerCount;
        for (let index = 0; index < headerCount; index += 1) {
          const header = headers.nth(index);
          const controls = await header.getAttribute("aria-controls");
          expect(controls).toBeTruthy();
          const content = page.locator(`#${controls}`);
          await expect(header).toBeVisible();
          await expect(content).toHaveCount(1);
          await expect(header).toHaveAttribute("aria-expanded", "true");
          await expect(header.locator(".accordion-v2__icon")).toHaveText("X");
          await header.click({ position: { x: 8, y: 8 } });
          await expect(header).toHaveAttribute("aria-expanded", "false");
          await expect(header.locator(".accordion-v2__icon")).toHaveText("+");
          await expect(header.locator(".accordion-v2__icon")).toHaveAttribute("data-accordion-v2-icon-state", "closed");
          await expect(content).toBeHidden();
          await header.click({ position: { x: 8, y: 8 } });
          await expect(header).toHaveAttribute("aria-expanded", "true");
          await expect(header.locator(".accordion-v2__icon")).toHaveText("X");
          await expect(header.locator(".accordion-v2__icon")).toHaveAttribute("data-accordion-v2-icon-state", "open");
          await expect(content).toBeVisible();
        }
      }
      expect(auditedHeaders).toBeGreaterThan(0);
    } finally {
      await workspaceV2CoverageReporter.stop(page);
      await server.close();
    }
  });

  test("expands and restores the MIDI Studio workspace from the header details toggle", async ({ page }) => {
    const server = await openMidiStudio(page);
    try {
      await page.setViewportSize({ height: 900, width: 1920 });
      await fillInstrumentGrid(page);
      await page.locator("#normalizeInstrumentGridButton").click();
      const summary = page.locator("[data-midi-studio-summary]");
      const centerPanel = page.locator(".tool-shell-common__fullscreen-center-panel");
      const normalWidth = (await centerPanel.boundingBox())?.width || 0;
      await summary.click();
      const enteredFullscreen = await page.waitForFunction(() => document.body.classList.contains("tools-platform-fullscreen-active"), null, { timeout: 2500 })
        .then(() => true)
        .catch(() => false);
      if (!enteredFullscreen) {
        await page.evaluate(() => {
          document.querySelector(".is-collapsible").open = false;
          window.__midiStudioV2App.shell.applyFullscreenState(true);
          window.__midiStudioV2App.shell.updateSummary();
          window.__midiStudioV2App.handleExpandedModeChange(true);
        });
      }

      await expect(page.locator("body")).toHaveClass(/tools-platform-fullscreen-active/);
      await expect(page.locator("body")).toHaveAttribute("data-tools-platform-fullscreen", "1");
      await expect(summary).toHaveAttribute("data-tools-platform-summary-mode", "fullscreen");
      await expect(summary).toHaveAttribute("data-tools-platform-summary-state", "collapsed");
      await expect(summary).toContainText("MIDI Studio V2 - First-Class Tools Surface V2");
      const fullscreenState = await page.evaluate(() => ({
        elementIsDocumentElement: document.fullscreenElement === document.documentElement,
        supported: document.fullscreenEnabled === true
      }));
      if (fullscreenState.supported && enteredFullscreen) {
        expect(fullscreenState.elementIsDocumentElement).toBe(true);
      }
      await expect(page.locator(".midi-studio-v2__tool-menu")).toBeVisible();
      await expect(page.locator("#playButton")).toBeVisible();
      await expect(page.locator("#stopAllAudioButton")).toBeVisible();
      await expect(page.locator(".tool-shell-common__fullscreen-panel-left")).toBeVisible();
      await expect(page.locator(".midi-studio-v2__instrument-list-panel")).toHaveCount(0);
      await expect(laneHeader(page, "lead")).toBeVisible();
      await expect(laneHeader(page, "bass")).toBeVisible();
      await expect(laneHeader(page, "drums")).toBeVisible();
      await expect(page.locator("#instrumentGridContent")).toBeVisible();
      await expect(page.locator("#toolImportManifestButton")).toBeVisible();
      await expect(page.locator("#statusLogContent")).toBeVisible();
      await expect(page.locator("#clearStatusButton")).toBeVisible();
      const fullscreenLayout = await page.evaluate(() => {
        const root = document.querySelector(".tool-shell-common__fullscreen-root").getBoundingClientRect();
        const left = document.querySelector(".tool-shell-common__fullscreen-panel-left").getBoundingClientRect();
        const center = document.querySelector(".tool-shell-common__fullscreen-center-panel").getBoundingClientRect();
        const right = document.querySelector(".tool-shell-common__fullscreen-panel-right").getBoundingClientRect();
        const layout = document.querySelector(".tool-shell-common__fullscreen-layout");
        return {
          centerAfterLeft: center.left >= left.right - 1,
          centerWidth: Math.round(center.width),
          layoutDisplay: getComputedStyle(layout).display,
          leftAtSide: left.left < center.left,
          leftWidth: Math.round(left.width),
          rightAtSide: right.left >= center.right - 1,
          rightWithinRoot: right.right <= root.right + 1,
          rightWidth: Math.round(right.width),
          rootWidth: Math.round(root.width),
          viewportWidth: window.innerWidth
        };
      });
      expect(fullscreenLayout.layoutDisplay).toBe("grid");
      expect(fullscreenLayout.rootWidth).toBeGreaterThanOrEqual(fullscreenLayout.viewportWidth - 24);
      expect(fullscreenLayout.leftWidth).toBeLessThanOrEqual(260);
      expect(fullscreenLayout.rightWidth).toBeLessThanOrEqual(220);
      expect(fullscreenLayout.centerWidth).toBeGreaterThan(1200);
      expect(fullscreenLayout.centerWidth).toBeGreaterThan(fullscreenLayout.leftWidth + fullscreenLayout.rightWidth);
      expect(fullscreenLayout.leftAtSide).toBe(true);
      expect(fullscreenLayout.centerAfterLeft).toBe(true);
      expect(fullscreenLayout.rightAtSide).toBe(true);
      expect(fullscreenLayout.rightWithinRoot).toBe(true);
      const expandedWidth = (await centerPanel.boundingBox())?.width || 0;
      expect(expandedWidth).toBeGreaterThan(normalWidth);
      await expect(page.locator("#statusLog")).toHaveValue(/INFO Entered MIDI Studio fullscreen view\. Tool transport, Stop All Audio, recovery controls, and timeline instrument rows remain visible\./);

      if (await page.evaluate(() => Boolean(document.fullscreenElement))) {
        await summary.click();
        await page.waitForFunction(() => !document.body.classList.contains("tools-platform-fullscreen-active"));
      } else {
        await page.evaluate(() => {
          window.__midiStudioV2App.shell.applyFullscreenState(false);
          document.querySelector(".is-collapsible").open = true;
          window.__midiStudioV2App.shell.updateSummary();
          window.__midiStudioV2App.handleExpandedModeChange(false);
        });
      }
      await expect(page.locator("body")).not.toHaveClass(/tools-platform-fullscreen-active/);
      await expect(summary).toHaveAttribute("data-tools-platform-summary-mode", "normal");
      await expect(summary).toContainText("Hide Header and Details");
      await expect(page.locator("#shared-theme-header")).toBeVisible();
      await expect(page.locator(".tool-shell-common__fullscreen-panel-left")).toBeVisible();
      await expect(page.locator('[data-midi-studio-tab="studio"]')).toHaveAttribute("aria-selected", "true");
      await expect(page.locator("#instrumentGridContent")).toBeVisible();
      await expect(page.locator("#statusLog")).toHaveValue(/INFO Exited MIDI Studio fullscreen view\. Header, setup, and diagnostics layout restored\./);
    } finally {
      await workspaceV2CoverageReporter.stop(page);
      await server.close();
    }
  });

  test("keeps guided Song Sheet workflow primary alongside the advanced grid editor", async ({ page }) => {
    const server = await openMidiStudio(page);
    try {
      await fillGuidedSongSheet(page);
      await page.locator("#parseSongSheetButton").click();
      await expect(page.locator("#songSheetSummary")).toContainText("loop: 4 bars, 4 chords, loop");
      await fillInstrumentGrid(page, {
        bass: "A2 - F2 - | C3 - G2 -",
        chords: "Am F C G | Am F C G"
      });
      await page.locator("#normalizeInstrumentGridButton").click();
      await expect(page.locator("#songSheetSummary")).toContainText("loop: 4 bars, 4 chords, loop");
      await expect(page.locator("#instrumentGridSummary")).toContainText("30 normalized events");
    } finally {
      await workspaceV2CoverageReporter.stop(page);
      await server.close();
    }
  });

  test("shows actionable failure when no rendered target and no live MIDI engine exist", async ({ page }) => {
    const server = await openMidiStudio(page);
    try {
      await page.locator('[data-song-id="source-only"]').click();
      await page.locator("#playButton").click();
      await expect(page.locator("#statusLog")).toHaveValue(/WARN Live MIDI synthesis not implemented\./);
      await expect(page.locator("#statusLog")).toHaveValue(/FAIL No rendered audio target is available for Source Only, and no live MIDI engine is available\./);
      await expect(page.locator("#stopButton")).toBeDisabled();
      await expect(page.locator("#playButton")).toBeEnabled();
    } finally {
      await workspaceV2CoverageReporter.stop(page);
      await server.close();
    }
  });

  test("updates play and stop control state without requiring real audio output", async ({ page }) => {
    const server = await openMidiStudio(page);
    try {
      await page.locator("#loopToggle").check();
      await page.locator("#playButton").click();
      await expect(page.locator("#playButton")).toBeDisabled();
      await expect(page.locator("#stopButton")).toBeEnabled();
      await expect(page.locator("#playbackState")).toContainText("Playing audible preview: Main Theme");
      await expect(page.locator("#statusLog")).toHaveValue(/OK Rendered preview started for Main Theme: assets\/music\/rendered\/theme-main\.ogg\./);
      expect(await page.evaluate(() => window.__midiStudioAudioEvents)).toEqual([
        { action: "play", loop: true, src: "assets/music/rendered/theme-main.ogg" }
      ]);
      await page.locator("#stopButton").click();
      await expect(page.locator("#stopButton")).toBeDisabled();
      await expect(page.locator("#playButton")).toBeEnabled();
      await expect(page.locator("#playbackState")).toContainText("Stopped audible preview: Main Theme.");
    } finally {
      await workspaceV2CoverageReporter.stop(page);
      await server.close();
    }
  });

  test("keeps header actions inside section headers", async ({ page }) => {
    const server = await openMidiStudio(page);
    try {
      const clearButton = page.locator("#clearStatusButton");
      await expect(clearButton.locator("xpath=ancestor::*[contains(concat(' ', normalize-space(@class), ' '), ' accordion-v2__header ')][1]")).toHaveAttribute("aria-controls", "statusLogContent");
      await expect(page.locator("#statusLogContent #clearStatusButton")).toHaveCount(0);
      await expect(page.locator(".accordion-v2__header #clearStatusButton")).toHaveCount(1);
      await expect(clearButton).toHaveClass(/midi-studio-v2__status-clear-button/);
      await expect(clearButton).toHaveCSS("padding-left", "0px");
      await expect(clearButton).toHaveCSS("padding-right", "0px");
      expect(await page.locator(".accordion-v2").evaluateAll((sections) => sections.every((section) => {
        const header = section.querySelector(".accordion-v2__header");
        const icon = section.querySelector(".accordion-v2__icon");
        return Boolean(header && icon && header.contains(icon));
      }))).toBe(true);
      expect(await page.locator("body").evaluate((body) => Array.from(body.querySelectorAll('[aria-label*="close" i], [title*="close" i], [data-close], .tool-starter__close-button')).every((control) => Boolean(control.closest(".accordion-v2__header, .tools-platform-frame__accordion-summary, .is-collapsible__summary"))))).toBe(true);
    } finally {
      await workspaceV2CoverageReporter.stop(page);
      await server.close();
    }
  });

  test("clears status content and preserves accordion open close behavior", async ({ page }) => {
    const server = await openMidiStudio(page);
    try {
      const statusHeader = page.locator('.accordion-v2__header[aria-controls="statusLogContent"]');
      await expect(page.locator("#statusLog")).toHaveValue(/OK Loaded 3 MIDI songs/);
      await page.locator("#clearStatusButton").click();
      await expect(page.locator("#statusLog")).toHaveValue("");
      await expect(statusHeader).toHaveAttribute("aria-expanded", "true");
      await expect(page.locator("#statusLogContent")).toBeVisible();
      await statusHeader.click();
      await expect(statusHeader).toHaveAttribute("aria-expanded", "false");
      await expect(page.locator("#statusLogContent")).toBeHidden();
      await statusHeader.click();
      await expect(statusHeader).toHaveAttribute("aria-expanded", "true");
      await expect(page.locator("#statusLogContent")).toBeVisible();
      await selectMidiStudioTab(page, "song-setup");
      const songDetailsHeader = page.locator('.accordion-v2__header[aria-controls="songDetailsContent"]');
      await songDetailsHeader.click();
      await expect(songDetailsHeader).toHaveAttribute("aria-expanded", "false");
      await expect(page.locator("#songDetailsContent")).toBeHidden();
      await songDetailsHeader.click();
      await expect(songDetailsHeader).toHaveAttribute("aria-expanded", "true");
      await expect(page.locator("#songDetailsContent")).toBeVisible();
    } finally {
      await workspaceV2CoverageReporter.stop(page);
      await server.close();
    }
  });

  test("rejects invalid payloads before render", async ({ page }) => {
    const server = await openMidiStudio(page, {
      music: {
        version: 1,
        songs: [{ name: "Broken Song" }]
      }
    });
    try {
      await expect(page.locator("#songList")).toContainText("No MIDI songs loaded.");
      await expect(page.locator("#playButton")).toBeDisabled();
      await expect(page.locator("#songDetails")).toBeHidden();
      await expect(page.locator("#songDetails input[data-song-detail-field]")).toHaveCount(0);
      await expect(page.locator("#instrumentGridOutput")).toContainText("No grid data normalized. Import a manifest arrangement or enter sections/chords, then choose Normalize Grid.");
      await expect(page.locator("#instrumentGridSectionSelect")).toContainText("No section selected");
      await expect(page.locator("#songSourceField")).toHaveValue("No song selected");
      await expect(page.locator("#renderedTargets")).toContainText("No rendered WAV target selected.");
      await expect(page.locator("#statusLog")).toHaveValue(/FAIL MIDI Studio V2 payload rejected before render .* music\.songs\[0\]\.id is required\./);
      await selectMidiStudioTab(page, "export");
      await page.locator("#renderedExportTargetTypeSelect").selectOption("wav");
      await page.locator("#renderedExportSaveButton").click();
      await expect(page.locator("#statusLog")).toHaveValue(/FAIL Missing MIDI song for WAV export\. Load or select a song before exporting\./);
    } finally {
      await workspaceV2CoverageReporter.stop(page);
      await server.close();
    }
  });
});
