export function sanitizeScore(value) {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.max(0, Math.trunc(value));
}

export function sanitizeInitials(value) {
  const letters = String(value ?? "").toUpperCase().replace(/[^A-Z]/g, "");
  return (letters || "AAA").slice(0, 3).padEnd(3, "A");
}

export function sanitizeRow(row) {
  return {
    initials: sanitizeInitials(row?.initials),
    score: sanitizeScore(row?.score),
  };
}

export function sortRows(rows) {
  return [...rows].sort((a, b) => b.score - a.score);
}
