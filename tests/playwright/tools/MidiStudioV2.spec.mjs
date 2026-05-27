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

function installMockAudio(page) {
  return page.addInitScript(() => {
    window.__midiStudioAudioEvents = [];
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
  });
}

async function openMidiStudio(page, routePayload = validManifest, midiRoutes = {}) {
  const server = await startRepoServer();
  await installMockAudio(page);
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
      await expect(page.locator("#midiSourceDetails")).toContainText("No MIDI source inspected.");
      await expect(page.locator("#playbackState")).toContainText("Live MIDI synthesis: NOT IMPLEMENTED");
      await expect(page.locator("#statusLog")).toHaveValue(/OK Loaded 3 MIDI songs/);
      await expect(page.locator("#statusLog")).toHaveValue(/WARN Live MIDI synthesis not implemented\. sourceMidi is musical instruction data; rendered OGG\/MP3\/WAV targets are used for preview and gameplay audio\./);
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
      await expect(page.locator("#songSourceField")).toHaveValue("missing sourceMidi");
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

  test("parses a valid Song Sheet into section summary metadata", async ({ page }) => {
    const server = await openMidiStudio(page);
    try {
      await page.locator("#songSheetInput").fill(`tempo=132
key=A minor
style=retro-arcade

[intro]
Am F

[loop]
Am F C G`);
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

  test("shows Song Sheet warnings for invalid chords and empty sections", async ({ page }) => {
    const server = await openMidiStudio(page);
    try {
      await page.locator("#songSheetInput").fill(`tempo=120
key=C major
style=chip

[loop]
C Hm G

[break]`);
      await page.locator("#parseSongSheetButton").click();
      await expect(page.locator("#songSheetSummary")).toContainText('Invalid chord "Hm"');
      await expect(page.locator("#songSheetSummary")).toContainText("Section break is empty.");
      await expect(page.locator("#songSheetSummary")).toContainText("loop: 2 bars, 2 chords, loop");
      await expect(page.locator("#statusLog")).toHaveValue(/WARN Song Sheet parsed with warnings: Invalid chord "Hm" in section loop/);
      await expect(page.locator("#statusLog")).toHaveValue(/OK Song Sheet parsed: 2 sections, 2 bars, 2 chords\./);
    } finally {
      await workspaceV2CoverageReporter.stop(page);
      await server.close();
    }
  });

  test("rejects malformed Song Sheet syntax without partial section summary", async ({ page }) => {
    const server = await openMidiStudio(page);
    try {
      await page.locator("#songSheetInput").fill(`tempo:132
key=A minor

[loop]
Am F`);
      await page.locator("#parseSongSheetButton").click();
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
      await page.locator("#songSheetInput").fill(`tempo=132
key=A minor
style=retro-arcade

[loop]
Am F C G`);
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
      await expect(page.locator("#statusLog")).toHaveValue(/FAIL MIDI Studio V2 payload rejected before render .* music\.songs\[0\]\.id is required\./);
    } finally {
      await workspaceV2CoverageReporter.stop(page);
      await server.close();
    }
  });
});
