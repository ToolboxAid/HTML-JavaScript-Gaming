const EXTENSION_SCRIPT_NAMES = [
  "ch-content-script-dend.js",
  "content-script-idle.js",
  "ShowOneChild.js",
];

export function isBrowserExtensionNoise(value) {
  const text = String(value || "");
  const hasKnownScriptName = EXTENSION_SCRIPT_NAMES.some((scriptName) => text.includes(scriptName));
  if (!hasKnownScriptName) {
    return false;
  }
  return text.includes("chrome-extension://") ||
    text.includes("moz-extension://") ||
    text.includes("extension://") ||
    hasKnownScriptName;
}
