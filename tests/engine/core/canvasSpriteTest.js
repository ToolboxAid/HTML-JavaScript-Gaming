// ToolboxAid.com
// David Quesenberry
// 03/16/2026
// canvasSpriteTest.js

import CanvasSprite from '../../../engine/core/canvasSprite.js';
import CanvasUtils from '../../../engine/core/canvasUtils.js';

export function testCanvasSprite(assert) {
    const originalCtx = CanvasUtils.ctx;
    const mockCtx = {
        saveCalls: 0,
        restoreCalls: 0,
        fillRectCalls: [],
        strokeRectCalls: [],
        drawImageCalls: [],
        fillStyle: '',
        lineWidth: 0,
        strokeStyle: '',
        save() {
            this.saveCalls += 1;
        },
        restore() {
            this.restoreCalls += 1;
        },
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

    try {
        const drawSpriteNoCtx = CanvasSprite._drawSpriteToContext(null, 0, 0, ['1'], 1, 'white', false);
        assert(drawSpriteNoCtx === false, 'CanvasSprite._drawSpriteToContext should return false without a context');

        const drawSpriteResult = CanvasSprite._drawSpriteToContext(mockCtx, 1, 2, ['10', '01'], 2, 'red', true);
        assert(drawSpriteResult === true, 'CanvasSprite._drawSpriteToContext should render with an explicit context');
        assert(mockCtx.fillRectCalls.length === 4, 'CanvasSprite._drawSpriteToContext should visit every sprite pixel');
        assert(mockCtx.fillRectCalls[0].fillStyle === 'red', 'CanvasSprite._drawSpriteToContext should color `1` pixels with spriteColor');
        assert(mockCtx.strokeRectCalls.length === 1, 'CanvasSprite._drawSpriteToContext should draw bounds when requested');
        assert(mockCtx.saveCalls === 1 && mockCtx.restoreCalls === 1, 'CanvasSprite._drawSpriteToContext should preserve canvas state');

        mockCtx.fillRectCalls = [];
        mockCtx.strokeRectCalls = [];

        const drawSpriteRgbResult = CanvasSprite._drawSpriteRGBToContext(mockCtx, 3, 4, [['#111111', '#222222']], 1.5, true);
        assert(drawSpriteRgbResult === true, 'CanvasSprite._drawSpriteRGBToContext should render with an explicit context');
        assert(mockCtx.fillRectCalls.length === 2, 'CanvasSprite._drawSpriteRGBToContext should draw each RGB pixel');
        assert(mockCtx.fillRectCalls[0].fillStyle === '#111111', 'CanvasSprite._drawSpriteRGBToContext should use frame colors directly');
        assert(mockCtx.strokeRectCalls.length === 1, 'CanvasSprite._drawSpriteRGBToContext should draw bounds when requested');
        assert(mockCtx.saveCalls === 2 && mockCtx.restoreCalls === 2, 'CanvasSprite._drawSpriteRGBToContext should preserve canvas state');

        const drawImageNoCtx = CanvasSprite._drawImageFrameToContext(mockCtx, null, 0, 0, 1, 1, 0, 0, 1, 1);
        assert(drawImageNoCtx === false, 'CanvasSprite._drawImageFrameToContext should return false without an image');

        const image = { width: 8, height: 8 };
        const drawImageResult = CanvasSprite._drawImageFrameToContext(mockCtx, image, 0, 0, 4, 4, 10, 20, 8, 8);
        assert(drawImageResult === true, 'CanvasSprite._drawImageFrameToContext should render with an explicit context');
        assert(mockCtx.drawImageCalls.length === 1, 'CanvasSprite._drawImageFrameToContext should forward one drawImage call');
        assert(mockCtx.saveCalls === 3 && mockCtx.restoreCalls === 3, 'CanvasSprite._drawImageFrameToContext should preserve canvas state');

        const boundDrawSprite = CanvasSprite.bindDrawSprite();
        const boundDrawSpriteRgb = CanvasSprite.bindDrawSpriteRGB();
        assert(typeof boundDrawSprite === 'function', 'CanvasSprite.bindDrawSprite should return a function');
        assert(typeof boundDrawSpriteRgb === 'function', 'CanvasSprite.bindDrawSpriteRGB should return a function');

        CanvasUtils.ctx = mockCtx;
        mockCtx.fillRectCalls = [];
        boundDrawSprite(0, 0, ['1'], 1, 'blue', false);
        assert(mockCtx.fillRectCalls.length === 1, 'CanvasSprite.bindDrawSprite should call drawSprite');

        mockCtx.fillRectCalls = [];
        boundDrawSpriteRgb(0, 0, [['#abcdef']], 1, false);
        assert(mockCtx.fillRectCalls.length === 1, 'CanvasSprite.bindDrawSpriteRGB should call drawSpriteRGB');
    } finally {
        CanvasUtils.ctx = originalCtx;
    }
}
