/*
Toolbox Aid
David Quesenberry
03/22/2026
TimelineCutsceneEditorScene.js
*/
import { Scene } from '/src/engine/scene/index.js'; import { drawFrame, drawPanel } from '/src/engine/debug/index.js'; import { Theme, ThemeTokens } from '/src/engine/theme/index.js'; import { TimelineEditor } from '/src/engine/editor/index.js';
const theme = new Theme(ThemeTokens);
export default class TimelineCutsceneEditorScene extends Scene {
  constructor() { super(); this.timeline = new TimelineEditor(); this.status = 'Add and reposition cutscene clips.'; }
  add() { if (this.timeline.tracks.length === 0) { this.timeline.addClip({ id: 'camera-pan', start: 2, duration: 3 }); } this.timeline.addClip({ id: `clip-${this.timeline.tracks.length + 1}`, start: 6 + this.timeline.tracks.length, duration: 2 }); this.status = 'Inserted timeline clip into editor data.'; }
  move() { if (this.timeline.tracks[0]) { this.timeline.moveClip(this.timeline.tracks[0].id, 1); this.status = 'Moved the first clip earlier in the cutscene.'; } }
  render(renderer) { drawFrame(renderer, theme, ['Engine Sample 1404', 'Timeline authoring lives in reusable editing structures instead of hardcoded script timing.', this.status]); renderer.drawRect(100, 250, 520, 80, '#0f172a'); this.timeline.tracks.forEach((clip) => renderer.drawRect(120 + clip.start * 40, 270, clip.duration * 40, 30, '#a855f7')); drawPanel(renderer, 650, 40, 220, 170, 'Timeline', [`Clips: ${this.timeline.tracks.length}`, `First Start: ${this.timeline.tracks[0]?.start ?? 'n/a'}`]); }
}
