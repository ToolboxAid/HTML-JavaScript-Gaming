export default class GameModeState {
  constructor(initial = 'title') {
    this.mode = initial;
  }

  setMode(mode) {
    this.mode = mode;
  }

  getMode() {
    return this.mode;
  }

  is(mode) {
    return this.mode === mode;
  }
}
