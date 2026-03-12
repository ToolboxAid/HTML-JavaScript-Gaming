// ToolboxAid.com
// David Quesenberry
// 03/12/2026
// runtime.js

class AsteroidsRuntime {
    static updateSafeSpawn(session, deltaTime) {
        const ship = session.getCurrentShip();
        const world = session.getCurrentWorld();

        world.stepForSpawn(deltaTime, ship);
        return world.isSafeSpawn(ship);
    }

    static stepPlay(session, deltaTime, keyboardInput, debug = false) {
        const ship = session.getCurrentShip();
        const world = session.getCurrentWorld();

        ship.update(deltaTime, keyboardInput);
        world.step(deltaTime, ship, keyboardInput);

        if (ship.isDying() && world.canFinalizeActorDeath()) {
            if (debug) {
                console.log('Ship death confirmed - UFO destroyed');
            }

            ship.setShipDead();
        }

        return session.addCurrentPlayerScore(world.consumeScore());
    }

    static drawSafeSpawn(session) {
        session.getCurrentWorld().drawSafeSpawn();
    }

    static drawPlay(session) {
        session.getCurrentShip().draw();
        session.getCurrentWorld().draw();
    }

    static drawPause(session) {
        this.drawPlay(session);
    }
}

export default AsteroidsRuntime;
