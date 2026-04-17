/*
Toolbox Aid
David Quesenberry
03/22/2026
TimelineEditor.js
*/
export default class TimelineEditor {
  constructor() {
    this.tracks = [];
  }

  addClip(clip) {
    this.tracks.push({ ...clip });
    this.tracks.sort((a, b) => a.start - b.start);
  }

  moveClip(id, start) {
    const clip = this.tracks.find((entry) => entry.id === id);
    if (clip) {
      clip.start = start;
      this.tracks.sort((a, b) => a.start - b.start);
    }
  }

  exportTimeline() {
    return this.tracks.map((track) => ({ ...track }));
  }
}
