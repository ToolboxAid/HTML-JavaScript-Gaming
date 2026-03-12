// ToolboxAid.com
// David Quesenberry
// 03/12/2026
// bulletFactory.js

import AngleUtils from "../../../engine/math/angleUtils.js";
import RandomUtils from "../../../engine/math/randomUtils.js";
import Bullet from "./bullet.js";

class AsteroidsBulletFactory {
    static OWNER_TEAM = Object.freeze({
        PLAYER: 'player',
        UFO: 'ufo'
    });

    static getSpawnPosition(source, angleInDegrees, noseDistance = 15) {
        const angleInRadians = angleInDegrees * (Math.PI / 180);

        return {
            x: source.x + (Math.cos(angleInRadians) * noseDistance),
            y: source.y + (Math.sin(angleInRadians) * noseDistance)
        };
    }

    static getAimPoint(object) {
        if (object && typeof object.getCenterPoint === 'function') {
            return object.getCenterPoint();
        }

        return {
            x: object?.x ?? 0,
            y: object?.y ?? 0
        };
    }

    static getAngleBetweenCenters(source, target) {
        const sourcePoint = this.getAimPoint(source);
        const targetPoint = this.getAimPoint(target);

        return AngleUtils.getAngleBetweenObjects(sourcePoint, targetPoint);
    }

    static createShipBullet(ship) {
        const spawnPosition = this.getSpawnPosition(ship, ship.rotationAngle);

        return new Bullet({
            x: spawnPosition.x,
            y: spawnPosition.y,
            angleInDegrees: ship.rotationAngle,
            inheritedVelocityX: ship.velocityX,
            inheritedVelocityY: ship.velocityY,
            ownerId: ship.ID,
            ownerType: 'Ship',
            team: this.OWNER_TEAM.PLAYER
        });
    }

    static createUfoBullet(ufo, ship, options = {}) {
        const angleInDegrees = this.getUfoBulletAngle(ufo, ship, options);
        const spawnPosition = this.getSpawnPosition(ufo, angleInDegrees);

        return new Bullet({
            x: spawnPosition.x,
            y: spawnPosition.y,
            angleInDegrees,
            inheritedVelocityX: ufo.velocityX,
            inheritedVelocityY: ufo.velocityY,
            ownerId: ufo.ID,
            ownerType: 'UFO',
            team: this.OWNER_TEAM.UFO
        });
    }

    static getUfoBulletAngle(ufo, ship, options = {}) {
        if (ufo.isSmall && ship.isAlive()) {
            const aimErrorDegrees = Number.isFinite(options.aimErrorDegrees)
                ? options.aimErrorDegrees
                : 0;
            const baseAngle = this.getAngleBetweenCenters(ufo, ship);
            return baseAngle + RandomUtils.randomRange(-aimErrorDegrees, aimErrorDegrees);
        }

        return RandomUtils.randomRange(0, 360, true);
    }
}

export default AsteroidsBulletFactory;
