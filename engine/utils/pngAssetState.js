// ToolboxAid.com
// David Quesenberry
// 03/12/2026
// pngAssetState.js

import ObjectCleanup from './objectCleanup.js';

class PngAssetState {
    constructor() {
        this.png = null;
        this.isLoaded = false;
        this.loadError = null;
    }

    applyTo(target) {
        if (!target || typeof target !== 'object') {
            throw new Error('target must be an object.');
        }

        target.png = this.png;
        target.isLoaded = this.isLoaded;
        target.loadError = this.loadError;
    }

    setLoaded(png) {
        this.png = png;
        this.isLoaded = true;
        this.loadError = null;
    }

    setError(error) {
        this.png = null;
        this.isLoaded = false;
        this.loadError = error;
    }

    clearImageHandlers() {
        if (this.png) {
            this.png.onload = null;
            this.png.onerror = null;
        }
    }

    destroy(target = null) {
        this.clearImageHandlers();

        if (target) {
            ObjectCleanup.nullifyProperties(target, ['png', 'isLoaded', 'loadError']);
        }

        this.png = null;
        this.isLoaded = null;
        this.loadError = null;
    }
}

export default PngAssetState;
