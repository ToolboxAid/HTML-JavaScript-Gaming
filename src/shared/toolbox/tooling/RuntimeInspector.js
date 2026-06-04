/*
Toolbox Aid
David Quesenberry
03/22/2026
RuntimeInspector.js
*/
export default class RuntimeInspector {
  inspect(target, fields = null) {
    if (!target || typeof target !== 'object') {
      return {};
    }

    const sourceFields = fields || Object.keys(target);
    return sourceFields.reduce((snapshot, field) => {
      snapshot[field] = target[field];
      return snapshot;
    }, {});
  }
}
