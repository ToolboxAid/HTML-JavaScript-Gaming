/*
Toolbox Aid
David Quesenberry
03/22/2026
AccessibilityOptions.js
*/
import SettingsSystem from './SettingsSystem.js';

const DEFAULTS = {
  uiScale: 1,
  highContrast: false,
  reducedMotion: false,
  inputComfort: 'standard',
};

export default class AccessibilityOptions {
  constructor(options = {}) {
    this.settings = options.settings || new SettingsSystem({
      namespace: options.namespace || 'toolboxaid:accessibility',
      defaults: { ...DEFAULTS, ...(options.defaults || {}) },
      storage: options.storage || null,
    });
    this.appliedTheme = this.getPresentationProfile();
  }

  load() {
    this.settings.load();
    this.appliedTheme = this.getPresentationProfile();
    return this.appliedTheme;
  }

  save() {
    return this.settings.save();
  }

  setOption(key, value, options = {}) {
    this.settings.set(key, value, options);
    this.appliedTheme = this.getPresentationProfile();
    return this.appliedTheme;
  }

  getOption(key, fallback = undefined) {
    return this.settings.get(key, fallback);
  }

  getPresentationProfile() {
    const snapshot = this.settings.getSnapshot();
    const uiScale = Math.max(1, Math.min(1.8, Number(snapshot.uiScale) || 1));
    return {
      ...snapshot,
      uiScale,
      motionScale: snapshot.reducedMotion ? 0.35 : 1,
      palette: snapshot.highContrast
        ? {
            background: '#020617',
            panel: '#000000',
            accent: '#facc15',
            text: '#ffffff',
            muted: '#d1d5db',
          }
        : {
            background: '#0f172a',
            panel: '#172554',
            accent: '#38bdf8',
            text: '#e2e8f0',
            muted: '#94a3b8',
          },
      comfortBindings: snapshot.inputComfort === 'assisted'
        ? ['Tap Confirm', 'Hold Reduced', 'Camera Soften']
        : snapshot.inputComfort === 'simplified'
          ? ['Fewer Inputs', 'Large Prompts', 'Slower Cursor']
          : ['Default Inputs', 'Standard Prompts', 'Normal Camera'],
    };
  }
}
