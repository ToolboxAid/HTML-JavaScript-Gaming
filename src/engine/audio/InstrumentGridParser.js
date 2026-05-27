const CHORD_PATTERN = /^[A-G](?:#|b)?(?:m|min|maj|dim|aug|sus2|sus4|7|maj7|m7|min7|dim7|add9)?$/;
const DRUM_TOKENS = new Set(["kick", "snare", "hat", "ride", "clap", "tom", "crash", "perc"]);
const LANE_NAMES = ["chords", "bass", "pad", "lead", "drums"];
const NOTE_PATTERN = /^[A-G](?:#|b)?[0-8]$/;
const REST_TOKENS = new Set(["", "-", ".", "rest"]);
const SUPPORTED_SUBDIVISIONS = new Set([1, 2, 4]);

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
        message: `Unsupported timing subdivision: ${subdivision.value}. Use 1, 2, or 4.`,
        ok: false
      };
    }
    const barCount = sections.value.reduce((total, section) => total + section.bars, 0);
    const stepsPerBar = beatsPerBar.value * subdivision.value;
    const timeline = [];
    const warnings = [];
    const laneCells = {};
    for (const lane of LANE_NAMES) {
      const parsedLane = this.parseLane({
        barCount,
        beatsPerBar: beatsPerBar.value,
        lane,
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
    const normalizedSections = sections.value.map((section) => ({
      ...section,
      beatsPerBar: beatsPerBar.value,
      subdivision: subdivision.value,
      steps: section.bars * stepsPerBar
    }));
    return {
      barCount,
      beatCount: barCount * beatsPerBar.value,
      beatsPerBar: beatsPerBar.value,
      cells: laneCells,
      chordCount: timeline.filter((event) => event.kind === "chord").length,
      drumCount: timeline.filter((event) => event.kind === "drum").length,
      eventCount: timeline.length,
      lanes: LANE_NAMES,
      noteCount: timeline.filter((event) => event.kind === "note").length,
      ok: true,
      sectionSummary: normalizedSections.map((section) => `${section.label}: ${section.bars} bar${section.bars === 1 ? "" : "s"}`).join("; "),
      sections: normalizedSections,
      subdivision: subdivision.value,
      timeline,
      totalSteps: barCount * stepsPerBar,
      warningSummary: warnings.length ? warnings.join("; ") : "none",
      warnings
    };
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

  parseLane({ barCount, beatsPerBar, lane, sections, source, stepsPerBar, subdivision }) {
    const text = String(source || "").trim();
    const bars = text ? text.split("|").map((bar) => bar.trim()) : [];
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
        const normalized = this.normalizeToken({ barIndex, beatsPerBar, lane, sections, stepIndex, subdivision, token });
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

  normalizeToken({ barIndex, beatsPerBar, lane, sections, stepIndex, subdivision, token }) {
    const value = token.trim();
    const timing = this.timingForCell({ barIndex, beatsPerBar, sections, stepIndex, subdivision });
    const cell = {
      bar: timing.bar,
      beat: timing.beat,
      lane,
      section: timing.section,
      subdivision: timing.subdivision,
      subdivisionStep: timing.subdivisionStep,
      token: value
    };
    if (REST_TOKENS.has(value.toLowerCase())) {
      return { cell, events: [], ok: true, warnings: [] };
    }
    if (lane === "drums") {
      return this.normalizeDrums({ cell, timing, value });
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
    if (!NOTE_PATTERN.test(value)) {
      return { message: `Invalid note token "${value}" in ${lane} at bar ${timing.bar}, beat ${timing.beat}. Use notes like C4 or rests (-).`, ok: false };
    }
    return { cell, events: [this.eventForCell({ cell, kind: "note", value })], ok: true, warnings: [] };
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

  eventForCell({ cell, kind, value }) {
    return {
      bar: cell.bar,
      beat: cell.beat,
      durationBeats: 1 / cell.subdivision,
      kind,
      lane: cell.lane,
      section: cell.section,
      subdivision: cell.subdivision,
      value
    };
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
