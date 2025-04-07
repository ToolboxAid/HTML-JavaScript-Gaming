// ToolboxAid.com
// David Quesenberry
// 03/24/2025
// homeFly.js

import GameObject from './gameObject.js';

class HomeFly extends GameObject {
    // - Type (homeFly)
    // - Sprite management
    // - Position updates

    constructor(x, y,
        velocityX, velocityY) {
        const width = 36;
        const height = 36;

        super(x, y,
            './assets/images/home_danger_sprite_48w_48h_5f.png',//spritePath
            48*4, 0,//spriteX, spriteY,
            width, height,//spriteWidth, spriteHeight,
            1.5,//pixelSize,
            'black',//transparentColor,
            'homeFly',//gameObjectType, 
            velocityX, velocityY
        );

        this.type = 'homeFly';
        this.frame = Math.floor(Math.random() * 4);
        this.counter = 0;

        this.attachedTo = null;
        //console.error('HomeFly created: ' + JSON.stringify(this));
    }

    update(deltaTime) {

    }

}

export default HomeFly;
