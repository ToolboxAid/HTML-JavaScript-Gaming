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
  0x00, 0x00, 0x00, 0x04,
  0x00, 0xff, 0x2f, 0x00,
  0x4d, 0x54, 0x72, 0x6b,
  0x00, 0x00, 0x00, 0x04,
  0x00, 0xff, 0x2f, 0x00
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

  test("shows actionable failure for invalid MIDI source bytes without partial render", async ({ page }) => {
    const server = await openMidiStudio(page, validManifest, {
      "assets/music/midi/theme-main.mid": Buffer.from([0x4e, 0x6f])
    });
    try {
      await page.locator("#inspectMidiSourceButton").click();
      await expect(page.locator("#midiSourceDetails")).toContainText("MIDI source validation failed");
      await expect(page.locator("#midiSourceDetails")).not.toContainText("Ticks per quarter note");
      await expect(page.locator("#statusLog")).toHaveValue(/FAIL MIDI source validation failed for assets\/music\/midi\/theme-main\.mid: MIDI source is too small/);
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

  test("keeps the Status Clear action aligned with MIDI Studio status layout", async ({ page }) => {
    const server = await openMidiStudio(page);
    try {
      const clearButton = page.locator("#clearStatusButton");
      await expect(clearButton).toHaveClass(/midi-studio-v2__status-clear-button/);
      await expect(clearButton).toHaveCSS("padding-left", "0px");
      await expect(clearButton).toHaveCSS("padding-right", "0px");
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
