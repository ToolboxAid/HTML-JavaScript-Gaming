// ToolboxAid.com
// David Quesenberry
// 10/24/2024
// objectPNG.js

import CanvasUtils from './canvas.js';
import ObjectKillable from './objectKillable.js';
import SystemUtils from './utils/systemUtils.js';
import AngleUtils from './math/angleUtils.js';
import ObjectValidation from './utils/objectValidation.js';
import ObjectDebug from './utils/objectDebug.js';

class ObjectPNG extends ObjectKillable {
    static DEBUG = new URLSearchParams(window.location.search).has('objectPNG');

    static Flip = Object.freeze({
        NONE: 'none',
        HORIZONTAL: 'horizontal',
        VERTICAL: 'vertical',
        BOTH: 'both'
    });

    constructor(
        x = 0,
        y = 0,
        spritePath,
        spriteX = 0,
        spriteY = 0,
        frameWidth = 50,
        frameHeight = 50,
        pixelSize = 1,
        transparentColor = 'black',
        velocityX = 0,
        velocityY = 0,
        frameCount = 1,
        framesPerRow = 1,
        frameDelay = 6,
        frameOffsets = null
    ) {
        ObjectValidation.nonEmptyString(spritePath, 'spritePath');
        ObjectValidation.finiteNumber(spriteX, 'spriteX');
        ObjectValidation.finiteNumber(spriteY, 'spriteY');
        ObjectValidation.positiveNumber(frameWidth, 'frameWidth');
        ObjectValidation.positiveNumber(frameHeight, 'frameHeight');
        ObjectValidation.positiveNumber(pixelSize, 'pixelSize');
        ObjectValidation.finiteNumber(velocityX, 'velocityX');
        ObjectValidation.finiteNumber(velocityY, 'velocityY');
        ObjectValidation.positiveNumber(frameCount, 'frameCount');
        ObjectValidation.positiveNumber(framesPerRow, 'framesPerRow');
        ObjectValidation.positiveNumber(frameDelay, 'frameDelay');

        // Keep inherited width/height as raw frame dimensions
        super(
            x,
            y,
            frameWidth,
            frameHeight,
            velocityX,
            velocityY
        );

        this.spritePath = spritePath;
        this.spriteX = spriteX;
        this.spriteY = spriteY;

        this.frameWidth = frameWidth;
        this.frameHeight = frameHeight;
        this.pixelSize = pixelSize;

        this.frameCount = Math.floor(frameCount);
        this.framesPerRow = Math.floor(framesPerRow);
        this.frameDelay = Math.floor(frameDelay);

        this.transparentColor = transparentColor;

        this.boundWidth = this.frameWidth * this.pixelSize;
        this.boundHeight = this.frameHeight * this.pixelSize;

        this.flip = ObjectPNG.Flip.NONE;
        this.rotation = 0;

        this.png = null;
        this.isLoaded = false;
        this.loadError = null;

        this.frameOffsets = Array.isArray(frameOffsets) ? frameOffsets : null;

        ObjectPNG.loadSprite(spritePath, transparentColor)
            .then((png) => {
                this.png = png;
                this.isLoaded = true;

                ObjectDebug.log(ObjectPNG.DEBUG, 'Loaded PNG sprite', {
                    path: spritePath,
                    imageWidth: png.width,
                    imageHeight: png.height,
                    frameWidth: this.frameWidth,
                    frameHeight: this.frameHeight
                });
            })
            .catch((error) => {
                this.loadError = error;
                this.isLoaded = false;
                console.error(`Failed to load sprite: ${spritePath}`, error);
            });
    }

    setFlip(flipType = ObjectPNG.Flip.NONE) {
        ObjectValidation.nonEmptyString(flipType, 'flipType');

        const normalized = flipType.toLowerCase();
        ObjectValidation.oneOf(normalized, 'flipType', Object.values(ObjectPNG.Flip));

        this.flip = normalized;
    }

    setRotation(rotationDegrees = 0) {
        ObjectValidation.finiteNumber(rotationDegrees, 'rotationDegrees');
        this.rotation = AngleUtils.toRadians(rotationDegrees);
    }

    setFrame(frameIndex = 0) {
        ObjectValidation.finiteNumber(frameIndex, 'frameIndex');

        if (!Number.isInteger(frameIndex)) {
            throw new Error('frameIndex must be an integer.');
        }

        if (frameIndex < 0 || frameIndex >= this.frameCount) {
            throw new Error(`frameIndex out of range: ${frameIndex}`);
        }

        this.currentFrameIndex = frameIndex;
        this.delayCounter = 0;
    }

    setFrameOffsets(frameOffsets) {
        if (frameOffsets !== null && !Array.isArray(frameOffsets)) {
            throw new Error('frameOffsets must be null or an array.');
        }

        this.frameOffsets = frameOffsets;
    }

    getFrameOffset(frameIndex = this.currentFrameIndex) {
        if (!this.frameOffsets || !this.frameOffsets[frameIndex]) {
            return { x: 0, y: 0 };
        }

        const offset = this.frameOffsets[frameIndex];
        const offsetX = Number.isFinite(offset?.x) ? offset.x : 0;
        const offsetY = Number.isFinite(offset?.y) ? offset.y : 0;

        return { x: offsetX, y: offsetY };
    }

    getCurrentSourceRect() {
        const frameIndex = this.currentFrameIndex || 0;
        const col = frameIndex % this.framesPerRow;
        const row = Math.floor(frameIndex / this.framesPerRow);

        return {
            sx: this.spriteX + (col * this.frameWidth),
            sy: this.spriteY + (row * this.frameHeight),
            sw: this.frameWidth,
            sh: this.frameHeight
        };
    }

    advanceFrame() {
        if (this.frameCount <= 1) {
            return;
        }

        this.currentFrameIndex++;
        if (this.currentFrameIndex >= this.frameCount) {
            this.currentFrameIndex = 0;
        }
    }

    handleAliveStatus(deltaTime, incFrame = false) {
        this.x += this.velocityX * deltaTime;
        this.y += this.velocityY * deltaTime;

        if (this.frameCount <= 1) {
            return;
        }

        if (incFrame) {
            this.advanceFrame();
            this.delayCounter = 0;
            return;
        }

        this.delayCounter++;
        if (this.delayCounter >= this.frameDelay) {
            this.delayCounter = 0;
            this.advanceFrame();
        }
    }

    handleDyingStatus(deltaTime, incFrame = false) {
        if (this.frameCount <= 1) {
            this.setIsDead();
            return;
        }

        if (incFrame) {
            this.currentFrameIndex++;
        } else {
            this.delayCounter++;
            if (this.delayCounter >= this.frameDelay) {
                this.delayCounter = 0;
                this.currentFrameIndex++;
            }
        }

        if (this.currentFrameIndex >= this.frameCount) {
            this.setIsDead();
        }
    }

    handleOtherStatus(deltaTime, incFrame = false) {
        // no-op by default
    }

    handleDeadStatus(deltaTime, incFrame = false) {
        // no-op
    }

    static async loadSprite(spritePath, transparentColor = 'black') {
        return new Promise((resolve, reject) => {
            const png = new Image();

            png.onload = () => {
                if (png.width === 0 || png.height === 0) {
                    reject(new Error('Loaded image has invalid dimensions.'));
                    return;
                }

                try {
                    const transparentPng = ObjectPNG.makeTransparent(png, transparentColor);
                    resolve(transparentPng);
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

    drawAllFramesPreview(previewX = 10, previewY = 10, scale = 2, padding = 4) {
        if (!this.png || !this.isLoaded) {
            return;
        }

        const totalFrames = this.frameCount || 1;
        const cols = this.framesPerRow || 1;
        const rows = Math.ceil(totalFrames / cols);

        const cellW = this.frameWidth * scale;
        const cellH = this.frameHeight * scale;

        CanvasUtils.ctx.save();

        for (let frameIndex = 0; frameIndex < totalFrames; frameIndex++) {
            const srcCol = frameIndex % cols;
            const srcRow = Math.floor(frameIndex / cols);

            const sx = this.spriteX + (srcCol * this.frameWidth);
            const sy = this.spriteY + (srcRow * this.frameHeight);

            const drawCol = frameIndex % cols;
            const drawRow = Math.floor(frameIndex / cols);

            const dx = previewX + drawCol * (cellW + padding);
            const dy = previewY + drawRow * (cellH + padding);

            CanvasUtils.ctx.drawImage(
                this.png,
                sx,
                sy,
                this.frameWidth,
                this.frameHeight,
                dx,
                dy,
                cellW,
                cellH
            );

            CanvasUtils.ctx.strokeStyle = '#666666';
            CanvasUtils.ctx.lineWidth = 1;
            CanvasUtils.ctx.strokeRect(dx, dy, cellW, cellH);

            CanvasUtils.ctx.fillStyle = 'white';
            CanvasUtils.ctx.font = '10px Arial';
            CanvasUtils.ctx.textAlign = 'left';
            CanvasUtils.ctx.fillText(`${frameIndex}`, dx + 2, dy + 11);

            if (frameIndex === this.currentFrameIndex) {
                CanvasUtils.ctx.strokeStyle = 'yellow';
                CanvasUtils.ctx.lineWidth = 2;
                CanvasUtils.ctx.strokeRect(dx - 1, dy - 1, cellW + 2, cellH + 2);
            }
        }

        CanvasUtils.ctx.fillStyle = 'white';
        CanvasUtils.ctx.font = '12px Arial';
        CanvasUtils.ctx.textAlign = 'left';
        CanvasUtils.ctx.fillText(
            `PNG Frames: current=${this.currentFrameIndex}`,
            previewX,
            previewY + rows * (cellH + padding) + 14
        );

        CanvasUtils.ctx.restore();
    }

    drawSheetPreview(previewX = 10, previewY = 150, scale = 1) {
        if (!this.png || !this.isLoaded) {
            return;
        }

        console.log('drawSheetPreview rect', {
            frameWidth: this.frameWidth,
            frameHeight: this.frameHeight,
            spritePath: this.spritePath,
            type: this.type
        });

        const sheetW = this.png.width * scale;
        const sheetH = this.png.height * scale;

        // Manual-sheet mode debug:
        // classes like TurtleSink move spriteX directly
        const debugFrameIndex = this.frameWidth > 0
            ? Math.floor(this.spriteX / this.frameWidth)
            : 0;

        const { sx, sy, sw, sh } = this.getCurrentSourceRect();

        CanvasUtils.ctx.save();

        CanvasUtils.ctx.drawImage(
            this.png,
            previewX,
            previewY,
            sheetW,
            sheetH
        );

        CanvasUtils.ctx.strokeStyle = 'yellow';
        CanvasUtils.ctx.lineWidth = 2;
        CanvasUtils.ctx.strokeRect(
            previewX + sx * scale,
            previewY + sy * scale,
            sw * scale,
            sh * scale
        );

        CanvasUtils.ctx.fillStyle = 'white';
        CanvasUtils.ctx.font = '12px Arial';
        CanvasUtils.ctx.fillText(`sheet frame=${debugFrameIndex}`, previewX, previewY - 6);

        CanvasUtils.ctx.restore();
    }

    draw(offsetX = 0, offsetY = 0) {
        if (this.isDestroyed || this.isDead()) {
            return;
        }

        if (!this.isLoaded || !this.png || !this.png.complete) {
            if (ObjectPNG.DEBUG && this.loadError) {
                console.warn('Sprite failed to load:', this.loadError);
            }
            return;
        }

        try {
            const scaledWidth = Math.round(this.frameWidth * this.pixelSize);
            const scaledHeight = Math.round(this.frameHeight * this.pixelSize);

            const frameOffset = this.getFrameOffset(this.currentFrameIndex);

            const newX = Math.round(this.x + offsetX + (frameOffset.x * this.pixelSize));
            const newY = Math.round(this.y + offsetY + (frameOffset.y * this.pixelSize));

            // Manual sprite-sheet mode:
            // draw uses spriteX/spriteY directly
            const { sx, sy, sw, sh } = this.getCurrentSourceRect();

            ObjectDebug.log(ObjectPNG.DEBUG, 'ObjectPNG frame debug', {
                spritePath: this.spritePath,
                spriteX: this.spriteX,
                spriteY: this.spriteY,
                frameWidth: this.frameWidth,
                frameHeight: this.frameHeight,
                currentFrameIndex: this.currentFrameIndex,
                sourceRect: { sx, sy, sw, sh },
                destRect: {
                    x: newX,
                    y: newY,
                    width: scaledWidth,
                    height: scaledHeight
                },
                frameOffset
            });

            CanvasUtils.ctx.save();

            if (this.rotation === 0 && this.flip === ObjectPNG.Flip.NONE) {
                CanvasUtils.ctx.drawImage(
                    this.png,
                    sx,
                    sy,
                    sw,
                    sh,
                    newX,
                    newY,
                    scaledWidth,
                    scaledHeight
                );
            } else {
                const centerX = newX + scaledWidth / 2;
                const centerY = newY + scaledHeight / 2;

                CanvasUtils.ctx.translate(centerX, centerY);

                switch (this.flip) {
                    case ObjectPNG.Flip.HORIZONTAL:
                        CanvasUtils.ctx.scale(-1, 1);
                        break;
                    case ObjectPNG.Flip.VERTICAL:
                        CanvasUtils.ctx.scale(1, -1);
                        break;
                    case ObjectPNG.Flip.BOTH:
                        CanvasUtils.ctx.scale(-1, -1);
                        break;
                    default:
                        break;
                }

                CanvasUtils.ctx.rotate(this.rotation);

                CanvasUtils.ctx.drawImage(
                    this.png,
                    sx,
                    sy,
                    sw,
                    sh,
                    -scaledWidth / 2,
                    -scaledHeight / 2,
                    scaledWidth,
                    scaledHeight
                );
            }

            if (ObjectPNG.DEBUG) {
                this.drawSheetPreview(100, 350, 1);
            }

            CanvasUtils.ctx.restore();
        } catch (error) {
            console.error('Draw error:', error);
        }
    }

    destroy() {
        if (this.isDestroyed) {
            ObjectDebug.warn(ObjectPNG.DEBUG, 'ObjectPNG already destroyed');
            return false;
        }

        ObjectDebug.log(ObjectPNG.DEBUG, `Destroying ${SystemUtils.getObjectType(this)}`, {
            position: { x: this.x, y: this.y },
            sprite: {
                path: this.spritePath,
                loaded: this.isLoaded,
                pixelSize: this.pixelSize,
                spriteX: this.spriteX,
                spriteY: this.spriteY
            }
        });

        if (this.png) {
            this.png.onload = null;
            this.png.onerror = null;
        }

        this.destroyProperties([
            'png',
            'isLoaded',
            'loadError',
            'spritePath',
            'spriteX',
            'spriteY',
            'frameWidth',
            'frameHeight',
            'pixelSize',
            'transparentColor',
            'boundWidth',
            'boundHeight',
            'flip',
            'rotation',
            'frameCount',
            'framesPerRow',
            'frameDelay',
            'frameOffsets'
        ]);

        return super.destroy();
    }
}

export default ObjectPNG;