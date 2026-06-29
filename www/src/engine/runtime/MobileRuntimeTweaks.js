/*
Toolbox Aid
David Quesenberry
03/22/2026
MobileRuntimeTweaks.js
*/
export default class MobileRuntimeTweaks {
  constructor({ isTouch = false, uiScale = 1, touchPadding = 0 } = {}) {
    this.isTouch = isTouch;
    this.uiScale = uiScale;
    this.touchPadding = touchPadding;
  }

  static createDefault() {
    const isTouch = typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);
    return new MobileRuntimeTweaks({
      isTouch,
      uiScale: isTouch ? 1.2 : 1,
      touchPadding: isTouch ? 12 : 0,
    });
  }
}
