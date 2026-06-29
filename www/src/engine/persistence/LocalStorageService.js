/*
Toolbox Aid
David Quesenberry
05/20/2026
LocalStorageService.js
*/
import BrowserStorageService from './BrowserStorageService.js';

export default class LocalStorageService extends BrowserStorageService {
  constructor(storage = undefined) {
    super(storage === undefined
      ? BrowserStorageService.resolveGlobalStorage('localStorage')
      : storage);
  }
}
