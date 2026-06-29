/*
Toolbox Aid
David Quesenberry
03/22/2026
DisposableStore.js
*/
export default class DisposableStore {
  constructor() {
    this.disposables = new Set();
  }

  add(disposable) {
    if (typeof disposable === 'function') {
      this.disposables.add(disposable);
    }
    return disposable;
  }

  disposeAll() {
    this.disposables.forEach((dispose) => dispose());
    this.disposables.clear();
  }
}
