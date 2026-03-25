/*
Toolbox Aid
David Quesenberry
03/24/2026
SpaceInvadersFont.test.mjs
*/
import assert from 'node:assert/strict';
import { FONT_8X8, hasGlyphsForText } from '../../games/SpaceInvaders/game/font8x8.js';

function testFontProvidesCoreHudAndOverlayCharacters() {
  const requiredStrings = [
    'PLAYER 1',
    'HI-SCORE',
    'PLAYER 2',
    '0000',
    'LEFT/RIGHT MOVE SPACE FIRE P PAUSE',
    'SPACE INVADERS',
    'PRESS SPACE OR ENTER TO START.',
    'GAME OVER',
    'PRESS SPACE OR ENTER TO RESTART.',
    'PAUSED',
    'PRESS P TO RESUME OR X FOR MENU.',
    'WAVE 9',
  ];

  requiredStrings.forEach((text) => {
    assert.equal(hasGlyphsForText(text), true, `Missing glyph coverage for "${text}"`);
  });
}

function testGlyphsAreEightByEightBitmaps() {
  Object.entries(FONT_8X8).forEach(([character, glyph]) => {
    assert.equal(glyph.length, 8, `${character} should have 8 rows`);
    glyph.forEach((row) => {
      assert.equal(row.length, 8, `${character} rows should be 8 columns wide`);
      assert.match(row, /^[01]{8}$/);
    });
  });
}

export function run() {
  testFontProvidesCoreHudAndOverlayCharacters();
  testGlyphsAreEightByEightBitmaps();
}
