import { WorldScreenTransformService } from "./WorldScreenTransformService.js";

export {
  CANONICAL_WORLD_TO_SCREEN_SCALE,
  WorldScreenTransformService
} from "./WorldScreenTransformService.js";

export function createWorldScreenTransform(options = {}) {
  return new WorldScreenTransformService(options);
}
