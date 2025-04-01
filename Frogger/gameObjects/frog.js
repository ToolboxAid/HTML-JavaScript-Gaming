import ObjectPNG from '../../scripts/objectPNG.js';
import CanvasUtils from '../../scripts/canvas.js';

/*
{
  "metadata": {
    "sprite": "sprite starter json",
    "spriteGridSize": 15.7,
    "spritePixelSize": 7,
    "palette": "default",
    "framesPerSprite": "18"
  },
  "layers": [
    {
      "metadata": {
        "spriteimage": "frog-zoom.png",
        "imageX": -263,
        "imageY": 3,
        "imageScale": 1
      },
      "data": [
        "ØdØØØØØØØØdØØdØØØØØØdØØØØØØØØØØØØØ",
        "ddØØWdWWØØddddØWdWWØddØdØØWdWWØØdØ",
        "ØdØÄdWWdÄØdØØdÄdWWdÄdØddØÄdWWdÄØdd",
        "ØdØddWWddØdØØdddWWdddØØdØddWWddØdØ",
        "ØØdWWWWWddØØØdWWWWWWdØØddWWWWWWddØ",
        "ØØØWdWWWWØØØØØWdWWWWØØØØØWdWWWWØØØ",
        "ØØØdddddWØØØØØWdWWWWØØØddWdWWWWddØ",
        "ØØØdWdWddØØØØØdWdWWdØØØdØdWdWWdØdØ",
        "ØØdddWWdddØØØdddWWdddØddØØdWWdØØdd",
        "ØddØØØØØØddØddØØØØØØddØdØØØØØØØØdØ",
        "ØdØØØØØØØØdØØddØØØØddØØØØØØØØØØØØØ",
        "ddØØØØØØØØddØØdØØØØdØØØØØØØØØØØØØØ",
        "ØdØØØØØØØØdØØØØdØØdØØØØØØØØØØØØØØØ",
        "ØØØØØØØØØØØØØØØdØØdØØØØØØØØØØØØØØØ"
      ]
    }
  ]
}
*/


class Frog extends ObjectPNG {

    // Debug mode enabled via URL parameter: game.html?frog
    static DEBUG = new URLSearchParams(window.location.search).has('frog');

    constructor(x, y, spriteSheet, pixelSize) {
        // Define sprite dimensions and initial position in sprite sheet

        //  1  2  3 image position x
        // 18 42 66 home x start positions
        // home x end position
        // 30 53 77 home x end positions

        //  1  2  3  4   5 image position y
        // 10 50
        const imageNumX = 0;
        const imageNumY = 0;
        const spriteX = 18 +(imageNumX * (42-18));
        const spriteY = 18;
        const spriteWidth = 12;
        const spriteHeight = 12;

        super(x, y,spriteSheet, spriteX, spriteY, spriteWidth, spriteHeight, pixelSize, 0,0);
     // super(x, y, spriteSheet, spriteX, spriteY, spriteWidth, spriteHeight, pixelSize, '#000047FF');

        // Frog state
        this.direction = 'up';
        this.isMoving = false;
        this.moveDistance = 32;
        this.lives = 3;
        this.score = 0;
        this.homeSpots = new Array(5).fill(false); // 5 home positions
    }

    move(direction) {
        if (this.isMoving || !this.isAlive()) return;

        // Update sprite sheet row based on direction
        switch (direction) {
            case 'up':
                this.y -= this.moveDistance;
                this.spriteY = 0;
                break;
            case 'down':
                this.y += this.moveDistance;
                this.spriteY = 32;
                break;
            case 'left':
                this.x -= this.moveDistance;
                this.spriteY = 64;
                break;
            case 'right':
                this.x += this.moveDistance;
                this.spriteY = 96;
                break;
        }

        // Bound checking
        this.x = Math.max(0, Math.min(this.x, CanvasUtils.width - this.spriteWidth));
        this.y = Math.max(0, Math.min(this.y, CanvasUtils.height - this.spriteHeight));

        // Update state
        this.direction = direction;
        this.isMoving = true;

        // Animation cooldown
        setTimeout(() => {
            this.isMoving = false;
        }, 100);
    }

    reset() {
        // Reset position and state
        this.x = CanvasUtils.width / 2 - this.spriteWidth / 2;
        this.y = CanvasUtils.height - this.spriteHeight - 16;
        this.direction = 'up';
        this.isMoving = false;
        this.spriteY = 0; // Reset to up-facing sprite
    }

    loseLife() {
        this.lives--;
        if (this.lives <= 0) {
            this.setIsDead();
        } else {
            this.reset();
        }
    }

    reachHome(spotIndex) {
        if (spotIndex >= 0 && spotIndex < 5 && !this.homeSpots[spotIndex]) {
            this.homeSpots[spotIndex] = true;
            this.score += 100;
            this.reset();
            return true;
        }
        return false;
    }

    update(deltaTime) {
        if (!this.isAlive()) return;
        super.update(deltaTime);
        //this.rotation = this.rotation+0.1;
    }

    destroy() {
        this.homeSpots = null;
        this.direction = null;
        this.isMoving = null;
        this.moveDistance = null;
        this.lives = null;
        this.score = null;
        super.destroy();
    }
}

export default Frog;