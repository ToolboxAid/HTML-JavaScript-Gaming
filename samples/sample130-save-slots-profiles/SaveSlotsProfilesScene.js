/*
Toolbox Aid
David Quesenberry
03/22/2026
SaveSlotsProfilesScene.js
*/
import Scene from '../../engine/scenes/Scene.js';
import { Theme, ThemeTokens } from '../../engine/theme/index.js';
import { drawFrame, drawPanel } from '../../engine/debug/index.js';
import { SaveSlotManager } from '../../engine/persistence/index.js';

const theme = new Theme(ThemeTokens);

export default class SaveSlotsProfilesScene extends Scene {
  constructor() {
    super();
    this.slots = new SaveSlotManager({ namespace: 'toolboxaid:sample130' });
    this.selected = 'slot-a';
    this.hp = 3;
    this.status = 'Select a slot, then save or load profile data.';
  }

  choose(slotId) {
    this.selected = slotId;
    this.status = `Selected ${slotId}.`;
  }

  save() {
    this.slots.saveSlot(this.selected, {
      label: this.selected.toUpperCase(),
      hp: this.hp,
      coins: this.hp * 3,
    });
    this.status = `Saved ${this.selected}.`;
  }

  load() {
    const payload = this.slots.loadSlot(this.selected);
    if (!payload) {
      this.status = `No save found for ${this.selected}.`;
      return;
    }

    this.hp = payload.hp;
    this.status = `Loaded ${this.selected}.`;
  }

  increaseHp() {
    this.hp += 1;
    this.status = 'Adjusted profile data before saving.';
  }

  render(renderer) {
    const entries = this.slots.listSlots();
    drawFrame(renderer, theme, [
      'Engine Sample130',
      'Multiple save identities are managed by a reusable save slot service.',
      this.status,
    ]);

    renderer.drawRect(90, 220, 480, 170, '#0f172a');
    ['slot-a', 'slot-b', 'slot-c'].forEach((slotId, index) => {
      renderer.drawRect(120 + index * 130, 250, 90, 44, this.selected === slotId ? '#34d399' : '#475569');
    });
    renderer.drawRect(120, 330, this.hp * 40, 20, '#f59e0b');

    drawPanel(renderer, 620, 34, 300, 190, 'Save Slots', [
      `Selected: ${this.selected}`,
      `HP: ${this.hp}`,
      `Slot Count: ${entries.length}`,
      ...entries.slice(0, 4).map((entry) => `${entry.slotId}: ${entry.label}`),
    ]);
  }
}
