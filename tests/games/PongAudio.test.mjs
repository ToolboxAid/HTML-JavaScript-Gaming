/*
Toolbox Aid
David Quesenberry
03/24/2026
PongAudio.test.mjs
*/
import assert from 'node:assert/strict';
import PongScene from '../../games/Pong/game/PongScene.js';

function createInput(codesPressed = []) {
  const pressed = new Set(codesPressed);
  return {
    isDown() {
      return false;
    },
    isPressed(code) {
      return pressed.has(code);
    },
    getGamepad() {
      return null;
    },
  };
}

function createAudioSpy() {
  const calls = [];
  return {
    calls,
    playOneShot(id) {
      calls.push(id);
      return true;
    },
  };
}

function createScene(audioSpy, input = createInput()) {
  const scene = new PongScene();
  scene.enter({
    input,
    audio: audioSpy,
  });
  return scene;
}

export async function run() {
  const serveAudio = createAudioSpy();
  const serveScene = createScene(serveAudio, createInput(['Enter']));
  serveScene.update(0.016, { input: createInput(['Enter']) });
  assert.equal(serveAudio.calls.includes('pong:serve'), true);

  const paddleAudio = createAudioSpy();
  const paddleScene = createScene(paddleAudio);
  paddleScene.roundOver = false;
  paddleScene.ball.x = paddleScene.leftPaddle.x + paddleScene.leftPaddle.width + paddleScene.ball.radius - 1;
  paddleScene.ball.y = paddleScene.leftPaddle.y + (paddleScene.leftPaddle.height * 0.5);
  paddleScene.ball.vx = -320;
  paddleScene.ball.vy = 0;
  paddleScene.update(1 / 60, { input: createInput() });
  assert.equal(paddleAudio.calls.includes('pong:paddle-hit'), true);

  const wallAudio = createAudioSpy();
  const wallScene = createScene(wallAudio);
  wallScene.roundOver = false;
  wallScene.ball.y = 70;
  wallScene.ball.vy = -240;
  wallScene.ball.vx = 0;
  wallScene.update(1 / 60, { input: createInput() });
  assert.equal(wallAudio.calls.includes('pong:wall-hit'), true);

  const scoreAudio = createAudioSpy();
  const scoreScene = createScene(scoreAudio);
  scoreScene.roundOver = false;
  scoreScene.ball.x = 950;
  scoreScene.ball.vx = 220;
  scoreScene.ball.vy = 0;
  scoreScene.update(1 / 60, { input: createInput() });
  assert.equal(scoreAudio.calls.includes('pong:score'), true);
}
