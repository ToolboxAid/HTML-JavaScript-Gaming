import CanvasUtils from '../../../engine/core/canvasUtils.js';
import PrimitiveRenderer from '../../../engine/renderers/primitiveRenderer.js';
import SpriteRenderer from '../../../engine/renderers/spriteRenderer.js';
import VectorRenderer from '../../../engine/renderers/vectorRenderer.js';
import PngRenderer from '../../../engine/renderers/pngRenderer.js';
import ParticleExplosion from '../../../engine/renderers/particleExplosion.js';

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
        saveCalls: 0,
        restoreCalls: 0,
        beginPath() {},
        closePath() {},
        moveTo() {},
        lineTo() {},
        stroke() {},
        fill() {},
        fillRect() {},
        strokeRect() {},
        drawImage() {},
        fillText() {},
        save() {
            this.saveCalls += 1;
        },
        restore() {
            this.restoreCalls += 1;
        },
        translate() {},
        rotate() {},
        scale() {},
        setLineDash() {},
        arc() {},
        ellipse() {},
        measureText() {
            return {
                width: 10,
                actualBoundingBoxAscent: 7,
                actualBoundingBoxDescent: 3
            };
        }
    };
}

function testCanvasUtilsGuardOnMissingContext(assert) {
    const originalCtx = CanvasUtils.ctx;

    try {
        CanvasUtils.ctx = null;

        assertNoThrow(assert, () => CanvasUtils.drawSprite(0, 0, ['1'], 1, 'white'), 'CanvasUtils.drawSprite should no-op without context');
        assertNoThrow(assert, () => CanvasUtils.drawSpriteRGB(0, 0, [['#fff']], 1), 'CanvasUtils.drawSpriteRGB should no-op without context');
        assertNoThrow(assert, () => CanvasUtils.drawLine(0, 0, 1, 1), 'CanvasUtils.drawLine should no-op without context');
        assertNoThrow(assert, () => CanvasUtils.drawDashLine(0, 0, 1, 1, 1), 'CanvasUtils.drawDashLine should no-op without context');
        assertNoThrow(assert, () => CanvasUtils.drawBounds(0, 0, 1, 1), 'CanvasUtils.drawBounds should no-op without context');
        assertNoThrow(assert, () => CanvasUtils.drawRect(0, 0, 1, 1, 'white'), 'CanvasUtils.drawRect should no-op without context');
        assertNoThrow(assert, () => CanvasUtils.drawBorder(), 'CanvasUtils.drawBorder should no-op without context');
        assertNoThrow(assert, () => CanvasUtils.drawCircle({ x: 0, y: 0 }), 'CanvasUtils.drawCircle should no-op without context');
        assertNoThrow(assert, () => CanvasUtils.drawCircle2(0, 0, 1), 'CanvasUtils.drawCircle2 should no-op without context');
        assertNoThrow(assert, () => CanvasUtils.canvasClear(), 'CanvasUtils.canvasClear should no-op without context');

        const dimensions = CanvasUtils.calculateTextMetrics('hello');
        assert(dimensions.width === 0 && dimensions.height === 0, 'CanvasUtils.calculateTextMetrics should fall back to zero dimensions without context');
    } finally {
        CanvasUtils.ctx = originalCtx;
    }
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

        assertNoThrow(assert, () => PrimitiveRenderer.draw({ x: 0, y: 0, width: 10, height: 10, isDestroyed: false }), 'PrimitiveRenderer should no-op without context');
        assertNoThrow(assert, () => PrimitiveRenderer.drawRect(0, 0, 10, 10, 'white'), 'PrimitiveRenderer.drawRect should no-op without context');
        assertNoThrow(assert, () => PrimitiveRenderer.drawCircle(5, 5, 3, 'white', null, 0, 0.5), 'PrimitiveRenderer.drawCircle should no-op without context');
        assertNoThrow(assert, () => PrimitiveRenderer.drawEllipse(5, 5, 3, 2, null, 'white', 1, 0, 0.5), 'PrimitiveRenderer.drawEllipse should no-op without context');
        assertNoThrow(assert, () => PrimitiveRenderer.drawPolygon([{ x: 0, y: 0 }, { x: 1, y: 1 }, { x: 1, y: 0 }], 'white', 'red', 1), 'PrimitiveRenderer.drawPolygon should no-op without context');
        assertNoThrow(assert, () => PrimitiveRenderer.drawTriangle([{ x: 0, y: 0 }, { x: 1, y: 1 }, { x: 1, y: 0 }], 'white'), 'PrimitiveRenderer.drawTriangle should no-op without context');
        assertNoThrow(assert, () => PrimitiveRenderer.drawLine(0, 0, 10, 10, 'white', 1, 0.5), 'PrimitiveRenderer.drawLine should no-op without context');
        assertNoThrow(assert, () => PrimitiveRenderer.drawBounds(0, 0, 10, 10, 'white', 1, 0.5), 'PrimitiveRenderer.drawBounds should no-op without context');
        assertNoThrow(assert, () => PrimitiveRenderer.drawPanel(0, 0, 10, 10, { fillColor: 'white', borderColor: 'red', borderWidth: 1, backdropColor: 'black', backdropInset: 2, headerY: 4 }), 'PrimitiveRenderer.drawPanel should no-op without context');
        assertNoThrow(assert, () => PrimitiveRenderer.drawPath([[0, 0], [1, 1], [1, 0]], 'white', 1, { closePath: true }), 'PrimitiveRenderer.drawPath should no-op without context');
        assertNoThrow(assert, () => SpriteRenderer.draw(spriteLike, Number.NaN, Number.NaN), 'SpriteRenderer should no-op without context');
        assertNoThrow(assert, () => VectorRenderer.draw(vectorLike, Number.NaN, Number.NaN, Number.NaN), 'VectorRenderer should no-op without context');
        assertNoThrow(assert, () => PngRenderer.draw(pngLike, Number.NaN, Number.NaN), 'PngRenderer should no-op without context');
        assertNoThrow(assert, () => PngRenderer.drawAllFramesPreview(pngLike, Number.NaN, Number.NaN, Number.NaN, Number.NaN), 'PngRenderer frame preview should no-op without context');
        assertNoThrow(assert, () => PngRenderer.drawSheetPreview(pngLike, Number.NaN, Number.NaN, Number.NaN), 'PngRenderer sheet preview should no-op without context');
        assertNoThrow(assert, () => new ParticleExplosion(0, 0, 1, 5, 1, 3).draw(), 'ParticleExplosion should no-op without context');
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
    let mockCtx = null;

    try {
        mockCtx = createMockCtx();
        CanvasUtils.ctx = mockCtx;
        CanvasUtils.drawSprite = () => { drawSpriteCalls += 1; };
        CanvasUtils.drawSpriteRGB = () => { drawSpriteRgbCalls += 1; };
        CanvasUtils.drawBounds = () => {};
        CanvasUtils.drawCircle2 = () => {};

        PrimitiveRenderer.draw({ x: 1, y: 2, width: 3, height: 4, isDestroyed: false }, 'white', 'red', 1);
        PrimitiveRenderer.drawRect(5, 6, 7, 8, 'white', 'red', 1);
        PrimitiveRenderer.drawCircle(20, 20, 4, 'white', 'red', 1, 0.5);
        PrimitiveRenderer.drawEllipse(25, 25, 6, 3, null, 'white', 1, 0, 0.5);
        PrimitiveRenderer.drawPolygon([{ x: 0, y: 0 }, { x: 3, y: 5 }, { x: 5, y: 0 }], '#fff', 'red', 1);
        PrimitiveRenderer.drawTriangle([{ x: 0, y: 0 }, { x: 3, y: 5 }, { x: 5, y: 0 }], '#fff', 'red', 1);
        PrimitiveRenderer.drawLine(0, 0, 10, 10, 'white', 1, 0.5);
        PrimitiveRenderer.drawBounds(10, 10, 20, 20, 'white', 1, 0.5);
        PrimitiveRenderer.drawPanel(0, 0, 30, 30, { fillColor: 'white', borderColor: 'red', borderWidth: 1, backdropColor: 'black', backdropInset: 2, headerY: 12, headerColor: 'yellow' });
        PrimitiveRenderer.drawPath([[0, 0], [5, 5], [8, 0]], 'white', 1, { closePath: true, offsetX: 2, offsetY: 3 });

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

        const particleExplosion = new ParticleExplosion(0, 0, 1, 5, 1, 3);
        particleExplosion.draw();

        assert(drawSpriteCalls === 1, 'SpriteRenderer should call drawSprite for non-json frames');
        assert(drawSpriteRgbCalls === 1, 'SpriteRenderer should call drawSpriteRGB for json frames');
        assert(mockCtx.saveCalls === mockCtx.restoreCalls, 'Renderers should balance canvas save and restore calls');
    } finally {
        CanvasUtils.ctx = originalCtx;
        CanvasUtils.drawSprite = originalDrawSprite;
        CanvasUtils.drawSpriteRGB = originalDrawSpriteRGB;
        CanvasUtils.drawBounds = originalDrawBounds;
        CanvasUtils.drawCircle2 = originalDrawCircle2;
    }
}

function testPrimitiveRendererWithMockContext(assert) {
    const originalCtx = CanvasUtils.ctx;
    const mockCtx = createMockCtx();

    try {
        CanvasUtils.ctx = mockCtx;

        PrimitiveRenderer.drawRect(5, 6, 7, 8, 'white', 'red', 1);
        PrimitiveRenderer.drawCircle(20, 20, 4, 'white', 'red', 1);
        PrimitiveRenderer.drawEllipse(25, 25, 6, 3, null, 'white', 1);
        PrimitiveRenderer.drawTriangle([{ x: 0, y: 0 }, { x: 3, y: 5 }, { x: 5, y: 0 }], '#fff', 'red', 1);
        PrimitiveRenderer.drawLine(0, 0, 10, 10, 'white', 1, 0.5);
        PrimitiveRenderer.drawBounds(10, 10, 20, 20, 'white', 1, 0.5);
        PrimitiveRenderer.drawPanel(0, 0, 30, 30, { fillColor: 'white', borderColor: 'red', borderWidth: 1, backdropColor: 'black', backdropInset: 2, headerY: 12, headerColor: 'yellow' });

        assert(mockCtx.saveCalls === mockCtx.restoreCalls, 'PrimitiveRenderer should balance canvas save and restore calls');
    } finally {
        CanvasUtils.ctx = originalCtx;
    }
}

export function testRendererSafety(assert) {
    testCanvasUtilsGuardOnMissingContext(assert);
    testRenderersGuardOnMissingContext(assert);
    testRenderersDrawWithMockContext(assert);
    testPrimitiveRendererWithMockContext(assert);
}


