import ObjectValidation from './objectValidation.js';

class ImageAssetCache {
    static #transparentImagePromises = new Map();
    static #rawImagePromises = new Map();

    static getKey(spritePath, transparentColor = 'black') {
        return `${spritePath}::${transparentColor}`;
    }

    static loadImage(spritePath) {
        ObjectValidation.nonEmptyString(spritePath, 'spritePath');

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
        ObjectValidation.nonEmptyString(spritePath, 'spritePath');

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

    static makeTransparent(png, transparentColor) {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = png.width;
        tempCanvas.height = png.height;

        const tempCtx = tempCanvas.getContext('2d');
        if (!tempCtx) {
            throw new Error('Unable to create 2D canvas context for image transparency processing.');
        }

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
        const colorCanvas = document.createElement('canvas');
        colorCanvas.width = 1;
        colorCanvas.height = 1;

        const colorCtx = colorCanvas.getContext('2d');
        if (!colorCtx) {
            throw new Error('Unable to create 2D canvas context for color resolution.');
        }

        colorCtx.clearRect(0, 0, 1, 1);
        colorCtx.fillStyle = color;
        colorCtx.fillRect(0, 0, 1, 1);

        const pixel = colorCtx.getImageData(0, 0, 1, 1).data;
        return [pixel[0], pixel[1], pixel[2]];
    }
}

export default ImageAssetCache;
