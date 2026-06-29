/*
Toolbox Aid
David Quesenberry
03/21/2026
StorageService.js
*/
import BrowserStorageService from './BrowserStorageService.js';

export default class StorageService extends BrowserStorageService {
  constructor(storage = undefined) {
    super(storage === undefined ? StorageService.resolveDefaultStorage() : storage);
  }

  static resolveDefaultStorage() {
    return BrowserStorageService.resolveGlobalStorage('localStorage');
  }
}
