import { expect, test } from "@playwright/test";
import fs from "node:fs/promises";
import path from "node:path";
import { startRepoServer } from "../../helpers/playwrightRepoServer.mjs";
import { workspaceV2CoverageReporter } from "../../helpers/workspaceV2CoverageReporter.mjs";

const uatManifestPath = path.resolve("tests/fixtures/midi-studio-v2/uat-midi-studio-v2.game.manifest.json");
const roadmapPath = path.resolve("docs/dev/roadmaps/MIDI_STUDIO_V2_ROADMAP.md");

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
  await selectMidiStudioTab(page, "studio");
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

function laneHeader(page, lane) {
  return page.locator(`.midi-studio-v2__lane-header-cell[data-lane="${lane}"]`);
}

function laneInstrumentSelect(page, lane) {
  return laneHeader(page, lane).locator("[data-lane-instrument-select]");
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

  test("imports UAT manifest and plays the upbeat multi-instrument studio arrangement", async ({ page }) => {
    const server = await openMidiStudioForImport(page);
    try {
      await expect(page.locator("#toolImportManifestButton")).toHaveText("Import JSON Manifest");
      await expect(page.locator("#loadExampleAndPlayButton")).toHaveCount(0);
      await expect(page.locator("#useExampleButton")).toHaveCount(0);
      await page.locator("#toolImportManifestInput").setInputFiles(uatManifestPath);

      await expect(page.locator("#statusLog")).toHaveValue(/OK Loaded 3 MIDI songs from Import JSON Manifest:.*uat-midi-studio-v2\.game\.manifest\.json via manifest\.music\./);
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
      await expect(page.locator(".midi-studio-v2__lane-role")).toHaveCount(0);
      await expect(laneHeader(page, "lead")).not.toContainText("Volume");
      await expect(laneHeader(page, "lead")).not.toContainText("Pan");
      await expect(laneHeader(page, "lead").locator('[aria-label="Mute Lead"]')).toHaveCount(1);
      await expect(laneHeader(page, "lead").locator('[aria-label="Solo Lead"]')).toHaveCount(1);
      await expect(laneHeader(page, "lead").locator('[data-lane-control-toggle="volume"]')).toHaveCount(1);
      await expect(laneHeader(page, "lead").locator('[data-lane-control-toggle="pan"]')).toHaveCount(1);
      await expect(page.locator("#previewVolumeLeadInput")).toBeHidden();
      await laneHeader(page, "lead").locator('[data-lane-control-toggle="volume"]').click();
      await expect(page.locator("#previewVolumeLeadInput")).toBeVisible();
      await laneHeader(page, "lead").locator('[data-lane-control-toggle="volume"]').click();
      await expect(page.locator("#previewVolumeLeadInput")).toBeHidden();
      await expect(page.locator("#previewPanLeadInput")).toBeHidden();
      await laneHeader(page, "lead").locator('[data-lane-control-toggle="pan"]').click();
      await expect(page.locator("#previewPanLeadInput")).toBeVisible();
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
      const firstPlayheadStep = Number(await page.locator(".midi-studio-v2__grid-cell--timing-header.midi-studio-v2__grid-cell--playhead-active").getAttribute("data-step-index"));
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
      const nextPlayheadStep = Number(await page.locator(".midi-studio-v2__grid-cell--timing-header.midi-studio-v2__grid-cell--playhead-active").getAttribute("data-step-index"));
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

  test("keeps selected song details editable and nests Song Sheet under the details panel", async ({ page }) => {
    const server = await openMidiStudioForImport(page);
    try {
      await page.locator("#toolImportManifestInput").setInputFiles(uatManifestPath);
      await page.locator('[data-midi-studio-tab="song-setup"]').click();
      await expect(page.locator('[data-midi-studio-tab="song-setup"]')).toHaveAttribute("aria-selected", "true");
      await expect(page.locator("#songDetailsContent")).toBeVisible();
      await expect(page.locator("#songDetailsContent #songSheetContent")).toHaveCount(1);
      await expect(page.locator("#songDetailsContent #songSheetSummary")).toHaveCount(1);
      await expect(page.locator("#songSheetSummaryContent")).toHaveCount(0);
      await expect(page.locator("#songDetails input[data-song-detail-field='name']")).toHaveValue("Camptown Races UAT Reel");
      await expect(page.locator("#songDetails input[data-song-detail-field='tempo']")).toHaveValue("144");
      await expect(page.locator("#songDetails input[data-song-detail-field='key']")).toHaveValue("G major");
      await expect(page.locator("#songDetails input[data-song-detail-field='style']")).toHaveValue("public-domain-reel");
      await expect(page.locator("#songDetails input[data-song-detail-field='loopEnabled']")).toBeChecked();
      await expect(page.locator("#songDetails input[data-song-detail-field='loopStartSeconds']")).toHaveValue("0");
      await expect(page.locator("#songDetails input[data-song-detail-field='loopEndSeconds']")).toHaveValue("14");
      await expect(page.locator("#songDetails input[data-song-detail-field='sourceMidi']")).toHaveValue("assets/music/midi/camptown-races-uat-reel.mid");
      await expect(page.locator("#songDetails input[data-song-detail-field='tags']")).toHaveValue("uat, upbeat, traditional, public-domain");

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

  test("roadmap exists with required MIDI Studio V2 status markers", async () => {
    const roadmap = await fs.readFile(roadmapPath, "utf8");
    expect(roadmap).toContain("[.] First priority: UAT manifest import");
    expect(roadmap).toContain("[x] UAT manifest import uses Import JSON Manifest");
    expect(roadmap).toContain("[x] Real UAT manifest fixture includes multiple MIDI Studio songs.");
    expect(roadmap).toContain("[x] Playable upbeat public-domain/traditional-style test song arrangement includes Lead, Bass, Chords/Pad, and Drums.");
    expect(roadmap).toContain("[x] Tabs organize Studio, Song Setup, Instruments, Auto-Create Parts, MIDI Import, Export, and Diagnostics.");
    expect(roadmap).toContain("[ ] MIDI import conversion to editable tracks.");
    expect(roadmap).toContain("[ ] Rendered WAV/MP3/OGG export.");
    expect(roadmap).toContain("[ ] SoundFont and real instrument playback.");
    expect(roadmap).toContain("[ ] Optional piano roll.");
    expect(roadmap).toContain("[ ] Optional advanced MIDI event editor.");
  });

  test("launches and renders a valid multi-song manifest payload", async ({ page }) => {
    const server = await openMidiStudio(page);
    try {
      await expect(page.locator("body")).toHaveAttribute("data-tool-id", "midi-studio-v2");
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
      await expect(page.locator(".midi-studio-v2__tool-menu #toolImportManifestButton")).toBeVisible();
      await expect(page.locator(".midi-studio-v2__tool-menu #loadExampleAndPlayButton")).toHaveCount(0);
      await expect(page.locator(".midi-studio-v2__tool-menu #stopAllAudioButton")).toBeVisible();
      await expect(page.locator(".midi-studio-v2__tool-menu #exportWavButton")).toBeVisible();
      await expect(page.locator(".midi-studio-v2__tool-menu #exportMp3Button")).toBeVisible();
      await expect(page.locator(".midi-studio-v2__tool-menu #exportOggButton")).toBeVisible();
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

  test("reports rendered export nav action status without claiming files were written", async ({ page }) => {
    const server = await openMidiStudio(page);
    try {
      await expect(page.locator('.accordion-v2__header[aria-controls="renderedTargetsContent"] #exportWavButton')).toHaveCount(0);
      await expect(page.locator(".midi-studio-v2__tool-menu #exportWavButton")).toBeVisible();
      await page.locator("#exportWavButton").click();
      await page.locator("#exportMp3Button").click();
      await page.locator("#exportOggButton").click();
      await expect(page.locator("#statusLog")).toHaveValue(/WARN Export rendering not implemented for WAV\. Planned target: assets\/music\/rendered\/theme-main\.wav\./);
      await expect(page.locator("#statusLog")).toHaveValue(/WARN Export rendering not implemented for MP3\. Planned target: assets\/music\/rendered\/theme-main\.mp3\./);
      await expect(page.locator("#statusLog")).toHaveValue(/WARN Export rendering not implemented for OGG\. Planned target: assets\/music\/rendered\/theme-main\.ogg\./);
      await page.locator('[data-song-id="source-only"]').click();
      await page.locator("#exportWavButton").click();
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

  test("rejects malformed raw Song Sheet syntax without partial section summary", async ({ page }) => {
    const server = await openMidiStudio(page);
    try {
      await selectMidiStudioTab(page, "song-setup");
      await page.locator(".midi-studio-v2__advanced-song-sheet summary").click();
      await page.locator("#songSheetInput").fill(`tempo:132
key=A minor

[loop]
Am F`);
      await page.locator("#parseRawSongSheetButton").click();
      await expect(page.locator("#songSheetSummary")).toContainText("Unsupported Song Sheet syntax on line 1: tempo:132");
      await expect(page.locator("#songSheetSummary")).not.toContainText("loop:");
      await expect(page.locator("#statusLog")).toHaveValue(/FAIL Song Sheet rejected: Unsupported Song Sheet syntax on line 1: tempo:132/);
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
      await expect(page.locator("#instrumentGridOutput")).toContainText("Bar 1");
      await expect(page.locator("#instrumentGridOutput")).toContainText("Bar 5");
      await expect(page.locator(".midi-studio-v2__grid-cell--bar")).toHaveCount(5);
      await expect(page.locator(".midi-studio-v2__grid-cell--ruler").first()).toContainText("1");
      await expect(page.locator(".midi-studio-v2__grid-cell--timing-header.midi-studio-v2__grid-cell--playhead-active")).toHaveAttribute("data-section", "intro");
      await expect(page.locator("#instrumentGridSectionSelect")).toContainText("bridge");
      await page.locator("#instrumentGridLoopStartSelect").selectOption("loop");
      await page.locator("#instrumentGridLoopEndSelect").selectOption("boss");
      expect(await page.locator(".midi-studio-v2__grid-cell--loop-region").count()).toBeGreaterThan(0);
      await page.locator('[data-section-preset="boss"]').click();
      await expect(page.locator("#instrumentGridSectionSelect")).toHaveValue("boss");
      await page.locator("#jumpToSectionButton").click();
      await expect(page.locator(".midi-studio-v2__grid-cell--timing-header.midi-studio-v2__grid-cell--playhead-active")).toHaveAttribute("data-section", "boss");
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
      const beforeStep = await page.locator(".midi-studio-v2__grid-cell--timing-header.midi-studio-v2__grid-cell--playhead-active").getAttribute("data-step-index");
      await page.locator("#playSectionButton").click();
      await expect(page.locator("#statusLog")).toHaveValue(/OK Preview Synth started for section intro with \d+ playable events\./);
      await expect(page.locator(".midi-studio-v2__grid-cell--timing-header.midi-studio-v2__grid-cell--playhead-active")).not.toHaveAttribute("data-step-index", beforeStep || "");
      await expect(page.locator(".midi-studio-v2__grid-cell--timing-header.midi-studio-v2__grid-cell--playhead-active")).toHaveAttribute("data-beat", /1|2/);
      await expect(page.locator(".midi-studio-v2__grid-cell--timing-header.midi-studio-v2__grid-cell--playhead-active")).toHaveAttribute("data-subdivision-step", /1|2/);
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
      const beforeStep = await page.locator(".midi-studio-v2__grid-cell--timing-header.midi-studio-v2__grid-cell--playhead-active").getAttribute("data-step-index");
      await page.locator("#playSectionButton").click();
      await expect(page.locator("#statusLog")).toHaveValue(/FAIL No playable Preview Synth notes found for section intro\. Generate or enter chords, bass, pad, lead, or drum cells before playing\./);
      await expect(page.locator("#audioDiagnostics")).toContainText("No playable Preview Synth notes found for section intro.");
      await expect(page.locator(".midi-studio-v2__grid-cell--timing-header.midi-studio-v2__grid-cell--playhead-active")).toHaveAttribute("data-step-index", beforeStep || "0");
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
      await expect(page.locator(".midi-studio-v2__grid-cell--lane-active")).not.toHaveCount(0);
      expect(await page.locator(".midi-studio-v2__grid-cell--lane-active").evaluateAll((cells) => (
        cells.every((cell) => cell.dataset.lane === "lead")
      ))).toBe(true);
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
      await page.locator('[data-section-preset="bridge"]').click();
      await expect(page.locator("#statusLog")).toHaveValue(/FAIL Instrument grid section not found: Bridge\. Normalize a section map containing that label or choose a listed custom section\./);
      await page.locator("#instrumentGridLoopStartSelect").selectOption("loop");
      await page.locator("#instrumentGridLoopEndSelect").selectOption("intro");
      await page.locator("#playLoopButton").click();
      await expect(page.locator("#statusLog")).toHaveValue(/FAIL Instrument grid loop rejected: Invalid loop region: loop starts after intro\./);
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
      await expect(page.locator("#instrumentGridOutput")).toContainText("kick");
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
      expect(fullscreenLayout.leftWidth).toBe(340);
      expect(fullscreenLayout.rightWidth).toBe(360);
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
      const sourceHeader = page.locator('.accordion-v2__header[aria-controls="songSourceContent"]');
      await sourceHeader.click();
      await expect(sourceHeader).toHaveAttribute("aria-expanded", "false");
      await expect(page.locator("#songSourceContent")).toBeHidden();
      await sourceHeader.click();
      await expect(sourceHeader).toHaveAttribute("aria-expanded", "true");
      await expect(page.locator("#songSourceContent")).toBeVisible();
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
      await page.locator("#exportWavButton").click();
      await expect(page.locator("#statusLog")).toHaveValue(/FAIL Missing MIDI song for WAV export\. Load or select a song before exporting\./);
    } finally {
      await workspaceV2CoverageReporter.stop(page);
      await server.close();
    }
  });
});
