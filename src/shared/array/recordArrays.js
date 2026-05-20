import { normalizeArray } from "./arrays.js";
import { normalizeRecord } from "../object/objects.js";

export function normalizeRecordArray(value) {
  return normalizeArray(value).map((entry) => normalizeRecord(entry));
}
