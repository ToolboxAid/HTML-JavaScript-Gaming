import Synthesizer from '../../engine/synthesizer/synthesizer.js';
import { sanitizeSoundProfileInput } from '../../engine/synthesizer/synthSoundProfile.js';
import SynthTransport from '../../engine/synthesizer/synthTransport.js';
import { createSynthKeyboardMap, normalizeSynthKeyboardKey } from '../../engine/synthesizer/synthKeyboardMap.js';
import { parseTimeSignatureInput } from '../../engine/synthesizer/synthTimeSignature.js';
import { froggerSong } from './songs/froggerSong.js';
import { shellBeSongComingAroundMountain } from './songs/comingAroundMountainSong.js';
import { twinkleTwinkle } from './songs/twinkleTwinkleSong.js';
import { loveStoryInspiredPiano } from './pianoPlayer.js';

const getElementByNote = (note) =>
    note && document.querySelector(`[note="${note}"]`);

const synthesizer = new Synthesizer();
const synthTransport = new SynthTransport(synthesizer);
const keys = createSynthKeyboardMap(getElementByNote, 3);
const pressedNotes = new Map();
let clickedKey = "";

function setControlError(message = '') {
    const controlError = document.getElementById('control-error');
    if (controlError) {
        controlError.textContent = message;
    }
}

function updateSoundProfile() {
    const { profilePatch, normalizedValues } = sanitizeSoundProfileInput({
        oscType: document.getElementById('osc-type')?.value,
        attack: document.getElementById('attack')?.value,
        release: document.getElementById('release')?.value,
        vibratoDepth: document.getElementById('vibrato-depth')?.value,
        delayAmount: document.getElementById('delay-amount')?.value
    });

    try {
        synthesizer.setSoundProfile(profilePatch);
        setControlError('');
    } catch (error) {
        // Keep user-facing errors generic and safe.
        setControlError('Invalid sound controls were ignored. Using safe values.');
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
    const parsed = parseTimeSignatureInput(e.target.value);
    if (!parsed.ok) {
        setControlError(parsed.error);
        updateTextboxes();
        return;
    }

    try {
        synthesizer.setTimeSignature(parsed.beatsPerMeasure, parsed.beatUnit);
        setControlError('');
    } catch (error) {
        setControlError('Time signature must be positive values like 4/4.');
    }
    updateTextboxes();
});

document.getElementById('tempo').addEventListener('change', (e) => {
    const tempo = parseInt(e.target.value, 10);
    try {
        synthesizer.setTempo(tempo);
        setControlError('');
    } catch (error) {
        setControlError('Tempo must be a positive number.');
    }
    updateTextboxes();
});

function updateTextboxes() {
    const tempoTextbox = document.getElementById('tempo');
    if (tempoTextbox) {
        tempoTextbox.value = synthesizer.tempo;
    }

    const timeSignatureTextbox = document.getElementById('time-signature');
    if (timeSignatureTextbox) {
        timeSignatureTextbox.value = `${synthesizer.timeSignature.beatsPerMeasure}/${synthesizer.timeSignature.beatUnit}`;
    }
}

async function playSampleFroggerSong() {
    await synthTransport.playSong(froggerSong);
};

async function playSampleMountainSong() {
    await synthTransport.playSong(shellBeSongComingAroundMountain);
};

async function playTwinkleTwinkle() {
    await synthTransport.playSong(twinkleTwinkle);
}

async function playSamplePianoSong() {
    // Play both hands from the sample piano arrangement.
    await synthTransport.playSong(loveStoryInspiredPiano);
}

document.getElementById('play-frogger-music').addEventListener('click', playSampleFroggerSong);
document.getElementById('play-mountain-music').addEventListener('click', playSampleMountainSong);
document.getElementById('play-twinkle-music').addEventListener('click', playTwinkleTwinkle);
document.getElementById('play-piano-music').addEventListener('click', playSamplePianoSong);
document.getElementById('stop-all-notes').addEventListener('click', () => {
    synthTransport.stopAll();
    setControlError('');
});

document.addEventListener("keydown", async (e) => {
    const key = normalizeSynthKeyboardKey(e.key);

    if (!keys[key] || pressedNotes.has(keys[key])) {
        return;
    }
    keys[key].element.classList.add("pressed");
    await synthTransport.playKeyboardNote(keys[key].note, '4n', keys[key].octaveOffset);
    pressedNotes.set(keys[key], true);
});

document.addEventListener("keyup", (e) => {
    const key = normalizeSynthKeyboardKey(e.key);

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
        await synthTransport.playKeyboardNote(keys[key].note, '4n', keys[key].octaveOffset);
        pressedNotes.set(keys[key], true);
        clickedKey = key;
    });
}


