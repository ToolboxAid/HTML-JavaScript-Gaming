export default class LevelLoader {
  load(data) {
    return JSON.parse(JSON.stringify(data));
  }

  loadSceneData(data) {
    return this.load(data);
  }
}
