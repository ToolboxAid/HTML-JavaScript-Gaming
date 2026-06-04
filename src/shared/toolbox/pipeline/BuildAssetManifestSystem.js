/*
Toolbox Aid
David Quesenberry
03/22/2026
BuildAssetManifestSystem.js
*/
export default class BuildAssetManifestSystem {
  createManifest({ buildId, assets = [] } = {}) {
    return {
      buildId,
      assetCount: assets.length,
      assets: assets.map((asset) => ({ ...asset })),
    };
  }

  validate(manifest) {
    const missing = manifest.assets.filter((asset) => !asset.path);
    return {
      passed: missing.length === 0,
      missing,
    };
  }
}
