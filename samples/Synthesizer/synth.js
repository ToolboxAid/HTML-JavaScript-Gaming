import SynthOrchestrator from './synthOrchestrator.js';
import { froggerSong } from './songs/froggerSong.js';
import { shellBeSongComingAroundMountain } from './songs/comingAroundMountainSong.js';
import { twinkleTwinkle } from './songs/twinkleTwinkleSong.js';
import { loveStoryInspiredPiano } from './pianoPlayer.js';

const getElementByNote = (note) =>
    note && document.querySelector(`[note="${note}"]`);

const orchestrator = new SynthOrchestrator(getElementByNote, 3);
const keys = orchestrator.getKeyMap();
const pressedNotes = new Map();
let clickedKey = "";

function setControlError(message = '') {
    const controlError = document.getElementById('control-error');
    if (controlError) {
        controlError.textContent = message;
    }
}

function updateSoundProfile() {
    const { ok, error, normalizedValues } = orchestrator.applySoundProfileInput({
        oscType: document.getElementById('osc-type')?.value,
        attack: document.getElementById('attack')?.value,
        release: document.getElementById('release')?.value,
        vibratoDepth: document.getElementById('vibrato-depth')?.value,
        delayAmount: document.getElementById('delay-amount')?.value
    });

    if (ok) {
        setControlError('');
    } else {
        setControlError(error);
    }

    const attackValue = document.getElementById('attack-value');
    if (attackValue) {
        attackValue.textContent = normalizedValues.attack.toFixed(3);
    }

    const releaseValue = document.getElementById('release-value');
    if (releaseValue) {
        releaseValue.textContent = normalizedValues.release.toFixed(2);
    }

    const vibratoDepthValue = document.getElementById('vibrato-depth-value');
    if (vibratoDepthValue) {
        vibratoDepthValue.textContent = normalizedValues.vibratoDepth.toFixed(1);
    }

    const delayAmountValue = document.getElementById('delay-amount-value');
    if (delayAmountValue) {
        delayAmountValue.textContent = normalizedValues.delayAmount.toFixed(2);
    }
}

['osc-type', 'attack', 'release', 'vibrato-depth', 'delay-amount'].forEach((id) => {
    document.getElementById(id)?.addEventListener('input', updateSoundProfile);
});

updateSoundProfile();

// Add controls to set the time signature and tempo
document.getElementById('time-signature').addEventListener('change', (e) => {
    const result = orchestrator.applyTimeSignatureInput(e.target.value);
    if (!result.ok) {
        setControlError(result.error);
        updateTextboxes();
        return;
    }

    setControlError('');
    updateTextboxes();
});

document.getElementById('tempo').addEventListener('change', (e) => {
    const result = orchestrator.applyTempoInput(e.target.value);
    if (result.ok) {
        setControlError('');
    } else {
        setControlError(result.error);
    }
    updateTextboxes();
});

function updateTextboxes() {
    const tempoTextbox = document.getElementById('tempo');
    if (tempoTextbox) {
        tempoTextbox.value = orchestrator.getTempo();
    }

    const timeSignatureTextbox = document.getElementById('time-signature');
    if (timeSignatureTextbox) {
        timeSignatureTextbox.value = orchestrator.getTimeSignatureText();
    }
}

async function playSampleFroggerSong() {
    await orchestrator.playSong(froggerSong);
};

async function playSampleMountainSong() {
    await orchestrator.playSong(shellBeSongComingAroundMountain);
};

async function playTwinkleTwinkle() {
    await orchestrator.playSong(twinkleTwinkle);
}

async function playSamplePianoSong() {
    // Play both hands from the sample piano arrangement.
    await orchestrator.playSong(loveStoryInspiredPiano);
}

document.getElementById('play-frogger-music').addEventListener('click', playSampleFroggerSong);
document.getElementById('play-mountain-music').addEventListener('click', playSampleMountainSong);
document.getElementById('play-twinkle-music').addEventListener('click', playTwinkleTwinkle);
document.getElementById('play-piano-music').addEventListener('click', playSamplePianoSong);
document.getElementById('stop-all-notes').addEventListener('click', () => {
    orchestrator.stopAll();
    setControlError('');
});

document.addEventListener("keydown", async (e) => {
    const key = orchestrator.normalizeKey(e.key);

    if (!keys[key] || pressedNotes.has(keys[key])) {
        return;
    }
    keys[key].element.classList.add("pressed");
    await orchestrator.playKeyboardNoteByKey(key, '4n');
    pressedNotes.set(keys[key], true);
});

document.addEventListener("keyup", (e) => {
    const key = orchestrator.normalizeKey(e.key);

    if (!keys[key]) {
        return;
    }
    keys[key].element.classList.remove("pressed");
    pressedNotes.delete(keys[key]);
});

document.addEventListener("mouseup", () => {
    if (clickedKey && keys[clickedKey]) {
        keys[clickedKey].element.classList.remove("pressed");
        pressedNotes.delete(keys[clickedKey]);
        clickedKey = "";
    }
});

for (const [key, { element }] of Object.entries(keys)) {
    element.addEventListener("mousedown", async () => {
        element.classList.add("pressed");
        await orchestrator.playKeyboardNoteByKey(key, '4n');
        pressedNotes.set(keys[key], true);
        clickedKey = key;
    });
}


