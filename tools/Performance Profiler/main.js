import {
  runDeterministicWorkloadIteration,
  summarizeDurationSamples,
  toPrettyJson
} from "../shared/debugInspectorData.js";
import { readToolHostSharedContextFromLocation } from "../shared/toolHostSharedContext.js";
import { registerToolBootContract } from "../shared/toolBootContract.js";
import { isFiniteNumber } from "../../src/shared/utils/numberUtils.js";

const refs = {
  runWorkloadButton: document.getElementById("runWorkloadButton"),
  runFrameSampleButton: document.getElementById("runFrameSampleButton"),
  stopButton: document.getElementById("stopProfilerButton"),
  statusText: document.getElementById("profilerStatusText"),
  workloadIterationsInput: document.getElementById("workloadIterationsInput"),
  workSizeInput: document.getElementById("workSizeInput"),
  frameSamplesInput: document.getElementById("frameSamplesInput"),
  output: document.getElementById("profileOutput")
};

const state = {
  frameHandle: 0,
  frameSampling: false
};

function setStatus(message) {
  if (refs.statusText instanceof HTMLElement) {
    refs.statusText.textContent = message;
  }
}

function readPositiveInt(input, fallback, min, max) {
  if (!(input instanceof HTMLInputElement)) {
    return fallback;
  }
  const numeric = Math.trunc(Number(input.value));
  if (!isFiniteNumber(numeric)) {
    return fallback;
  }
  return Math.max(min, Math.min(max, numeric));
}

function writeOutput(payload) {
  if (refs.output instanceof HTMLElement) {
    refs.output.textContent = toPrettyJson(payload);
  }
}

function runWorkloadProfile() {
  const iterations = readPositiveInt(refs.workloadIterationsInput, 300, 10, 5000);
  const workSize = readPositiveInt(refs.workSizeInput, 3000, 100, 100000);
  const durations = [];
  let checksum = 0;

  for (let index = 0; index < iterations; index += 1) {
    const started = performance.now();
    checksum += runDeterministicWorkloadIteration(workSize);
    durations.push(performance.now() - started);
  }

  const summary = summarizeDurationSamples(durations);
  writeOutput({
    schema: "tools.performance-profiler.workload-profile/1",
    iterations,
    workSize,
    checksum,
    summary
  });
  setStatus(`Workload profile complete. iterations=${iterations}, avg=${summary.avgMs.toFixed(3)}ms, p95=${summary.p95Ms.toFixed(3)}ms.`);
}

function stopFrameSampling() {
  if (state.frameHandle) {
    cancelAnimationFrame(state.frameHandle);
    state.frameHandle = 0;
  }
  state.frameSampling = false;
}

function runFrameSample() {
  stopFrameSampling();
  const frameSamples = readPositiveInt(refs.frameSamplesInput, 120, 10, 600);
  const frameDurations = [];
  let lastTimestamp = 0;
  let sampleCount = 0;
  state.frameSampling = true;

  function tick(timestamp) {
    if (!state.frameSampling) {
      return;
    }

    if (lastTimestamp > 0) {
      frameDurations.push(Math.max(0, timestamp - lastTimestamp));
      sampleCount += 1;
    }
    lastTimestamp = timestamp;

    if (sampleCount >= frameSamples) {
      stopFrameSampling();
      const summary = summarizeDurationSamples(frameDurations);
      const avgFps = summary.avgMs > 0 ? 1000 / summary.avgMs : 0;
      writeOutput({
        schema: "tools.performance-profiler.frame-sample/1",
        frameSamples,
        summary,
        estimatedFps: avgFps
      });
      setStatus(`Frame sample complete. samples=${frameSamples}, avg=${summary.avgMs.toFixed(3)}ms, estFps=${avgFps.toFixed(2)}.`);
      return;
    }

    state.frameHandle = requestAnimationFrame(tick);
  }

  state.frameHandle = requestAnimationFrame(tick);
  setStatus(`Frame sampling started (${frameSamples} samples).`);
}

function bindEvents() {
  if (refs.runWorkloadButton instanceof HTMLButtonElement) {
    refs.runWorkloadButton.addEventListener("click", runWorkloadProfile);
  }
  if (refs.runFrameSampleButton instanceof HTMLButtonElement) {
    refs.runFrameSampleButton.addEventListener("click", runFrameSample);
  }
  if (refs.stopButton instanceof HTMLButtonElement) {
    refs.stopButton.addEventListener("click", () => {
      stopFrameSampling();
      setStatus("Profiler stopped.");
    });
  }
}

let initialized = false;

const performanceProfilerApi = {
  captureProjectState() {
    return {
      workloadIterations: readPositiveInt(refs.workloadIterationsInput, 300, 10, 5000),
      workSize: readPositiveInt(refs.workSizeInput, 3000, 100, 100000),
      frameSamples: readPositiveInt(refs.frameSamplesInput, 120, 10, 600)
    };
  },
  applyProjectState(snapshot) {
    if (refs.workloadIterationsInput instanceof HTMLInputElement && isFiniteNumber(snapshot?.workloadIterations)) {
      refs.workloadIterationsInput.value = String(snapshot.workloadIterations);
    }
    if (refs.workSizeInput instanceof HTMLInputElement && isFiniteNumber(snapshot?.workSize)) {
      refs.workSizeInput.value = String(snapshot.workSize);
    }
    if (refs.frameSamplesInput instanceof HTMLInputElement && isFiniteNumber(snapshot?.frameSamples)) {
      refs.frameSamplesInput.value = String(snapshot.frameSamples);
    }
    return true;
  }
};

function bootPerformanceProfiler() {
  if (!initialized) {
    bindEvents();
    const hostContext = readToolHostSharedContextFromLocation(window.location);
    if (hostContext?.state && typeof hostContext.state === "object") {
      performanceProfilerApi.applyProjectState(hostContext.state);
      setStatus("Profiler initialized from host context state.");
    }
    initialized = true;
  }
  window.performanceProfilerApp = performanceProfilerApi;
  return performanceProfilerApi;
}

registerToolBootContract("performance-profiler", {
  init: bootPerformanceProfiler,
  destroy() {
    stopFrameSampling();
    return true;
  },
  getApi() {
    return window.performanceProfilerApp || null;
  }
});

bootPerformanceProfiler();
