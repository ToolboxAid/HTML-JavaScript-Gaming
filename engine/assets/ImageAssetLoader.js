/*
Toolbox Aid
David Quesenberry
03/21/2026
ImageAssetLoader.js
*/
export default class ImageAssetLoader {
  constructor() {
    this.loaded = new Map();
  }

  async load(id, src) {
    const image = { id, src, status: 'mock-loaded' };
    this.loaded.set(id, image);
    return image;
  }

  get(id) {
    return this.loaded.get(id) || null;
  }
}
