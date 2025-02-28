class Synthesizer {
  constructor(audioContext, keys) {
    this.audioContext = audioContext;
    this.pressedNotes = new Map();
    this.keys = keys;
  }

  getHz(note = "A", octave = 4) {
    const A4 = 440;
    let N = 0;
    switch (note) {
      default:
      case "A":
        N = 0;
        break;
      case "A#":
      case "Bb":
        N = 1;
        break;
      case "B":
        N = 2;
        break;
      case "C":
        N = 3;
        break;
      case "C#":
      case "Db":
        N = 4;
        break;
      case "D":
        N = 5;
        break;
      case "D#":
      case "Eb":
        N = 6;
        break;
      case "E":
        N = 7;
        break;
      case "F":
        N = 8;
        break;
      case "F#":
      case "Gb":
        N = 9;
        break;
      case "G":
        N = 10;
        break;
      case "G#":
      case "Ab":
        N = 11;
        break;
    }
    N += 12 * (octave - 4);
    return A4 * Math.pow(2, N / 12);
  }

  playKey(key, keyData) {
    if (!keyData) {
      return;
    }

    const osc = this.audioContext.createOscillator();
    const noteGainNode = this.audioContext.createGain();
    noteGainNode.connect(this.audioContext.destination);

    const zeroGain = 0.00001;
    const maxGain = 0.5;
    const sustainedGain = 0.001;

    noteGainNode.gain.value = zeroGain;

    const setAttack = () =>
      noteGainNode.gain.exponentialRampToValueAtTime(
        maxGain,
        this.audioContext.currentTime + 0.01
      );
    const setDecay = () =>
      noteGainNode.gain.exponentialRampToValueAtTime(
        sustainedGain,
        this.audioContext.currentTime + 1
      );
    const setRelease = () =>
      noteGainNode.gain.exponentialRampToValueAtTime(
        zeroGain,
        this.audioContext.currentTime + 2
      );

    setAttack();
    setDecay();
    setRelease();

    osc.connect(noteGainNode);
    osc.type = "triangle";

    const freq = this.getHz(keyData.note, (keyData.octaveOffset || 0) + 3);

    if (Number.isFinite(freq)) {
      osc.frequency.value = freq;
    }

    keyData.element.classList.add("pressed");
    this.pressedNotes.set(key, osc);
    this.pressedNotes.get(key).start();
  }

  stopKey(key) {
    if (!this.pressedNotes.has(key)) {
      return;
    }

    const osc = this.pressedNotes.get(key);

    if (osc) {
      setTimeout(() => {
        osc.stop();
      }, 2000);

      this.pressedNotes.delete(key);
    }

    const keyData = this.keys[key];
    if (keyData && keyData.element) {
      keyData.element.classList.remove("pressed");
    }
  }

  isKeyPressed(key) {
    return this.pressedNotes.has(key);
  }
}

export default Synthesizer;
