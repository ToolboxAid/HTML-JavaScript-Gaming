// ToolboxAid.com
// David Quesenberry
// 03/24/2025
// homeFrog.js

import GameObject from './gameObject.js';

class HomeFrog extends GameObject {
    // - Type (homeFrog)
    // - Sprite management
    // - Position updates

    constructor(x, y,
        velocityX, velocityY) {
        const width = 48;
        const height = 48;

        super(x, y,
            './assets/images/home_danger_sprite_48w_48h_5f.png',//spritePath
            width*2, 0,//spriteX, spriteY,
            width, height,//spriteWidth, spriteHeight,
            1.25,//pixelSize,
            'black',//transparentColor,
            'homeFrog',//gameObjectType, 
            velocityX, velocityY
        );

        this.type = 'homeFrog';
        //this.frame = Math.floor(Math.random() * 4);
        this.counter = 0;

        //this.attachedTo = null;
        //console.error('HomeFrog created: ' + JSON.stringify(this));
    }

    setBite(){
        this.spriteX += this.width;
    }

    update(deltaTime) {

    }

}

export default HomeFrog;
