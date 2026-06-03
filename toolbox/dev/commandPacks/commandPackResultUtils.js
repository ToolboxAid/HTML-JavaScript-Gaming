export function createResult(status, title, lines, code, details = {}) {
  return {
    status: status === "failed" ? "failed" : "ready",
    title,
    lines: Array.isArray(lines) ? lines : [],
    code,
    details
  };
}
