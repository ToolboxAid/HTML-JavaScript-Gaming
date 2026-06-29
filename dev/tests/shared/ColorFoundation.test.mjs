/*
Toolbox Aid
David Quesenberry
06/26/2026
ColorFoundation.test.mjs
*/
import assert from "node:assert/strict";
import {
  blendColors,
  clamp01,
  clampByte,
  contrastRatio,
  hexToRgb,
  hslToRgb,
  lerpColor,
  relativeLuminance,
  rgbToHex,
  rgbToHsl,
} from "../../../www/src/shared/color/color.js";

export function run() {
  assert.equal(clamp01(2), 1);
  assert.equal(clamp01(-1), 0);
  assert.equal(clampByte(260), 255);
  assert.equal(clampByte(12.4), 12);

  assert.deepEqual(hexToRgb("#369"), { r: 51, g: 102, b: 153 });
  assert.deepEqual(hexToRgb("#336699"), { r: 51, g: 102, b: 153 });
  assert.equal(rgbToHex({ r: 51, g: 102, b: 153 }), "#336699");
  assert.throws(() => hexToRgb("not-a-color"), TypeError);

  assert.deepEqual(rgbToHsl({ r: 255, g: 0, b: 0 }), { h: 0, s: 100, l: 50 });
  assert.deepEqual(hslToRgb({ h: 120, s: 100, l: 50 }), { r: 0, g: 255, b: 0 });
  assert.equal(rgbToHex(hslToRgb(rgbToHsl({ r: 51, g: 102, b: 153 }))), "#336699");

  assert.deepEqual(lerpColor({ r: 0, g: 0, b: 0 }, { r: 255, g: 255, b: 255 }, 0.5), {
    r: 128,
    g: 128,
    b: 128,
  });
  assert.equal(blendColors({ r: 255, g: 0, b: 0 }, { r: 0, g: 0, b: 255 }, 0.5), "#800080");

  assert.equal(relativeLuminance({ r: 0, g: 0, b: 0 }), 0);
  assert.equal(Number(relativeLuminance({ r: 255, g: 255, b: 255 }).toFixed(6)), 1);
  assert.equal(contrastRatio({ r: 0, g: 0, b: 0 }, { r: 255, g: 255, b: 255 }), 21);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  run();
}
