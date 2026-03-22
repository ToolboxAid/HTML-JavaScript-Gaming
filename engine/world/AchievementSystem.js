/*
Toolbox Aid
David Quesenberry
03/22/2026
AchievementSystem.js
*/
export default class AchievementSystem {
  constructor(definitions = []) {
    this.achievements = new Map();
    definitions.forEach((definition) => {
      this.achievements.set(definition.id, {
        ...definition,
        unlocked: false,
      });
    });
  }

  evaluate(context = {}) {
    this.achievements.forEach((achievement) => {
      if (!achievement.unlocked && achievement.condition(context)) {
        achievement.unlocked = true;
      }
    });
  }

  getAll() {
    return [...this.achievements.values()];
  }
}
