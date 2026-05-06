import { execFileSync } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";

export class PlaywrightV8CoverageReporter {
  constructor({
    repoRoot = process.cwd(),
    reportPath = "docs/dev/reports/playwright_v8_coverage_report.txt",
    advisoryLowCoveragePercent = 50
  } = {}) {
    this.repoRoot = repoRoot;
    this.reportPath = path.resolve(repoRoot, reportPath);
    this.advisoryLowCoveragePercent = advisoryLowCoveragePercent;
    this.activePages = new WeakSet();
    this.entries = [];
  }

  async start(page) {
    if (this.activePages.has(page)) {
      return;
    }
    await page.coverage.startJSCoverage({
      resetOnNavigation: false,
      reportAnonymousScripts: false
    });
    this.activePages.add(page);
  }

  async stop(page) {
    if (!this.activePages.has(page)) {
      return;
    }
    const entries = await page.coverage.stopJSCoverage();
    this.entries.push(...entries);
    this.activePages.delete(page);
  }

  async writeReport() {
    const coverageByPath = this.buildCoverageByPath();
    const changedJsFiles = this.getChangedJsFiles();
    const changedRuntimeJsFiles = changedJsFiles.filter((filePath) => (
      filePath.startsWith("src/")
      || filePath.startsWith("tools/")
      || filePath.startsWith("common/")
    ));
    const reportLines = [
      "Playwright V8 Coverage Report",
      "",
      "PR: PR_26126_058-playwright-coverage-include-palette-manager",
      "Coverage source: Playwright/Chromium built-in V8 coverage.",
      "Coverage scope: all collected runtime JavaScript under src/, tools/, and common/.",
      "Dependencies: no new npm packages.",
      "Thresholds: none enforced.",
      "Note: coverage is an advisory baseline only for this PR.",
      "Note: line counts are V8 range-based and advisory; function counts show partial module exercise where available.",
      "Note: entry percentages use function coverage when available, otherwise line coverage.",
      "",
      "Changed runtime JS files covered:",
      ...this.formatChangedRuntimeCoverage(changedRuntimeJsFiles, coverageByPath),
      "",
      "Files with executed line/function counts where available:",
      ...this.formatCoverageTable(coverageByPath),
      "",
      "Uncovered or low-coverage changed JS files:",
      ...this.formatLowCoverageChangedFiles(changedRuntimeJsFiles, coverageByPath),
      "",
      "Changed JS files considered:",
      ...this.formatChangedJsFiles(changedJsFiles, coverageByPath)
    ];

    await fs.mkdir(path.dirname(this.reportPath), { recursive: true });
    await fs.writeFile(this.reportPath, `${reportLines.join("\n")}\n`, "utf8");
  }

  buildCoverageByPath() {
    const coverageByPath = new Map();
    for (const entry of this.entries) {
      const repoPath = this.repoPathFromCoverageUrl(entry.url);
      if (!repoPath) {
        continue;
      }
      const source = entry.text || entry.source || "";
      const existing = coverageByPath.get(repoPath) || {
        repoPath,
        source,
        executedLines: new Set(),
        totalLines: this.countTotalLines(source),
        executedFunctions: new Set(),
        totalFunctions: new Set()
      };
      if (!existing.source && source) {
        existing.source = source;
        existing.totalLines = this.countTotalLines(source);
      }
      this.applyLineCoverage(existing, entry, source || existing.source);
      this.applyFunctionCoverage(existing, entry);
      coverageByPath.set(repoPath, existing);
    }
    return coverageByPath;
  }

  repoPathFromCoverageUrl(url) {
    if (!url || url.startsWith("debugger://")) {
      return null;
    }
    let pathname;
    try {
      pathname = new URL(url).pathname;
    } catch {
      return null;
    }
    const repoPath = decodeURIComponent(pathname).replace(/^\/+/, "").replaceAll("\\", "/");
    const absolutePath = path.resolve(this.repoRoot, repoPath);
    const relativePath = path.relative(this.repoRoot, absolutePath).replaceAll("\\", "/");
    if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) {
      return null;
    }
    if (!relativePath.endsWith(".js") && !relativePath.endsWith(".mjs")) {
      return null;
    }
    return relativePath;
  }

  applyLineCoverage(record, entry, source) {
    if (!source) {
      return;
    }
    const lineStarts = this.lineStartOffsets(source);
    for (const range of this.executedRanges(entry)) {
      const startLine = this.lineNumberForOffset(lineStarts, range.startOffset);
      const endLine = this.lineNumberForOffset(lineStarts, Math.max(range.startOffset, range.endOffset - 1));
      for (let line = startLine; line <= endLine; line += 1) {
        if (this.isCountableLine(source, line)) {
          record.executedLines.add(line);
        }
      }
    }
  }

  applyFunctionCoverage(record, entry) {
    if (!Array.isArray(entry.functions)) {
      return;
    }
    for (const fn of entry.functions) {
      const ranges = Array.isArray(fn.ranges) ? fn.ranges : [];
      const startOffset = ranges[0]?.startOffset ?? 0;
      const endOffset = ranges[0]?.endOffset ?? 0;
      const id = `${fn.functionName || "(anonymous)"}:${startOffset}:${endOffset}`;
      record.totalFunctions.add(id);
      if (ranges.some((range) => range.count > 0)) {
        record.executedFunctions.add(id);
      }
    }
  }

  executedRanges(entry) {
    if (Array.isArray(entry.functions)) {
      return entry.functions
        .flatMap((fn) => Array.isArray(fn.ranges) ? fn.ranges : [])
        .filter((range) => range.count > 0);
    }
    if (Array.isArray(entry.ranges)) {
      return entry.ranges.filter((range) => range.count > 0);
    }
    return [];
  }

  lineStartOffsets(source) {
    const offsets = [0];
    for (let index = 0; index < source.length; index += 1) {
      if (source[index] === "\n") {
        offsets.push(index + 1);
      }
    }
    return offsets;
  }

  lineNumberForOffset(lineStarts, offset) {
    let low = 0;
    let high = lineStarts.length - 1;
    while (low <= high) {
      const middle = Math.floor((low + high) / 2);
      if (lineStarts[middle] <= offset) {
        low = middle + 1;
      } else {
        high = middle - 1;
      }
    }
    return Math.max(1, high + 1);
  }

  countTotalLines(source) {
    return source
      .split(/\r?\n/)
      .filter((line) => this.isCountableText(line))
      .length;
  }

  isCountableLine(source, oneBasedLineNumber) {
    const line = source.split(/\r?\n/)[oneBasedLineNumber - 1] || "";
    return this.isCountableText(line);
  }

  isCountableText(line) {
    const trimmed = line.trim();
    return Boolean(trimmed) && !trimmed.startsWith("//");
  }

  getChangedJsFiles() {
    const statusOutput = execFileSync("git", ["status", "--porcelain"], {
      cwd: this.repoRoot,
      encoding: "utf8"
    });
    return statusOutput
      .split(/\r?\n/)
      .map((line) => line.trimEnd())
      .filter(Boolean)
      .map((line) => this.pathFromStatusLine(line))
      .filter(Boolean)
      .filter((filePath) => filePath.endsWith(".js") || filePath.endsWith(".mjs"))
      .sort((left, right) => left.localeCompare(right));
  }

  pathFromStatusLine(line) {
    const rawPath = line.slice(3).trim();
    if (!rawPath) {
      return null;
    }
    const renameSeparator = " -> ";
    const filePath = rawPath.includes(renameSeparator)
      ? rawPath.slice(rawPath.lastIndexOf(renameSeparator) + renameSeparator.length)
      : rawPath;
    return filePath.replaceAll("\\", "/");
  }

  formatChangedRuntimeCoverage(changedRuntimeJsFiles, coverageByPath) {
    if (!changedRuntimeJsFiles.length) {
      return ["(100%) none changed - no changed runtime JS files"];
    }
    return changedRuntimeJsFiles
      .map((filePath) => ({ filePath, record: coverageByPath.get(filePath) }))
      .sort((left, right) => this.compareCoverageEntries(left, right))
      .map(({ filePath, record }) => (
        record
          ? this.formatCoverageEntry(filePath, record, `${this.lineSummary(record)}; ${this.functionSummary(record)}`)
          : "(0%) " + filePath + " - not covered"
      ));
  }

  formatCoverageTable(coverageByPath) {
    const records = [...coverageByPath.values()]
      .filter((record) => (
        record.repoPath.startsWith("tools/")
        || record.repoPath.startsWith("src/")
        || record.repoPath.startsWith("common/")
      ))
      .sort((left, right) => this.compareCoverageEntries(
        { filePath: left.repoPath, record: left },
        { filePath: right.repoPath, record: right }
      ));
    if (!records.length) {
      return ["(100%) none - no covered runtime files"];
    }
    return records.map((record) => this.formatCoverageEntry(
      record.repoPath,
      record,
      `${this.lineSummary(record)}; ${this.functionSummary(record)}`
    ));
  }

  formatLowCoverageChangedFiles(changedRuntimeJsFiles, coverageByPath) {
    if (!changedRuntimeJsFiles.length) {
      return ["(100%) none changed - no changed runtime JS files"];
    }
    const lowCoverage = changedRuntimeJsFiles
      .map((filePath) => ({ filePath, record: coverageByPath.get(filePath) }))
      .filter(({ record }) => !record || this.coveragePercent(record) < this.advisoryLowCoveragePercent)
      .sort((left, right) => this.compareCoverageEntries(left, right));
    if (!lowCoverage.length) {
      return ["(100%) none - no low-coverage changed runtime JS files"];
    }
    return lowCoverage.map(({ filePath, record }) => (
      record
        ? this.formatCoverageEntry(filePath, record, `advisory low coverage; ${this.lineSummary(record)}`)
        : "(0%) " + filePath + " - uncovered"
    ));
  }

  formatChangedJsFiles(changedJsFiles, coverageByPath) {
    if (!changedJsFiles.length) {
      return ["(100%) none - no changed JS files"];
    }
    return changedJsFiles
      .map((filePath) => ({ filePath, record: coverageByPath.get(filePath) }))
      .sort((left, right) => this.compareCoverageEntries(left, right))
      .map(({ filePath, record }) => (
        record
          ? this.formatCoverageEntry(filePath, record, "changed JS file with browser V8 coverage")
          : "(0%) " + filePath + " - changed JS file not collected as browser runtime coverage"
      ));
  }

  formatCoverageEntry(filePath, record, details) {
    return `(${this.coveragePercent(record)}%) ${filePath} - ${details}`;
  }

  compareCoverageEntries(left, right) {
    const percentDelta = this.coveragePercent(left.record) - this.coveragePercent(right.record);
    if (percentDelta !== 0) {
      return percentDelta;
    }
    return left.filePath.localeCompare(right.filePath);
  }

  lineSummary(record) {
    if (!record.totalLines) {
      return `executed lines ${record.executedLines.size}/unknown`;
    }
    return `executed lines ${record.executedLines.size}/${record.totalLines}`;
  }

  functionSummary(record) {
    if (!record.totalFunctions.size) {
      return `executed functions ${record.executedFunctions.size}/unknown`;
    }
    return `executed functions ${record.executedFunctions.size}/${record.totalFunctions.size}`;
  }

  linePercent(record) {
    if (!record.totalLines) {
      return 0;
    }
    return Math.round((record.executedLines.size / record.totalLines) * 100);
  }

  functionPercent(record) {
    if (!record.totalFunctions.size) {
      return 0;
    }
    return Math.round((record.executedFunctions.size / record.totalFunctions.size) * 100);
  }

  coveragePercent(record) {
    if (!record) {
      return 0;
    }
    if (record.totalFunctions.size) {
      return this.functionPercent(record);
    }
    return this.linePercent(record);
  }
}
