// ToolboxAid.com
// David Quesenberry
// 03/12/2026
// asteroidsCollisionSystem.js

class AsteroidsCollisionSystem {
    static resolve(world, ship) {
        const ufo = world.ufoManager.getUfo();
        let score = 0;

        world.asteroidManager.checkShip(ship);

        if (ufo && typeof ufo.isAlive === 'function') {
            world.asteroidManager.checkShip(ufo);
        }

        world.bulletManager.bullets.forEach((bullet) => {
            score += world.asteroidManager.checkBullet(bullet);
        });

        const ufoBullets = world.ufoManager.getActiveBullets();

        ufoBullets.forEach((bullet) => {
            world.asteroidManager.checkBullet(bullet);
        });

        world.bulletManager.bullets.forEach((bullet) => {
            if (ufo && bullet.collisionDetection(ufo)) {
                bullet.setIsDead();
                ufo.setHit();
                world.ufoManager.createExplosion(ufo);
                score += ufo.getValue();
            }
        });

        if (ship.isAlive()) {
            ufoBullets.forEach((bullet) => {
                if (bullet.team !== 'player' && bullet.collisionDetection(ship)) {
                    bullet.setIsDead();
                    ship.setShipHit();
                    world.ufoManager.createExplosion(ship);
                }
            });
        }

        if (ship.isAlive()) {
            world.bulletManager.bullets.forEach((bullet) => {
                if (bullet.ownerId !== ship.ID && bullet.collisionDetection(ship)) {
                    bullet.setIsDead();
                    ship.setShipHit();
                    world.asteroidManager.createExplosion(ship);
                }
            });
        }

        world.ufoManager.check(ship);

        return score;
    }
}

export default AsteroidsCollisionSystem;
