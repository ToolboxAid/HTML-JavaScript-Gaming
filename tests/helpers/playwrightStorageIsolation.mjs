const STORAGE_MARKER_PREFIX = "__html_js_gaming_test_storage_isolated__";

function makeMarker({ lane = "unspecified", surface = "unspecified" } = {}) {
  return `${STORAGE_MARKER_PREFIX}:${lane}:${surface}`.replace(/\s+/g, "-");
}

export async function installPlaywrightStorageIsolation(page, options = {}) {
  const marker = makeMarker(options);
  await page.addInitScript(({ marker: storageMarker }) => {
    const currentName = String(window.name || "");
    if (currentName.includes(storageMarker)) {
      return;
    }
    try {
      window.localStorage?.clear();
    } catch {}
    try {
      window.sessionStorage?.clear();
    } catch {}
    window.name = currentName ? `${currentName}|${storageMarker}` : storageMarker;
  }, { marker });
}

export async function clearPlaywrightStorage(page) {
  await page.evaluate(() => {
    try {
      window.localStorage?.clear();
    } catch {}
    try {
      window.sessionStorage?.clear();
    } catch {}
  }).catch(() => {});
}
