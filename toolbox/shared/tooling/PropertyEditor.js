/*
Toolbox Aid
David Quesenberry
03/22/2026
PropertyEditor.js
*/
export default class PropertyEditor {
  set(target, key, value) {
    if (!target || typeof target !== 'object') {
      return false;
    }

    target[key] = value;
    return true;
  }
}
