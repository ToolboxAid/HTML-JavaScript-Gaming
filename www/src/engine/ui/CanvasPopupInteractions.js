/*
Toolbox Aid
David Quesenberry
03/27/2026
CanvasPopupInteractions.js
*/
export function dismissCanvasPopup({ close, showMessage = null, render = null, message = "", consumed = true } = {}) {
  if (typeof close === "function") close();
  if (message && typeof showMessage === "function") showMessage(message);
  if (typeof render === "function") render();
  return consumed;
}

export function handleCanvasPopupDismissPointer({
  point,
  popup,
  containsPoint,
  close,
  showMessage = null,
  render = null,
  closeMessage = "",
  outsideMessage = "",
  outsideConsumed = false
} = {}) {
  if (typeof containsPoint !== "function") return null;
  if (containsPoint(point, popup?.closeRect)) {
    return dismissCanvasPopup({ close, showMessage, render, message: closeMessage, consumed: true });
  }
  if (popup?.panelRect && !containsPoint(point, popup.panelRect)) {
    return dismissCanvasPopup({ close, showMessage, render, message: outsideMessage, consumed: outsideConsumed });
  }
  return null;
}

export function openCanvasTransientSurface({
  canOpen,
  closeOthers,
  open,
  showMessage = null,
  render = null,
  message = ""
} = {}) {
  if (typeof canOpen === "function" && !canOpen()) return false;
  if (typeof closeOthers === "function") closeOthers();
  if (typeof open === "function") open();
  if (message && typeof showMessage === "function") showMessage(message);
  if (typeof render === "function") render();
  return true;
}
