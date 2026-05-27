import { expect, test } from "@playwright/test";
import { startRepoServer } from "../../helpers/playwrightRepoServer.mjs";
import { workspaceV2CoverageReporter } from "../../helpers/workspaceV2CoverageReporter.mjs";

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
        this.state = "suspended";
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

async function fillGuidedSongSheet(page, { intro = "Am F", key = "A minor", loop = "Am F C G", style = "retro-arcade", tempo = "132" } = {}) {
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
  await page.locator("#instrumentGridSectionsInput").fill(sections);
  await page.locator("#instrumentGridBeatsInput").fill(beats);
  await page.locator("#instrumentGridSubdivisionInput").selectOption(subdivision);
  await page.locator("#instrumentGridChordsInput").fill(chords);
  await page.locator("#instrumentGridBassInput").fill(bass);
  await page.locator("#instrumentGridPadInput").fill(pad);
  await page.locator("#instrumentGridLeadInput").fill(lead);
  await page.locator("#instrumentGridDrumsInput").fill(drums);
}

test.describe("MIDI Studio V2", () => {
  test.afterAll(async () => {
    await workspaceV2CoverageReporter.writeReport();
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
      await expect(page.locator("#playButton")).toHaveText("Play Rendered Preview");
      await expect(page.locator("#inspectMidiSourceButton")).toBeEnabled();
      const renderedHeader = page.locator('.accordion-v2__header[aria-controls="renderedTargetsContent"]');
      await expect(renderedHeader).toContainText("Rendered Export Targets");
      await expect(renderedHeader.locator("#exportWavButton")).toHaveCount(0);
      await expect(page.locator(".midi-studio-v2__tool-menu #exportWavButton")).toBeVisible();
      await expect(page.locator(".midi-studio-v2__tool-menu #exportMp3Button")).toBeVisible();
      await expect(page.locator(".midi-studio-v2__tool-menu #exportOggButton")).toBeVisible();
      await expect(page.locator("#midiSourceDetails")).toContainText("No MIDI source inspected.");
      await expect(page.locator("#playbackState")).toContainText("Live MIDI synthesis: NOT IMPLEMENTED");
      await expect(page.locator("#statusLog")).toHaveValue(/OK Loaded 3 MIDI songs/);
      await expect(page.locator("#statusLog")).toHaveValue(/WARN Live MIDI synthesis not implemented\. sourceMidi is musical instruction data; rendered OGG\/MP3\/WAV targets are used for preview and gameplay audio\./);
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
      await expect(page.locator("#howToTestContent")).toContainText("Step 1: choose style/key/tempo");
      await expect(page.locator("#howToTestContent")).toContainText("Step 5: test Preview Synth playhead/loop timing preview");
      await expect(page.locator("#howToTestContent")).toContainText("Step 6: test export action status");
    } finally {
      await workspaceV2CoverageReporter.stop(page);
      await server.close();
    }
  });

  test("loads explicit demo test song data for UAT grid and Preview Synth timing preview", async ({ page }) => {
    const server = await openMidiStudio(page);
    try {
      await page.locator("#useExampleButton").click();
      await expect(page.locator("#songList")).toContainText("Demo Test Song");
      await expect(page.locator("#songList")).toContainText("Demo Missing Target");
      await expect(page.locator("#songSheetKeyInput")).toHaveValue("A minor");
      await expect(page.locator("#songSheetStyleInput")).toHaveValue("retro-arcade");
      await expect(page.locator("#instrumentGridSectionsInput")).toHaveValue("intro:1, loop:1, victory:1");
      await expect(page.locator("#instrumentGridChordsInput")).toHaveValue("Am F C G | Am F C G | C G F Am");
      await expect(page.locator("#statusLog")).toHaveValue(/OK Loaded explicit demo test song data\. Demo paths are declared for UAT only; they are not hidden fallback assets\./);

      await page.locator("#generateBassFromChordsButton").click();
      await page.locator("#generatePadFromChordsButton").click();
      await page.locator("#generateArpeggioFromChordsButton").click();
      await page.locator("#generateBasicDrumsButton").click();
      await page.locator("#normalizeInstrumentGridButton").click();
      await expect(page.locator("#instrumentGridOutput")).toContainText("victory");
      await expect(page.locator(".midi-studio-v2__grid-cell--bar")).toHaveCount(3);
      await expect(page.locator("#instrumentGridSectionSelect")).toContainText("victory");
      const demoModel = await page.evaluate(() => window.__midiStudioV2App.lastInstrumentGridResult);
      expect(demoModel).toMatchObject({ barCount: 3, ok: true });
      expect(demoModel.timeline.some((event) => event.source === "generated" && event.lane === "bass")).toBe(true);

      await page.locator("#instrumentGridLoopStartSelect").selectOption("loop");
      await page.locator("#instrumentGridLoopEndSelect").selectOption("victory");
      expect(await page.locator(".midi-studio-v2__grid-cell--loop-region").count()).toBeGreaterThan(0);
      await page.locator("#playLoopButton").click();
      await expect(page.locator("#statusLog")).toHaveValue(/OK Preview Synth started for loop loop to victory with \d+ playable events\./);
      await expect(page.locator("#statusLog")).toHaveValue(/Preview Synth uses temporary oscillator instruments for grid audition only; SoundFont playback is not implemented\./);
      await expect(page.locator("#instrumentGridTransportState")).toContainText("Playing loop Preview Synth timing preview: loop to victory");
      expect(await page.evaluate(() => window.__midiStudioPreviewSynthEvents.some((event) => event.action === "oscillator-start"))).toBe(true);
      await page.locator("#exportOggButton").click();
      await expect(page.locator("#statusLog")).toHaveValue(/WARN Export rendering not implemented for OGG\. Planned target: assets\/music\/demo\/demo-test-song\.ogg\./);
      await page.locator('[data-song-id="demo-missing-target"]').click();
      await page.locator("#exportWavButton").click();
      await expect(page.locator("#statusLog")).toHaveValue(/FAIL Missing rendered WAV export target for Demo Missing Target\. Add music\.songs\[\]\.rendered\.wav before exporting\./);
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
      await expect(page.locator("#instrumentGridOutput")).toContainText("intro");
      await expect(page.locator("#instrumentGridOutput")).toContainText("loop");
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

  test("keeps beat bar alignment consistent across grid lanes", async ({ page }) => {
    const server = await openMidiStudio(page);
    try {
      await fillInstrumentGrid(page);
      await page.locator("#normalizeInstrumentGridButton").click();
      expect(await page.locator(".midi-studio-v2__instrument-grid").evaluate((grid) => getComputedStyle(grid).gridTemplateColumns.split(" ").length)).toBe(9);
      expect(await page.locator(".midi-studio-v2__grid-cell--section").evaluateAll((cells) => cells.map((cell) => cell.style.gridColumn))).toEqual(["span 4", "span 4"]);
      expect(await page.locator(".midi-studio-v2__grid-cell--beat").evaluateAll((cells) => cells.map((cell) => cell.textContent))).toEqual(["B1.1", "B1.2", "B1.3", "B1.4", "B2.1", "B2.2", "B2.3", "B2.4"]);
      expect(await page.locator(".midi-studio-v2__instrument-grid").evaluate((grid) => Array.from(grid.children).filter((cell) => cell.textContent === "Am").length)).toBe(3);
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
      await expect(page.locator("#instrumentGridOutput")).toContainText("intro");
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
      expect(await page.locator(".midi-studio-v2__grid-cell--beat").evaluateAll((cells) => cells.map((cell) => cell.textContent))).toEqual([
        "B1.1.1",
        "B1.1.2",
        "B1.2.1",
        "B1.2.2"
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
      await expect(page.locator(".midi-studio-v2__grid-cell--playhead-active")).toHaveAttribute("data-section", "intro");
      await expect(page.locator("#instrumentGridSectionSelect")).toContainText("bridge");
      await page.locator("#instrumentGridLoopStartSelect").selectOption("loop");
      await page.locator("#instrumentGridLoopEndSelect").selectOption("boss");
      expect(await page.locator(".midi-studio-v2__grid-cell--loop-region").count()).toBeGreaterThan(0);
      await page.locator('[data-section-preset="boss"]').click();
      await expect(page.locator("#instrumentGridSectionSelect")).toHaveValue("boss");
      await page.locator("#jumpToSectionButton").click();
      await expect(page.locator(".midi-studio-v2__grid-cell--playhead-active")).toHaveAttribute("data-section", "boss");
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
      const beforeStep = await page.locator(".midi-studio-v2__grid-cell--playhead-active").getAttribute("data-step-index");
      await page.locator("#playSectionButton").click();
      await expect(page.locator("#statusLog")).toHaveValue(/OK Preview Synth started for section intro with \d+ playable events\./);
      await expect(page.locator(".midi-studio-v2__grid-cell--playhead-active")).not.toHaveAttribute("data-step-index", beforeStep || "");
      await expect(page.locator(".midi-studio-v2__grid-cell--playhead-active")).toHaveAttribute("data-beat", /1|2/);
      await expect(page.locator(".midi-studio-v2__grid-cell--playhead-active")).toHaveAttribute("data-subdivision-step", /1|2/);
      expect(await page.evaluate(() => window.__midiStudioPreviewSynthEvents.some((event) => event.action === "oscillator-start"))).toBe(true);
      await page.locator("#stopTimingPreviewButton").click();
      await expect(page.locator("#instrumentGridTransportState")).toContainText("Preview Synth timing preview stopped.");
      await expect(page.locator("#statusLog")).toHaveValue(/OK Preview Synth timing preview stopped\. Cleared \d+ scheduled oscillators\./);
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
      const beforeStep = await page.locator(".midi-studio-v2__grid-cell--playhead-active").getAttribute("data-step-index");
      await page.locator("#playSectionButton").click();
      await expect(page.locator("#statusLog")).toHaveValue(/FAIL No playable Preview Synth notes found for section intro\. Generate or enter chords, bass, pad, lead, or drum cells before playing\./);
      await expect(page.locator(".midi-studio-v2__grid-cell--playhead-active")).toHaveAttribute("data-step-index", beforeStep || "0");
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
      expect(await page.evaluate(() => window.__midiStudioV2App.previewSynth.getSnapshot())).toMatchObject({
        playing: false,
        supported: false
      });
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
      const centerPanel = page.locator(".tool-starter__panel--center");
      const normalWidth = (await centerPanel.boundingBox())?.width || 0;
      await page.locator("[data-midi-studio-summary]").click();
      await expect(page.locator("body")).toHaveClass(/midi-studio-v2--expanded/);
      await expect(page.locator("[data-midi-studio-summary]")).toContainText("Show Header and Details");
      await expect(page.locator("#shared-theme-header")).toBeHidden();
      await expect(page.locator(".tool-starter__panel--left")).toBeHidden();
      await expect(page.locator("#songDetailsContent")).toBeHidden();
      await expect(page.locator("#instrumentGridContent")).toBeVisible();
      await expect(page.locator(".midi-studio-v2__tool-menu")).toBeVisible();
      await expect(page.locator("#useExampleButton")).toBeVisible();
      await expect(page.locator("#statusLogContent")).toBeVisible();
      await expect(page.locator("#clearStatusButton")).toBeVisible();
      const expandedWidth = (await centerPanel.boundingBox())?.width || 0;
      expect(expandedWidth).toBeGreaterThan(normalWidth);
      await expect(page.locator("#statusLog")).toHaveValue(/INFO Entered expanded MIDI Studio workspace view/);

      await page.locator("[data-midi-studio-summary]").click();
      await expect(page.locator("body")).not.toHaveClass(/midi-studio-v2--expanded/);
      await expect(page.locator("[data-midi-studio-summary]")).toContainText("Hide Header and Details");
      await expect(page.locator("#shared-theme-header")).toBeVisible();
      await expect(page.locator(".tool-starter__panel--left")).toBeVisible();
      await expect(page.locator("#songDetailsContent")).toBeVisible();
      await expect(page.locator("#statusLog")).toHaveValue(/INFO Exited expanded MIDI Studio workspace view/);
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
      await expect(page.locator("#playbackState")).toContainText("Playing rendered preview: Main Theme");
      await expect(page.locator("#statusLog")).toHaveValue(/OK Rendered preview started for Main Theme: assets\/music\/rendered\/theme-main\.ogg\./);
      expect(await page.evaluate(() => window.__midiStudioAudioEvents)).toEqual([
        { action: "play", loop: true, src: "assets/music/rendered/theme-main.ogg" }
      ]);
      await page.locator("#stopButton").click();
      await expect(page.locator("#stopButton")).toBeDisabled();
      await expect(page.locator("#playButton")).toBeEnabled();
      await expect(page.locator("#playbackState")).toContainText("Stopped rendered preview: Main Theme");
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
      await expect(page.locator("#instrumentGridOutput")).toContainText("No grid data normalized. Enter sections/chords or use the example test song, then choose Normalize Grid.");
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
