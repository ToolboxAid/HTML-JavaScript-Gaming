/*
Toolbox Aid
David Quesenberry
03/21/2026
GameModeState.js
*/
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
