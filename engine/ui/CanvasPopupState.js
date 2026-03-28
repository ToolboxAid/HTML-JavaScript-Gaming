/*
Toolbox Aid
David Quesenberry
03/27/2026
CanvasPopupState.js
*/
export function createCanvasPopupState(defaults = {}) {
  return {
    open: false,
    panelRect: null,
    closeRect: null,
    ...defaults
  };
}

export function resetCanvasPopupState(target, defaults = {}) {
  if (!target || typeof target !== "object") {
    return createCanvasPopupState(defaults);
  }
  Object.keys(target).forEach((key) => {
    delete target[key];
  });
  Object.assign(target, createCanvasPopupState(defaults));
  return target;
}
