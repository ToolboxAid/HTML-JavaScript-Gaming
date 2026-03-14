// Shared keyboard mapping for synth note triggers.
function normalizeSynthKeyboardKey(rawKey) {
  const eventKey = String(rawKey || '').toUpperCase();
  if (eventKey === ';') {
    return 'semicolon';
  }
  return eventKey;
}

function createSynthKeyboardMap(getElementByNote, baseOctaveOffset = 3) {
  const octaveOffsetA = baseOctaveOffset;
  const octaveOffsetB = octaveOffsetA + 1;

  return {
    A: { element: getElementByNote('C'), note: 'C', octaveOffset: octaveOffsetA },
    W: { element: getElementByNote('C#'), note: 'C#', octaveOffset: octaveOffsetA },
    S: { element: getElementByNote('D'), note: 'D', octaveOffset: octaveOffsetA },
    E: { element: getElementByNote('D#'), note: 'D#', octaveOffset: octaveOffsetA },
    D: { element: getElementByNote('E'), note: 'E', octaveOffset: octaveOffsetA },
    F: { element: getElementByNote('F'), note: 'F', octaveOffset: octaveOffsetA },
    T: { element: getElementByNote('F#'), note: 'F#', octaveOffset: octaveOffsetA },
    G: { element: getElementByNote('G'), note: 'G', octaveOffset: octaveOffsetA },
    Y: { element: getElementByNote('G#'), note: 'G#', octaveOffset: octaveOffsetA },
    H: { element: getElementByNote('A'), note: 'A', octaveOffset: octaveOffsetB },
    U: { element: getElementByNote('A#'), note: 'A#', octaveOffset: octaveOffsetB },
    J: { element: getElementByNote('B'), note: 'B', octaveOffset: octaveOffsetB },
    K: { element: getElementByNote('C2'), note: 'C', octaveOffset: octaveOffsetB },
    O: { element: getElementByNote('C#2'), note: 'C#', octaveOffset: octaveOffsetB },
    L: { element: getElementByNote('D2'), note: 'D', octaveOffset: octaveOffsetB },
    P: { element: getElementByNote('D#2'), note: 'D#', octaveOffset: octaveOffsetB },
    semicolon: { element: getElementByNote('E2'), note: 'E', octaveOffset: octaveOffsetB }
  };
}

export { createSynthKeyboardMap, normalizeSynthKeyboardKey };
