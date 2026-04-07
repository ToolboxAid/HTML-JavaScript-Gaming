/*
Toolbox Aid
David Quesenberry
03/21/2026
CameraSystem.js
*/
export function followCameraTarget(camera, target, clampToWorld = true) {
  camera.followRect(target);

  if (clampToWorld) {
    camera.clampToWorld();
  }
}

export function worldRectToScreen(camera, rect, screenX = 0, screenY = 0) {
  const pos = camera.worldToScreen(rect.x, rect.y, screenX, screenY);
  return {
    x: pos.x,
    y: pos.y,
    width: rect.width,
    height: rect.height,
  };
}
