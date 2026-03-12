// ToolboxAid.com
// David Quesenberry
// 03/12/2026
// asteroidsHitResolver.js

class AsteroidsHitResolver {
    static hitAsteroid(world, asteroidKey, asteroid) {
        if (!asteroid || !asteroidKey) {
            return 0;
        }

        let score = 0;

        switch (asteroid.size) {
            case 'large':
                world.asteroidManager.spawnChildAsteroids(asteroid, 'medium');
                score = 100;
                break;
            case 'medium':
                world.asteroidManager.spawnChildAsteroids(asteroid, 'small');
                score = 50;
                break;
            case 'small':
                score = 10;
                break;
            default:
                return 0;
        }

        world.asteroidManager.playHitAudio(asteroid.size);
        world.asteroidManager.createExplosion(asteroid);
        world.asteroidManager.removeAsteroid(asteroidKey);

        return score;
    }

    static hitShipByAsteroid(world, ship, collision) {
        if (typeof ship.setIsDying === 'function') {
            ship.setIsDying();
        }

        world.asteroidManager.createExplosion(ship);
        this.hitAsteroid(world, collision.asteroidKey, collision.asteroid);
        return 0;
    }

    static hitUfoByAsteroid(world, ufo, collision) {
        if (typeof ufo.setIsDying === 'function') {
            ufo.setIsDying();
        }

        world.asteroidManager.createExplosion(ufo);
        this.hitAsteroid(world, collision.asteroidKey, collision.asteroid);
        return 0;
    }

    static hitAsteroidByBullet(world, bullet, collision) {
        bullet.setIsDead();
        return this.hitAsteroid(world, collision.asteroidKey, collision.asteroid);
    }

    static hitUfo(world, bullet, ufo) {
        bullet.setIsDead();
        ufo.setHit();
        world.ufoManager.createExplosion(ufo);
        return ufo.getValue();
    }

    static hitShipByUfoBullet(world, bullet, ship) {
        bullet.setIsDead();
        ship.setShipHit();
        world.ufoManager.createExplosion(ship);
    }

    static hitShipByPlayerBullet(world, bullet, ship) {
        bullet.setIsDead();
        ship.setShipHit();
        world.asteroidManager.createExplosion(ship);
    }
}

export default AsteroidsHitResolver;
