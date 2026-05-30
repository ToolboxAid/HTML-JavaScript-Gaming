const EXPORT_FORMATS = [
  { key: "wav", label: "WAV" },
  { key: "mp3", label: "MP3" },
  { key: "ogg", label: "OGG" }
];
const DEFAULT_PREVIEW_ENGINE_STATUS = {
  engine: "fast-js-synth",
  label: "Fast JS Synth",
  level: "INFO",
  message: "Fast JS Synth preview ready."
};
const GAME_USAGE_READINESS_LABELS = ["Menu", "Intro", "Loop", "Boss", "Victory", "Game Over", "Ambient", "Cutscene"];

function displayValue(value) {
  if (value === undefined || value === null || value === "") {
    return "not declared";
  }
  return String(value);
}

function missingTargetLabel(label) {
  return `No rendered ${label} target selected.`;
}

function fieldToken(label) {
  return String(label || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function targetFormatSummary(song) {
  return EXPORT_FORMATS
    .map(({ key, label }) => `${label}: ${String(song?.rendered?.[key] || "").trim() ? "ready" : "missing"}`)
    .join("; ");
}

function normalizePreviewEngineStatus(status = {}) {
  const engine = String(status.engine || DEFAULT_PREVIEW_ENGINE_STATUS.engine);
  const label = String(status.label || (engine === "soundfont" ? "SoundFont Preview" : DEFAULT_PREVIEW_ENGINE_STATUS.label));
  const level = String(status.level || DEFAULT_PREVIEW_ENGINE_STATUS.level).toUpperCase();
  const message = String(status.message || DEFAULT_PREVIEW_ENGINE_STATUS.message);
  return { engine, label, level, message };
}

function previewEngineSummary(status = DEFAULT_PREVIEW_ENGINE_STATUS) {
  const preview = normalizePreviewEngineStatus(status);
  return `${preview.label}: ${preview.level} - ${preview.message}`;
}

function sequenceLength(song) {
  const sequence = String(song?.studioArrangement?.songSheet?.sequence || "");
  const count = sequence.split(/[\n,;]+/).map((entry) => entry.trim()).filter(Boolean).length;
  if (count > 0) {
    return count;
  }
  return Array.isArray(song?.studioArrangement?.sections) ? song.studioArrangement.sections.length : 0;
}

function sequenceLabels(song) {
  const sequence = String(song?.studioArrangement?.songSheet?.sequence || "");
  return sequence.split(/[\n,;]+/).map((entry) => entry.trim()).filter(Boolean);
}

function sequenceSummary(song) {
  const labels = sequenceLabels(song);
  if (labels.length) {
    return `${labels.length} sequence item${labels.length === 1 ? "" : "s"}: ${labels.join(", ")}`;
  }
  const count = sequenceLength(song);
  return `${count} sequence item${count === 1 ? "" : "s"}`;
}

function sectionRows(song) {
  const source = String(song?.studioArrangement?.songSheet?.sections || "");
  return source
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const separator = line.indexOf(":");
      if (separator < 0) {
        return null;
      }
      const label = line.slice(0, separator).trim();
      const chords = line.slice(separator + 1).trim();
      return label && chords ? { chords, label } : null;
    })
    .filter(Boolean);
}

function sectionSummary(song) {
  const rows = sectionRows(song);
  const barCount = rows.reduce((total, section) => total + section.chords.split(/\s+/).filter(Boolean).length, 0);
  return `${rows.length} populated section${rows.length === 1 ? "" : "s"} / ${barCount} bar${barCount === 1 ? "" : "s"}`;
}

function instrumentCount(song) {
  return Object.keys(song?.studioArrangement?.lanes || {}).length;
}

function noteCount(playable) {
  return Number(playable?.totalCount ?? playable?.count ?? 0);
}

function manifestSongs(payload) {
  return Array.isArray(payload?.songs) ? payload.songs : [];
}

function classificationSummary(payload) {
  const counts = new Map();
  manifestSongs(payload).forEach((song) => {
    const classification = String(song.classification || "Unclassified").trim() || "Unclassified";
    counts.set(classification, (counts.get(classification) || 0) + 1);
  });
  if (!counts.size) {
    return "0 classifications";
  }
  return Array.from(counts, ([classification, count]) => `${classification}: ${count}`).join("; ");
}

function manifestSectionSummary(payload) {
  const rows = manifestSongs(payload).flatMap((song) => sectionRows(song));
  const barCount = rows.reduce((total, section) => total + section.chords.split(/\s+/).filter(Boolean).length, 0);
  return `${rows.length} populated section${rows.length === 1 ? "" : "s"} / ${barCount} bar${barCount === 1 ? "" : "s"}`;
}

function manifestSequenceSummary(payload) {
  const sequenceCount = manifestSongs(payload).reduce((total, song) => total + sequenceLength(song), 0);
  return `${sequenceCount} sequence item${sequenceCount === 1 ? "" : "s"} across ${manifestSongs(payload).length} song${manifestSongs(payload).length === 1 ? "" : "s"}`;
}

function manifestInstrumentSummary(payload) {
  const laneCount = manifestSongs(payload).reduce((total, song) => total + instrumentCount(song), 0);
  return `${laneCount} instrument lane${laneCount === 1 ? "" : "s"} across ${manifestSongs(payload).length} song${manifestSongs(payload).length === 1 ? "" : "s"}`;
}

function gameUsageLabels(song) {
  const usage = song?.director?.usage;
  if (!Array.isArray(usage)) {
    return [];
  }
  return usage.map((entry) => String(entry || "").trim()).filter(Boolean);
}

function selectedGameUsageSummary(song) {
  const labels = gameUsageLabels(song);
  return labels.length ? labels.join(", ") : "unassigned";
}

function songUsageDisplay(song) {
  return song?.name ? `${song.name} (${song.id || "no id"})` : song?.id || "Unnamed song";
}

function manifestGameUsageAssignmentSummary(payload) {
  const songs = manifestSongs(payload);
  if (!songs.length) {
    return "No songs loaded for Game Usage assignment readiness.";
  }
  const assignments = new Map(GAME_USAGE_READINESS_LABELS.map((label) => [label, []]));
  const customAssignments = [];
  const missingAssignments = [];
  let assignedCount = 0;
  songs.forEach((song) => {
    const labels = gameUsageLabels(song);
    if (labels.length) {
      assignedCount += 1;
    } else {
      missingAssignments.push(songUsageDisplay(song));
    }
    labels.forEach((label) => {
      const commonLabel = GAME_USAGE_READINESS_LABELS.find((candidate) => candidate.toLowerCase() === label.toLowerCase());
      if (commonLabel) {
        assignments.get(commonLabel).push(songUsageDisplay(song));
      } else {
        customAssignments.push(`${label}: ${songUsageDisplay(song)}`);
      }
    });
  });
  const commonSummary = GAME_USAGE_READINESS_LABELS
    .map((label) => `${label}: ${assignments.get(label).join(", ") || "none"}`)
    .join("; ");
  const customSummary = customAssignments.length ? customAssignments.join("; ") : "none";
  const missingSummary = missingAssignments.length ? missingAssignments.join(", ") : "none";
  return `${assignedCount}/${songs.length} songs assigned; ${commonSummary}; Custom: ${customSummary}; Missing assignments WARN: ${missingSummary}.`;
}

function manifestExportReadiness(payload, selectedSong, playable) {
  const songs = manifestSongs(payload);
  if (!songs.length) {
    return "No songs loaded for manifest export readiness.";
  }
  const missingTargets = songs.filter((song) => EXPORT_FORMATS.some(({ key }) => !String(song.rendered?.[key] || "").trim()));
  const selectedNoteCount = noteCount(playable);
  const assignmentSummary = manifestGameUsageAssignmentSummary(payload);
  if (missingTargets.length) {
    return `${songs.length - missingTargets.length}/${songs.length} songs have WAV/MP3/OGG targets; selected song note count ${selectedNoteCount}; Game Usage ${assignmentSummary}.`;
  }
  return `${songs.length}/${songs.length} songs have WAV/MP3/OGG targets; selected song ${selectedSong?.name || "none"} has ${selectedNoteCount} note${selectedNoteCount === 1 ? "" : "s"}; Game Usage ${assignmentSummary}.`;
}

export class ExportPanelControl {
  constructor({ diagnosticManifestDetails = null, diagnosticTargets, manifestDetails, renderedTargets, sourceDetails, statusDetails }) {
    this.diagnosticManifestDetails = diagnosticManifestDetails;
    this.diagnosticTargets = diagnosticTargets;
    this.manifestDetails = manifestDetails;
    this.renderedTargets = renderedTargets;
    this.previewEngineStatus = normalizePreviewEngineStatus();
    this.sourceDetails = sourceDetails;
    this.statusDetails = statusDetails;
    this.onTargetChange = () => {};
  }

  mount({ onTargetChange = () => {} } = {}) {
    this.onTargetChange = onTargetChange;
    this.renderedTargets.addEventListener("input", (event) => this.handleTargetInput(event));
    this.renderedTargets.addEventListener("change", (event) => this.handleTargetInput(event));
  }

  handleTargetInput(event) {
    const input = event.target.closest("[data-rendered-target-format]");
    if (!input) {
      return;
    }
    const format = input.dataset.renderedTargetFormat;
    const value = input.value;
    const readout = input.closest(".midi-studio-v2__export-target-row")?.querySelector(".midi-studio-v2__export-target-readout");
    if (readout) {
      const label = EXPORT_FORMATS.find((entry) => entry.key === format)?.label || format.toUpperCase();
      readout.textContent = value.trim() || missingTargetLabel(label);
    }
    this.onTargetChange(format, value);
  }

  setPreviewEngineStatus(status = {}) {
    this.previewEngineStatus = normalizePreviewEngineStatus(status);
  }

  render(song, { payload = null, playable = { count: 0 }, previewEngineStatus = null } = {}) {
    if (previewEngineStatus) {
      this.setPreviewEngineStatus(previewEngineStatus);
    }
    this.renderSource(song, playable);
    this.renderManifestReadiness(payload, song, playable);
    this.renderTargets(song);
    this.renderDiagnostics(song, playable, payload);
    this.setStatus(this.exportReadiness(song, { payload, playable }));
  }

  renderSource(song, playable = { count: 0 }) {
    this.renderDefinitionList(this.sourceDetails, [
      ["Song name", song?.name || "No song selected"],
      ["Classification", song?.classification || "not declared"],
      ["Generated ID", song?.id || "not declared"],
      ["Game usage assignment", selectedGameUsageSummary(song)],
      ["Sequence summary", sequenceSummary(song)],
      ["Section summary", sectionSummary(song)],
      ["Sequence length", sequenceLength(song)],
      ["Note count", noteCount(playable)],
      ["Instrument count", instrumentCount(song)],
      ["Target output formats", targetFormatSummary(song)],
      ["Preview engine", this.previewEngineStatus.label],
      ["SoundFont preview", previewEngineSummary(this.previewEngineStatus)],
      ["Playable event count", Number(playable.count || 0)],
      ["Runtime source", song ? "canonical song model / octave timeline data" : "No octave timeline source selected"]
    ]);
  }

  renderTargets(song) {
    this.renderedTargets.replaceChildren();
    EXPORT_FORMATS.forEach(({ key, label }) => {
      const row = document.createElement("div");
      const term = document.createElement("dt");
      const description = document.createElement("dd");
      const input = document.createElement("input");
      const readout = document.createElement("span");
      const value = String(song?.rendered?.[key] || "");

      row.className = "midi-studio-v2__export-target-row";
      term.textContent = `${label} target path`;
      input.id = `renderedTarget${label.charAt(0)}${label.slice(1).toLowerCase()}Input`;
      input.type = "text";
      input.disabled = !song;
      input.placeholder = `assets/music/rendered/song.${key}`;
      input.value = value;
      input.dataset.renderedTargetFormat = key;
      input.setAttribute("aria-label", `${label} rendered target path`);
      readout.className = "midi-studio-v2__export-target-readout";
      readout.textContent = value || missingTargetLabel(label);

      description.append(input, readout);
      row.append(term, description);
      this.renderedTargets.append(row);
    });
  }

  renderManifestReadiness(payload, song, playable = { count: 0 }) {
    if (!this.manifestDetails) {
      return;
    }
    const rows = [
      ["Song count", manifestSongs(payload).length],
      ["Classification summary", classificationSummary(payload)],
      ["Section summary", manifestSectionSummary(payload)],
      ["Sequence summary", manifestSequenceSummary(payload)],
      ["Instrument summary", manifestInstrumentSummary(payload)],
      ["Game usage assignment", manifestGameUsageAssignmentSummary(payload)],
      ["Export readiness", manifestExportReadiness(payload, song, playable)],
      ["Preview engine readiness", previewEngineSummary(this.previewEngineStatus)]
    ];
    this.renderDefinitionList(this.manifestDetails, rows);
    if (this.diagnosticManifestDetails) {
      this.renderDefinitionList(this.diagnosticManifestDetails, rows);
    }
  }

  renderDiagnostics(song, playable = { count: 0 }, payload = null) {
    if (!this.diagnosticTargets) {
      return;
    }
    const readiness = this.exportReadiness(song, { payload, playable });
    this.renderDefinitionList(this.diagnosticTargets, [
      ["Song name", song?.name || "No song selected"],
      ["Classification", song?.classification || "not declared"],
      ["Generated ID", song?.id || "not declared"],
      ["Game usage assignment", selectedGameUsageSummary(song)],
      ["Sequence summary", sequenceSummary(song)],
      ["Section summary", sectionSummary(song)],
      ["Sequence length", sequenceLength(song)],
      ["Note count", noteCount(playable)],
      ["Instrument count", instrumentCount(song)],
      ["Target output formats", targetFormatSummary(song)],
      ["Export readiness", manifestExportReadiness(payload, song, playable)],
      ["Renderer", "Existing rendered asset download"],
      ["Preview engine", this.previewEngineStatus.label],
      ["SoundFont", previewEngineSummary(this.previewEngineStatus)],
      ["Status", `${readiness.level}: ${readiness.message}`],
      ...EXPORT_FORMATS.map(({ key, label }) => [
        `${label} target`,
        song?.rendered?.[key] || missingTargetLabel(label)
      ])
    ]);
  }

  exportReadiness(song, { payload = null, playable = { count: 0 } } = {}) {
    if (!song) {
      return { level: "FAIL", message: "No MIDI song selected.", payload, playable, song };
    }
    const missingTargets = EXPORT_FORMATS
      .filter(({ key }) => !String(song.rendered?.[key] || "").trim())
      .map(({ label }) => label);
    if (Number(playable.count || 0) <= 0) {
      return {
        level: "WARN",
        message: `Selected song ${song.name} has no playable timeline events for rendered export readiness. Sequence length ${sequenceLength(song)}; instruments ${instrumentCount(song)}. Preview engine ${previewEngineSummary(this.previewEngineStatus)}.`,
        payload,
        playable,
        song
      };
    }
    if (missingTargets.length) {
      return {
        level: "WARN",
        message: `Export source is ready with ${sequenceLength(song)} sequence item(s), ${noteCount(playable)} notes, and ${instrumentCount(song)} instrument(s), but target paths are missing for ${missingTargets.join(", ")}. Save WAV/MP3/OGG downloads declared rendered targets when files exist. Preview engine ${previewEngineSummary(this.previewEngineStatus)}.`,
        payload,
        playable,
        song
      };
    }
    return {
      level: this.previewEngineStatus.level === "FAIL" || this.previewEngineStatus.level === "WARN" ? "WARN" : "INFO",
      message: `Export source and target formats are declared for ${sequenceLength(song)} sequence item(s), ${noteCount(playable)} notes, and ${instrumentCount(song)} instrument(s). Save WAV/MP3/OGG downloads the declared rendered target files. Preview engine ${previewEngineSummary(this.previewEngineStatus)}.`,
      payload,
      playable,
      song
    };
  }

  setStatus({ level = "INFO", message = "No export attempted.", payload = null, playable = { count: 0 }, song = null } = {}) {
    this.statusDetails.dataset.exportStatusLevel = level.toLowerCase();
    this.renderDefinitionList(this.statusDetails, [
      ["Song name", song?.name || "No song selected"],
      ["Classification", song?.classification || "not declared"],
      ["Generated ID", song?.id || "not declared"],
      ["Game usage assignment", selectedGameUsageSummary(song)],
      ["Sequence summary", sequenceSummary(song)],
      ["Section summary", sectionSummary(song)],
      ["Sequence length", sequenceLength(song)],
      ["Note count", noteCount(playable)],
      ["Instrument count", instrumentCount(song)],
      ["Song count", manifestSongs(payload).length],
      ["Classification summary", classificationSummary(payload)],
      ["Manifest section summary", manifestSectionSummary(payload)],
      ["Manifest sequence summary", manifestSequenceSummary(payload)],
      ["Manifest instrument summary", manifestInstrumentSummary(payload)],
      ["Manifest game usage assignment", manifestGameUsageAssignmentSummary(payload)],
      ["Export readiness", manifestExportReadiness(payload, song, playable)],
      ["Target output formats", targetFormatSummary(song)],
      ["Owner", "Export tab owns rendered audio output workflow"],
      ["Renderer", "Existing rendered asset download"],
      ["Preview engine", this.previewEngineStatus.label],
      ["SoundFont", previewEngineSummary(this.previewEngineStatus)],
      ["Status", `${level}: ${message}`]
    ]);
  }

  renderDefinitionList(list, rows) {
    list.replaceChildren();
    rows.forEach(([label, value]) => {
      const row = document.createElement("div");
      const term = document.createElement("dt");
      const description = document.createElement("dd");
      row.dataset.exportField = fieldToken(label);
      term.textContent = label;
      description.textContent = displayValue(value);
      row.append(term, description);
      list.append(row);
    });
  }
}
