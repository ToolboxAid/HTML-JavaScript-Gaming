/*
Toolbox Aid
David Quesenberry
03/22/2026
ResolutionScaler.js
*/
export default class ResolutionScaler {
  constructor({ baseWidth = 960, baseHeight = 540, scale = 1 } = {}) {
    this.baseWidth = baseWidth;
    this.baseHeight = baseHeight;
    this.scale = scale;
  }

  getScaledSize() {
    return {
      width: Math.round(this.baseWidth * this.scale),
      height: Math.round(this.baseHeight * this.scale),
    };
  }

  setScale(scale) {
    this.scale = Math.max(0.5, Number(scale) || 1);
  }
}
