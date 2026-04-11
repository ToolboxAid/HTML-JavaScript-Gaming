import { trimSafe } from "../../src/shared/utils/stringUtils.js";

export function queryFirst(selector, root = document) {
  if (!root || typeof root.querySelector !== "function") {
    return null;
  }
  return root.querySelector(selector);
}

export function queryAll(selector, root = document) {
  if (!root || typeof root.querySelectorAll !== "function") {
    return [];
  }
  return Array.from(root.querySelectorAll(selector));
}

export function readDataAttribute(element, attributeName, fallback = "") {
  if (!(element instanceof Element)) {
    return fallback;
  }
  const key = trimSafe(attributeName);
  if (!key) {
    return fallback;
  }
  const value = trimSafe(element.getAttribute(key));
  return value || fallback;
}

export function asHtmlInput(element) {
  return element instanceof HTMLInputElement ? element : null;
}

export function setTextContent(element, value) {
  if (element && "textContent" in element) {
    element.textContent = typeof value === "string" ? value : String(value ?? "");
  }
}
