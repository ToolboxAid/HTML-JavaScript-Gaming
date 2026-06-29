/*
Toolbox Aid
David Quesenberry
04/15/2026
Camera3D.js
*/
function toVector3(value, fallback) {
  if (!value || typeof value !== 'object') {
    return { ...fallback };
  }

  return {
    x: Number.isFinite(value.x) ? value.x : fallback.x,
    y: Number.isFinite(value.y) ? value.y : fallback.y,
    z: Number.isFinite(value.z) ? value.z : fallback.z,
  };
}

export default class Camera3D {
  constructor({ position = null, rotation = null } = {}) {
    this.position = toVector3(position, { x: 0, y: 0, z: 0 });
    this.rotation = toVector3(rotation, { x: 0, y: 0, z: 0 });
  }

  setPosition(position = {}) {
    this.position = toVector3(position, this.position);
    return this.getState();
  }

  setRotation(rotation = {}) {
    this.rotation = toVector3(rotation, this.rotation);
    return this.getState();
  }

  translate({ x = 0, y = 0, z = 0 } = {}) {
    this.position.x += Number.isFinite(x) ? x : 0;
    this.position.y += Number.isFinite(y) ? y : 0;
    this.position.z += Number.isFinite(z) ? z : 0;
    return this.getState();
  }

  rotate({ x = 0, y = 0, z = 0 } = {}) {
    this.rotation.x += Number.isFinite(x) ? x : 0;
    this.rotation.y += Number.isFinite(y) ? y : 0;
    this.rotation.z += Number.isFinite(z) ? z : 0;
    return this.getState();
  }

  getState() {
    return {
      position: { ...this.position },
      rotation: { ...this.rotation },
    };
  }
}
