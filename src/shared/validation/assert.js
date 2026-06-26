export function assertArray(value, name) {
  if (!Array.isArray(value)) {
    throw new TypeError(`${name} must be an array.`);
  }
}

export function assertFiniteNumber(value, name) {
  if (!Number.isFinite(value)) {
    throw new TypeError(`${name} must be a finite number.`);
  }
}

export function assertOrderedRange(min, max) {
  assertFiniteNumber(min, "min");
  assertFiniteNumber(max, "max");

  if (max < min) {
    throw new RangeError("max must be greater than or equal to min.");
  }
}
