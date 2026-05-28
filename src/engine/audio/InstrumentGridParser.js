const CHORD_PATTERN = /^[A-G](?:#|b)?(?:m|min|maj|dim|aug|sus2|sus4|7|maj7|m7|min7|dim7|add9)?$/;
const DRUM_TOKENS = new Set(["kick", "snare", "hat", "ride", "clap", "tom", "crash", "perc"]);
const DEFAULT_LANE_NAMES = ["chords", "bass", "pad", "lead", "drums"];
const NOTE_PATTERN = /^[A-G](?:#|b)?[0-8]$/;
const REST_TOKENS = new Set(["", "-", ".", "rest"]);
const SUPPORTED_SUBDIVISIONS = new Set([1, 2, 4, 8, 16]);

const CHORD_TONES = {
  A: ["A", "C#", "E"],
  Am: ["A", "C", "E"],
  B: ["B", "D#", "F#"],
  Bm: ["B", "D", "F#"],
  C: ["C", "E", "G"],
  Cm: ["C", "Eb", "G"],
  D: ["D", "F#", "A"],
  Dm: ["D", "F", "A"],
  E: ["E", "G#", "B"],
  Em: ["E", "G", "B"],
  F: ["F", "A", "C"],
  Fm: ["F", "Ab", "C"],
  G: ["G", "B", "D"],
  Gm: ["G", "Bb", "D"]
};

export class InstrumentGridParser {
  parse(input = {}) {
    const sections = this.parseSections(input.sections);
    if (!sections.ok) {
      return sections;
    }
    const beatsPerBar = this.parsePositiveInteger(input.beatsPerBar, "beats per bar");
    if (!beatsPerBar.ok) {
      return beatsPerBar;
    }
    const subdivision = this.parsePositiveInteger(input.subdivision, "timing subdivision");
    if (!subdivision.ok) {
      return subdivision;
    }
    if (!SUPPORTED_SUBDIVISIONS.has(subdivision.value)) {
      return {
        message: `Unsupported timing subdivision: ${subdivision.value}. Use 1, 2, 4, 8, or 16.`,
        ok: false
      };
    }
    const barCount = sections.value.reduce((total, section) => total + section.bars, 0);
    const stepsPerBar = beatsPerBar.value * subdivision.value;
    const timeline = [];
    const warnings = [];
    const laneCells = {};
    const laneNames = this.laneNamesFor(input.lanes);
    for (const lane of laneNames) {
      const parsedLane = this.parseLane({
        barCount,
        beatsPerBar: beatsPerBar.value,
        lane,
        generatedSource: input.generatedLanes?.[lane],
        sections: sections.value,
        source: input.lanes?.[lane],
        stepsPerBar,
        subdivision: subdivision.value
      });
      if (!parsedLane.ok) {
        return parsedLane;
      }
      laneCells[lane] = parsedLane.cells;
      timeline.push(...parsedLane.events);
      warnings.push(...parsedLane.warnings);
    }
    let nextSectionColorIndex = 0;
    const sectionColorIndices = new Map();
    let sectionStepCursor = 0;
    const normalizedSections = sections.value.map((section) => {
      const colorKey = section.label.toLowerCase();
      if (!sectionColorIndices.has(colorKey)) {
        sectionColorIndices.set(colorKey, nextSectionColorIndex);
        nextSectionColorIndex += 1;
      }
      const steps = section.bars * stepsPerBar;
      const normalized = {
        ...section,
        beatsPerBar: beatsPerBar.value,
        colorIndex: sectionColorIndices.get(colorKey) % 5,
        endStep: sectionStepCursor + steps - 1,
        startStep: sectionStepCursor,
        subdivision: subdivision.value,
        steps
      };
      sectionStepCursor += steps;
      return normalized;
    });
    return {
      barCount,
      beatCount: barCount * beatsPerBar.value,
      beatsPerBar: beatsPerBar.value,
      cells: laneCells,
      chordCount: timeline.filter((event) => event.kind === "chord").length,
      drumCount: timeline.filter((event) => event.kind === "drum").length,
      eventCount: timeline.length,
      lanes: laneNames,
      noteCount: timeline.filter((event) => event.kind === "note").length,
      ok: true,
      sectionSummary: normalizedSections.map((section) => `${section.label}: ${section.bars} bar${section.bars === 1 ? "" : "s"}`).join("; "),
      sections: normalizedSections,
      subdivision: subdivision.value,
      subdivisionLabel: `1/${subdivision.value}`,
      timeline,
      totalSteps: barCount * stepsPerBar,
      warningSummary: warnings.length ? warnings.join("; ") : "none",
      warnings
    };
  }

  generateLane(input = {}, lane) {
    if (!["bass", "pad", "lead", "drums"].includes(lane)) {
      return { message: `Unsupported generated lane: ${lane}.`, ok: false };
    }
    const sections = this.parseSections(input.sections);
    if (!sections.ok) {
      return sections;
    }
    const beatsPerBar = this.parsePositiveInteger(input.beatsPerBar, "beats per bar");
    if (!beatsPerBar.ok) {
      return beatsPerBar;
    }
    const subdivision = this.parsePositiveInteger(input.subdivision, "timing subdivision");
    if (!subdivision.ok) {
      return subdivision;
    }
    if (!SUPPORTED_SUBDIVISIONS.has(subdivision.value)) {
      return {
        message: `Unsupported timing subdivision: ${subdivision.value}. Use 1, 2, 4, 8, or 16.`,
        ok: false
      };
    }
    const barCount = sections.value.reduce((total, section) => total + section.bars, 0);
    const stepsPerBar = beatsPerBar.value * subdivision.value;
    if (lane === "drums") {
      return this.generateDrums({ barCount, beatsPerBar: beatsPerBar.value, stepsPerBar, subdivision: subdivision.value });
    }
    return this.generateFromChords({
      barCount,
      lane,
      source: input.lanes?.chords,
      stepsPerBar
    });
  }

  parseSections(source) {
    const text = String(source || "").trim();
    if (!text) {
      return { message: "Malformed bar counts. Enter sections as label:bars, for example intro:1, loop:2.", ok: false };
    }
    const sections = [];
    let startBar = 1;
    for (const part of text.split(",")) {
      const match = part.trim().match(/^([A-Za-z][A-Za-z0-9_-]*)\s*:\s*(\d+)$/);
      if (!match) {
        return { message: `Malformed bar counts in section entry: ${part.trim() || "(empty)"}. Use label:bars.`, ok: false };
      }
      const bars = Number(match[2]);
      if (!Number.isInteger(bars) || bars <= 0) {
        return { message: `Malformed bar counts for section ${match[1]}. Bars must be a positive integer.`, ok: false };
      }
      sections.push({
        bars,
        label: match[1],
        startBar
      });
      startBar += bars;
    }
    return { ok: true, value: sections };
  }

  parsePositiveInteger(value, label) {
    const number = Number(value);
    if (!Number.isInteger(number) || number <= 0) {
      return { message: `Invalid ${label}. Enter a positive whole number.`, ok: false };
    }
    return { ok: true, value: number };
  }

  laneNamesFor(lanes = {}) {
    const names = [];
    Object.keys(lanes || {}).forEach((lane) => {
      const normalized = String(lane || "").trim();
      if (normalized && !names.includes(normalized)) {
        names.push(normalized);
      }
    });
    return names.length ? names : DEFAULT_LANE_NAMES.slice();
  }

  parseLane({ barCount, beatsPerBar, generatedSource, lane, sections, source, stepsPerBar, subdivision }) {
    const text = String(source || "").trim();
    const bars = text ? text.split("|").map((bar) => bar.trim()) : [];
    const generatedBars = this.parseGeneratedBars({ barCount, generatedSource, stepsPerBar });
    if (bars.length && bars.length !== barCount) {
      return {
        message: `Malformed bar counts for ${lane}. Expected ${barCount} bar${barCount === 1 ? "" : "s"} from the section map, received ${bars.length}.`,
        ok: false
      };
    }
    const cells = [];
    const events = [];
    const warnings = [];
    for (let barIndex = 0; barIndex < barCount; barIndex += 1) {
      const tokens = bars[barIndex] ? bars[barIndex].split(/\s+/).filter(Boolean) : [];
      if (tokens.length && tokens.length !== stepsPerBar) {
        return {
          message: `Malformed bar counts for ${lane} bar ${barIndex + 1}. Expected ${stepsPerBar} beat slot${stepsPerBar === 1 ? "" : "s"}, received ${tokens.length}.`,
          ok: false
        };
      }
      for (let stepIndex = 0; stepIndex < stepsPerBar; stepIndex += 1) {
        const token = tokens[stepIndex] || "";
        const generatedToken = generatedBars[barIndex]?.[stepIndex] || "";
        const normalized = this.normalizeToken({ barIndex, beatsPerBar, generatedToken, lane, sections, stepIndex, subdivision, token });
        if (!normalized.ok) {
          return normalized;
        }
        warnings.push(...normalized.warnings);
        cells.push(normalized.cell);
        events.push(...normalized.events);
      }
    }
    return { cells, events, ok: true, warnings };
  }

  normalizeToken({ barIndex, beatsPerBar, generatedToken, lane, sections, stepIndex, subdivision, token }) {
    const value = token.trim();
    const timing = this.timingForCell({ barIndex, beatsPerBar, sections, stepIndex, subdivision });
    const tokenSource = this.tokenSource({ generatedToken, value });
    const cell = {
      bar: timing.bar,
      beat: timing.beat,
      lane,
      section: timing.section,
      source: tokenSource,
      stepIndex: barIndex * beatsPerBar * subdivision + stepIndex,
      subdivision: timing.subdivision,
      subdivisionStep: timing.subdivisionStep,
      token: value
    };
    if (REST_TOKENS.has(value.toLowerCase())) {
      return { cell, events: [], ok: true, warnings: [] };
    }
    if (lane === "drums" || this.isDrumToken(value)) {
      return this.normalizeDrums({ cell, timing, value });
    }
    if (value.includes("+")) {
      return this.normalizeNotes({ cell, timing, value });
    }
    if (NOTE_PATTERN.test(value)) {
      return { cell, events: [this.eventForCell({ cell, kind: "note", value })], ok: true, warnings: [] };
    }
    if (lane === "chords") {
      if (!CHORD_PATTERN.test(value)) {
        return { message: `Invalid chord token "${value}" in ${lane} at bar ${timing.bar}, beat ${timing.beat}.`, ok: false };
      }
      return { cell, events: [this.eventForCell({ cell, kind: "chord", value })], ok: true, warnings: [] };
    }
    if (lane === "pad" && CHORD_PATTERN.test(value)) {
      return { cell, events: [this.eventForCell({ cell, kind: "chord", value })], ok: true, warnings: [] };
    }
    return { message: `Invalid note token "${value}" in ${lane} at bar ${timing.bar}, beat ${timing.beat}. Use notes like C4, C4+E4, or rests (-).`, ok: false };
  }

  normalizeNotes({ cell, timing, value }) {
    const parts = value.split("+").map((part) => part.trim()).filter(Boolean);
    const invalid = parts.filter((part) => !NOTE_PATTERN.test(part));
    if (!parts.length || invalid.length) {
      return {
        message: `Invalid multi-note token "${value}" in ${cell.lane} at bar ${timing.bar}, beat ${timing.beat}. Use notes like C4+E4+G4.`,
        ok: false
      };
    }
    return {
      cell,
      events: parts.map((part) => this.eventForCell({ cell, kind: "note", value: part })),
      ok: true,
      warnings: []
    };
  }

  normalizeDrums({ cell, timing, value }) {
    const parts = value.toLowerCase().split("+").map((part) => part.trim()).filter(Boolean);
    const invalid = parts.filter((part) => !DRUM_TOKENS.has(part));
    if (invalid.length) {
      return {
        cell,
        events: [],
        ok: true,
        warnings: [`Invalid drum token "${invalid.join("+")}" at bar ${timing.bar}, beat ${timing.beat}; token was skipped.`]
      };
    }
    return {
      cell,
      events: parts.map((part) => this.eventForCell({ cell, kind: "drum", value: part })),
      ok: true,
      warnings: []
    };
  }

  isDrumToken(value) {
    const parts = String(value || "").toLowerCase().split("+").map((part) => part.trim()).filter(Boolean);
    return parts.length > 0 && parts.every((part) => DRUM_TOKENS.has(part));
  }

  eventForCell({ cell, kind, value }) {
    return {
      bar: cell.bar,
      beat: cell.beat,
      durationBeats: 1 / cell.subdivision,
      kind,
      lane: cell.lane,
      section: cell.section,
      source: cell.source,
      stepIndex: cell.stepIndex,
      subdivision: cell.subdivision,
      subdivisionStep: cell.subdivisionStep,
      value
    };
  }

  parseGeneratedBars({ barCount, generatedSource, stepsPerBar }) {
    const text = String(generatedSource || "").trim();
    const bars = text ? text.split("|").map((bar) => bar.trim()) : [];
    if (bars.length !== barCount) {
      return [];
    }
    return bars.map((bar) => {
      const tokens = bar ? bar.split(/\s+/).filter(Boolean) : [];
      return tokens.length === stepsPerBar ? tokens : [];
    });
  }

  tokenSource({ generatedToken, value }) {
    const generated = String(generatedToken || "").trim();
    if (REST_TOKENS.has(String(value || "").toLowerCase())) {
      return generated && !REST_TOKENS.has(generated.toLowerCase()) ? "manual" : "empty";
    }
    return generated === value ? "generated" : "manual";
  }

  generateDrums({ barCount, beatsPerBar, stepsPerBar, subdivision }) {
    const bars = [];
    for (let barIndex = 0; barIndex < barCount; barIndex += 1) {
      const tokens = [];
      for (let stepIndex = 0; stepIndex < stepsPerBar; stepIndex += 1) {
        if (stepIndex % subdivision !== 0) {
          tokens.push("-");
          continue;
        }
        const beat = Math.floor(stepIndex / subdivision) + 1;
        tokens.push(beat === 1 ? "kick" : beat === Math.ceil(beatsPerBar / 2) + 1 ? "snare" : "hat");
      }
      bars.push(tokens.join(" "));
    }
    return {
      generatedCount: barCount * beatsPerBar,
      lane: "drums",
      message: `Generated Basic Drums for ${barCount} bar${barCount === 1 ? "" : "s"}.`,
      ok: true,
      skippedEmptyBars: 0,
      text: bars.join(" | "),
      warningSummary: "none",
      warnings: []
    };
  }

  generateFromChords({ barCount, lane, source, stepsPerBar }) {
    const text = String(source || "").trim();
    const bars = text ? text.split("|").map((bar) => bar.trim()) : Array.from({ length: barCount }, () => "");
    if (bars.length !== barCount) {
      return {
        message: `Malformed bar counts for chord generation. Expected ${barCount} bar${barCount === 1 ? "" : "s"}, received ${bars.filter(Boolean).length || bars.length}.`,
        ok: false
      };
    }
    const generatedBars = [];
    const warnings = [];
    let generatedCount = 0;
    let skippedEmptyBars = 0;
    bars.forEach((bar, barIndex) => {
      const tokens = bar ? bar.split(/\s+/).filter(Boolean) : [];
      if (!tokens.length || tokens.every((token) => REST_TOKENS.has(token.toLowerCase()))) {
        skippedEmptyBars += 1;
        generatedBars.push(Array.from({ length: stepsPerBar }, () => "-").join(" "));
        return;
      }
      if (tokens.length !== stepsPerBar) {
        warnings.push(`Skipped bar ${barIndex + 1}: expected ${stepsPerBar} chord slot${stepsPerBar === 1 ? "" : "s"}, received ${tokens.length}.`);
        generatedBars.push(Array.from({ length: stepsPerBar }, () => "-").join(" "));
        return;
      }
      const generatedTokens = tokens.map((chord, stepIndex) => {
        const generated = this.generateTokenForChord({ chord, lane, stepIndex });
        if (!generated.ok) {
          warnings.push(`${generated.message} Bar ${barIndex + 1}, slot ${stepIndex + 1} skipped.`);
          return "-";
        }
        generatedCount += 1;
        return generated.value;
      });
      generatedBars.push(generatedTokens.join(" "));
    });
    const skipMessage = skippedEmptyBars ? ` Skipped ${skippedEmptyBars} empty bar${skippedEmptyBars === 1 ? "" : "s"}.` : "";
    return {
      generatedCount,
      lane,
      message: `Generated ${this.generatedLaneLabel(lane)} from chords with ${generatedCount} cell${generatedCount === 1 ? "" : "s"}.${skipMessage}`,
      ok: true,
      skippedEmptyBars,
      text: generatedBars.join(" | "),
      warningSummary: warnings.length ? warnings.join("; ") : "none",
      warnings
    };
  }

  generateTokenForChord({ chord, lane, stepIndex }) {
    const value = String(chord || "").trim();
    if (REST_TOKENS.has(value.toLowerCase())) {
      return { ok: true, value: "-" };
    }
    if (!CHORD_PATTERN.test(value)) {
      return { message: `Invalid chord "${value}" for lane generation.`, ok: false };
    }
    const simple = value.match(/^([A-G](?:#|b)?)(m?)$/);
    if (!simple) {
      return { message: `Unsupported chord pattern "${value}" for lane generation.`, ok: false };
    }
    const chordName = `${simple[1]}${simple[2] || ""}`;
    const tones = CHORD_TONES[chordName];
    if (!tones) {
      return { message: `Invalid note generation for chord "${value}".`, ok: false };
    }
    if (lane === "bass") {
      return { ok: true, value: `${tones[0]}2` };
    }
    if (lane === "pad") {
      return { ok: true, value };
    }
    return { ok: true, value: `${tones[stepIndex % tones.length]}4` };
  }

  generatedLaneLabel(lane) {
    return lane === "bass"
      ? "Bass"
      : lane === "pad"
        ? "Pad"
        : lane === "lead"
          ? "Arpeggio"
          : "Basic Drums";
  }

  timingForCell({ barIndex, beatsPerBar, sections, stepIndex, subdivision }) {
    const bar = barIndex + 1;
    const section = sections.find((entry) => bar >= entry.startBar && bar < entry.startBar + entry.bars)?.label || "unknown";
    return {
      bar,
      beat: Math.floor(stepIndex / subdivision) + 1,
      section,
      subdivision,
      subdivisionStep: (stepIndex % subdivision) + 1
    };
  }
}
