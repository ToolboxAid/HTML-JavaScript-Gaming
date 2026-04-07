/*
Toolbox Aid
David Quesenberry
03/21/2026
main.js
*/
import Engine from '../../../src/engine/core/Engine.js';
import IntroScene from './IntroScene.js';
import PlayScene from './PlayScene.js';
import { InputService } from '../../../src/engine/input/index.js';
import { SceneTransition, TransitionScene } from '../../../src/engine/scenes/index.js';
import { Theme, ThemeTokens } from '../../../src/engine/theme/index.js';

const theme = new Theme(ThemeTokens);
theme.applyDocumentTheme();

const input = new InputService();
const canvas = document.getElementById('game');
const engine = new Engine({
    canvas,
    width: 960,
    height: 540,
    fixedStepMs: 1000 / 60,
    input,
});

const createTransitionScene = ({ fromScene, toScene }) => new TransitionScene({
    fromScene,
    toScene,
    transition: new SceneTransition({ durationSeconds: 0.35 }),
});

const createIntroScene = () => new IntroScene({ createPlayScene, createTransitionScene });
const createPlayScene = () => new PlayScene({ createIntroScene, createTransitionScene });

engine.setScene(createIntroScene());
engine.start();
