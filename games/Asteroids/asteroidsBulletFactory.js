// ToolboxAid.com
// David Quesenberry
// 03/12/2026
// asteroidsBulletFactory.js

import AngleUtils from "../../engine/math/angleUtils.js";
import RandomUtils from "../../engine/math/randomUtils.js";
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

    static createUfoBullet(ufo, ship) {
        const angleInDegrees = this.getUfoBulletAngle(ufo, ship);
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

    static getUfoBulletAngle(ufo, ship) {
        if (ufo.isSmall && ship.isAlive()) {
            return AngleUtils.getAngleBetweenObjects(ufo, ship);
        }

        return RandomUtils.randomRange(0, 360, true);
    }
}

export default AsteroidsBulletFactory;
