// Shared validation for synth score/song structures.
function validateNote(note, handName, index) {
  if (!note || typeof note !== 'object') {
    throw new Error(`${handName}[${index}] must be an object.`);
  }

  if (typeof note.note !== 'string' || note.note.length === 0) {
    throw new Error(`${handName}[${index}].note must be a non-empty string.`);
  }

  if (typeof note.duration !== 'string' || note.duration.length === 0) {
    throw new Error(`${handName}[${index}].duration must be a non-empty string.`);
  }

  if (!Number.isFinite(note.beat) || note.beat < 0) {
    throw new Error(`${handName}[${index}].beat must be a non-negative number.`);
  }

  if (note.octave !== undefined && (!Number.isFinite(note.octave) || note.octave < 0 || note.octave > 8)) {
    throw new Error(`${handName}[${index}].octave must be a number between 0 and 8 when provided.`);
  }
}

function validateHand(notes, handName) {
  if (notes === undefined) {
    return false;
  }

  if (!Array.isArray(notes)) {
    throw new Error(`${handName} must be an array when provided.`);
  }

  notes.forEach((note, index) => validateNote(note, handName, index));
  return notes.length > 0;
}

function validateSynthScore(noteObject) {
  if (!noteObject || typeof noteObject !== 'object') {
    throw new Error('noteObject must be a non-null object.');
  }

  const hasLeft = validateHand(noteObject.leftHand, 'leftHand');
  const hasRight = validateHand(noteObject.rightHand, 'rightHand');
  if (!hasLeft && !hasRight) {
    throw new Error('noteObject must include at least one non-empty hand.');
  }
}

export { validateSynthScore };
