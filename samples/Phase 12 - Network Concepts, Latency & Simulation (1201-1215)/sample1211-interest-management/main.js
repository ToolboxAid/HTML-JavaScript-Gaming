/*
Toolbox Aid
David Quesenberry
03/22/2026
main.js
*/
import Engine from '../../../engine/core/Engine.js';
import { Theme, ThemeTokens } from '../../../engine/theme/index.js';
import InterestManagementScene from './InterestManagementScene.js';

const theme = new Theme(ThemeTokens);
theme.applyDocumentTheme();

const canvas = document.getElementById('game');
const engine = new Engine({ canvas, width: 960, height: 540 });
engine.setScene(new InterestManagementScene());
engine.start();
