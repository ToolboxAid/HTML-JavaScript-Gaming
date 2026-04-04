import { bootAsteroids } from "../Asteroids/main.js";

export async function bootVectorArcadeSample(options = {}) {
  return bootAsteroids(options);
}

if (typeof document !== "undefined") {
  void bootVectorArcadeSample();
}
