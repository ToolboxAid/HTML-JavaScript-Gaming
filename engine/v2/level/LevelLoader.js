export default class LevelLoader {
  static cloneLevel(levelData) {
    return typeof structuredClone === 'function'
      ? structuredClone(levelData)
      : JSON.parse(JSON.stringify(levelData));
  }

  static loadIntoScene(scene, levelData) {
    const cloned = LevelLoader.cloneLevel(levelData);
    Object.assign(scene, cloned);
    return cloned;
  }
}
