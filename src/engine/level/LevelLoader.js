/*
Toolbox Aid
David Quesenberry
03/21/2026
LevelLoader.js
*/
export default class LevelLoader {
  load(data) {
    return JSON.parse(JSON.stringify(data));
  }

  loadSceneData(data) {
    return this.load(data);
  }
}
