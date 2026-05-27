const CHORD_PATTERN = /^[A-G](?:#|b)?(?:m|min|maj|dim|aug|sus2|sus4|7|maj7|m7|min7|dim7|add9)?$/;
const DIRECTIVES = new Set(["key", "style", "tempo"]);

export class SongSheetParser {
  parse(sourceText) {
    const text = String(sourceText || "").trim();
    if (!text) {
      return { ok: false, message: "Song Sheet is empty. Add tempo, key, style, and at least one section." };
    }
    const lines = String(sourceText || "").split(/\r?\n/);
    const metadata = { key: "", style: "", tempo: 120 };
    const sections = [];
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
          loop: label.toLowerCase() === "loop",
          timeline: []
        };
        sections.push(activeSection);
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
    if (!sections.length) {
      return { ok: false, message: "Song Sheet must include at least one [section]." };
    }
    sections.forEach((section) => {
      section.bars = section.chords.length;
      if (!section.chords.length) {
        warnings.push(`Section ${section.label} is empty.`);
      }
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
      sectionSummary: sections.map((section) => `${section.label}: ${section.bars} bars, ${section.chords.length} chords${section.loop ? ", loop" : ""}`).join("; "),
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
    return { key, ok: true, value };
  }
}
