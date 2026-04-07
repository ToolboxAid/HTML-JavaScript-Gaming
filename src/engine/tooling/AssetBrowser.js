/*
Toolbox Aid
David Quesenberry
03/22/2026
AssetBrowser.js
*/
export default class AssetBrowser {
  constructor(assets = []) {
    this.assets = assets.map((asset) => ({ ...asset }));
    this.selectedId = this.assets[0]?.id || null;
  }

  list(category = null) {
    return this.assets.filter((asset) => !category || asset.category === category);
  }

  select(id) {
    this.selectedId = id;
  }

  getSelected() {
    return this.assets.find((asset) => asset.id === this.selectedId) || null;
  }
}
