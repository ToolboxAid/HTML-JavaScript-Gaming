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

async function selectMidiStudioTab(page, tabId) {
  const tab = page.locator(`[data-midi-studio-tab="${tabId}"]`);
  if (await tab.getAttribute("aria-selected") === "true") {
    return;
  }
  await tab.click();
  await expect(tab).toHaveAttribute("aria-selected", "true");
}

async function fillGuidedSongSheet(page, { intro = "Am F", key = "A minor", loop = "Am F C G", style = "retro-arcade", tempo = "132" } = {}) {
  await selectMidiStudioTab(page, "song-setup");
  await page.locator("#songSheetTempoInput").fill(tempo);
  await page.locator("#songSheetKeyInput").selectOption(key);
  await page.locator("#songSheetStyleInput").selectOption(style);
  await page.locator("#songSheetIntroInput").fill(intro);
  await page.locator("#songSheetLoopInput").fill(loop);
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

function instrumentRow(page, lane) {
  return page.locator(`.midi-studio-v2__instrument-row[data-lane="${lane}"]`);
}

async function selectInstrumentRow(page, lane) {
  await instrumentRow(page, lane).locator(`[data-lane-label="${lane}"]`).click();
}

function instrumentTypeSelect(page, lane) {
  return instrumentRow(page, lane).locator("[data-lane-instrument-type-select]");
}

function instrumentSelect(page, lane) {
  return instrumentRow(page, lane).locator("[data-lane-instrument-select]");
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

  test("octave timeline editor is the default editable and playable Studio workflow", async ({ page }) => {
    const server = await openMidiStudioForImport(page);
    try {
      await page.locator("#toolImportManifestInput").setInputFiles(uatManifestPath);
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
      await expect(page.locator("#songDetails input[data-song-detail-field='name']")).toHaveValue("Camptown Races UAT Reel");
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

  test("keeps selected song details editable and nests Song Sheet under the details panel", async ({ page }) => {
    const server = await openMidiStudioForImport(page);
    try {
      await page.locator("#toolImportManifestInput").setInputFiles(uatManifestPath);
      await page.locator('[data-midi-studio-tab="song-setup"]').click();
      await expect(page.locator('[data-midi-studio-tab="song-setup"]')).toHaveAttribute("aria-selected", "true");
      await expect(page.locator("#songDetailsContent")).toBeVisible();
      await expect(page.locator("#songDetailsContent #songSheetContent")).toHaveCount(1);
      await expect(page.locator("#songDetailsContent #songSheetSummary")).toHaveCount(0);
      await expect(page.locator("#songSheetSummaryContent")).toHaveCount(0);
      await expect(page.locator("#songDetails input[data-song-detail-field='name']")).toHaveValue("Camptown Races UAT Reel");
      await expect(page.locator("#songDetails input[data-song-detail-field='tempo']")).toHaveValue("144");
      await expect(page.locator("#songDetails input[data-song-detail-field='key']")).toHaveValue("G major");
      await expect(page.locator("#songDetails input[data-song-detail-field='style']")).toHaveValue("public-domain-reel");
      await expect(page.locator("#songDetails input[data-song-detail-field='loopEnabled']")).toBeChecked();
      await expect(page.locator("#songDetails input[data-song-detail-field='loopStartSeconds']")).toHaveValue("0");
      await expect(page.locator("#songDetails input[data-song-detail-field='loopEndSeconds']")).toHaveValue("14");
      await expect(page.locator("#songDetails input[data-song-detail-field='sourceMidi']")).toHaveCount(0);
      await expect(page.locator("#songDetails input[data-song-detail-field='instrumentSet']")).toHaveCount(0);
      await expect(page.locator("#songDetails input[data-song-detail-field='tags']")).toHaveValue("uat, upbeat, traditional, public-domain");
      await selectMidiStudioTab(page, "midi-import");
      await expect(page.locator("#songSourceField")).toHaveValue("assets/music/midi/camptown-races-uat-reel.mid");
      await expect(page.locator("#instrumentSetField")).toHaveValue("Preview Synth public-domain UAT band");
      await selectMidiStudioTab(page, "song-setup");

      await page.locator("#songDetails input[data-song-detail-field='name']").fill("Edited UAT Reel");
      await expect(page.locator("#nowPlayingLabel")).toHaveText("Selected: Edited UAT Reel");
      await expect(page.locator("#songList [data-song-id='camptown-races-uat-reel']")).toContainText("Edited UAT Reel");
      await page.locator("#songDetails input[data-song-detail-field='tempo']").fill("156");
      await expect(page.locator("#songSheetTempoInput")).toHaveValue("156");
      await page.locator("#songDetails input[data-song-detail-field='key']").fill("C major");
      await expect(page.locator("#songSheetKeyInput")).toHaveValue("C major");
      await page.locator("#songDetails input[data-song-detail-field='style']").fill("chip");
      await expect(page.locator("#songSheetStyleInput")).toHaveValue("chip");
      await page.locator("#songDetails input[data-song-detail-field='loopEnabled']").setChecked(false);
      await page.locator("#songDetails input[data-song-detail-field='loopStartSeconds']").fill("1.5");
      await page.locator("#songDetails input[data-song-detail-field='loopEndSeconds']").fill("12.5");
      await expect(page.locator("#songDetails input[data-song-detail-field='loopEnabled']")).not.toBeChecked();
      expect(await page.evaluate(() => {
        const song = window.__midiStudioV2App.selectedSong();
        return {
          key: song.studioArrangement.key,
          loopEnabled: song.loop.enabled,
          loopEndSeconds: song.loop.endSeconds,
          loopStartSeconds: song.loop.startSeconds,
          name: song.name,
          style: song.studioArrangement.style,
          tempo: song.studioArrangement.tempo
        };
      })).toEqual({
        key: "C major",
        loopEnabled: false,
        loopEndSeconds: 12.5,
        loopStartSeconds: 1.5,
        name: "Edited UAT Reel",
        style: "chip",
        tempo: "156"
      });
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
      await expect(page.locator("#songDetails input[data-song-detail-field='name']")).toHaveValue("Camptown Races UAT Reel");
      await expect(page.locator("#songDetails input[data-song-detail-field='tempo']")).toHaveValue("144");
      await expect(page.locator("#songDetails input[data-song-detail-field='key']")).toHaveValue("G major");
      await expect(page.locator("#songDetails input[data-song-detail-field='style']")).toHaveValue("public-domain-reel");
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
      await expect(page.locator("#songDetails input[data-song-detail-field='name']")).toHaveValue("Frog Hop Nursery Rhyme UAT");
      await expect(page.locator("#instrumentGridSectionsInput")).toHaveValue("hop:2, home:2");
      await expect(octaveCell(page, "C5", 0)).toHaveAttribute("data-note-lanes", /lead/);
      await expect(octaveCell(page, "G4", 0)).not.toHaveAttribute("data-note-lanes", /lead/);
      const frogState = await page.evaluate(() => {
        const app = window.__midiStudioV2App;
        const state = app.selectedSongState();
        return {
          activeSongId: app.payload.activeSongId,
          detailTitle: document.querySelector("#songDetails input[data-song-detail-field='name']").value,
          instrumentRows: document.querySelectorAll(".midi-studio-v2__instrument-row").length,
          selectedSongId: app.selectedSongId,
          stateSongId: state.songId,
          timelineLeadZero: state.gridResult.timeline.some((event) => event.lane === "lead" && event.stepIndex === 0 && event.value === "C5")
        };
      });
      expect(frogState).toEqual({
        activeSongId: "frog-hop-nursery-rhyme",
        detailTitle: "Frog Hop Nursery Rhyme UAT",
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

      await selectMidiStudioTab(page, "diagnostics");
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
      await expect(renderedHeader).toContainText("Rendered Export Targets");
      await expect(renderedHeader.locator("#exportWavButton")).toHaveCount(0);
      await expect(page.locator("#exportWavButton")).toHaveCount(0);
      await expect(page.locator("#exportMp3Button")).toHaveCount(0);
      await expect(page.locator("#exportOggButton")).toHaveCount(0);
      await expect(page.locator(".midi-studio-v2__tool-menu #toolImportManifestButton")).toBeVisible();
      await expect(page.locator(".midi-studio-v2__tool-menu #saveProjectButton")).toBeVisible();
      await expect(page.locator(".midi-studio-v2__tool-menu #loadExampleAndPlayButton")).toHaveCount(0);
      await expect(page.locator(".midi-studio-v2__tool-menu #stopAllAudioButton")).toBeVisible();
      await expect(page.locator('.midi-studio-v2__tool-menu label[for="renderedExportTargetTypeSelect"]')).toContainText("Output Type");
      await expect(page.locator(".midi-studio-v2__tool-menu #renderedExportTargetTypeSelect")).toBeVisible();
      await expect(page.locator(".midi-studio-v2__tool-menu #renderedExportSaveButton")).toBeVisible();
      await expect(page.locator(".midi-studio-v2__tool-menu #renderedExportSaveButton")).toHaveText("Save Output");
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
        "Studio",
        "Song Setup",
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
      await expect(page.locator("#statusLog")).toHaveValue(/INFO Next: select a MIDI Studio song, review the Studio tab timeline, then press Play to audition the imported arrangement\./);
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

  test("exports output through Type dropdown and Save Output without claiming project save", async ({ page }) => {
    const server = await openMidiStudio(page);
    try {
      await expect(page.locator("#exportWavButton")).toHaveCount(0);
      await expect(page.locator("#exportMp3Button")).toHaveCount(0);
      await expect(page.locator("#exportOggButton")).toHaveCount(0);
      await expect(page.locator("#renderedExportTargetTypeSelect")).toBeVisible();
      await expect(page.locator("#renderedExportTargetTypeSelect option")).toContainText(["WAV", "MP3", "OGG"]);
      await expect(page.locator("#renderedExportSaveButton")).toBeVisible();
      await expect(page.locator("#renderedExportSaveButton")).toHaveText("Save Output");
      const exportControlsFit = await page.locator(".midi-studio-v2__tool-menu").evaluate((menu) => {
        const label = menu.querySelector('label[for="renderedExportTargetTypeSelect"]').getBoundingClientRect();
        const typeSelect = menu.querySelector("#renderedExportTargetTypeSelect").getBoundingClientRect();
        const saveButton = menu.querySelector("#renderedExportSaveButton").getBoundingClientRect();
        const menuRect = menu.getBoundingClientRect();
        return {
          fit: typeSelect.left >= menuRect.left - 1 && saveButton.right <= menuRect.right + 1,
          sameRow: label.right <= saveButton.left && label.bottom >= saveButton.top && saveButton.bottom >= label.top
        };
      });
      expect(exportControlsFit.fit).toBe(true);
      expect(exportControlsFit.sameRow).toBe(true);
      await page.locator("#renderedExportTargetTypeSelect").selectOption("wav");
      await page.locator("#renderedExportSaveButton").click();
      await page.locator("#renderedExportTargetTypeSelect").selectOption("mp3");
      await page.locator("#renderedExportSaveButton").click();
      await page.locator("#renderedExportTargetTypeSelect").selectOption("ogg");
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
      await expect(spreadsheetCell(page, "chords", 0)).toHaveText("Am");
      await expect(spreadsheetCell(page, "chords", 8)).toHaveText("Am");
      await expect(spreadsheetCell(page, "bass", 0)).toContainText("A2");
      expect(await page.locator("#songSheetSummary div").evaluateAll((rows) => Object.fromEntries(rows.map((row) => [
        row.querySelector("dt")?.textContent || "",
        row.querySelector("dd")?.textContent || ""
      ])))).toMatchObject({
        "Bars": "6",
        "Chord count": "6",
        "Estimated duration": "10.909 seconds",
        "Key": "A minor",
        "Loop sections": "loop",
        "Style": "retro-arcade",
        "Tempo": "132",
        "Warnings": "none"
      });
      await expect(page.locator("#statusLog")).toHaveValue(/OK Song Sheet parsed: 2 sections, 6 bars, 6 chords\./);
      await expect(page.locator("#statusLog")).toHaveValue(/OK Song Sheet updated the editable note grid\./);
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
      await page.locator("#songSheetLoopInput").fill("");
      await page.locator("#parseSongSheetButton").click();
      await expect(page.locator("#songSheetSummary")).toContainText("Section loop is empty.");
      await expect(page.locator("#statusLog")).toHaveValue(/WARN Song Sheet parsed with warnings: Section intro is empty\.; Section loop is empty\./);
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
      await expect(page.locator("#songSheetSummary")).toContainText("Invalid tempo/BPM. Enter a positive number before parsing the guided Song Sheet.");
      await expect(page.locator("#songSheetSummary")).not.toContainText("intro:");
      await expect(page.locator("#statusLog")).toHaveValue(/FAIL Song Sheet rejected: Invalid tempo\/BPM\. Enter a positive number before parsing the guided Song Sheet\./);
      await page.locator("#songSheetTempoInput").fill("132");
      await page.locator("#songSheetKeyInput").selectOption("");
      await page.locator("#parseSongSheetButton").click();
      await expect(page.locator("#songSheetSummary")).toContainText("Missing key. Enter a key before parsing the guided Song Sheet.");
      await expect(page.locator("#songSheetSummary")).not.toContainText("loop:");
      await expect(page.locator("#statusLog")).toHaveValue(/FAIL Song Sheet rejected: Missing key\. Enter a key before parsing the guided Song Sheet\./);
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
      await selectMidiStudioTab(page, "song-setup");
      await expect(page.locator("#songDetailsContent #midiImportContent")).toBeVisible();
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
      const headerCount = await page.locator(".accordion-v2__header").count();
      for (let index = 0; index < headerCount; index += 1) {
        const header = page.locator(".accordion-v2__header").nth(index);
        const controls = await header.getAttribute("aria-controls");
        expect(controls).toBeTruthy();
        const content = page.locator(`#${controls}`);
        await expect(content).toHaveCount(1);
        await expect(header).toHaveAttribute("aria-expanded", "true");
        await expect(header.locator(".accordion-v2__icon")).toHaveText("-");
        await header.click({ position: { x: 8, y: 8 } });
        await expect(header).toHaveAttribute("aria-expanded", "false");
        await expect(header.locator(".accordion-v2__icon")).toHaveText("+");
        await expect(content).toBeHidden();
        await header.click({ position: { x: 8, y: 8 } });
        await expect(header).toHaveAttribute("aria-expanded", "true");
        await expect(header.locator(".accordion-v2__icon")).toHaveText("-");
        await expect(content).toBeVisible();
      }
      expect(await page.locator("[id]").evaluateAll((elements) => {
        const ids = elements.map((element) => element.id).filter(Boolean);
        return ids.length === new Set(ids).size;
      })).toBe(true);
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
      await expect(page.locator("#songDetails")).toContainText("No song selected");
      await expect(page.locator("#instrumentGridOutput")).toContainText("No grid data normalized. Import a manifest arrangement or enter sections/chords, then choose Normalize Grid.");
      await expect(page.locator("#instrumentGridSectionSelect")).toContainText("No section selected");
      await expect(page.locator("#songSourceField")).toHaveValue("No song selected");
      await expect(page.locator("#renderedTargets")).toContainText("No rendered WAV target selected.");
      await expect(page.locator("#statusLog")).toHaveValue(/FAIL MIDI Studio V2 payload rejected before render .* music\.songs\[0\]\.id is required\./);
      await page.locator("#renderedExportTargetTypeSelect").selectOption("wav");
      await page.locator("#renderedExportSaveButton").click();
      await expect(page.locator("#statusLog")).toHaveValue(/FAIL Missing MIDI song for WAV export\. Load or select a song before exporting\./);
    } finally {
      await workspaceV2CoverageReporter.stop(page);
      await server.close();
    }
  });
});
