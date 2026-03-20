export class AssetRegistry {
  constructor() {
    this.assets = new Map();
  }

  register(id, definition) {
    this.assets.set(id, definition);
  }

  get(id) {
    return this.assets.get(id);
  }

  entries() {
    return Array.from(this.assets.entries());
  }

  count() {
    return this.assets.size;
  }
}

export function buildSampleAssetRegistry() {
  const registry = new AssetRegistry();

  registry.register('playerSprite', {
    type: 'image',
    path: '/assets/player.png',
    status: 'registered',
  });

  registry.register('pickupSprite', {
    type: 'image',
    path: '/assets/pickup.png',
    status: 'registered',
  });

  registry.register('menuMusic', {
    type: 'audio',
    path: '/assets/menu-theme.mp3',
    status: 'registered',
  });

  registry.register('levelOneData', {
    type: 'data',
    path: '/assets/level-one.json',
    status: 'registered',
  });

  return registry;
}
