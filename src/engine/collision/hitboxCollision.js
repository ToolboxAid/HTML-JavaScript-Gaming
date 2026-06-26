function finiteNumber(value, fallback = 0) {
  return Number.isFinite(value) ? value : fallback;
}

function normalizeAxisBounds(start, size, end) {
  if (Number.isFinite(end)) {
    return {
      max: Math.max(finiteNumber(start), end),
      min: Math.min(finiteNumber(start), end),
    };
  }
  const safeStart = finiteNumber(start);
  const safeEnd = safeStart + finiteNumber(size);
  return {
    max: Math.max(safeStart, safeEnd),
    min: Math.min(safeStart, safeEnd),
  };
}

function freezePoint(x, y) {
  return Object.freeze({
    x: finiteNumber(x),
    y: finiteNumber(y),
  });
}

export function normalizeBoundingBox(box = {}) {
  const xBounds = normalizeAxisBounds(box.x ?? box.left, box.width, box.right);
  const yBounds = normalizeAxisBounds(box.y ?? box.top, box.height, box.bottom);
  const width = xBounds.max - xBounds.min;
  const height = yBounds.max - yBounds.min;
  return Object.freeze({
    bottom: yBounds.max,
    centerX: xBounds.min + width / 2,
    centerY: yBounds.min + height / 2,
    height,
    left: xBounds.min,
    right: xBounds.max,
    top: yBounds.min,
    width,
    x: xBounds.min,
    y: yBounds.min,
  });
}

export function aabbOverlap(leftBox, rightBox) {
  const left = normalizeBoundingBox(leftBox);
  const right = normalizeBoundingBox(rightBox);
  const overlap = left.left < right.right
    && left.right > right.left
    && left.top < right.bottom
    && left.bottom > right.top;
  const intersection = overlap
    ? normalizeBoundingBox({
      bottom: Math.min(left.bottom, right.bottom),
      left: Math.max(left.left, right.left),
      right: Math.min(left.right, right.right),
      top: Math.max(left.top, right.top),
    })
    : null;
  return Object.freeze({
    intersection,
    left,
    overlap,
    right,
  });
}

export function aabbContactState(leftBox, rightBox) {
  const left = normalizeBoundingBox(leftBox);
  const right = normalizeBoundingBox(rightBox);
  const overlapResult = aabbOverlap(left, right);
  if (overlapResult.overlap) {
    return Object.freeze({
      left,
      right,
      state: "overlapping",
    });
  }

  const xRangesTouch = left.left <= right.right && left.right >= right.left;
  const yRangesTouch = left.top <= right.bottom && left.bottom >= right.top;
  const edgesTouch = left.right === right.left
    || left.left === right.right
    || left.bottom === right.top
    || left.top === right.bottom;
  const state = edgesTouch && xRangesTouch && yRangesTouch ? "touching" : "separated";
  return Object.freeze({
    left,
    right,
    state,
  });
}

function positionBox(box, position) {
  const normalized = normalizeBoundingBox(box);
  return normalizeBoundingBox({
    height: normalized.height,
    width: normalized.width,
    x: position.x,
    y: position.y,
  });
}

function entryExitTimes(movingMin, movingMax, targetMin, targetMax, velocity) {
  if (velocity > 0) {
    return {
      entry: (targetMin - movingMax) / velocity,
      exit: (targetMax - movingMin) / velocity,
    };
  }
  if (velocity < 0) {
    return {
      entry: (targetMax - movingMin) / velocity,
      exit: (targetMin - movingMax) / velocity,
    };
  }
  if (movingMax <= targetMin || movingMin >= targetMax) {
    return {
      entry: Number.POSITIVE_INFINITY,
      exit: Number.NEGATIVE_INFINITY,
    };
  }
  return {
    entry: Number.NEGATIVE_INFINITY,
    exit: Number.POSITIVE_INFINITY,
  };
}

function normalForImpact(entryX, entryY, velocity) {
  if (entryX > entryY) {
    return freezePoint(velocity.x > 0 ? -1 : 1, 0);
  }
  if (entryY > entryX) {
    return freezePoint(0, velocity.y > 0 ? -1 : 1);
  }
  return freezePoint(0, 0);
}

function impactPointFor(movingBox, targetBox, normal) {
  if (normal.x < 0) {
    return freezePoint(targetBox.left, movingBox.centerY);
  }
  if (normal.x > 0) {
    return freezePoint(targetBox.right, movingBox.centerY);
  }
  if (normal.y < 0) {
    return freezePoint(movingBox.centerX, targetBox.top);
  }
  if (normal.y > 0) {
    return freezePoint(movingBox.centerX, targetBox.bottom);
  }
  return freezePoint(movingBox.centerX, movingBox.centerY);
}

export function sweptAabb({
  deltaTime = 1,
  movingBox,
  targetBox,
  velocity = {},
} = {}) {
  const moving = normalizeBoundingBox(movingBox);
  const target = normalizeBoundingBox(targetBox);
  const duration = Math.max(0, finiteNumber(deltaTime, 1));
  const safeVelocity = freezePoint(velocity.x, velocity.y);
  const displacement = freezePoint(safeVelocity.x * duration, safeVelocity.y * duration);
  const startPosition = freezePoint(moving.x, moving.y);
  const endPosition = freezePoint(moving.x + displacement.x, moving.y + displacement.y);
  const startOverlap = aabbOverlap(moving, target).overlap;

  if (startOverlap) {
    const impactPosition = startPosition;
    const impactBox = positionBox(moving, impactPosition);
    return Object.freeze({
      afterPosition: endPosition,
      beforePosition: startPosition,
      collided: true,
      collisionTime: 0,
      endBox: positionBox(moving, endPosition),
      endPosition,
      impactNormal: freezePoint(0, 0),
      impactPoint: impactPointFor(impactBox, target, freezePoint(0, 0)),
      impactPosition,
      startBox: moving,
      startPosition,
      targetBox: target,
    });
  }

  const xTimes = entryExitTimes(moving.left, moving.right, target.left, target.right, displacement.x);
  const yTimes = entryExitTimes(moving.top, moving.bottom, target.top, target.bottom, displacement.y);
  const entryTime = Math.max(xTimes.entry, yTimes.entry);
  const exitTime = Math.min(xTimes.exit, yTimes.exit);
  const collided = entryTime >= 0
    && entryTime <= 1
    && entryTime <= exitTime
    && xTimes.entry !== Number.POSITIVE_INFINITY
    && yTimes.entry !== Number.POSITIVE_INFINITY;
  const collisionTime = collided ? entryTime : null;
  const impactPosition = collided
    ? freezePoint(moving.x + displacement.x * entryTime, moving.y + displacement.y * entryTime)
    : null;
  const impactBox = impactPosition ? positionBox(moving, impactPosition) : null;
  const impactNormal = collided ? normalForImpact(xTimes.entry, yTimes.entry, displacement) : freezePoint(0, 0);

  return Object.freeze({
    afterPosition: endPosition,
    beforePosition: startPosition,
    collided,
    collisionTime,
    endBox: positionBox(moving, endPosition),
    endPosition,
    impactNormal,
    impactPoint: impactBox ? impactPointFor(impactBox, target, impactNormal) : null,
    impactPosition,
    startBox: moving,
    startPosition,
    targetBox: target,
  });
}

export function collisionTime(sweptResult = {}) {
  return Number.isFinite(sweptResult.collisionTime) ? sweptResult.collisionTime : null;
}
