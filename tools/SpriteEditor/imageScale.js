// ToolboxAid.com
// David Quesenberry
// 01/20/2024
// imageScale.js

import { Message } from './message.js';

export class ImageScale {

    static value = 1.0;

    static setImageScale(value, jsonSprite, currentFrame) {
        if (typeof value === 'number' && !isNaN(value)) {
            this.value = 0;
            this.updateImageScale(value, jsonSprite, currentFrame);
        } else {
            Message.add(`'imageScale' value is not a valid number: ${value}`);
        }
    }

    static updateImageScale(value, jsonSprite, currentFrame) {
        if (typeof value === 'number' && !isNaN(value)) {

            this.value += value;
            if (this.value > 20.0) {
                this.value = 20.0;
                Message.add(`Max image scale reached: ${this.value}`);
            } else if (this.value < 0.01) {
                this.value = 0.01;
                Message.add(`Min image scale reached: ${this.value}`);
            }
            jsonSprite.layers[currentFrame].metadata.imageScale = this.value;
        } else {
            Message.add(`'imageScale' value is not a valid number: ${value}`);
        }
    }
}