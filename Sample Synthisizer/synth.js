import Synthesizer from '../scripts/output/synthesizer.js';

const audioContext = new (window.AudioContext || window.webkitAudioContext)();

const getElementByNote = (note) =>
    note && document.querySelector(`[note="${note}"]`);

const octaveOffsetA = 0; // Audiable values are -3 to 3 octaves below middle C
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

const synthesizer = new Synthesizer(audioContext, keys);
let clickedKey = "";

const playSampleFroggerSong = () => {
    const duration = 225;
    const song = [ // "Inu No Omawarisan" by Kikuo
        { key: 'A', duration: duration }, // C
        { key: 'A', duration: duration }, // C
        { key: 'E', duration: duration }, // D#
        { key: 'E', duration: duration }, // D#
        { key: 'G', duration: duration }, // G
        { key: 'G', duration: duration }, // G
        { key: 'E', duration: duration * 2 }, // D#
        { key: 'D', duration: duration }, // D
        { key: 'D', duration: duration }, // D
        { key: 'C', duration: duration }, // C
        { key: 'C', duration: duration }, // C
        { key: 'A', duration: duration }, // C
        { key: 'A', duration: duration }, // C
        { key: 'C', duration: duration * 2 }, // C
        { key: 'E', duration: duration }, // D#
        { key: 'E', duration: duration }, // D#
        { key: 'G', duration: duration }, // G
        { key: 'G', duration: duration }, // G
        { key: 'E', duration: duration }, // D#
        { key: 'E', duration: duration }, // D#
        { key: 'D', duration: duration * 2 }, // D
        { key: 'C', duration: duration }, // C
        { key: 'C', duration: duration }, // C
        { key: 'A', duration: duration }, // C
        { key: 'A', duration: duration }, // C
        { key: 'C', duration: duration }, // C
        { key: 'C', duration: duration }, // C
        { key: 'A', duration: duration * 2 },  // C
        { key: 'G', duration: duration }, // G
        { key: 'G', duration: duration }, // G
        { key: 'E', duration: duration }, // D#
        { key: 'E', duration: duration }, // D#
        { key: 'D', duration: duration }, // D
        { key: 'D', duration: duration }, // D
        { key: 'C', duration: duration }, // C
        { key: 'C', duration: duration }, // C
        { key: 'A', duration: duration }, // C
        { key: 'A', duration: duration }, // C
        { key: 'C', duration: duration }, // C
        { key: 'C', duration: duration }, // C
        { key: 'A', duration: duration * 2 }  // C
    ];

    let currentTime = 0;

    song.forEach(note => {
        setTimeout(() => {
            synthesizer.playKey(note.key, keys[note.key]);
            setTimeout(() => {
                synthesizer.stopKey(note.key);
            }, note.duration);
        }, currentTime);
        currentTime += note.duration;
    });
};

const playSampleMountainSong = () => {
    const duration = 250;
    const song = [
        { key: 'C', duration: duration }, // C
        { key: 'C', duration: duration }, // C
        { key: 'G', duration: duration }, // G
        { key: 'G', duration: duration }, // G
        { key: 'A', duration: duration }, // A
        { key: 'A', duration: duration }, // A
        { key: 'G', duration: duration * 2 }, // G
        { key: 'F', duration: duration }, // F
        { key: 'F', duration: duration }, // F
        { key: 'E', duration: duration }, // E
        { key: 'E', duration: duration }, // E
        { key: 'D', duration: duration }, // D
        { key: 'D', duration: duration }, // D
        { key: 'C', duration: duration * 2 }, // C
        { key: 'G', duration: duration }, // G
        { key: 'G', duration: duration }, // G
        { key: 'F', duration: duration }, // F
        { key: 'F', duration: duration }, // F
        { key: 'E', duration: duration }, // E
        { key: 'E', duration: duration }, // E
        { key: 'D', duration: duration * 2 }, // D
        { key: 'G', duration: duration }, // G
        { key: 'G', duration: duration }, // G
        { key: 'F', duration: duration }, // F
        { key: 'F', duration: duration }, // F
        { key: 'E', duration: duration }, // E
        { key: 'E', duration: duration }, // E
        { key: 'D', duration: duration * 2 }, // D
        { key: 'C', duration: duration }, // C
        { key: 'C', duration: duration }, // C
        { key: 'G', duration: duration }, // G
        { key: 'G', duration: duration }, // G
        { key: 'A', duration: duration }, // A
        { key: 'A', duration: duration }, // A
        { key: 'G', duration: duration * 2 }, // G
        { key: 'F', duration: duration }, // F
        { key: 'F', duration: duration }, // F
        { key: 'E', duration: duration }, // E
        { key: 'E', duration: duration }, // E
        { key: 'D', duration: duration }, // D
        { key: 'D', duration: duration }, // D
        { key: 'C', duration: duration * 2 }  // C
    ];

    let currentTime = 0;

    song.forEach(note => {
        setTimeout(() => {
            synthesizer.playKey(note.key, keys[note.key]);
            setTimeout(() => {
                synthesizer.stopKey(note.key);
            }, note.duration);
        }, currentTime);
        currentTime += note.duration;
    });
};

document.getElementById('play-frogger-music').addEventListener('click', playSampleFroggerSong);
document.getElementById('play-mountain-music').addEventListener('click', playSampleMountainSong);

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
