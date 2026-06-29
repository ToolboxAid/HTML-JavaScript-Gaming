import { asObject } from "../../../../shared/object/objects.js";

export function readHostStatus(host) {
  return host && typeof host.getStatus === "function"
    ? asObject(host.getStatus())
    : {};
}

export function readHostSnapshot(host) {
  return host && typeof host.getSnapshot === "function"
    ? asObject(host.getSnapshot())
    : {};
}
