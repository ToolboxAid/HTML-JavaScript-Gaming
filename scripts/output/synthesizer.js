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

  playNotes(noteObject) {
    const startTime = this.audioContext.currentTime;
    const measureDuration = this.getMeasureDuration();

    const playHand = (notes) => {
      notes.forEach(noteObj => {
        const duration = this.getNoteDuration(noteObj.duration);
        const noteStartTime = startTime + noteObj.beat * measureDuration / this.timeSignature.beatsPerMeasure;
        this.playNoteDirectly(noteObj.note, noteObj.duration, noteObj.octave, noteStartTime - startTime);
      });
    };

    if (noteObject.leftHand) {
      playHand(noteObject.leftHand);
    }
    if (noteObject.rightHand) {
      playHand(noteObject.rightHand);
    }
  }

  getMeasureDuration() {
    return (60 / this.tempo) * this.timeSignature.beatsPerMeasure;
  }

  playNoteDirectly(note, duration,
    octave = 3,
    startTime = 0,
    oscType = "triangle",  // Use "triangle" or "sawtooth" for a richer sound
    vibrato = { frequency: 5, depth: 5 },  // Add vibrato for a more dynamic sound
    delay = { time: 0.2, feedback: 0.5, amount: 0.2 },
    envelope = { attack: 0.01, decay: 0.1, sustain: 0.8, release: 0.5 }) {

      if (Synthesizer.DEBUG) {
        console.log(`Playing note ${note}${octave} for ${duration} seconds starting at ${startTime} seconds`);
      }

    const osc = this.audioContext.createOscillator();
    const noteGainNode = this.audioContext.createGain();
    noteGainNode.connect(this.audioContext.destination);

    const zeroGain = 0.00001;
    const maxGain = 0.6;

    noteGainNode.gain.value = zeroGain;

    const setAttack = () => noteGainNode.gain.exponentialRampToValueAtTime(maxGain, this.audioContext.currentTime + startTime + envelope.attack);
    const setDecay = () => noteGainNode.gain.exponentialRampToValueAtTime(maxGain * envelope.sustain, this.audioContext.currentTime + startTime + envelope.attack + envelope.decay);
    const setRelease = () => noteGainNode.gain.exponentialRampToValueAtTime(zeroGain, this.audioContext.currentTime + startTime + envelope.attack + envelope.decay + this.getNoteDuration(duration) + envelope.release);

    setAttack();
    setDecay();
    setRelease();

    osc.connect(noteGainNode);

    osc.type = oscType; // Set oscillator type

    const freq = this.getHz(note, octave);
    if (Number.isFinite(freq)) {
      osc.frequency.value = freq;
    }

    // Create LFO for vibrato
    const lfo = this.audioContext.createOscillator();
    const lfoGain = this.audioContext.createGain();
    lfo.frequency.value = vibrato.frequency; // Vibrato frequency (min: 0, max: 20, recommended 1-10 Hz)
    lfoGain.gain.value = vibrato.depth; // Vibrato depth (min: 0, max: 100, recommended 1-50)
    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);

    // Create delay effect
    const delayNode = this.audioContext.createDelay();
    const delayAmountGain = this.audioContext.createGain();
    const feedbackGain = this.audioContext.createGain();
    delayNode.delayTime.value = delay.time; // Delay time (min: 0, max: 5, recommended 0.1-1)
    feedbackGain.gain.value = delay.feedback; // Delay feedback (min: 0, max: 0.9, recommended 0.3-0.7)
    delayAmountGain.gain.value = delay.amount; // Delay amount (min: 0, max: 1, recommended 0.1-0.5)
    noteGainNode.connect(delayAmountGain);
    delayAmountGain.connect(delayNode);
    delayNode.connect(feedbackGain);
    feedbackGain.connect(delayNode);
    delayNode.connect(this.audioContext.destination);

    // Add reverb effect
    const reverbNode = this.audioContext.createConvolver();
    // Assuming you have a reverb impulse response buffer loaded as `reverbBuffer`
    // reverbNode.buffer = reverbBuffer;
    noteGainNode.connect(reverbNode);
    reverbNode.connect(this.audioContext.destination);

    lfo.start(this.audioContext.currentTime + startTime);
    osc.start(this.audioContext.currentTime + startTime);
    osc.stop(this.audioContext.currentTime + startTime + this.getNoteDuration(duration));
    lfo.stop(this.audioContext.currentTime + startTime + this.getNoteDuration(duration));
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