/*
Toolbox Aid
David Quesenberry
03/22/2026
CompressionService.js
*/
export function compressText(text) {
  return globalThis.btoa(unescape(encodeURIComponent(text)));
}

export function decompressText(text) {
  return decodeURIComponent(escape(globalThis.atob(text)));
}

export function compressJson(value) {
  return compressText(JSON.stringify(value));
}

export function decompressJson(text) {
  return JSON.parse(decompressText(text));
}
