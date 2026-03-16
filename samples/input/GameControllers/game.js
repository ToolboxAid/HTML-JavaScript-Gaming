// ToolboxAid.com
// David Quesenberry
// 11/21/2024
// game.js - GameController Integration with Button States on Canvas

import Fullscreen from '../../../engine/core/fullscreen.js';
import GameControllers from '../../../engine/input/controller/gameControllers.js';

const canvas = document.getElementById('gameArea');
const ctx = canvas.getContext('2d');

const canvasConfig = {
    width: 480,
    height: 320,
    scale: 4 / 3,
};

const fullscreenConfig = {
    color: '#ed9700',
    font: '20px Segoe UI',
    text: 'Click the canvas to toggle fullscreen.',
    x: 92,
    y: 300
};

canvas.width = canvasConfig.width;
canvas.height = canvasConfig.height;

const PLAYER_COLORS = ['red', 'orange', 'yellow', 'green', 'blue', 'indigo', 'violet', 'cyan', 'brown', 'lime'];
const MAX_BUTTONS = 10;
const MAX_AXIS_ROWS = 4;
const TITLE_FONT = 'bold 9px Segoe UI';
const LABEL_FONT = '8px Segoe UI';
const PANEL_LAYOUT = Object.freeze({
    columns: 2,
    startX: 18,
    startY: 62,
    gapX: 230,
    gapY: 118
});
const players = [];
let animationFrameId = null;
let isDestroyed = false;

const gameControllers = new GameControllers();

function getPlayerPanelPosition(gameControllerIndex) {
    const column = gameControllerIndex % PANEL_LAYOUT.columns;
    const row = Math.floor(gameControllerIndex / PANEL_LAYOUT.columns);

    return {
        x: PANEL_LAYOUT.startX + (column * PANEL_LAYOUT.gapX),
        y: PANEL_LAYOUT.startY + (row * PANEL_LAYOUT.gapY)
    };
}

function createPlayer(gameControllerIndex) {
    const color = PLAYER_COLORS[gameControllerIndex % PLAYER_COLORS.length];
    const position = getPlayerPanelPosition(gameControllerIndex);

    players[gameControllerIndex] = {
        color,
        x: position.x,
        y: position.y,
        size: 8,
        width: 140,
        height: 36,
        buttonColors: Array(MAX_BUTTONS).fill('gray'),
        buttonLabels: Array(MAX_BUTTONS).fill(''),
        title: `P${gameControllerIndex + 1}`,
        subtitle: '',
        dPad: { left: false, right: false, up: false, down: false },
        axisValues: [],
    };
}

function resetPlayerButtons(player) {
    player.buttonColors = Array(MAX_BUTTONS).fill('gray');
    player.buttonLabels = Array(MAX_BUTTONS).fill('');
}

function gameUpdate() {
    gameControllers.update();

    players.forEach((_, playerIndex) => {
        if (!gameControllers.isConnected(playerIndex)) {
            players[playerIndex] = null;
        }
    });

    gameControllers.getTrackedControllerIndices().forEach((playerIndex) => {
        const controller = gameControllers.getControllerSnapshot(playerIndex);
        if (!controller) {
            players[playerIndex] = null;
            return;
        }

        if (!players[playerIndex]) {
            createPlayer(playerIndex);
        }

        const player = players[playerIndex];
        resetPlayerButtons(player);
        player.title = controller.shortName
            ? `P${playerIndex + 1} ${controller.shortName}`
            : `P${playerIndex + 1}`;
        player.subtitle = controller.id || '';
        controller.buttonEntries.forEach((buttonEntry) => {
            if (buttonEntry.index >= 0 && buttonEntry.index < MAX_BUTTONS) {
                player.buttonLabels[buttonEntry.index] = buttonEntry.name;
            }
        });
        controller.buttonsDown.forEach((button) => {
            if (button >= 0 && button < MAX_BUTTONS) {
                player.buttonColors[button] = player.color;
            }
        });

        let moveX = 0;
        let moveY = 0;
        player.dPad = controller.dPad;
        player.axisValues = controller.axisValues.slice(0, MAX_AXIS_ROWS);
        if (player.dPad.left) moveX = -1;
        if (player.dPad.right) moveX = 1;
        if (player.dPad.up) moveY = -1;
        if (player.dPad.down) moveY = 1;

        player.x += moveX;
        player.y += moveY;

        player.x = Math.max(-6, Math.min(canvas.width - player.width, player.x));
        player.y = Math.max(10, Math.min(canvas.height - player.height, player.y));
    });
}

function gameRender() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#f3d8ab';
    ctx.font = 'bold 12px Segoe UI';
    ctx.textAlign = 'center';
    ctx.fillText('Buttons highlight active inputs. Panels show mapped labels, d-pad state, and live axis values.', canvas.width / 2, 24);
    ctx.font = '10px Segoe UI';
    ctx.fillText('Each panel title uses the connected controller mapping name when available.', canvas.width / 2, 40);

    const hasVisiblePlayers = players.some(Boolean);
    if (!hasVisiblePlayers) {
        ctx.fillStyle = '#f3d8ab';
        ctx.font = 'bold 18px Segoe UI';
        ctx.textAlign = 'center';
        ctx.fillText('Connect a controller to begin.', canvas.width / 2, 132);
        ctx.font = '14px Segoe UI';
        ctx.fillText('Button presses, d-pad movement, and mapped axis values will appear here.', canvas.width / 2, 164);
        ctx.textAlign = 'start';
    }

    players.forEach((player, playerIndex) => {
        if (player) {
            const buttonsAcross = 5;
            const buttonSize = 12;
            const panelX = player.x - 8;
            const panelY = player.y - 22;
            const panelWidth = 178;
            const panelHeight = 64;
            ctx.fillStyle = 'rgba(14, 7, 40, 0.82)';
            ctx.fillRect(panelX, panelY, panelWidth, panelHeight);
            ctx.strokeStyle = player.color;
            ctx.lineWidth = 1.5;
            ctx.strokeRect(panelX, panelY, panelWidth, panelHeight);

            ctx.font = TITLE_FONT;
            ctx.fillStyle = player.color;
            ctx.fillText(player.title, player.x, player.y - 12);
            ctx.font = LABEL_FONT;
            ctx.fillStyle = '#f3d8ab';
            ctx.fillText(player.subtitle.slice(0, 26), player.x, player.y - 4);

            player.buttonColors.forEach((color, buttonIndex) => {
                const buttonX = player.x + player.size + 6 + (buttonIndex % buttonsAcross) * (buttonSize + 2);
                const buttonY = player.y + 7 + Math.floor(buttonIndex / buttonsAcross) * (buttonSize + 2);

                ctx.beginPath();
                ctx.arc(buttonX, buttonY, buttonSize / 2, 0, 2 * Math.PI);
                ctx.fillStyle = color;
                ctx.fill();
                ctx.strokeStyle = player.color;
                ctx.stroke();

                ctx.fillStyle = 'white';
                const buttonLabel = player.buttonLabels[buttonIndex] || buttonIndex;
                ctx.fillText(String(buttonLabel).slice(0, 3), buttonX - 4.5, buttonY + 2.5);
            });

            ctx.fillStyle = player.color;
            const infoX = player.x + (buttonsAcross * (buttonSize + 2)) + 20;
            ctx.fillText('dPad:', infoX, player.y + 10);
            const activeDirections = [];
            if (player.dPad.up) activeDirections.push('Up');
            if (player.dPad.down) activeDirections.push('Down');
            if (player.dPad.left) activeDirections.push('Left');
            if (player.dPad.right) activeDirections.push('Right');

            const dPadState = activeDirections.length > 0 ? activeDirections.join(', ') : 'None';
            ctx.fillText(dPadState, infoX + 22, player.y + 10);

            const decimals = 2;
            player.axisValues.forEach((axisEntry, axisIndex) => {
                const axisY = player.y + 18 + (axisIndex * 8);
                ctx.fillText(`${axisEntry.name}:`, infoX, axisY);
                ctx.fillText(axisEntry.value.toFixed(decimals), infoX + 42, axisY);
            });
        }
    });

    ctx.textAlign = 'start';
    Fullscreen.draw(ctx);
}

function gameLoop() {
    if (isDestroyed) {
        return;
    }

    gameUpdate();
    gameRender();
    animationFrameId = requestAnimationFrame(gameLoop);
}

function destroy() {
    if (isDestroyed) {
        return;
    }

    isDestroyed = true;

    if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
    }

    gameControllers.destroy();
    Fullscreen.destroy();
}

window.addEventListener('pagehide', destroy);
window.addEventListener('beforeunload', destroy);

await Fullscreen.init(fullscreenConfig, canvasConfig);
gameLoop();

