/*
Toolbox Aid
David Quesenberry
03/25/2026
VectorMapFullscreenController.js
*/
export class VectorMapFullscreenController {
  constructor(targetElement) {
    this.targetElement = targetElement;
  }

  async toggle() {
    if (!document.fullscreenElement) {
      await this.targetElement.requestFullscreen();
      document.body.classList.add("fullscreen-mode");
      return true;
    }
    await document.exitFullscreen();
    document.body.classList.remove("fullscreen-mode");
    return false;
  }

  syncBodyClass() {
    document.body.classList.toggle("fullscreen-mode", Boolean(document.fullscreenElement));
  }
}
