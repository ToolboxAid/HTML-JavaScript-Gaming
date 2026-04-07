/*
Toolbox Aid
David Quesenberry
03/22/2026
FullscreenService.js
*/
export default class FullscreenService {
  static fromBrowser({ documentRef = globalThis.document ?? null, target = null } = {}) {
    return new FullscreenService({ documentRef, target });
  }

  constructor({ documentRef = null, target = null } = {}) {
    this.documentRef = documentRef;
    this.target = target;
    this.isActive = false;
    this.lastError = '';
    this.isAttached = false;

    this.handleFullscreenChange = this.handleFullscreenChange.bind(this);
    this.handleFullscreenError = this.handleFullscreenError.bind(this);

    this.syncState();
  }

  attach(target = this.target) {
    if (target) {
      this.target = target;
    }

    if (!this.documentRef || this.isAttached) {
      this.syncState();
      return;
    }

    this.documentRef.addEventListener('fullscreenchange', this.handleFullscreenChange);
    this.documentRef.addEventListener('fullscreenerror', this.handleFullscreenError);
    this.isAttached = true;
    this.syncState();
  }

  detach() {
    if (!this.documentRef || !this.isAttached) {
      return;
    }

    this.documentRef.removeEventListener('fullscreenchange', this.handleFullscreenChange);
    this.documentRef.removeEventListener('fullscreenerror', this.handleFullscreenError);
    this.isAttached = false;
  }

  setTarget(target) {
    this.target = target;
    this.syncState();
  }

  isSupported() {
    if (!this.documentRef) {
      return false;
    }

    return typeof this.documentRef.exitFullscreen === 'function';
  }

  isAvailable() {
    return this.isSupported() && !!this.target && typeof this.target.requestFullscreen === 'function';
  }

  getState() {
    return {
      supported: this.isSupported(),
      available: this.isAvailable(),
      active: this.isActive,
      lastError: this.lastError,
    };
  }

  async request(target = this.target) {
    if (target) {
      this.target = target;
    }

    if (!this.isAvailable()) {
      this.lastError = 'Fullscreen is unavailable in this environment.';
      this.syncState();
      return false;
    }

    try {
      await this.target.requestFullscreen();
      this.lastError = '';
      this.syncState();
      return true;
    } catch (error) {
      this.lastError = error?.message || 'Fullscreen request was denied.';
      this.syncState();
      return false;
    }
  }

  async exit() {
    if (!this.isSupported()) {
      this.lastError = 'Fullscreen is unavailable in this environment.';
      this.syncState();
      return false;
    }

    if (!this.documentRef.fullscreenElement) {
      this.lastError = '';
      this.syncState();
      return true;
    }

    try {
      await this.documentRef.exitFullscreen();
      this.lastError = '';
      this.syncState();
      return true;
    } catch (error) {
      this.lastError = error?.message || 'Fullscreen exit failed.';
      this.syncState();
      return false;
    }
  }

  handleFullscreenChange() {
    this.lastError = '';
    this.syncState();
  }

  handleFullscreenError() {
    if (!this.lastError) {
      this.lastError = 'Fullscreen request was blocked.';
    }
    this.syncState();
  }

  syncState() {
    this.isActive = !!this.documentRef?.fullscreenElement;
  }
}
