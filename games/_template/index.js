import { attractFlow } from "./flow/attract.js";
import { introFlow } from "./flow/intro.js";

export const templateFlow = Object.freeze({
  attract: attractFlow,
  intro: introFlow
});

export default templateFlow;
