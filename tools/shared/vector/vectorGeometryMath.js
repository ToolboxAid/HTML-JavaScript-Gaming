import { toFiniteNumber, roundNumber } from "../../../src/shared/math/numberNormalization.js";
const PATH_TOKEN_PATTERN = /[AaCcHhLlMmQqSsTtVvZz]|-?\d*\.?\d+(?:e[-+]?\d+)?/g;

export function createPoint(x = 0, y = 0) {
  return {
    x: roundNumber(toFiniteNumber(x, 0)),
    y: roundNumber(toFiniteNumber(y, 0))
  };
}

export function translatePoint(point, translation = {}) {
  return createPoint(
    toFiniteNumber(point?.x, 0) + toFiniteNumber(translation?.x, 0),
    toFiniteNumber(point?.y, 0) + toFiniteNumber(translation?.y, 0)
  );
}

export function scalePoint(point, scale = {}, origin = {}) {
  const originPoint = createPoint(origin?.x, origin?.y);
  const scaleX = toFiniteNumber(scale?.x, 1);
  const scaleY = toFiniteNumber(scale?.y, scaleX);
  return createPoint(
    originPoint.x + (toFiniteNumber(point?.x, 0) - originPoint.x) * scaleX,
    originPoint.y + (toFiniteNumber(point?.y, 0) - originPoint.y) * scaleY
  );
}

export function rotatePoint(point, radians = 0, origin = {}) {
  const originPoint = createPoint(origin?.x, origin?.y);
  const angle = toFiniteNumber(radians, 0);
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const dx = toFiniteNumber(point?.x, 0) - originPoint.x;
  const dy = toFiniteNumber(point?.y, 0) - originPoint.y;
  return createPoint(
    originPoint.x + dx * cos - dy * sin,
    originPoint.y + dx * sin + dy * cos
  );
}

export function transformPoint(point, transform = {}, originOverride = null) {
  const origin = originOverride && typeof originOverride === "object"
    ? createPoint(originOverride?.x, originOverride?.y)
    : createPoint(transform?.origin?.x, transform?.origin?.y);
  let next = createPoint(point?.x, point?.y);
  next = scalePoint(next, transform?.scale || {}, origin);
  next = rotatePoint(next, transform?.rotateRadians, origin);
  next = translatePoint(next, transform?.translate || {});
  return next;
}

export function transformPoints(points, transform = {}, originOverride = null) {
  const input = Array.isArray(points) ? points : [];
  return input.map((point) => transformPoint(point, transform, originOverride));
}

export function computeBoundsFromPoints(points) {
  const input = Array.isArray(points) ? points : [];
  if (input.length === 0) {
    return {
      minX: 0,
      minY: 0,
      maxX: 0,
      maxY: 0,
      width: 0,
      height: 0,
      center: createPoint(0, 0)
    };
  }

  let minX = Number.POSITIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;

  input.forEach((point) => {
    const x = toFiniteNumber(point?.x, 0);
    const y = toFiniteNumber(point?.y, 0);
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
  });

  return {
    minX: roundNumber(minX),
    minY: roundNumber(minY),
    maxX: roundNumber(maxX),
    maxY: roundNumber(maxY),
    width: roundNumber(maxX - minX),
    height: roundNumber(maxY - minY),
    center: createPoint((minX + maxX) / 2, (minY + maxY) / 2)
  };
}

export function combineBounds(boundsList) {
  const input = Array.isArray(boundsList) ? boundsList.filter(Boolean) : [];
  if (input.length === 0) {
    return computeBoundsFromPoints([]);
  }

  return computeBoundsFromPoints(input.flatMap((bounds) => ([
    createPoint(bounds?.minX, bounds?.minY),
    createPoint(bounds?.maxX, bounds?.maxY)
  ])));
}

function tokenizePathData(pathData) {
  return String(pathData || "").match(PATH_TOKEN_PATTERN) || [];
}

function readNumber(tokens, state) {
  const token = tokens[state.index];
  if (token === undefined) {
    throw new Error("Path command is missing a numeric argument.");
  }
  const value = toFiniteNumber(token);
  if (!Number.isFinite(value)) {
    throw new Error(`Unsupported path token ${token}.`);
  }
  state.index += 1;
  return value;
}

export function parseSvgPathData(pathData = "") {
  const tokens = tokenizePathData(pathData);
  const points = [];
  const commands = [];
  const state = {
    index: 0,
    current: createPoint(0, 0),
    subpathStart: null
  };
  let activeCommand = "";
  let closed = false;

  while (state.index < tokens.length) {
    const token = tokens[state.index];
    if (/^[AaCcQqSsTt]$/.test(token)) {
      throw new Error(`Unsupported path command ${token}.`);
    }

    if (/^[MmLlHhVvZz]$/.test(token)) {
      activeCommand = token;
      state.index += 1;
    } else if (!activeCommand) {
      throw new Error("Path data must begin with a move command.");
    }

    switch (activeCommand) {
      case "M":
      case "m": {
        let firstPair = true;
        while (state.index < tokens.length && !/^[A-Za-z]$/.test(tokens[state.index])) {
          const x = readNumber(tokens, state);
          const y = readNumber(tokens, state);
          const point = activeCommand === "m"
            ? createPoint(state.current.x + x, state.current.y + y)
            : createPoint(x, y);
          state.current = point;
          if (firstPair) {
            state.subpathStart = point;
            commands.push({ type: "move", point });
            points.push(point);
            firstPair = false;
            continue;
          }
          commands.push({ type: "line", point });
          points.push(point);
        }
        break;
      }
      case "L":
      case "l": {
        while (state.index < tokens.length && !/^[A-Za-z]$/.test(tokens[state.index])) {
          const x = readNumber(tokens, state);
          const y = readNumber(tokens, state);
          const point = activeCommand === "l"
            ? createPoint(state.current.x + x, state.current.y + y)
            : createPoint(x, y);
          state.current = point;
          commands.push({ type: "line", point });
          points.push(point);
        }
        break;
      }
      case "H":
      case "h": {
        while (state.index < tokens.length && !/^[A-Za-z]$/.test(tokens[state.index])) {
          const x = readNumber(tokens, state);
          const point = activeCommand === "h"
            ? createPoint(state.current.x + x, state.current.y)
            : createPoint(x, state.current.y);
          state.current = point;
          commands.push({ type: "line", point });
          points.push(point);
        }
        break;
      }
      case "V":
      case "v": {
        while (state.index < tokens.length && !/^[A-Za-z]$/.test(tokens[state.index])) {
          const y = readNumber(tokens, state);
          const point = activeCommand === "v"
            ? createPoint(state.current.x, state.current.y + y)
            : createPoint(state.current.x, y);
          state.current = point;
          commands.push({ type: "line", point });
          points.push(point);
        }
        break;
      }
      case "Z":
      case "z":
        if (state.subpathStart) {
          closed = true;
          state.current = state.subpathStart;
          commands.push({ type: "close", point: state.subpathStart });
        }
        break;
      default:
        throw new Error(`Unsupported path command ${activeCommand}.`);
    }
  }

  return {
    commands,
    points,
    closed
  };
}
