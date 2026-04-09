import { asObject } from "/src/engine/debug/inspectors/shared/inspectorUtils.js";

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
