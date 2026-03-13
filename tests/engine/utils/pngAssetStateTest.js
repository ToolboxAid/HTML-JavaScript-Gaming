// ToolboxAid.com
// David Quesenberry
// 03/12/2026
// pngAssetStateTest.js

import PngAssetState from '../../../engine/utils/pngAssetState.js';

export function testPngAssetState(assert) {
    const state = new PngAssetState();
    const target = {};

    state.applyTo(target);
    assert(target.png === null, 'applyTo should initialize png to null');
    assert(target.isLoaded === false, 'applyTo should initialize isLoaded to false');
    assert(target.loadError === null, 'applyTo should initialize loadError to null');

    const png = { width: 16, height: 16, onload() {}, onerror() {} };
    state.setLoaded(png);
    state.applyTo(target);
    assert(target.png === png, 'setLoaded should store png');
    assert(target.isLoaded === true, 'setLoaded should mark asset as loaded');
    assert(target.loadError === null, 'setLoaded should clear prior errors');

    const error = new Error('failed');
    state.setError(error);
    state.applyTo(target);
    assert(target.png === null, 'setError should clear png');
    assert(target.isLoaded === false, 'setError should clear loaded flag');
    assert(target.loadError === error, 'setError should keep the error');

    state.setLoaded(png);
    state.destroy(target);
    assert(target.png === null, 'destroy should clear target png');
    assert(target.isLoaded === null, 'destroy should clear target isLoaded');
    assert(target.loadError === null, 'destroy should clear target loadError');
}
