import Synthesizer from '../../engine/output/synthesizer.js';
import { froggerSong } from './songs/froggerSong.js';
import { shellBeSongComingAroundMountain } from './songs/comingAroundMountainSong.js';
import { twinkleTwinkle } from './songs/twinkleTwinkleSong.js';
import { loveStoryInspiredPiano } from './pianoPlayer.js';

const getElementByNote = (note) =>
    note && document.querySelector(`[note="${note}"]`);

const octaveOffsetA = 3; // Audiable values are -3 to 3 octaves below middle C
const octaveOffsetB = octaveOffsetA + 1;
const keys = {
    // octaveOffsetA
    A: { element: getElementByNote("C"), note: "C", octaveOffset: octaveOffsetA },
    W: { element: getElementByNote("C#"), note: "C#", octaveOffset: octaveOffsetA },
    S: { element: getElementByNote("D"), note: "D", octaveOffset: octaveOffsetA },
    E: { element: getElementByNote("D#"), note: "D#", octaveOffset: octaveOffsetA },
    D: { element: getElementByNote("E"), note: "E", octaveOffset: octaveOffsetA },
    F: { element: getElementByNote("F"), note: "F", octaveOffset: octaveOffsetA },
    T: { element: getElementByNote("F#"), note: "F#", octaveOffset: octaveOffsetA },
    G: { element: getElementByNote("G"), note: "G", octaveOffset: octaveOffsetA },
    Y: { element: getElementByNote("G#"), note: "G#", octaveOffset: octaveOffsetA },
    // octaveOffsetB
    H: { element: getElementByNote("A"), note: "A", octaveOffset: octaveOffsetB },
    U: { element: getElementByNote("A#"), note: "A#", octaveOffset: octaveOffsetB },
    J: { element: getElementByNote("B"), note: "B", octaveOffset: octaveOffsetB },
    // octaveOffsetB restart at C
    K: { element: getElementByNote("C2"), note: "C", octaveOffset: octaveOffsetB },
    O: { element: getElementByNote("C#2"), note: "C#", octaveOffset: octaveOffsetB },
    L: { element: getElementByNote("D2"), note: "D", octaveOffset: octaveOffsetB },
    P: { element: getElementByNote("D#2"), note: "D#", octaveOffset: octaveOffsetB },
    semicolon:
        { element: getElementByNote("E2"), note: "E", octaveOffset: octaveOffsetB }
};

const synthesizer = new Synthesizer();
const pressedNotes = new Map();
let clickedKey = "";

async function ensureAudioReady() {
    if (synthesizer.audioContext.state === 'suspended') {
        await synthesizer.audioContext.resume();
    }
}

function updateSoundProfile() {
    const oscType = document.getElementById('osc-type')?.value || 'triangle';
    const attack = parseFloat(document.getElementById('attack')?.value || '0.01');
    const release = parseFloat(document.getElementById('release')?.value || '0.5');
    const vibratoDepth = parseFloat(document.getElementById('vibrato-depth')?.value || '5');
    const delayAmount = parseFloat(document.getElementById('delay-amount')?.value || '0.2');

    synthesizer.setSoundProfile({
        oscType,
        vibrato: { depth: vibratoDepth },
        delay: { amount: delayAmount },
        envelope: { attack, release }
    });

    const attackValue = document.getElementById('attack-value');
    if (attackValue) {
        attackValue.textContent = attack.toFixed(3);
    }

    const releaseValue = document.getElementById('release-value');
    if (releaseValue) {
        releaseValue.textContent = release.toFixed(2);
    }

    const vibratoDepthValue = document.getElementById('vibrato-depth-value');
    if (vibratoDepthValue) {
        vibratoDepthValue.textContent = vibratoDepth.toFixed(1);
    }

    const delayAmountValue = document.getElementById('delay-amount-value');
    if (delayAmountValue) {
        delayAmountValue.textContent = delayAmount.toFixed(2);
    }
}

['osc-type', 'attack', 'release', 'vibrato-depth', 'delay-amount'].forEach((id) => {
    document.getElementById(id)?.addEventListener('input', updateSoundProfile);
});

updateSoundProfile();

// Add controls to set the time signature and tempo
document.getElementById('time-signature').addEventListener('change', (e) => {
    const [beatsPerMeasure, beatUnit] = e.target.value.split('/').map(Number);
    synthesizer.setTimeSignature(beatsPerMeasure, beatUnit);
    updateTextboxes();
});

document.getElementById('tempo').addEventListener('change', (e) => {
    const tempo = parseInt(e.target.value, 10);
    synthesizer.setTempo(tempo);
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
    await ensureAudioReady();
    synthesizer.playNotes(froggerSong);
};

async function playSampleMountainSong() {
    await ensureAudioReady();
    synthesizer.playNotes(shellBeSongComingAroundMountain);
};

async function playTwinkleTwinkle() {
    await ensureAudioReady();
    synthesizer.playNotes(twinkleTwinkle);
}

async function playSamplePianoSong() {
    // Play both hands from the sample piano arrangement.
    await ensureAudioReady();
    synthesizer.playNotes(loveStoryInspiredPiano);
}

document.getElementById('play-frogger-music').addEventListener('click', playSampleFroggerSong);
document.getElementById('play-mountain-music').addEventListener('click', playSampleMountainSong);
document.getElementById('play-twinkle-music').addEventListener('click', playTwinkleTwinkle);
document.getElementById('play-piano-music').addEventListener('click', playSamplePianoSong);

document.addEventListener("keydown", async (e) => {
    const eventKey = e.key.toUpperCase();
    const key = eventKey === ";" ? "semicolon" : eventKey;

    if (!keys[key] || pressedNotes.has(keys[key])) {
        return;
    }
    await ensureAudioReady();
    keys[key].element.classList.add("pressed");
    synthesizer.playNoteDirectly(keys[key].note, '4n', keys[key].octaveOffset); // Default note type
    pressedNotes.set(keys[key], true);
});

document.addEventListener("keyup", (e) => {
    const eventKey = e.key.toUpperCase();
    const key = eventKey === ";" ? "semicolon" : eventKey;

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
        await ensureAudioReady();
        element.classList.add("pressed");
        synthesizer.playNoteDirectly(keys[key].note, '4n', keys[key].octaveOffset); // Default note type
        pressedNotes.set(keys[key], true);
        clickedKey = key;
    });
}


