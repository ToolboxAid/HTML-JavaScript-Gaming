/*
Toolbox Aid
David Quesenberry
05/20/2026
SessionStorageService.js
*/
import BrowserStorageService from './BrowserStorageService.js';

export default class SessionStorageService extends BrowserStorageService {
  constructor(storage = undefined) {
    super(storage === undefined
      ? BrowserStorageService.resolveGlobalStorage('sessionStorage')
      : storage);
  }
}
