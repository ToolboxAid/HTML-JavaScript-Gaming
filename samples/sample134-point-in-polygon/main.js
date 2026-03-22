/*
Toolbox Aid
David Quesenberry
03/22/2026
main.js
*/
import Engine from '../../engine/core/Engine.js';
import PointInPolygonScene from './PointInPolygonScene.js';
import { Theme, ThemeTokens } from '../../engine/theme/index.js';

const theme = new Theme(ThemeTokens);
theme.applyDocumentTheme();
const canvas = document.getElementById('game');
const engine = new Engine({ canvas, width: 960, height: 540 });
engine.setScene(new PointInPolygonScene());
engine.start();
