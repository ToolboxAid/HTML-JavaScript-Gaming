import CanvasUtils from '../core/canvas.js';
import BoxRenderer from './boxRenderer.js';
import SpriteRenderer from './spriteRenderer.js';
import VectorRenderer from './vectorRenderer.js';
import PngRenderer from './pngRenderer.js';

function assertNoThrow(assert, fn, message) {
    let threw = false;

    try {
        fn();
    } catch (error) {
        threw = true;
    }

    assert(!threw, message);
}

function createMockCtx() {
    return {
        beginPath() {},
        closePath() {},
        moveTo() {},
        lineTo() {},
        stroke() {},
        fillRect() {},
        strokeRect() {},
        drawImage() {},
        fillText() {},
        save() {},
        restore() {},
        translate() {},
        rotate() {},
        scale() {}
    };
}

function testRenderersGuardOnMissingContext(assert) {
    const originalCtx = CanvasUtils.ctx;
    const originalDrawSprite = CanvasUtils.drawSprite;
    const originalDrawSpriteRGB = CanvasUtils.drawSpriteRGB;
    const originalDrawBounds = CanvasUtils.drawBounds;
    const originalDrawCircle2 = CanvasUtils.drawCircle2;

    try {
        CanvasUtils.ctx = null;
        CanvasUtils.drawSprite = () => {};
        CanvasUtils.drawSpriteRGB = () => {};
        CanvasUtils.drawBounds = () => {};
        CanvasUtils.drawCircle2 = () => {};

        const spriteLike = {
            isDead: () => false,
            isAlive: () => true,
            isDying: () => false,
            isDestroyed: false,
            frameType: 'singleFrame',
            getCurrentLivingFrame: () => ['1'],
            getCurrentDyingFrame: () => null,
            x: 0,
            y: 0,
            pixelSize: 1,
            spriteColor: 'white'
        };

        const vectorLike = {
            isAlive: () => true,
            isDestroyed: false,
            rotatedPoints: [[0, 0], [1, 1]],
            color: 'white',
            drawBounds: false
        };

        const pngLike = {
            isDead: () => false,
            isDestroyed: false,
            isLoaded: true,
            png: { complete: true },
            frameWidth: 10,
            frameHeight: 10,
            pixelSize: 1,
            getFrameOffset: () => ({ x: 0, y: 0 }),
            getCurrentSourceRect: () => ({ sx: 0, sy: 0, sw: 10, sh: 10 }),
            constructor: {
                DEBUG: false,
                Flip: {
                    NONE: 'none',
                    HORIZONTAL: 'horizontal',
                    VERTICAL: 'vertical',
                    BOTH: 'both'
                }
            },
            rotation: 0,
            flip: 'none',
            x: 0,
            y: 0
        };

        assertNoThrow(assert, () => BoxRenderer.draw({ x: 0, y: 0, width: 10, height: 10, isDestroyed: false }), 'BoxRenderer should no-op without context');
        assertNoThrow(assert, () => SpriteRenderer.draw(spriteLike, Number.NaN, Number.NaN), 'SpriteRenderer should no-op without context');
        assertNoThrow(assert, () => VectorRenderer.draw(vectorLike, Number.NaN, Number.NaN, Number.NaN), 'VectorRenderer should no-op without context');
        assertNoThrow(assert, () => PngRenderer.draw(pngLike, Number.NaN, Number.NaN), 'PngRenderer should no-op without context');
        assertNoThrow(assert, () => PngRenderer.drawAllFramesPreview(pngLike, Number.NaN, Number.NaN, Number.NaN, Number.NaN), 'PngRenderer frame preview should no-op without context');
        assertNoThrow(assert, () => PngRenderer.drawSheetPreview(pngLike, Number.NaN, Number.NaN, Number.NaN), 'PngRenderer sheet preview should no-op without context');
    } finally {
        CanvasUtils.ctx = originalCtx;
        CanvasUtils.drawSprite = originalDrawSprite;
        CanvasUtils.drawSpriteRGB = originalDrawSpriteRGB;
        CanvasUtils.drawBounds = originalDrawBounds;
        CanvasUtils.drawCircle2 = originalDrawCircle2;
    }
}

function testRenderersDrawWithMockContext(assert) {
    const originalCtx = CanvasUtils.ctx;
    const originalDrawSprite = CanvasUtils.drawSprite;
    const originalDrawSpriteRGB = CanvasUtils.drawSpriteRGB;
    const originalDrawBounds = CanvasUtils.drawBounds;
    const originalDrawCircle2 = CanvasUtils.drawCircle2;

    let drawSpriteCalls = 0;
    let drawSpriteRgbCalls = 0;

    try {
        CanvasUtils.ctx = createMockCtx();
        CanvasUtils.drawSprite = () => { drawSpriteCalls += 1; };
        CanvasUtils.drawSpriteRGB = () => { drawSpriteRgbCalls += 1; };
        CanvasUtils.drawBounds = () => {};
        CanvasUtils.drawCircle2 = () => {};

        BoxRenderer.draw({ x: 1, y: 2, width: 3, height: 4, isDestroyed: false }, 'white', 'red', 1);

        const spriteLiving = {
            isDead: () => false,
            isAlive: () => true,
            isDying: () => false,
            isDestroyed: false,
            frameType: 'singleFrame',
            getCurrentLivingFrame: () => ['1'],
            getCurrentDyingFrame: () => null,
            x: 0,
            y: 0,
            pixelSize: 1,
            spriteColor: 'white'
        };

        const spriteRgb = {
            ...spriteLiving,
            frameType: 'json'
        };

        SpriteRenderer.draw(spriteLiving, Number.NaN, Number.NaN);
        SpriteRenderer.draw(spriteRgb, Number.NaN, Number.NaN);

        const vectorLike = {
            isAlive: () => true,
            isDestroyed: false,
            rotatedPoints: [[0, 0], [1, 1], [2, 0]],
            color: 'white',
            drawBounds: true,
            x: 0,
            y: 0,
            boundX: 0,
            boundY: 0,
            boundWidth: 2,
            boundHeight: 2
        };
        VectorRenderer.draw(vectorLike, Number.NaN, Number.NaN, Number.NaN);

        const pngLike = {
            isDead: () => false,
            isDestroyed: false,
            isLoaded: true,
            png: { complete: true, width: 20, height: 20 },
            frameWidth: 10,
            frameHeight: 10,
            pixelSize: 1,
            getFrameOffset: () => ({ x: 0, y: 0 }),
            getCurrentSourceRect: () => ({ sx: 0, sy: 0, sw: 10, sh: 10 }),
            constructor: {
                DEBUG: false,
                Flip: {
                    NONE: 'none',
                    HORIZONTAL: 'horizontal',
                    VERTICAL: 'vertical',
                    BOTH: 'both'
                }
            },
            rotation: 0,
            flip: 'none',
            x: 0,
            y: 0,
            currentFrameIndex: 0,
            frameCount: 1,
            framesPerRow: 1,
            spriteX: 0,
            spriteY: 0
        };

        PngRenderer.draw(pngLike, Number.NaN, Number.NaN);
        PngRenderer.drawAllFramesPreview(pngLike, Number.NaN, Number.NaN, Number.NaN, Number.NaN);
        PngRenderer.drawSheetPreview(pngLike, Number.NaN, Number.NaN, Number.NaN);

        assert(drawSpriteCalls === 1, 'SpriteRenderer should call drawSprite for non-json frames');
        assert(drawSpriteRgbCalls === 1, 'SpriteRenderer should call drawSpriteRGB for json frames');
    } finally {
        CanvasUtils.ctx = originalCtx;
        CanvasUtils.drawSprite = originalDrawSprite;
        CanvasUtils.drawSpriteRGB = originalDrawSpriteRGB;
        CanvasUtils.drawBounds = originalDrawBounds;
        CanvasUtils.drawCircle2 = originalDrawCircle2;
    }
}

export function testRendererSafety(assert) {
    testRenderersGuardOnMissingContext(assert);
    testRenderersDrawWithMockContext(assert);
}

