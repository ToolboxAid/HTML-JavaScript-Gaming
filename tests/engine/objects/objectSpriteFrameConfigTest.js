// ToolboxAid.com
// David Quesenberry
// 03/13/2026
// objectSpriteFrameConfigTest.js

import ObjectSpriteFrameConfig from '../../../engine/objects/objectSpriteFrameConfig.js';

export function testObjectSpriteFrameConfig(assert) {
    const livingSprite = {
        metadata: {
            sprite: 'Test',
            spriteGridSize: 1,
            spritePixelSize: 2,
            palette: 'default',
            framesPerSprite: 4
        },
        layers: [
            {
                metadata: {
                    spriteimage: '',
                    imageX: 0,
                    imageY: 0,
                    imageScale: 1
                },
                data: ['10', '01']
            },
            {
                metadata: {
                    spriteimage: '',
                    imageX: 0,
                    imageY: 0,
                    imageScale: 1
                },
                data: ['01', '10']
            }
        ]
    };

    const config = ObjectSpriteFrameConfig.create(livingSprite, null, 1, null);

    assert(Array.isArray(config.livingFrames), 'json living frames should normalize to an array');
    assert(config.livingFrames.length === 2, 'json living frames should preserve layer count');
    assert(Array.isArray(config.livingFrames[0]), 'each living frame should be a frame array');
    assert(config.livingFrameCount === 2, 'livingFrameCount should match normalized frame length');
}
