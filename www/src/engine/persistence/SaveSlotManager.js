/*
Toolbox Aid
David Quesenberry
03/22/2026
SaveSlotManager.js
*/
import StorageService from './StorageService.js';

export default class SaveSlotManager {
  constructor({ storage = new StorageService(), namespace = 'toolboxaid:saves' } = {}) {
    this.storage = storage;
    this.namespace = namespace;
  }

  getSlotKey(slotId) {
    return `${this.namespace}:${slotId}`;
  }

  getIndexKey() {
    return `${this.namespace}:index`;
  }

  listSlots() {
    return this.storage.loadJson(this.getIndexKey(), []);
  }

  saveSlot(slotId, payload) {
    const slots = this.listSlots().filter((entry) => entry.slotId !== slotId);
    const entry = {
      slotId,
      updatedAt: new Date().toISOString(),
      label: payload.label ?? slotId,
    };

    slots.push(entry);
    slots.sort((a, b) => a.slotId.localeCompare(b.slotId));
    this.storage.saveJson(this.getSlotKey(slotId), payload);
    this.storage.saveJson(this.getIndexKey(), slots);
    return entry;
  }

  loadSlot(slotId, fallback = null) {
    return this.storage.loadJson(this.getSlotKey(slotId), fallback);
  }

  deleteSlot(slotId) {
    const slots = this.listSlots().filter((entry) => entry.slotId !== slotId);
    this.storage.saveJson(this.getIndexKey(), slots);
    if (this.storage.storage?.removeItem) {
      this.storage.storage.removeItem(this.getSlotKey(slotId));
    }
  }
}
