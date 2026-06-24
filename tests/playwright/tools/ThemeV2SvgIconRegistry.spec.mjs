import { expect, test } from "@playwright/test";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { startRepoServer } from "../../helpers/playwrightRepoServer.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..", "..", "..");
const svgRoot = path.join(repoRoot, "assets", "theme-v2", "svg");
const readmePath = path.join(svgRoot, "README.md");
const styleGuidePath = path.join(repoRoot, "docs_build", "design", "theme-v2-icons", "theme-v2-icon-style-guide.md");

const REQUIRED_SVG_FILES = [
  "gfs-add.svg",
  "gfs-chevron-down.svg",
  "gfs-chevron-left.svg",
  "gfs-chevron-right.svg",
  "gfs-chevron-up.svg",
  "gfs-close.svg",
  "gfs-error.svg",
  "gfs-exit-fullscreen.svg",
  "gfs-fullscreen.svg",
  "gfs-info.svg",
  "gfs-menu.svg",
  "gfs-search.svg",
  "gfs-settings.svg",
  "gfs-subtract.svg",
  "gfs-success.svg",
  "gfs-trash.svg",
  "gfs-warning.svg",
];

const FORBIDDEN_SVG_FILES = [
  "gfs-collapse.svg",
  "gfs-delete.svg",
  "gfs-expand.svg",
];

function attributeValues(content, attributeName) {
  return [...content.matchAll(new RegExp(`\\s${attributeName}="([^"]+)"`, "g"))].map((match) => match[1]);
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function readSvg(fileName) {
  return fs.readFile(path.join(svgRoot, fileName), "utf8");
}

test("provides the required standalone Theme V2 SVG files", async () => {
  const actualFiles = (await fs.readdir(svgRoot)).filter((name) => name.endsWith(".svg")).sort();
  expect(actualFiles).toEqual(REQUIRED_SVG_FILES);

  for (const fileName of FORBIDDEN_SVG_FILES) {
    await expect(fileExists(path.join(svgRoot, fileName))).resolves.toBe(false);
  }
});

test("validates every SVG as well-formed XML", async ({ page }) => {
  for (const fileName of REQUIRED_SVG_FILES) {
    const content = await readSvg(fileName);
    const result = await page.evaluate((svgText) => {
      const document = new DOMParser().parseFromString(svgText, "image/svg+xml");
      const parserError = document.querySelector("parsererror");
      const root = document.documentElement;
      return {
        error: parserError?.textContent?.replace(/\s+/g, " ").trim() || "",
        rootName: root?.tagName || "",
      };
    }, content);
    expect(result.error, fileName).toBe("");
    expect(result.rootName.toLowerCase(), fileName).toBe("svg");
  }
});

test("validates required shared SVG attributes without inspecting artwork geometry", async () => {
  for (const fileName of REQUIRED_SVG_FILES) {
    const content = await readSvg(fileName);
    const fillValues = attributeValues(content, "fill");
    const strokeValues = attributeValues(content, "stroke");
    const linecapValues = attributeValues(content, "stroke-linecap");
    const linejoinValues = attributeValues(content, "stroke-linejoin");

    expect(content, fileName).toContain("<svg");
    expect(content, fileName).toContain('viewBox="0 0 24 24"');
    expect(content, fileName).toContain('fill="none"');
    expect(content, fileName).toContain('stroke="currentColor"');
    expect(content, fileName).toContain('stroke-linecap="round"');
    expect(content, fileName).toContain('stroke-linejoin="round"');
    expect(fillValues.every((value) => value === "none"), fileName).toBe(true);
    expect(strokeValues.every((value) => value === "currentColor"), fileName).toBe(true);
    expect(linecapValues.every((value) => value === "round"), fileName).toBe(true);
    expect(linejoinValues.every((value) => value === "round"), fileName).toBe(true);
  }
});

test("serves every Theme V2 SVG asset as an external file", async ({ request }) => {
  const server = await startRepoServer();
  try {
    for (const fileName of REQUIRED_SVG_FILES) {
      const response = await request.get(`${server.baseUrl}/assets/theme-v2/svg/${fileName}`);
      expect(response.ok(), fileName).toBe(true);
      expect(response.headers()["content-type"], fileName).toContain("image/svg+xml");
      const body = await response.text();
      expect(body, fileName).toContain('viewBox="0 0 24 24"');
      expect(body, fileName).toContain('stroke="currentColor"');
    }
  } finally {
    await server.close();
  }
});

test("documents the SVG registry and authoritative artwork policy", async () => {
  const readme = await fs.readFile(readmePath, "utf8");
  const styleGuide = await fs.readFile(styleGuidePath, "utf8");
  const requiredPhrases = [
    "The SVG files in `assets/theme-v2/svg/` are the authoritative Theme V2 icon source.",
    "Do not regenerate, redesign, simplify, optimize, or redraw these SVG files during validation-only PRs.",
    "If a required SVG is missing, report validation failure instead of generating a replacement.",
    '`viewBox="0 0 24 24"`',
    '`fill="none"`',
    '`stroke="currentColor"`',
    '`stroke-linecap="round"`',
    '`stroke-linejoin="round"`',
  ];

  for (const phrase of requiredPhrases) {
    expect(readme).toContain(phrase);
    expect(styleGuide).toContain(phrase);
  }
});
