// Shared transport/orchestration wrapper for synth playback flows.
import { ensureAudioContextReady } from '../output/audioContextUtils.js';

class SynthTransport {
  constructor(synthesizer) {
    if (!synthesizer) {
      throw new Error('synthesizer is required.');
    }
    this.synthesizer = synthesizer;
  }

  async ensureReady() {
    await ensureAudioContextReady(this.synthesizer.audioContext);
  }

  async playSong(song) {
    await this.ensureReady();
    this.synthesizer.stopAllNotes();
    this.synthesizer.playNotes(song);
  }

  async playKeyboardNote(note, duration = '4n', octaveOffset = 3) {
    await this.ensureReady();
    this.synthesizer.playNoteDirectly(note, duration, octaveOffset);
  }

  stopAll() {
    this.synthesizer.stopAllNotes();
  }
}

export default SynthTransport;
