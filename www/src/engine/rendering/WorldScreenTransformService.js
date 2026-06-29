import { asPositiveInteger } from "../../shared/number/numbers.js";
import { rotationRadians } from "./OrientationTransform.js";

export const CANONICAL_WORLD_TO_SCREEN_SCALE = 1;

function finiteNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function positiveScale(value, fallback = 1) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : fallback;
}

export class WorldScreenTransformService {
  constructor({
    screenHeight = 1,
    screenWidth = 1,
    userZoom = 1,
    worldScale = CANONICAL_WORLD_TO_SCREEN_SCALE
  } = {}) {
    this.screenHeight = asPositiveInteger(screenHeight);
    this.screenWidth = asPositiveInteger(screenWidth);
    this.userZoom = positiveScale(userZoom);
    this.worldScale = positiveScale(worldScale, CANONICAL_WORLD_TO_SCREEN_SCALE);
    this.center = Object.freeze({
      x: this.screenWidth / 2,
      y: this.screenHeight / 2
    });
    this.cssAspectRatio = `${this.screenWidth} / ${this.screenHeight}`;
    this.cssHeight = this.screenHeight * this.worldScale;
    this.cssWidth = this.screenWidth * this.worldScale;
    Object.freeze(this);
  }

  applyUserZoom(context) {
    if (this.userZoom === 1) {
      return;
    }
    context.translate(this.center.x, this.center.y);
    context.scale(this.userZoom, this.userZoom);
    context.translate(-this.center.x, -this.center.y);
  }

  applyWorldToScreen(context) {
    if (this.worldScale === 1) {
      return;
    }
    context.scale(this.worldScale, this.worldScale);
  }

  applyViewportTransform(context) {
    this.applyUserZoom(context);
    this.applyWorldToScreen(context);
  }

  applyObjectRenderTransform(context, options = {}) {
    const renderOptions = this.objectRenderOptions(options);
    context.translate(renderOptions.x, renderOptions.y);
    context.rotate(renderOptions.rotation);
    context.scale(renderOptions.scale, renderOptions.scale);
  }

  clientPointToScreenPoint(event, rect) {
    const rectWidth = positiveScale(rect?.width);
    const rectHeight = positiveScale(rect?.height);
    return {
      x: ((finiteNumber(event?.clientX) - finiteNumber(rect?.left)) / rectWidth) * this.screenWidth,
      y: ((finiteNumber(event?.clientY) - finiteNumber(rect?.top)) / rectHeight) * this.screenHeight
    };
  }

  objectRenderOptions(options = {}) {
    const screenPoint = this.worldPointToScreenPoint({ x: options.x, y: options.y });
    return {
      rotation: rotationRadians(options.rotation || 0, options.rotationUnit || "radians"),
      scale: (Number.isFinite(options.scale) ? options.scale : 1) * this.worldScale,
      x: screenPoint.x,
      y: screenPoint.y
    };
  }

  screenPointToWorldPoint(point) {
    return {
      x: finiteNumber(point?.x) / this.worldScale,
      y: finiteNumber(point?.y) / this.worldScale
    };
  }

  screenPointToWorldWithUserZoom(point) {
    return {
      x: ((finiteNumber(point?.x) - this.center.x) / this.userZoom + this.center.x) / this.worldScale,
      y: ((finiteNumber(point?.y) - this.center.y) / this.userZoom + this.center.y) / this.worldScale
    };
  }

  worldPointToScreenPoint(point) {
    return {
      x: finiteNumber(point?.x) * this.worldScale,
      y: finiteNumber(point?.y) * this.worldScale
    };
  }

  worldPointToViewportPoint(point) {
    const screenPoint = this.worldPointToScreenPoint(point);
    return {
      x: (screenPoint.x - this.center.x) * this.userZoom + this.center.x,
      y: (screenPoint.y - this.center.y) * this.userZoom + this.center.y
    };
  }
}
