/*
Toolbox Aid
David Quesenberry
03/22/2026
QuestSystem.js
*/
export default class QuestSystem {
  constructor(quests = []) {
    this.quests = new Map();
    quests.forEach((quest) => this.registerQuest(quest));
  }

  registerQuest(quest) {
    this.quests.set(quest.id, {
      id: quest.id,
      title: quest.title ?? quest.id,
      required: quest.required ?? 1,
      progress: 0,
      completed: false,
    });
  }

  advance(id, amount = 1) {
    const quest = this.quests.get(id);
    if (!quest || quest.completed) {
      return quest ?? null;
    }

    quest.progress = Math.min(quest.required, quest.progress + amount);
    quest.completed = quest.progress >= quest.required;
    return quest;
  }

  get(id) {
    return this.quests.get(id) ?? null;
  }

  getAll() {
    return [...this.quests.values()];
  }
}
