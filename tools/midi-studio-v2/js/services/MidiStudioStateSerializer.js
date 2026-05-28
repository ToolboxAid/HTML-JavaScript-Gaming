import { deepClone } from "../../../../src/shared/json/clone.js";
import { isPlainObject } from "../../../../src/shared/object/objects.js";

const TOOL_ID = "midi-studio-v2";

function text(value) {
  return String(value || "").trim();
}

function numberOrBlank(value) {
  return Number.isFinite(value) ? value : "";
}

function normalizeRendered(value) {
  const rendered = isPlainObject(value) ? value : {};
  return {
    mp3: text(rendered.mp3),
    ogg: text(rendered.ogg),
    wav: text(rendered.wav)
  };
}

function normalizeDirector(value) {
  const director = isPlainObject(value) ? value : {};
  return {
    intensity: text(director.intensity),
    mood: text(director.mood),
    notes: text(director.notes),
    usage: Array.isArray(director.usage) ? director.usage.map(text).filter(Boolean) : []
  };
}

function normalizeInstrumentSet(value) {
  if (typeof value === "string") {
    return text(value);
  }
  if (isPlainObject(value)) {
    return text(value.name || value.id);
  }
  return "";
}

function normalizeLoop(value) {
  const loop = isPlainObject(value) ? value : {};
  return {
    enabled: loop.enabled === true,
    endSeconds: numberOrBlank(loop.endSeconds),
    startSeconds: numberOrBlank(loop.startSeconds)
  };
}

function legacySongSheetSections(songSheet) {
  const rows = [];
  if (text(songSheet.intro)) {
    rows.push(`intro: ${text(songSheet.intro)}`);
  }
  if (text(songSheet.loop)) {
    rows.push(`loop: ${text(songSheet.loop)}`);
  }
  return rows.join("\n");
}

function normalizeSongSheetApplyTargets(value, lanes = {}) {
  const targets = isPlainObject(value) ? value : {};
  const hasDrums = Object.keys(lanes).some((lane) => lane === "drums" || lane.toLowerCase().includes("drum"));
  return {
    bass: targets.bass !== false,
    chordsPad: targets.chordsPad !== false,
    drums: targets.drums === undefined ? hasDrums : targets.drums === true,
    lead: targets.lead === true
  };
}

function normalizeStudioArrangement(value) {
  if (!isPlainObject(value)) {
    return null;
  }
  const lanes = isPlainObject(value.lanes) ? value.lanes : {};
  const previewInstruments = isPlainObject(value.previewInstruments) ? value.previewInstruments : {};
  const songSheet = isPlainObject(value.songSheet) ? value.songSheet : {};
  const normalizedLanes = {};
  Object.entries(lanes).forEach(([lane, laneSource]) => {
    const laneName = text(lane);
    if (laneName) {
      normalizedLanes[laneName] = text(laneSource);
    }
  });
  const normalizedPreviewInstruments = {};
  Object.entries(previewInstruments).forEach(([lane, instrument]) => {
    const laneName = text(lane);
    if (laneName) {
      normalizedPreviewInstruments[laneName] = text(instrument);
    }
  });
  return {
    beatsPerBar: text(value.beatsPerBar || "4"),
    key: text(value.key),
    lanes: normalizedLanes,
    previewInstruments: normalizedPreviewInstruments,
    sections: text(value.sections),
    songSheet: {
      applyTargets: normalizeSongSheetApplyTargets(songSheet.applyTargets, normalizedLanes),
      sequence: text(songSheet.sequence),
      sections: text(songSheet.sections) || legacySongSheetSections(songSheet)
    },
    style: text(value.style),
    subdivision: text(value.subdivision || "1"),
    tempo: text(value.tempo)
  };
}

function normalizeSong(song, index) {
  if (!isPlainObject(song)) {
    return { ok: false, message: `music.songs[${index}] must be an object.` };
  }
  const id = text(song.id);
  if (!id) {
    return { ok: false, message: `music.songs[${index}].id is required.` };
  }
  return {
    ok: true,
    song: {
      defaultRuntimeFormat: text(song.defaultRuntimeFormat || "ogg"),
      classification: text(song.classification),
      director: normalizeDirector(song.director),
      id,
      instrumentSet: normalizeInstrumentSet(song.instrumentSet),
      loop: normalizeLoop(song.loop),
      name: text(song.name) || id,
      rendered: normalizeRendered(song.rendered),
      sourceMidi: text(song.sourceMidi),
      studioArrangement: normalizeStudioArrangement(song.studioArrangement),
      tags: Array.isArray(song.tags) ? song.tags.map(text).filter(Boolean) : []
    }
  };
}

export class MidiStudioStateSerializer {
  extractPayload(rawValue) {
    if (!isPlainObject(rawValue)) {
      return { ok: false, message: "MIDI Studio V2 payload root must be an object." };
    }
    const manifestMusic = isPlainObject(rawValue.music) ? rawValue.music : null;
    const toolPayload = isPlainObject(rawValue.tools?.[TOOL_ID]) ? rawValue.tools[TOOL_ID] : null;
    if (manifestMusic) {
      return {
        ok: true,
        payload: {
          ...deepClone(manifestMusic),
          activeSongId: text(toolPayload?.activeSongId || manifestMusic.activeSongId),
          directorMode: isPlainObject(toolPayload?.directorMode) ? deepClone(toolPayload.directorMode) : deepClone(manifestMusic.directorMode || {})
        },
        sourceKind: "manifest.music"
      };
    }
    if (toolPayload) {
      return { ok: true, payload: deepClone(toolPayload), sourceKind: `tools.${TOOL_ID}` };
    }
    if (rawValue.toolId === TOOL_ID || rawValue.schema === "html-js-gaming.midi-studio-v2") {
      return { ok: true, payload: deepClone(rawValue), sourceKind: "toolState" };
    }
    return { ok: false, message: "MIDI Studio V2 requires root.music or root.tools.midi-studio-v2 metadata." };
  }

  normalize(rawValue) {
    const extracted = this.extractPayload(rawValue);
    if (!extracted.ok) {
      return extracted;
    }
    const payload = extracted.payload;
    if (!Array.isArray(payload.songs)) {
      return { ok: false, message: "music.songs must be an array." };
    }
    const songs = [];
    for (let index = 0; index < payload.songs.length; index += 1) {
      const normalized = normalizeSong(payload.songs[index], index);
      if (!normalized.ok) {
        return normalized;
      }
      songs.push(normalized.song);
    }
    const activeSongId = text(payload.activeSongId);
    const selectedSongId = songs.some((song) => song.id === activeSongId)
      ? activeSongId
      : songs[0]?.id || "";
    return {
      ok: true,
      payload: {
        schema: "html-js-gaming.midi-studio-v2",
        toolId: TOOL_ID,
        version: Number.isInteger(payload.version) ? payload.version : 1,
        runtimePreference: text(payload.runtimePreference || "rendered"),
        activeSongId: selectedSongId,
        directorMode: isPlainObject(payload.directorMode) ? deepClone(payload.directorMode) : {},
        songs
      },
      sourceKind: extracted.sourceKind
    };
  }

  createToolState(payload) {
    return {
      schema: "html-js-gaming.tool-state",
      toolId: TOOL_ID,
      version: 1,
      payload: deepClone(payload)
    };
  }
}
