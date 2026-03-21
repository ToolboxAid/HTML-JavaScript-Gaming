export default class LevelLoader {
  load(data) {
    return JSON.parse(JSON.stringify(data));
  }
}
