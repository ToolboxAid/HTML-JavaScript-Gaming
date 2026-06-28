import { expect, test } from "@playwright/test";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { startRepoServer } from "../../helpers/playwrightRepoServer.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..", "..", "..");
const svgRoot = path.join(repoRoot, "www", "assets", "theme-v2", "svg");
const readmePath = path.join(svgRoot, "README.md");
const themeIconsPath = path.join(repoRoot, "www", "assets", "theme-v2", "js", "theme-icons.js");
const styleGuidePath = path.join(repoRoot, "dev", "build", "design", "theme-v2-icons", "theme-v2-icon-style-guide.md");

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

const REQUIRED_ICON_REGISTRY = {
  add: "gfs-add.svg",
  "chevron-down": "gfs-chevron-down.svg",
  "chevron-left": "gfs-chevron-left.svg",
  "chevron-right": "gfs-chevron-right.svg",
  "chevron-up": "gfs-chevron-up.svg",
  close: "gfs-close.svg",
  delete: "gfs-trash.svg",
  edit: "gfs-settings.svg",
  error: "gfs-error.svg",
  "external-link": "gfs-chevron-right.svg",
  "exit-fullscreen": "gfs-exit-fullscreen.svg",
  fullscreen: "gfs-fullscreen.svg",
  info: "gfs-info.svg",
  menu: "gfs-menu.svg",
  save: "gfs-success.svg",
  search: "gfs-search.svg",
  settings: "gfs-settings.svg",
  subtract: "gfs-subtract.svg",
  success: "gfs-success.svg",
  trash: "gfs-trash.svg",
  validation: "gfs-warning.svg",
  warning: "gfs-warning.svg",
};

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

test("maps shared Theme V2 icon names to standalone SVG files", async () => {
  const themeIcons = await import(`${pathToFileURL(themeIconsPath).href}?cacheBust=${Date.now()}`);

  expect(themeIcons.themeV2IconRegistry).toEqual(REQUIRED_ICON_REGISTRY);
  for (const [iconName, fileName] of Object.entries(REQUIRED_ICON_REGISTRY)) {
    expect(REQUIRED_SVG_FILES, iconName).toContain(fileName);
    expect(themeIcons.themeIconFileName(iconName)).toBe(fileName);
    expect(themeIcons.themeIconPath(iconName)).toBe(`/assets/theme-v2/svg/${fileName}`);
  }
});

test("creates CSS-backed registry icon nodes without inline SVG", async ({ page }) => {
  const server = await startRepoServer();
  try {
    await page.goto(`${server.baseUrl}/toolbox/idea-board/index.html`, { waitUntil: "networkidle" });
    const result = await page.evaluate(async () => {
      const themeIcons = await import("/assets/theme-v2/js/theme-icons.js");
      const icon = themeIcons.createThemeIcon("chevron-down", { className: "test-registry-icon" });
      document.body.appendChild(icon);
      const iconStyles = getComputedStyle(icon);
      return {
        ariaHidden: icon.getAttribute("aria-hidden"),
        className: icon.className,
        iconFile: icon.dataset.themeIconFile,
        iconName: icon.dataset.themeIcon,
        inlineSvgCount: icon.querySelectorAll("svg").length,
        maskImage: iconStyles.getPropertyValue("-webkit-mask-image") || iconStyles.maskImage,
        role: icon.getAttribute("role"),
        tagName: icon.tagName.toLowerCase(),
      };
    });

    expect(result).toEqual({
      ariaHidden: "true",
      className: "theme-icon theme-icon--chevron-down test-registry-icon",
      iconFile: "gfs-chevron-down.svg",
      iconName: "chevron-down",
      inlineSvgCount: 0,
      maskImage: expect.stringContaining("gfs-chevron-down.svg"),
      role: null,
      tagName: "span",
    });
  } finally {
    await server.close();
  }
});

test("supports semantic status and action aliases with shared CSS classes", async ({ page }) => {
  const server = await startRepoServer();
  try {
    await page.goto(`${server.baseUrl}/toolbox/idea-board/index.html`, { waitUntil: "networkidle" });
    const result = await page.evaluate(async () => {
      const themeIcons = await import("/assets/theme-v2/js/theme-icons.js");
      const saveButton = document.createElement("button");
      saveButton.className = "btn btn--with-icon";
      saveButton.type = "button";
      saveButton.append(
        themeIcons.createThemeIcon("save", { className: "btn__icon" }),
        document.createTextNode("Save")
      );

      const deleteButton = document.createElement("button");
      deleteButton.className = "btn btn--icon-only btn--icon-danger";
      deleteButton.type = "button";
      deleteButton.setAttribute("aria-label", "Delete game");
      deleteButton.append(themeIcons.createThemeIcon("delete", { className: "btn__icon" }));

      const statusIcon = themeIcons.createThemeIcon("validation", {
        className: "status-icon status-icon--validation",
      });
      const layoutIcon = themeIcons.createThemeIcon("fullscreen", { className: "layout-icon" });

      document.body.append(saveButton, deleteButton, statusIcon, layoutIcon);

      const saveIcon = saveButton.querySelector("[data-theme-icon]");
      const deleteIcon = deleteButton.querySelector("[data-theme-icon]");
      const saveStyles = getComputedStyle(saveButton);
      const deleteStyles = getComputedStyle(deleteButton);
      const statusStyles = getComputedStyle(statusIcon);
      return {
        deleteAriaLabel: deleteButton.getAttribute("aria-label"),
        deleteButtonHeight: deleteStyles.height,
        deleteButtonWidth: deleteStyles.width,
        deleteIconFile: deleteIcon?.dataset.themeIconFile,
        deleteIconName: deleteIcon?.dataset.themeIcon,
        saveButtonGap: saveStyles.gap,
        saveButtonText: saveButton.textContent.trim(),
        saveIconFile: saveIcon?.dataset.themeIconFile,
        saveIconName: saveIcon?.dataset.themeIcon,
        statusIconColor: statusStyles.color,
        statusIconFile: statusIcon.dataset.themeIconFile,
        statusIconName: statusIcon.dataset.themeIcon,
        layoutIconFile: layoutIcon.dataset.themeIconFile,
        layoutIconName: layoutIcon.dataset.themeIcon,
        layoutIconWidth: getComputedStyle(layoutIcon).width,
      };
    });

    expect(result).toEqual({
      deleteAriaLabel: "Delete game",
      deleteButtonHeight: "44px",
      deleteButtonWidth: "44px",
      deleteIconFile: "gfs-trash.svg",
      deleteIconName: "delete",
      saveButtonGap: "8px",
      saveButtonText: "Save",
      saveIconFile: "gfs-success.svg",
      saveIconName: "save",
      statusIconColor: "rgb(255, 200, 87)",
      statusIconFile: "gfs-warning.svg",
      statusIconName: "validation",
      layoutIconFile: "gfs-fullscreen.svg",
      layoutIconName: "fullscreen",
      layoutIconWidth: "16px",
    });
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
