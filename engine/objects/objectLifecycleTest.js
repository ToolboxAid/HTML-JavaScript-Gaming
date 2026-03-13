import ObjectVector from './objectVector.js';
import ObjectSprite from './objectSprite.js';
import ObjectPNG from './objectPNG.js';

function assertNoThrow(assert, fn, message) {
    let threw = false;

    try {
        fn();
    } catch (error) {
        threw = true;
    }

    assert(!threw, message);
}

function testObjectVectorLifecycle(assert) {
    const triangle = [
        [0, 0],
        [8, 0],
        [4, 6]
    ];

    const vector = new ObjectVector(10, 12, triangle, 2, 1);
    const initialBoundWidth = vector.boundWidth;

    vector.update(1, true);
    assert(vector.boundWidth === initialBoundWidth, 'ObjectVector update should keep valid bounds');

    vector.vectorMap = null;
    assertNoThrow(
        assert,
        () => vector.update(1, true),
        'ObjectVector update should guard missing vectorMap'
    );

    const destroyed = vector.destroy();
    assert(destroyed === true, 'ObjectVector destroy should succeed');
    assert(vector.vectorMap === null, 'ObjectVector destroy should nullify vectorMap');
    assertNoThrow(
        assert,
        () => vector.update(1, true),
        'ObjectVector update should no-op after destroy'
    );
}

function testObjectSpriteLifecycle(assert) {
    const livingFrame = [
        '10',
        '01'
    ];
    const dyingFrames = [
        [
            '11',
            '00'
        ],
        [
            '00',
            '11'
        ]
    ];

    const spriteWithDeath = new ObjectSprite(0, 0, livingFrame, dyingFrames, 2);
    spriteWithDeath.setSpriteColor('#ffffff');
    assert(spriteWithDeath.spriteColor === '#ffffff', 'ObjectSprite should accept valid hex spriteColor');

    spriteWithDeath.setHit();
    assert(spriteWithDeath.isDying(), 'ObjectSprite setHit should enter dying state when dying frames exist');

    const spriteWithoutDeath = new ObjectSprite(0, 0, livingFrame, null, 2);
    spriteWithoutDeath.setHit();
    assert(spriteWithoutDeath.isDead(), 'ObjectSprite setHit should enter dead state when no dying frames exist');

    const destroyed = spriteWithDeath.destroy();
    assert(destroyed === true, 'ObjectSprite destroy should succeed');
    assertNoThrow(
        assert,
        () => spriteWithDeath.update(1, true),
        'ObjectSprite update should no-op after destroy'
    );
}

function testObjectPngLifecycle(assert) {
    const originalLoadSprite = ObjectPNG.loadSprite;

    try {
        ObjectPNG.loadSprite = () => ({
            then() {
                return {
                    catch() {
                        return null;
                    }
                };
            }
        });

        const pngObject = new ObjectPNG(
            5,
            6,
            'fake/path.png',
            0,
            0,
            16,
            16,
            2,
            'black',
            0,
            0,
            4,
            2,
            2
        );

        pngObject.setFrame(1);
        assert(pngObject.currentFrameIndex === 1, 'ObjectPNG setFrame should update currentFrameIndex');
        assert(pngObject.animation.currentFrameIndex === 1, 'ObjectPNG setFrame should sync animation frame');

        pngObject.delayCounter = 7;
        assert(pngObject.animation.delayCounter === 7, 'ObjectPNG delayCounter setter should sync animation');

        const destroyed = pngObject.destroy();
        assert(destroyed === true, 'ObjectPNG destroy should succeed');
        assertNoThrow(
            assert,
            () => pngObject.update(1, true),
            'ObjectPNG update should no-op after destroy'
        );
    } finally {
        ObjectPNG.loadSprite = originalLoadSprite;
    }
}

export function testObjectLifecycle(assert) {
    testObjectVectorLifecycle(assert);
    testObjectSpriteLifecycle(assert);
    testObjectPngLifecycle(assert);
}
