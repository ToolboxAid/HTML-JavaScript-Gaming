export default class BouncerScene {
  constructor() {
    this.x = 100;
    this.y = 100;
    this.vx = 120;
    this.vy = 90;
    this.size = 20;
  }

  update(dt, engine) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;

    const width = engine.canvas.width;
    const height = engine.canvas.height;

    if (this.x < 0 || this.x + this.size > width) {
      this.vx *= -1;
    }

    if (this.y < 0 || this.y + this.size > height) {
      this.vy *= -1;
    }
  }

  render(renderer, engine) {
    const width = engine.canvas.width;
    const height = engine.canvas.height;

    renderer.clear();

    renderer.drawRect(this.x, this.y, this.size, this.size, "#4CAF50");

    renderer.drawText(
      "Sample01: Bouncer (Fixed)",
      20,
      30,
      "#ffffff",
      "16px monospace"
    );
  }
}
