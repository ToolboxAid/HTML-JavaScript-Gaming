export const COMPONENT_NAMES = {
  transform: 'transform',
  size: 'size',
  velocity: 'velocity',
  speed: 'speed',
  renderable: 'renderable',
  inputControlled: 'inputControlled',
  collider: 'collider',
  solid: 'solid',
  lifetime: 'lifetime',
  tag: 'tag',
};

export function createTransform(x = 0, y = 0) {
  return { x, y, previousX: x, previousY: y };
}

export function createSize(width = 0, height = 0) {
  return { width, height };
}

export function createVelocity(x = 0, y = 0) {
  return { x, y };
}

export function createSpeed(value = 0) {
  return { value };
}

export function createRenderable(color, label = null) {
  return { color, label };
}

export function createInputControlled(enabled = true) {
  return { enabled };
}

export function createCollider(solid = false) {
  return { solid };
}

export function createSolid(enabled = true) {
  return { enabled };
}

export function createLifetime(remaining = 0) {
  return { remaining };
}

export function createTag(value = '') {
  return { value };
}
