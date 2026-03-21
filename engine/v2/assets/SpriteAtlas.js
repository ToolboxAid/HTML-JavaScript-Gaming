export default class SpriteAtlas {
  constructor({ imagePath = '', frames = {} } = {}) {
    this.imagePath = imagePath;
    this.frames = frames;
  }

  getFrame(name) {
    return this.frames[name] || null;
  }

  getFrameNames() {
    return Object.keys(this.frames);
  }
}
