import {
  requireServerApiData,
  safeRequestServerApi,
} from "./server-api-client.js";

export function readPublishedLegalDocument(documentType) {
  return requireServerApiData(
    safeRequestServerApi(`/legal/document?documentType=${encodeURIComponent(documentType)}`),
    "Legal document",
  );
}
