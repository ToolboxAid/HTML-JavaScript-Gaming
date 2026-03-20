import Engine from '../../../engine/v2/core/Engine.js';
import IntroScene from './IntroScene.js';
import PlayScene from './PlayScene.js';
import { SceneTransition, TransitionScene } from '../../../engine/v2/scenes/index.js';
import { Theme, ThemeTokens } from '../../../engine/v2/theme/index.js';

const theme = new Theme(ThemeTokens);
theme.applyDocumentTheme();

const canvas = document.getElementById('game');
const engine = new Engine({
    canvas,
    width: 960,
    height: 540,
    fixedStepMs: 1000 / 60,
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
