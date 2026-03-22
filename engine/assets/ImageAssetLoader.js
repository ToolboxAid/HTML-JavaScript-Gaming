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

  async load(id, source) {
    let image = null;
    let status = 'mock-loaded';

    if (typeof source === 'function') {
      image = source();
      status = 'generated-loaded';
    } else if (source && typeof source.createImage === 'function') {
      image = source.createImage();
      status = 'generated-loaded';
    } else if (source && typeof source === 'object' && source.image) {
      image = source.image;
      status = source.status || 'provided-loaded';
    } else {
      image = { id, src: source, status: 'mock-loaded' };
    }

    const asset = {
      id,
      src: typeof source === 'string' ? source : 'generated',
      status,
      image,
      width: image?.width ?? 0,
      height: image?.height ?? 0,
    };

    this.loaded.set(id, asset);
    return asset;
  }

  get(id) {
    return this.loaded.get(id) || null;
  }
}
