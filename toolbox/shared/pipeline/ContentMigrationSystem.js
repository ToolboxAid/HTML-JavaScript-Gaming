/*
Toolbox Aid
David Quesenberry
03/22/2026
ContentMigrationSystem.js
*/
export default class ContentMigrationSystem {
  constructor() {
    this.migrations = new Map();
  }

  register(fromVersion, migrate) {
    this.migrations.set(fromVersion, migrate);
  }

  migrate(content, targetVersion) {
    let current = { ...content };
    while (current.version < targetVersion) {
      const step = this.migrations.get(current.version);
      if (!step) {
        break;
      }
      current = step({ ...current });
    }
    return current;
  }
}
