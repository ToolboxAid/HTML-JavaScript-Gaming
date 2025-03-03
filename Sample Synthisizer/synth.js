import Synthesizer from '../scripts/output/synthesizer.js';
import { froggerSong, shellBeSongComingAroundMountain, twinkleTwinkle} from './songs.js';

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

function playSampleFroggerSong() {
    synthesizer.playNotes(froggerSong);
};

function playSampleMountainSong() {
    synthesizer.playNotes(shellBeSongComingAroundMountain);
};

function playTwinkleTwinkle() {
    synthesizer.playNotes(twinkleTwinkle);
}

function playSamplePianoSong() {
    // 🎵 Play Both Hands
    console.log('Playing Piano Song');
    synthesizer.playNotes({ leftHand, rightHand });
    console.log('Finished Playing Piano Song');
}

document.getElementById('play-frogger-music').addEventListener('click', playSampleFroggerSong);
document.getElementById('play-mountain-music').addEventListener('click', playSampleMountainSong);
document.getElementById('play-twinkle-music').addEventListener('click', playTwinkleTwinkle);
document.getElementById('play-piano-music').addEventListener('click', playSamplePianoSong);

document.addEventListener("keydown", (e) => {
    const eventKey = e.key.toUpperCase();
    const key = eventKey === ";" ? "semicolon" : eventKey;

    if (!keys[key] || pressedNotes.has(keys[key])) {
        return;
    }
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
    element.addEventListener("mousedown", () => {
        element.classList.add("pressed");
        synthesizer.playNoteDirectly(keys[key].note, '4n', keys[key].octaveOffset); // Default note type
        pressedNotes.set(keys[key], true);
        clickedKey = key;
    });
}

