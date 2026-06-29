/*
Toolbox Aid
David Quesenberry
03/22/2026
WeatherSystem.js
*/
export default class WeatherSystem {
  constructor(pattern = ['clear']) {
    this.pattern = pattern;
    this.index = 0;
    this.elapsed = 0;
  }

  update(dt, durationSeconds = 2) {
    this.elapsed += dt;
    if (this.elapsed >= durationSeconds) {
      this.elapsed = 0;
      this.index = (this.index + 1) % this.pattern.length;
    }
  }

  getCurrent() {
    return this.pattern[this.index];
  }
}
