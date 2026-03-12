// ToolboxAid.com
// David Quesenberry
// 03/12/2026
// asteroidsHitResolver.js

class AsteroidsHitResolver {
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
