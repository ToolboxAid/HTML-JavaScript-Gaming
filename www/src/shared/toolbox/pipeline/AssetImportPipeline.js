/*
Toolbox Aid
David Quesenberry
03/22/2026
AssetImportPipeline.js
*/
export default class AssetImportPipeline {
  constructor(steps = []) {
    this.steps = steps;
  }

  run(asset) {
    return this.steps.reduce((current, step) => step({ ...current }), { ...asset });
  }
}
