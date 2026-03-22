/*
Toolbox Aid
David Quesenberry
03/22/2026
DeploymentProfiles.js
*/
export default class DeploymentProfiles {
  constructor(profiles = {}) {
    this.profiles = new Map();
    Object.entries(profiles).forEach(([name, config]) => {
      this.register(name, config);
    });
  }

  register(name, config = {}) {
    this.profiles.set(name, {
      id: name,
      diagnostics: false,
      demoLimits: null,
      analytics: false,
      optimizeAssets: true,
      ...config,
    });
    return this.get(name);
  }

  get(name) {
    const profile = this.profiles.get(name);
    return profile ? JSON.parse(JSON.stringify(profile)) : null;
  }

  list() {
    return Array.from(this.profiles.keys()).map((name) => this.get(name));
  }

  resolve(name, overrides = {}) {
    const profile = this.get(name);
    if (!profile) {
      throw new Error(`Unknown deployment profile "${name}".`);
    }

    return {
      ...profile,
      ...overrides,
      flags: [
        profile.diagnostics ? 'diagnostics' : 'quiet',
        profile.analytics ? 'analytics' : 'local-only',
        profile.optimizeAssets ? 'optimized-assets' : 'raw-assets',
        profile.demoLimits ? 'demo-limits' : 'full-content',
      ],
    };
  }
}
