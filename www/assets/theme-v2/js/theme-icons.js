const themeV2IconRegistry = Object.freeze({
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
});

function themeIconFileName(name) {
  const fileName = themeV2IconRegistry[name];
  if (!fileName) {
    throw new RangeError(`Unknown Theme V2 icon: ${name}`);
  }
  return fileName;
}

function themeIconPath(name) {
  return `/assets/theme-v2/svg/${themeIconFileName(name)}`;
}

function normalizeClassName(className) {
  if (Array.isArray(className)) {
    return className.filter(Boolean).join(" ");
  }
  return className || "";
}

function createThemeIcon(name, options = {}) {
  const icon = document.createElement("span");
  const extraClassName = normalizeClassName(options.className);
  icon.className = ["theme-icon", `theme-icon--${name}`, extraClassName].filter(Boolean).join(" ");
  icon.dataset.themeIcon = name;
  icon.dataset.themeIconFile = themeIconFileName(name);

  if (options.label) {
    icon.setAttribute("role", "img");
    icon.setAttribute("aria-label", options.label);
  } else {
    icon.setAttribute("aria-hidden", "true");
  }

  return icon;
}

const themeIconsApi = Object.freeze({
  createThemeIcon,
  themeIconFileName,
  themeIconPath,
  themeV2IconRegistry,
});

if (typeof window !== "undefined") {
  window.ThemeV2Icons = themeIconsApi;
}

export {
  createThemeIcon,
  themeIconFileName,
  themeIconPath,
  themeV2IconRegistry,
};
