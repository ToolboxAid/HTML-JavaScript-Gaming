/*
Toolbox Aid
David Quesenberry
03/22/2026
AccessibilityOptionsScene.js
*/
import { Scene } from '../../../engine/scenes/index.js';
import { drawFrame, drawPanel } from '../../../engine/debug/index.js';
import { Theme, ThemeTokens } from '../../../engine/theme/index.js';

const theme = new Theme(ThemeTokens);
const COMFORTS = ['standard', 'simplified', 'assisted'];

export default class AccessibilityOptionsScene extends Scene {
  constructor(accessibility) {
    super();
    this.accessibility = accessibility;
    this.motion = 0;
    this.status = 'Accessibility options change presentation and comfort hints in real time.';
  }

  cycleScale() {
    const current = this.accessibility.getOption('uiScale', 1);
    const next = current >= 1.6 ? 1 : Number((current + 0.2).toFixed(1));
    this.accessibility.setOption('uiScale', next);
    this.status = `UI scale set to ${next.toFixed(1)}x.`;
  }

  toggleContrast() {
    const next = !this.accessibility.getOption('highContrast', false);
    this.accessibility.setOption('highContrast', next);
    this.status = `High contrast ${next ? 'enabled' : 'disabled'}.`;
  }

  toggleMotion() {
    const next = !this.accessibility.getOption('reducedMotion', false);
    this.accessibility.setOption('reducedMotion', next);
    this.status = `Reduced motion ${next ? 'enabled' : 'disabled'}.`;
  }

  cycleComfort() {
    const current = this.accessibility.getOption('inputComfort', 'standard');
    const next = COMFORTS[(COMFORTS.indexOf(current) + 1) % COMFORTS.length];
    this.accessibility.setOption('inputComfort', next);
    this.status = `Input comfort switched to ${next}.`;
  }

  save() {
    this.accessibility.save();
    this.status = 'Saved accessibility preferences.';
  }

  update(dtSeconds) {
    this.motion += dtSeconds * 120 * this.accessibility.getPresentationProfile().motionScale;
  }

  render(renderer) {
    const profile = this.accessibility.getPresentationProfile();
    const cardScale = profile.uiScale;
    const cardWidth = 180 * cardScale;
    const cardHeight = 70 * cardScale;
    const palette = profile.palette;
    const bob = Math.sin(this.motion / 35) * 24;

    drawFrame(renderer, theme, [
      'Engine Sample142',
      'Accessibility settings adapt visuals and motion without embedding rules into the scene.',
      this.status,
    ]);

    renderer.drawRect(90, 205, 470, 225, palette.background);
    renderer.drawRect(120, 240, cardWidth, cardHeight, palette.panel);
    renderer.drawRect(120, 240, 14, cardHeight, palette.accent);
    renderer.drawText('Large Prompt', 150, 285, { color: palette.text, font: `${16 * cardScale}px monospace` });
    renderer.drawRect(360, 260 + bob, 44, 44, palette.accent);
    renderer.drawText('Focus', 382, 288 + bob, {
      color: '#000000',
      font: '12px monospace',
      textAlign: 'center',
    });

    drawPanel(renderer, 600, 40, 300, 230, 'Accessibility Profile', [
      `UI Scale: ${profile.uiScale.toFixed(1)}x`,
      `High Contrast: ${profile.highContrast}`,
      `Reduced Motion: ${profile.reducedMotion}`,
      `Input Comfort: ${profile.inputComfort}`,
      `Comfort Hints: ${profile.comfortBindings.join(', ')}`,
    ]);
  }
}
