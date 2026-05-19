export const CANONICAL_WORLD_TO_SCREEN_SCALE = 1;

function finiteNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function positiveInteger(value, fallback = 1) {
  const number = Math.floor(Number(value));
  return Number.isFinite(number) && number > 0 ? number : fallback;
}

function positiveScale(value, fallback = 1) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : fallback;
}

export function createWorldScreenTransform({
  screenHeight = 1,
  screenWidth = 1,
  userZoom = 1,
  worldScale = CANONICAL_WORLD_TO_SCREEN_SCALE
} = {}) {
  const resolvedScreenHeight = positiveInteger(screenHeight);
  const resolvedScreenWidth = positiveInteger(screenWidth);
  const resolvedUserZoom = positiveScale(userZoom);
  const resolvedWorldScale = positiveScale(worldScale, CANONICAL_WORLD_TO_SCREEN_SCALE);
  const center = Object.freeze({
    x: resolvedScreenWidth / 2,
    y: resolvedScreenHeight / 2
  });

  return Object.freeze({
    center,
    cssAspectRatio: `${resolvedScreenWidth} / ${resolvedScreenHeight}`,
    cssHeight: resolvedScreenHeight * resolvedWorldScale,
    cssWidth: resolvedScreenWidth * resolvedWorldScale,
    screenHeight: resolvedScreenHeight,
    screenWidth: resolvedScreenWidth,
    userZoom: resolvedUserZoom,
    worldScale: resolvedWorldScale,
    applyUserZoom(context) {
      if (resolvedUserZoom === 1) {
        return;
      }
      context.translate(center.x, center.y);
      context.scale(resolvedUserZoom, resolvedUserZoom);
      context.translate(-center.x, -center.y);
    },
    applyWorldToScreen(context) {
      if (resolvedWorldScale === 1) {
        return;
      }
      context.scale(resolvedWorldScale, resolvedWorldScale);
    },
    clientPointToScreenPoint(event, rect) {
      const rectWidth = positiveScale(rect?.width);
      const rectHeight = positiveScale(rect?.height);
      return {
        x: ((finiteNumber(event?.clientX) - finiteNumber(rect?.left)) / rectWidth) * resolvedScreenWidth,
        y: ((finiteNumber(event?.clientY) - finiteNumber(rect?.top)) / rectHeight) * resolvedScreenHeight
      };
    },
    objectRenderOptions(options = {}) {
      return {
        rotation: options.rotation || 0,
        scale: (Number.isFinite(options.scale) ? options.scale : 1) * resolvedWorldScale,
        x: (options.x || 0) * resolvedWorldScale,
        y: (options.y || 0) * resolvedWorldScale
      };
    },
    screenPointToWorldWithUserZoom(point) {
      return {
        x: ((finiteNumber(point?.x) - center.x) / resolvedUserZoom + center.x) / resolvedWorldScale,
        y: ((finiteNumber(point?.y) - center.y) / resolvedUserZoom + center.y) / resolvedWorldScale
      };
    }
  });
}
