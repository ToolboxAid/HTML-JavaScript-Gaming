import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "../..");
const baselinePath = path.join(__dirname, "checkPhase24CloseoutExecutionGuard.baseline.json");

const SOURCE_EXTENSIONS = new Set([".js", ".mjs", ".cjs", ".html", ".json"]);
const SKIP_DIRS = new Set(["metadata", "shared", "_shared"]);

function toPosix(value) {
  return value.replace(/\\/g, "/");
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function sha256(text) {
  return crypto.createHash("sha256").update(text, "utf8").digest("hex");
}

function normalizeRoadmapStatusMarkers(roadmapText) {
  const lf = roadmapText.replace(/\r\n/g, "\n");
  return lf.replace(/^([ \t]*[-*]?\s*\[)(?: |\.|x)(\])/gm, "$1#$2");
}

function collectSampleFiles(samplesRoot) {
  const out = [];
  const stack = [samplesRoot];
  while (stack.length > 0) {
    const current = stack.pop();
    const entries = fs.readdirSync(current, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) {
        const isSamplesRootChild = path.resolve(current) === path.resolve(samplesRoot);
        if (isSamplesRootChild && SKIP_DIRS.has(entry.name)) {
          continue;
        }
        stack.push(full);
        continue;
      }
      if (SOURCE_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) {
        out.push(full);
      }
    }
  }
  return out;
}

function runGuard() {
  if (!fs.existsSync(baselinePath)) {
    throw new Error(`Missing baseline: ${toPosix(path.relative(repoRoot, baselinePath))}`);
  }

  const baseline = readJson(baselinePath);
  const roadmapPath = path.join(repoRoot, baseline.roadmapPath);
  const errors = [];

  if (!fs.existsSync(roadmapPath)) {
    errors.push(`Roadmap path missing: ${baseline.roadmapPath}`);
  } else {
    const roadmapText = fs.readFileSync(roadmapPath, "utf8");
    const normalized = normalizeRoadmapStatusMarkers(roadmapText);
    const hash = sha256(normalized);
    if (hash !== baseline.statusInsensitiveSha256) {
      errors.push(
        `Roadmap non-status drift detected at ${baseline.roadmapPath}. Expected ${baseline.statusInsensitiveSha256}, got ${hash}.`
      );
    }
  }

  const samplesRoot = path.join(repoRoot, "samples");
  const allowedRoot = path.join(repoRoot, baseline.fullscreenAllowedRoot);
  const patterns = (baseline.fullscreenPatterns || []).map((token) => ({ token, re: new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g") }));
  const hitsOutsideAllowed = [];
  let totalHits = 0;

  for (const filePath of collectSampleFiles(samplesRoot)) {
    const source = fs.readFileSync(filePath, "utf8");
    let matched = false;
    for (const { re } of patterns) {
      if (re.test(source)) {
        matched = true;
      }
      re.lastIndex = 0;
    }
    if (!matched) {
      continue;
    }
    totalHits += 1;
    if (!path.resolve(filePath).startsWith(path.resolve(allowedRoot))) {
      hitsOutsideAllowed.push(toPosix(path.relative(repoRoot, filePath)));
    }
  }

  if (hitsOutsideAllowed.length > 0) {
    errors.push(
      `Fullscreen policy violation outside ${baseline.fullscreenAllowedRoot}:\n- ${hitsOutsideAllowed.join("\n- ")}`
    );
  }

  if (errors.length > 0) {
    console.error("PHASE24_CLOSEOUT_EXECUTION_GUARD_FAIL");
    errors.forEach((item) => console.error(item));
    process.exitCode = 1;
    return;
  }

  console.log("PHASE24_CLOSEOUT_EXECUTION_GUARD_PASS");
  console.log(`Roadmap lock path: ${baseline.roadmapPath}`);
  console.log(`Fullscreen sample hits: ${totalHits}`);
  console.log(`Fullscreen outside allowed root: 0`);
}

runGuard();
