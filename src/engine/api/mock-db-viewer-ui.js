import { startLocalDbViewer } from "./local-db-viewer-ui.js";

export { startLocalDbViewer } from "./local-db-viewer-ui.js";

/**
 * @deprecated Use startLocalDbViewer from local-db-viewer-ui.js.
 */
export function startMockDbViewer(documentRef = document, options = {}) {
  startLocalDbViewer(documentRef, options);
}
