import ObjectValidation from './objectValidation.js';

class ImageAssetCache {
    static #transparentImagePromises = new Map();

    static getKey(spritePath, transparentColor = 'black') {
        return `${spritePath}::${transparentColor}`;
    }

    static loadTransparentSprite(spritePath, transparentColor = 'black') {
        ObjectValidation.nonEmptyString(spritePath, 'spritePath');
        ObjectValidation.nonEmptyString(transparentColor, 'transparentColor');

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

    static #loadTransparentSprite(spritePath, transparentColor) {
        return new Promise((resolve, reject) => {
            const png = new Image();

            png.onload = () => {
                if (png.width === 0 || png.height === 0) {
                    reject(new Error('Loaded image has invalid dimensions.'));
                    return;
                }

                try {
                    resolve(this.makeTransparent(png, transparentColor));
                } catch (error) {
                    reject(error);
                }
            };

            png.onerror = () => {
                reject(new Error(`Error loading sprite: ${spritePath}`));
            };

            png.src = spritePath;
        });
    }

    static makeTransparent(png, transparentColor) {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = png.width;
        tempCanvas.height = png.height;

        const tempCtx = tempCanvas.getContext('2d');
        tempCtx.drawImage(png, 0, 0);

        const imageData = tempCtx.getImageData(0, 0, png.width, png.height);
        const data = imageData.data;

        const tempDiv = document.createElement('div');
        tempDiv.style.backgroundColor = transparentColor;
        document.body.appendChild(tempDiv);

        const colorStyle = window.getComputedStyle(tempDiv).backgroundColor;
        document.body.removeChild(tempDiv);

        const matches = colorStyle.match(/\d+/g);
        if (!matches || matches.length < 3) {
            throw new Error(`Unable to parse transparent color: ${transparentColor}`);
        }

        const [r, g, b] = matches.map(Number);

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
}

export default ImageAssetCache;
