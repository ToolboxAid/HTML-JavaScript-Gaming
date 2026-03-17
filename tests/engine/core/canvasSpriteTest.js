// ToolboxAid.com
// David Quesenberry
// 03/16/2026
// canvasSpriteTest.js

import CanvasSprite from '../../../engine/core/canvasSprite.js';

export function testCanvasSprite(assert) {
    const mockCtx = {
        fillRectCalls: [],
        strokeRectCalls: [],
        drawImageCalls: [],
        fillStyle: '',
        lineWidth: 0,
        strokeStyle: '',
        fillRect(x, y, w, h) {
            this.fillRectCalls.push({ x, y, w, h, fillStyle: this.fillStyle });
        },
        strokeRect(x, y, w, h) {
            this.strokeRectCalls.push({ x, y, w, h, lineWidth: this.lineWidth, strokeStyle: this.strokeStyle });
        },
        drawImage(...args) {
            this.drawImageCalls.push(args);
        }
    };

    const drawSpriteNoCtx = CanvasSprite.drawSprite(0, 0, ['1'], 1, 'white', false, null);
    assert(drawSpriteNoCtx === false, 'CanvasSprite.drawSprite should return false without a context');

    const drawSpriteResult = CanvasSprite.drawSprite(1, 2, ['10', '01'], 2, 'red', true, mockCtx);
    assert(drawSpriteResult === true, 'CanvasSprite.drawSprite should render with an explicit context');
    assert(mockCtx.fillRectCalls.length === 4, 'CanvasSprite.drawSprite should visit every sprite pixel');
    assert(mockCtx.fillRectCalls[0].fillStyle === 'red', 'CanvasSprite.drawSprite should color `1` pixels with spriteColor');
    assert(mockCtx.strokeRectCalls.length === 1, 'CanvasSprite.drawSprite should draw bounds when requested');

    mockCtx.fillRectCalls = [];
    mockCtx.strokeRectCalls = [];

    const drawSpriteRgbResult = CanvasSprite.drawSpriteRGB(3, 4, [['#111111', '#222222']], 1.5, true, mockCtx);
    assert(drawSpriteRgbResult === true, 'CanvasSprite.drawSpriteRGB should render with an explicit context');
    assert(mockCtx.fillRectCalls.length === 2, 'CanvasSprite.drawSpriteRGB should draw each RGB pixel');
    assert(mockCtx.fillRectCalls[0].fillStyle === '#111111', 'CanvasSprite.drawSpriteRGB should use frame colors directly');
    assert(mockCtx.strokeRectCalls.length === 1, 'CanvasSprite.drawSpriteRGB should draw bounds when requested');

    const drawImageNoCtx = CanvasSprite.drawImageFrame(null, 0, 0, 1, 1, 0, 0, 1, 1, mockCtx);
    assert(drawImageNoCtx === false, 'CanvasSprite.drawImageFrame should return false without an image');

    const image = { width: 8, height: 8 };
    const drawImageResult = CanvasSprite.drawImageFrame(image, 0, 0, 4, 4, 10, 20, 8, 8, mockCtx);
    assert(drawImageResult === true, 'CanvasSprite.drawImageFrame should render with an explicit context');
    assert(mockCtx.drawImageCalls.length === 1, 'CanvasSprite.drawImageFrame should forward one drawImage call');

    const boundDrawSprite = CanvasSprite.bindDrawSprite();
    const boundDrawSpriteRgb = CanvasSprite.bindDrawSpriteRGB();
    assert(typeof boundDrawSprite === 'function', 'CanvasSprite.bindDrawSprite should return a function');
    assert(typeof boundDrawSpriteRgb === 'function', 'CanvasSprite.bindDrawSpriteRGB should return a function');

    mockCtx.fillRectCalls = [];
    boundDrawSprite(0, 0, ['1'], 1, 'blue', false, mockCtx);
    assert(mockCtx.fillRectCalls.length === 1, 'CanvasSprite.bindDrawSprite should call drawSprite');

    mockCtx.fillRectCalls = [];
    boundDrawSpriteRgb(0, 0, [['#abcdef']], 1, false, mockCtx);
    assert(mockCtx.fillRectCalls.length === 1, 'CanvasSprite.bindDrawSpriteRGB should call drawSpriteRGB');
}
