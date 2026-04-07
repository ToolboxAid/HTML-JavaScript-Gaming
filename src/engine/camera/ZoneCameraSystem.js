/*
Toolbox Aid
David Quesenberry
03/21/2026
ZoneCameraSystem.js
*/
import { clamp } from '../utils/math.js';

export function updateZoneCamera(camera, target, zones = []) {
  const targetCenterX = target.x + target.width / 2;
  const targetCenterY = target.y + target.height / 2;
  const zone = zones.find((entry) =>
    targetCenterX >= entry.x &&
    targetCenterX < entry.x + entry.width &&
    targetCenterY >= entry.y &&
    targetCenterY < entry.y + entry.height);

  if (!zone) {
    camera.followRect(target);
    camera.clampToWorld();
    return null;
  }

  const zoneMaxX = zone.x + zone.width - camera.viewportWidth;
  const zoneMaxY = zone.y + zone.height - camera.viewportHeight;
  camera.x = clamp(target.x + target.width / 2 - camera.viewportWidth / 2, zone.x, Math.max(zone.x, zoneMaxX));
  camera.y = clamp(target.y + target.height / 2 - camera.viewportHeight / 2, zone.y, Math.max(zone.y, zoneMaxY));
  return zone;
}
