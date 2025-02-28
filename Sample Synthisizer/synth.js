import Synthesizer from '../scripts/output/synthesizer.js';

const audioContext = new (window.AudioContext || window.webkitAudioContext)();

const getElementByNote = (note) =>
    note && document.querySelector(`[note="${note}"]`);

const octaveOffsetA = 0; // Audiable values are -3 to 3 octaves below middle C
const octaveOffsetB = octaveOffsetA + 1;
const keys = {
    A: { element: getElementByNote("C"), note: "C", octaveOffset: octaveOffsetA },
    W: { element: getElementByNote("C#"), note: "C#", octaveOffset: octaveOffsetA },
    S: { element: getElementByNote("D"), note: "D", octaveOffset: octaveOffsetA },
    E: { element: getElementByNote("D#"), note: "D#", octaveOffset: octaveOffsetA },
    D: { element: getElementByNote("E"), note: "E", octaveOffset: octaveOffsetA },
    F: { element: getElementByNote("F"), note: "F", octaveOffset: octaveOffsetA },
    T: { element: getElementByNote("F#"), note: "F#", octaveOffset: octaveOffsetA },
    G: { element: getElementByNote("G"), note: "G", octaveOffset: octaveOffsetA },
    Y: { element: getElementByNote("G#"), note: "G#", octaveOffset: octaveOffsetA },
    H: { element: getElementByNote("A"), note: "A", octaveOffset: octaveOffsetB },
    U: { element: getElementByNote("A#"), note: "A#", octaveOffset: octaveOffsetB },
    J: { element: getElementByNote("B"), note: "B", octaveOffset: octaveOffsetB },
    K: { element: getElementByNote("C2"), note: "C", octaveOffset: octaveOffsetB },
    O: { element: getElementByNote("C#2"), note: "C#", octaveOffset: octaveOffsetB },
    L: { element: getElementByNote("D2"), note: "D", octaveOffset: octaveOffsetB },
    P: { element: getElementByNote("D#2"), note: "D#", octaveOffset: 1 },
    semicolon: { element: getElementByNote("E2"), note: "E", octaveOffset: octaveOffsetB }
};

const synthesizer = new Synthesizer(audioContext, keys);
let clickedKey = "";

document.addEventListener("keydown", (e) => {
    const eventKey = e.key.toUpperCase();
    const key = eventKey === ";" ? "semicolon" : eventKey;

    if (!key || synthesizer.isKeyPressed(key)) {
        return;
    }
    synthesizer.playKey(key, keys[key]);
});

document.addEventListener("keyup", (e) => {
    const eventKey = e.key.toUpperCase();
    const key = eventKey === ";" ? "semicolon" : eventKey;

    if (!key) {
        return;
    }
    synthesizer.stopKey(key);
});

for (const [key, { element }] of Object.entries(keys)) {
    element.addEventListener("mousedown", () => {
        synthesizer.playKey(key, keys[key]);
        clickedKey = key;
    });
}

document.addEventListener("mouseup", () => {
    synthesizer.stopKey(clickedKey);
    clickedKey = "";
});
