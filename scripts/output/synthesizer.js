class Synthesizer {

  // Enable debug mode: game.html?synthesizer
  static DEBUG = new URLSearchParams(window.location.search).has('synthesizer');

  constructor() {
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    this.timeSignature = { beatsPerMeasure: 4, beatUnit: 4 }; // Default time signature 4/4
    this.tempo = 120; // Default tempo in BPM
  }

  setTimeSignature(beatsPerMeasure, beatUnit) {
    this.timeSignature = { beatsPerMeasure, beatUnit };
    if (Synthesizer.DEBUG) {
      console.log(`Updated time signature to ${this.timeSignature.beatsPerMeasure}/${this.timeSignature.beatUnit} ::: tempo set to ${this.tempo} BPM`);
    }
  }

  setTempo(tempo) { // tempo in BPM
    this.tempo = tempo;
    if (Synthesizer.DEBUG) {
      console.log(`Updated tempo to ${this.tempo} BPM ::: time signature set to ${this.timeSignature.beatsPerMeasure}/${this.timeSignature.beatUnit}`);
    }
  }

  getNoteDuration(noteType) {
    const noteDurations = {
      '1n': 4, // whole note
      '2n': 2, // half note
      '4n': 1, // quarter note
      '8n': 0.5, // eighth note
      '16n': 0.25, // sixteenth note
      '32n': 0.125, // thirty-second note
      '64n': 0.0625 // sixty-fourth note
    };
    const beatsPerMeasure = this.timeSignature.beatsPerMeasure;
    const beatUnit = this.timeSignature.beatUnit;
    const beatDuration = 60 / this.tempo; // duration of one beat in seconds

    return (noteDurations[noteType] || 1) * (4 / beatUnit) * beatDuration; // adjust for time signature
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

  /** Other valid values for note durations include:
1n for a whole note
2n for a half note
4n for a quarter note
8n for an eighth note
16n for a sixteenth note
32n for a thirty-second note
64n for a sixty-fourth note
} notes 
 */
  playNotes(notes) {
    let currentTime = 0;

    notes.forEach(note => {
      setTimeout(() => {
        this.playNoteDirectly(note.note, note.duration);
      }, currentTime);
      currentTime += this.getNoteDuration(note.duration) * 1000; // Convert to milliseconds
    });
  }

  playNoteDirectly(note, duration) {
    // if (!note || !noteType) {
    //   return;
    // }  
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

    /*
    osc.type = "sine", "square", "sawtooth", "triangle", "custom"; // Custom waveform (requires a PeriodicWave object)
    */
    osc.type = "triangle";

    const freq = this.getHz(note, 3); // Default to octave 4
    if (Number.isFinite(freq)) {
      osc.frequency.value = freq;
    }

    osc.start();
    setTimeout(() => {
      osc.stop();
    }, this.getNoteDuration(duration) * 1000); // Convert duration to milliseconds
  }

  static bpmToSignature(bpm, beatsPerMeasure, noteValue) {
    // Convert BPM to quarter note beats per minute
    let quarterNoteBpm = (noteValue === 4) ? bpm : bpm * (noteValue / 4);

    // Measure duration in seconds
    let measureDuration = (beatsPerMeasure / quarterNoteBpm) * 60;

    return {
      measureDuration: measureDuration.toFixed(2),
      timeSignature: `${beatsPerMeasure}/${noteValue}`
    };
  }

  static signatureToBpm(measureDuration, beatsPerMeasure, noteValue) {
    // Calculate quarter note BPM
    let quarterNoteBpm = (beatsPerMeasure * 60) / measureDuration;

    // Adjust BPM based on note value
    let bpm = (noteValue === 4) ? quarterNoteBpm : quarterNoteBpm / (noteValue / 4);

    return Math.round(bpm);
  }

}

export default Synthesizer;

if (Synthesizer.DEBUG) {
  // Example usage:
  console.log(Synthesizer.bpmToSignature(100, 4, 4));  // { measureDuration: '2.40', timeSignature: '4/4' }
  console.log(Synthesizer.bpmToSignature(120, 6, 8));  // { measureDuration: '3.00', timeSignature: '6/8' }
  console.log(Synthesizer.signatureToBpm(2.4, 4, 4));  // 100
  console.log(Synthesizer.signatureToBpm(3.0, 6, 8));  // 120
}