/*
Toolbox Aid
David Quesenberry
03/30/2026
utils.js
*/

function isPlainObject(value) {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

function cloneDeep(value) {
  if (Array.isArray(value)) {
    return value.map((entry) => cloneDeep(entry));
  }
  if (isPlainObject(value)) {
    const out = {};
    const keys = Object.keys(value);
    for (let i = 0; i < keys.length; i += 1) {
      out[keys[i]] = cloneDeep(value[keys[i]]);
    }
    return out;
  }
  return value;
}

function deepFreeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  Object.freeze(value);
  const keys = Object.keys(value);
  for (let i = 0; i < keys.length; i += 1) {
    deepFreeze(value[keys[i]]);
  }
  return value;
}

function createReadonlyClone(value) {
  return deepFreeze(cloneDeep(value));
}

function mergeDeep(baseValue, patchValue) {
  if (Array.isArray(patchValue)) {
    return patchValue.map((entry) => cloneDeep(entry));
  }
  if (isPlainObject(patchValue)) {
    const baseObject = isPlainObject(baseValue) ? baseValue : {};
    const out = {};
    const baseKeys = Object.keys(baseObject);
    for (let i = 0; i < baseKeys.length; i += 1) {
      out[baseKeys[i]] = cloneDeep(baseObject[baseKeys[i]]);
    }
    const patchKeys = Object.keys(patchValue);
    for (let i = 0; i < patchKeys.length; i += 1) {
      const key = patchKeys[i];
      out[key] = mergeDeep(baseObject[key], patchValue[key]);
    }
    return out;
  }
  return patchValue === undefined ? cloneDeep(baseValue) : patchValue;
}

export {
  isPlainObject,
  cloneDeep,
  deepFreeze,
  createReadonlyClone,
  mergeDeep
};
