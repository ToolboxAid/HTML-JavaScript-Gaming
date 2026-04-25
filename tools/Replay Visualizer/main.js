import {
  getReplayEventAtTime,
  normalizeReplayEvents,
  safeParseJson,
  toPrettyJson
} from "../shared/debugInspectorData.js";
import { readToolHostSharedContextFromLocation } from "../shared/toolHostSharedContext.js";
import { registerToolBootContract } from "../shared/toolBootContract.js";
import { isFiniteNumber } from "../../src/shared/number/index.js";
import { setupDebugToolInteractionFlow } from "../shared/debugToolInteractionFlow.js";

const refs = {
  loadButton: document.getElementById("loadReplayButton"),
  loadSampleButton: document.getElementById("loadSampleReplayButton"),
  playButton: document.getElementById("playReplayButton"),
  pauseButton: document.getElementById("pauseReplayButton"),
  resetButton: document.getElementById("resetReplayButton"),
  statusText: document.getElementById("replayStatusText"),
  input: document.getElementById("replayJsonInput"),
  slider: document.getElementById("replayTimeSlider"),
  timeReadout: document.getElementById("replayTimeReadout"),
  eventList: document.getElementById("replayEventList"),
  eventOutput: document.getElementById("replayEventOutput")
};

const state = {
  events: [],
  currentTimeMs: 0,
  durationMs: 0,
  playing: false,
  timerId: 0
};

let disposeInteractionFlow = null;

function normalizeSamplePresetPath(pathValue) {
  if (typeof pathValue !== "string") {
    return "";
  }
  const trimmed = pathValue.trim().replace(/\\/g, "/");
  if (!trimmed || trimmed.includes("..")) {
    return "";
  }
  if (trimmed.startsWith("/samples/")) {
    return trimmed;
  }
  if (trimmed.startsWith("./samples/")) {
    return trimmed;
  }
  if (trimmed.startsWith("samples/")) {
    return `./${trimmed}`;
  }
  return "";
}

function buildPresetLoadedStatus(sampleId, samplePresetPath) {
  const normalizedSampleId = typeof sampleId === "string" ? sampleId.trim() : "";
  if (normalizedSampleId) {
    return `Loaded preset from sample ${normalizedSampleId}.`;
  }
  const normalizedPath = typeof samplePresetPath === "string" ? samplePresetPath.trim() : "";
  return normalizedPath ? `Loaded preset from ${normalizedPath}.` : "Loaded preset.";
}

function setStatus(message) {
  if (refs.statusText instanceof HTMLElement) {
    refs.statusText.textContent = message;
  }
}

function getDurationMs(events) {
  if (!Array.isArray(events) || events.length === 0) {
    return 0;
  }
  return Math.max(0, Number(events[events.length - 1]?.timeMs || 0));
}

function clampTimeMs(value, durationMs) {
  const numeric = Number(value);
  if (!isFiniteNumber(numeric)) {
    return 0;
  }
  return Math.max(0, Math.min(durationMs, numeric));
}

function setCurrentTimeMs(value) {
  state.currentTimeMs = clampTimeMs(value, state.durationMs);
  if (refs.slider instanceof HTMLInputElement) {
    refs.slider.value = String(state.currentTimeMs);
  }
}

function renderEventList() {
  if (!(refs.eventList instanceof HTMLElement)) {
    return;
  }

  refs.eventList.innerHTML = state.events.map((event, index) => {
    const current = index === getReplayEventAtTime(state.events, state.currentTimeMs).index ? " is-current" : "";
    return `
      <li>
        <button type="button" data-replay-index="${index}" class="${current.trim()}">
          ${event.timeMs.toFixed(0)}ms | ${event.type} | ${event.label}
        </button>
      </li>
    `;
  }).join("");
}

function renderCurrentEvent() {
  const { index, event } = getReplayEventAtTime(state.events, state.currentTimeMs);
  if (refs.timeReadout instanceof HTMLElement) {
    refs.timeReadout.textContent = `t=${state.currentTimeMs.toFixed(0)}ms (${Math.max(0, index + 1)}/${state.events.length})`;
  }
  if (refs.eventOutput instanceof HTMLElement) {
    refs.eventOutput.textContent = event
      ? toPrettyJson({
        index,
        event,
        durationMs: state.durationMs
      })
      : "Replay has no events.";
  }
  renderEventList();
}

function applyEvents(events, sourceLabel = "payload") {
  state.events = normalizeReplayEvents(events);
  state.durationMs = getDurationMs(state.events);
  setCurrentTimeMs(0);
  if (refs.slider instanceof HTMLInputElement) {
    refs.slider.max = String(Math.max(1, Math.ceil(state.durationMs)));
  }
  renderCurrentEvent();
  setStatus(`Loaded ${state.events.length} events from ${sourceLabel}.`);
}

function extractReplayEventsFromSamplePreset(rawPreset) {
  if (Array.isArray(rawPreset)) {
    return rawPreset;
  }
  if (!rawPreset || typeof rawPreset !== "object") {
    return null;
  }

  const payload = rawPreset.payload && typeof rawPreset.payload === "object"
    ? rawPreset.payload
    : rawPreset;

  if (Array.isArray(payload.events)) {
    return payload.events;
  }
  if (Array.isArray(payload.replayEvents)) {
    return payload.replayEvents;
  }
  if (payload.replay && typeof payload.replay === "object") {
    if (Array.isArray(payload.replay.events)) {
      return payload.replay.events;
    }
    if (Array.isArray(payload.replay.replayEvents)) {
      return payload.replay.replayEvents;
    }
  }
  return null;
}

async function tryLoadPresetFromQuery() {
  const searchParams = new URLSearchParams(window.location.search);
  const samplePresetPath = normalizeSamplePresetPath(searchParams.get("samplePresetPath") || "");
  if (!samplePresetPath) {
    return false;
  }
  const sampleId = String(searchParams.get("sampleId") || "").trim();
  try {
    const presetUrl = new URL(samplePresetPath, window.location.href);
    const response = await fetch(presetUrl.toString(), { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`Preset request failed (${response.status}).`);
    }
    const rawPreset = await response.json();
    const events = extractReplayEventsFromSamplePreset(rawPreset);
    if (!Array.isArray(events)) {
      throw new Error("Preset payload did not include replay events.");
    }
    stopPlayback();
    applyEvents(events, "sample preset");
    if (refs.input instanceof HTMLTextAreaElement) {
      refs.input.value = toPrettyJson({ events: normalizeReplayEvents(events) });
    }
    setStatus(buildPresetLoadedStatus(sampleId, samplePresetPath));
    return true;
  } catch (error) {
    setStatus(`Preset load failed: ${error instanceof Error ? error.message : "unknown error"}`);
    return false;
  }
}

function loadReplayFromInput() {
  if (!(refs.input instanceof HTMLTextAreaElement)) {
    return;
  }
  const parsed = safeParseJson(refs.input.value);
  if (!parsed) {
    setStatus("Replay JSON is invalid. Provide an object with an events array or a direct event array.");
    return;
  }
  applyEvents(parsed, "JSON input");
}

function stopPlayback() {
  state.playing = false;
  if (state.timerId) {
    window.clearInterval(state.timerId);
    state.timerId = 0;
  }
  updateControlState();
}

function updateControlState() {
  const running = state.playing;
  if (refs.playButton instanceof HTMLButtonElement) {
    refs.playButton.disabled = running;
  }
  if (refs.pauseButton instanceof HTMLButtonElement) {
    refs.pauseButton.disabled = !running;
  }
}

function playReplay() {
  stopPlayback();
  state.playing = true;
  updateControlState();
  state.timerId = window.setInterval(() => {
    const next = state.currentTimeMs + 33;
    if (next >= state.durationMs) {
      setCurrentTimeMs(state.durationMs);
      renderCurrentEvent();
      stopPlayback();
      setStatus("Replay reached end of timeline.");
      return;
    }
    setCurrentTimeMs(next);
    renderCurrentEvent();
  }, 33);
  setStatus("Replay playback started.");
}

function bindEvents() {
  if (refs.loadButton instanceof HTMLButtonElement) {
    refs.loadButton.addEventListener("click", loadReplayFromInput);
  }
  if (refs.loadSampleButton instanceof HTMLButtonElement) {
    refs.loadSampleButton.addEventListener("click", () => {
      setStatus("No built-in replay sample is available. Load replay JSON from source data.");
    });
  }
  if (refs.playButton instanceof HTMLButtonElement) {
    refs.playButton.addEventListener("click", playReplay);
  }
  if (refs.pauseButton instanceof HTMLButtonElement) {
    refs.pauseButton.addEventListener("click", () => {
      stopPlayback();
      setStatus("Replay paused.");
    });
  }
  if (refs.resetButton instanceof HTMLButtonElement) {
    refs.resetButton.addEventListener("click", () => {
      stopPlayback();
      setCurrentTimeMs(0);
      renderCurrentEvent();
      setStatus("Replay reset to start.");
    });
  }
  if (refs.slider instanceof HTMLInputElement) {
    refs.slider.addEventListener("input", () => {
      setCurrentTimeMs(refs.slider.value);
      renderCurrentEvent();
    });
  }
  if (refs.eventList instanceof HTMLElement) {
    refs.eventList.addEventListener("click", (event) => {
      const button = event.target instanceof Element ? event.target.closest("[data-replay-index]") : null;
      if (!(button instanceof HTMLElement)) {
        return;
      }
      const index = Number(button.dataset.replayIndex || "0");
      if (!Number.isInteger(index) || index < 0 || index >= state.events.length) {
        return;
      }
      setCurrentTimeMs(state.events[index].timeMs);
      renderCurrentEvent();
      setStatus(`Jumped to event ${index + 1}/${state.events.length}.`);
    });
  }
}

let initialized = false;

const replayVisualizerApi = {
  captureProjectState() {
    return {
      replayInput: refs.input instanceof HTMLTextAreaElement ? refs.input.value : "",
      currentTimeMs: state.currentTimeMs
    };
  },
  applyProjectState(snapshot) {
    if (refs.input instanceof HTMLTextAreaElement && typeof snapshot?.replayInput === "string") {
      refs.input.value = snapshot.replayInput;
    }
    if (typeof snapshot?.replayInput === "string" && snapshot.replayInput.trim()) {
      loadReplayFromInput();
    }
    if (isFiniteNumber(snapshot?.currentTimeMs)) {
      setCurrentTimeMs(snapshot.currentTimeMs);
      renderCurrentEvent();
    }
    return true;
  }
};

function bootReplayVisualizer() {
  if (!initialized) {
    bindEvents();
    disposeInteractionFlow = setupDebugToolInteractionFlow({
      primaryButton: refs.loadButton,
      escapeAction: () => {
        stopPlayback();
        setCurrentTimeMs(0);
        renderCurrentEvent();
        setStatus("Replay reset to start.");
      },
      statusElement: refs.statusText
    });
    updateControlState();
    const hostContext = readToolHostSharedContextFromLocation(window.location);
    const hostReplay = hostContext?.state?.replay || hostContext?.state?.events || null;
    if (hostReplay) {
      applyEvents(hostReplay, "host context");
      if (refs.input instanceof HTMLTextAreaElement) {
        refs.input.value = toPrettyJson({ events: normalizeReplayEvents(hostReplay) });
      }
    } else {
      applyEvents([], "empty replay");
      setStatus("Awaiting replay source JSON. No default replay is applied.");
    }
    void tryLoadPresetFromQuery();
    initialized = true;
  }
  window.replayVisualizerApp = replayVisualizerApi;
  return replayVisualizerApi;
}

registerToolBootContract("replay-visualizer", {
  init: bootReplayVisualizer,
  destroy() {
    stopPlayback();
    if (typeof disposeInteractionFlow === "function") {
      disposeInteractionFlow();
      disposeInteractionFlow = null;
    }
    return true;
  },
  getApi() {
    return window.replayVisualizerApp || null;
  }
});

bootReplayVisualizer();
