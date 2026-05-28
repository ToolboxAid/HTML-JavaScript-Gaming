const CHORD_PATTERN = /^[A-G](?:#|b)?(?:m|min|maj|dim|aug|sus2|sus4|7|maj7|m7|min7|dim7|add9)?$/;
const DIRECTIVES = new Set(["key", "sequence", "style", "tempo"]);

export class SongSheetParser {
  parse(sourceText) {
    const text = String(sourceText || "").trim();
    if (!text) {
      return { ok: false, message: "Song Sheet is empty. Add tempo, key, style, and at least one section." };
    }
    const lines = String(sourceText || "").split(/\r?\n/);
    const metadata = { key: "", sequence: [], style: "", tempo: 120 };
    const sectionDefinitions = [];
    const warnings = [];
    let activeSection = null;
    for (let index = 0; index < lines.length; index += 1) {
      const lineNumber = index + 1;
      const line = lines[index].trim();
      if (!line) {
        continue;
      }
      if (line.startsWith("[") || line.endsWith("]")) {
        if (!line.startsWith("[") || !line.endsWith("]")) {
          return { ok: false, message: `Malformed section header on line ${lineNumber}: ${line}` };
        }
        const label = line.slice(1, -1).trim();
        if (!/^[A-Za-z][A-Za-z0-9_-]*$/.test(label)) {
          return { ok: false, message: `Malformed section label on line ${lineNumber}: ${label || "(empty)"}` };
        }
        activeSection = {
          bars: 0,
          chords: [],
          label,
          lineNumber,
          timeline: []
        };
        sectionDefinitions.push(activeSection);
        continue;
      }
      if (line.includes("=")) {
        if (activeSection) {
          return { ok: false, message: `Unsupported directive inside section ${activeSection.label} on line ${lineNumber}: ${line}` };
        }
        const parsedDirective = this.parseDirective(line, lineNumber);
        if (!parsedDirective.ok) {
          return parsedDirective;
        }
        metadata[parsedDirective.key] = parsedDirective.value;
        continue;
      }
      if (!activeSection && line.includes(":")) {
        return { ok: false, message: `Unsupported Song Sheet syntax on line ${lineNumber}: ${line}` };
      }
      if (!activeSection) {
        return { ok: false, message: `Chord progression on line ${lineNumber} must appear inside a [section].` };
      }
      const chords = line.split(/\s+/).filter(Boolean);
      chords.forEach((chord) => {
        if (!CHORD_PATTERN.test(chord)) {
          warnings.push(`Invalid chord "${chord}" in section ${activeSection.label} on line ${lineNumber}; chord was skipped.`);
          return;
        }
        activeSection.timeline.push({
          bar: activeSection.timeline.length + 1,
          chord,
          durationBars: 1,
          section: activeSection.label
        });
        activeSection.chords.push(chord);
      });
    }
    if (!sectionDefinitions.length) {
      return { ok: false, message: "Song Sheet must include at least one [section]." };
    }
    const duplicateDefinition = sectionDefinitions.find((section, index) => sectionDefinitions.findIndex((entry) => entry.label.toLowerCase() === section.label.toLowerCase()) !== index);
    if (duplicateDefinition) {
      return { ok: false, message: `Duplicate musical section definition: ${duplicateDefinition.label}` };
    }
    sectionDefinitions.forEach((section) => {
      section.bars = section.chords.length;
      if (!section.chords.length) {
        warnings.push(`Empty musical section ${section.label} was skipped.`);
      }
    });
    const populatedDefinitions = sectionDefinitions.filter((section) => section.chords.length);
    if (!populatedDefinitions.length) {
      return { ok: false, message: "Song Sheet must include at least one populated musical section." };
    }
    const sectionLookup = new Map(populatedDefinitions.map((section) => [section.label.toLowerCase(), section]));
    const sequence = metadata.sequence.length ? metadata.sequence : populatedDefinitions.map((section) => section.label);
    const missingSequenceLabel = sequence.find((label) => !sectionLookup.has(label.toLowerCase()));
    if (missingSequenceLabel) {
      return { ok: false, message: `Song Sheet Sequence references missing musical section: ${missingSequenceLabel}` };
    }
    const sections = sequence.map((label, index) => {
      const definition = sectionLookup.get(label.toLowerCase());
      return {
        ...definition,
        chords: definition.chords.slice(),
        occurrence: index + 1,
        timeline: definition.timeline.map((entry) => ({ ...entry }))
      };
    });
    const bars = sections.reduce((total, section) => total + section.bars, 0);
    const chordCount = sections.reduce((total, section) => total + section.chords.length, 0);
    const estimatedDurationSeconds = Number(((bars * 4 * 60) / metadata.tempo).toFixed(3));
    return {
      bars,
      chordCount,
      estimatedDurationSeconds,
      key: metadata.key || "not declared",
      ok: true,
      sections,
      sectionDefinitions,
      sectionSummary: sections.map((section) => `${section.label}: ${section.bars} bars, ${section.chords.length} chords`).join("; "),
      sequence,
      style: metadata.style || "not declared",
      tempo: metadata.tempo,
      timeline: sections.flatMap((section) => section.timeline),
      warnings,
      warningSummary: warnings.length ? warnings.join("; ") : "none"
    };
  }

  parseDirective(line, lineNumber) {
    const match = line.match(/^([A-Za-z]+)\s*=\s*(.+)$/);
    if (!match) {
      return { ok: false, message: `Unsupported directive syntax on line ${lineNumber}: ${line}` };
    }
    const key = match[1].toLowerCase();
    const value = match[2].trim();
    if (!DIRECTIVES.has(key)) {
      return { ok: false, message: `Unsupported Song Sheet directive on line ${lineNumber}: ${key}` };
    }
    if (key === "tempo") {
      const tempo = Number(value);
      if (!Number.isFinite(tempo) || tempo <= 0) {
        return { ok: false, message: `Invalid tempo on line ${lineNumber}: ${value}` };
      }
      return { key, ok: true, value: tempo };
    }
    if (key === "sequence") {
      return {
        key,
        ok: true,
        value: value.split(/[\n,;]+/).map((entry) => entry.trim()).filter(Boolean)
      };
    }
    return { key, ok: true, value };
  }
}
