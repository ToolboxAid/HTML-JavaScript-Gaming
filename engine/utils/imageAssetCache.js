import StringValidation from './stringValidation.js';

class ImageAssetCache {
    static #transparentImagePromises = new Map();
    static #rawImagePromises = new Map();

    static getKey(spritePath, transparentColor = 'black') {
        return `${spritePath}::${transparentColor}`;
    }

    static loadImage(spritePath) {
        StringValidation.nonEmptyString(spritePath, 'spritePath');

        if (!this.#rawImagePromises.has(spritePath)) {
            const promise = this.#loadImage(spritePath)
                .catch((error) => {
                    this.#rawImagePromises.delete(spritePath);
                    throw error;
                });

            this.#rawImagePromises.set(spritePath, promise);
        }

        return this.#rawImagePromises.get(spritePath);
    }

    static loadTransparentSprite(spritePath, transparentColor = 'black') {
        StringValidation.nonEmptyString(spritePath, 'spritePath');

        if (typeof transparentColor !== 'string' || transparentColor.trim() === '') {
            return this.loadImage(spritePath);
        }

        const cacheKey = this.getKey(spritePath, transparentColor);

        if (!this.#transparentImagePromises.has(cacheKey)) {
            const promise = this.#loadTransparentSprite(spritePath, transparentColor)
                .catch((error) => {
                    this.#transparentImagePromises.delete(cacheKey);
                    throw error;
                });

            this.#transparentImagePromises.set(cacheKey, promise);
        }

        return this.#transparentImagePromises.get(cacheKey);
    }

    static #loadImage(spritePath) {
        if (typeof Image === 'undefined') {
            throw new Error('ImageAssetCache.loadImage requires a browser Image implementation.');
        }

        return new Promise((resolve, reject) => {
            const png = new Image();

            png.onload = () => {
                if (png.width === 0 || png.height === 0) {
                    reject(new Error('Loaded image has invalid dimensions.'));
                    return;
                }

                resolve(png);
            };

            png.onerror = () => {
                reject(new Error(`Error loading sprite: ${spritePath}`));
            };

            png.src = spritePath;
        });
    }

    static #loadTransparentSprite(spritePath, transparentColor) {
        return this.#loadImage(spritePath).then((png) => this.makeTransparent(png, transparentColor));
    }

    static #createCanvasContext(width, height, purpose) {
        if (typeof document === 'undefined') {
            throw new Error(`ImageAssetCache.${purpose} requires browser canvas support.`);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
            throw new Error(`Unable to create 2D canvas context for ${purpose}.`);
        }

        return { canvas, ctx };
    }

    static makeTransparent(png, transparentColor) {
        if (typeof Image === 'undefined') {
            throw new Error('ImageAssetCache.makeTransparent requires browser canvas and Image support.');
        }

        const { canvas: tempCanvas, ctx: tempCtx } = this.#createCanvasContext(
            png.width,
            png.height,
            'image transparency processing'
        );

        tempCtx.drawImage(png, 0, 0);

        const imageData = tempCtx.getImageData(0, 0, png.width, png.height);
        const data = imageData.data;
        const [r, g, b] = this.resolveColorChannels(transparentColor);

        for (let i = 0; i < data.length; i += 4) {
            if (data[i] === r && data[i + 1] === g && data[i + 2] === b) {
                data[i + 3] = 0;
            }
        }

        tempCtx.putImageData(imageData, 0, 0);

        const transparentImage = new Image();
        transparentImage.src = tempCanvas.toDataURL();

        return transparentImage;
    }

    static resolveColorChannels(color) {
        const { ctx: colorCtx } = this.#createCanvasContext(1, 1, 'color resolution');

        colorCtx.clearRect(0, 0, 1, 1);
        colorCtx.fillStyle = color;
        colorCtx.fillRect(0, 0, 1, 1);

        const pixel = colorCtx.getImageData(0, 0, 1, 1).data;
        return [pixel[0], pixel[1], pixel[2]];
    }
}

export default ImageAssetCache;
