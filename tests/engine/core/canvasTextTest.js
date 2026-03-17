// ToolboxAid.com
// David Quesenberry
// 03/16/2026
// canvasTextTest.js

import CanvasText from '../../../engine/core/canvasText.js';
import CanvasUtils from '../../../engine/core/canvasUtils.js';

export function testCanvasText(assert) {
    const parsedDefault = CanvasText.parseFont(null);
    assert(parsedDefault.fontSize === 20, 'CanvasText.parseFont should fall back to default size when font is missing');
    assert(parsedDefault.fontFamily === 'Arial', 'CanvasText.parseFont should fall back to default family when font is missing');

    const parsedConfigured = CanvasText.parseFont('40px monospace');
    assert(parsedConfigured.fontSize === 40, 'CanvasText.parseFont should parse the font size');
    assert(parsedConfigured.fontFamily === 'monospace', 'CanvasText.parseFont should parse the font family');

    const parsedQuoted = CanvasText.parseFont('20px "Vector Battle"');
    assert(parsedQuoted.fontSize === 20, 'CanvasText.parseFont should preserve quoted font sizes');
    assert(parsedQuoted.fontFamily === '"Vector Battle"', 'CanvasText.parseFont should preserve quoted font families');

    const nullRender = CanvasText.renderText(null, 'hello', 10, 20);
    assert(nullRender === null, 'CanvasText.renderText should return null without a context');

    const mockCtx = {
        saveCalls: 0,
        restoreCalls: 0,
        fillTextCalls: [],
        fillStyle: '',
        font: '',
        textAlign: '',
        textBaseline: '',
        save() {
            this.saveCalls += 1;
        },
        restore() {
            this.restoreCalls += 1;
        },
        fillText(text, x, y) {
            this.fillTextCalls.push({ text, x, y });
        },
        measureText() {
            return {
                width: 42,
                actualBoundingBoxAscent: 8,
                actualBoundingBoxDescent: 2
            };
        }
    };

    const singleLine = CanvasText.renderText(mockCtx, 'hello', 10, 20, {
        fontSize: 16,
        fontFamily: 'monospace',
        color: 'red',
        useDpr: false
    });
    assert(singleLine.x === 10 && singleLine.y === 20, 'CanvasText.renderText should report rendered coordinates');
    assert(mockCtx.saveCalls === 1 && mockCtx.restoreCalls === 1, 'CanvasText.renderText should preserve canvas state');
    assert(mockCtx.fillTextCalls.length === 1, 'CanvasText.renderText should draw one line of text');

    CanvasText.renderText(mockCtx, 'font-override', 12, 24, {
        font: 'bold 18px Segoe UI',
        useDpr: false
    });
    assert(mockCtx.font === 'bold 18px Segoe UI', 'CanvasText.renderText should allow a raw font override');

    const multiLine = CanvasText.renderMultilineText(mockCtx, ['line1', 'line2'], 15, 25, {
        fontSize: 12,
        lineHeight: 20,
        useDpr: false
    });
    assert(multiLine.length === 2, 'CanvasText.renderMultilineText should return one result per line');
    assert(mockCtx.fillTextCalls.length === 4, 'CanvasText.renderMultilineText should draw all provided lines');

    const centered = CanvasText.renderCenteredText(mockCtx, 'centered', 50, {
        centerX: 100,
        fontSize: 20,
        useDpr: false
    });
    assert(centered.x === 79, 'CanvasText.renderCenteredText should offset from center using measured width');
    assert(mockCtx.saveCalls === 4 && mockCtx.restoreCalls === 4, 'CanvasText.renderCenteredText should preserve canvas state');

    const centeredLines = CanvasText.renderCenteredMultilineText(mockCtx, ['a', 'b'], 10, {
        centerX: 60,
        fontSize: 10,
        lineHeight: 12,
        useDpr: false
    });
    assert(centeredLines.length === 2, 'CanvasText.renderCenteredMultilineText should draw one result per centered line');

    CanvasUtils.ctx = mockCtx;
    const sharedRender = CanvasText.renderText(CanvasUtils.ctx, 'shared', 5, 6, {
        fontSize: 12,
        useDpr: false
    });
    assert(sharedRender.x === 5 && sharedRender.y === 6, 'CanvasText.renderText should use the shared canvas context when one is available');

    const sharedMetrics = CanvasText.calculateTextMetrics(CanvasUtils.ctx, 'shared', 12, 'Arial');
    assert(sharedMetrics.width === 42 && sharedMetrics.height === 10, 'CanvasText.calculateTextMetrics should use the shared canvas context when one is available');

    CanvasUtils.ctx = null;
}
