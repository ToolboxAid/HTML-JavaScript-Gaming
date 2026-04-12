import {
  createDefaultReplayEvents,
  getReplayEventAtTime,
  normalizeReplayEvents,
  safeParseJson,
  toPrettyJson
} from "../shared/debugInspectorData.js";
import { readToolHostSharedContextFromLocation } from "../shared/toolHostSharedContext.js";
import { registerToolBootContract } from "../shared/toolBootContract.js";

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
  events: createDefaultReplayEvents(),
  currentTimeMs: 0,
  durationMs: 0,
  playing: false,
  timerId: 0
};

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
  if (!Number.isFinite(numeric)) {
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
}

function playReplay() {
  stopPlayback();
  state.playing = true;
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
      const sample = createDefaultReplayEvents();
      if (refs.input instanceof HTMLTextAreaElement) {
        refs.input.value = toPrettyJson({ events: sample });
      }
      applyEvents(sample, "sample");
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
    if (Number.isFinite(snapshot?.currentTimeMs)) {
      setCurrentTimeMs(snapshot.currentTimeMs);
      renderCurrentEvent();
    }
    return true;
  }
};

function bootReplayVisualizer() {
  if (!initialized) {
    bindEvents();
    const hostContext = readToolHostSharedContextFromLocation(window.location);
    const hostReplay = hostContext?.state?.replay || hostContext?.state?.events || null;
    if (hostReplay) {
      applyEvents(hostReplay, "host context");
      if (refs.input instanceof HTMLTextAreaElement) {
        refs.input.value = toPrettyJson({ events: normalizeReplayEvents(hostReplay) });
      }
    } else {
      applyEvents(state.events, "default replay");
      if (refs.input instanceof HTMLTextAreaElement) {
        refs.input.value = toPrettyJson({ events: state.events });
      }
    }
    initialized = true;
  }
  window.replayVisualizerApp = replayVisualizerApi;
  return replayVisualizerApi;
}

registerToolBootContract("replay-visualizer", {
  init: bootReplayVisualizer,
  destroy() {
    stopPlayback();
    return true;
  },
  getApi() {
    return window.replayVisualizerApp || null;
  }
});

bootReplayVisualizer();
