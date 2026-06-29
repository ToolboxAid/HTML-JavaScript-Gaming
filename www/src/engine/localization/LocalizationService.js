/*
Toolbox Aid
David Quesenberry
03/22/2026
LocalizationService.js
*/
export default class LocalizationService {
  constructor(translations = {}, language = 'en') {
    this.translations = translations;
    this.language = language;
  }

  setLanguage(language) {
    this.language = language;
  }

  t(key) {
    return this.translations[this.language]?.[key] ?? key;
  }
}
