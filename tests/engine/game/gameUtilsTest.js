// ADD: PR-018 equivalence probe
import GameTurnFlowUtils from '../../../engine/game/gameTurnFlowUtils.js';

// inside testGameUtils(assert)
{
    const cases = [
        { lives:[3,3,3,3], current:0, count:4 },
        { lives:[0,2,0,3], current:3, count:4 },
        { lives:[1,0,5], current:0, count:2 },
        { lives:[1,0,0,0], current:0, count:4 }
    ];

    for (const c of cases) {
        const a = GameUtils.swapPlayer(c.lives, c.current, c.count);
        const b = GameTurnFlowUtils.swapPlayer(c.lives, c.current, c.count);

        assert(JSON.stringify(a) === JSON.stringify(b), "swapPlayer equivalence failed");
        assert(JSON.stringify(c.lives) === JSON.stringify(c.lives), "input mutation detected");
    }
}
