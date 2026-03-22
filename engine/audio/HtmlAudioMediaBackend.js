/*
Toolbox Aid
David Quesenberry
03/22/2026
HtmlAudioMediaBackend.js
*/
export default class HtmlAudioMediaBackend {
  constructor({ audioFactory = (src) => new Audio(src) } = {}) {
    this.audioFactory = audioFactory;
  }

  isSupported() {
    return typeof globalThis.Audio === 'function';
  }

  createTrack(src) {
    if (!this.isSupported()) {
      return null;
    }

    const audio = this.audioFactory(src);
    audio.preload = 'auto';
    return audio;
  }
}
