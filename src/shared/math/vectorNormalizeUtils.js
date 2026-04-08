export function safeNormalize(x, y) {
  const length = Math.hypot(x, y);
  if (length <= 1e-6) {
    return { x: 0, y: 0, length: 0 };
  }
  return { x: x / length, y: y / length, length };
}
