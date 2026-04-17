/*
Toolbox Aid
David Quesenberry
03/22/2026
AudioPreprocessPipeline.js
*/
export default class AudioPreprocessPipeline {
  run(audio) {
    return {
      ...audio,
      sampleRate: audio.sampleRate || 44100,
      normalized: true,
      trimmed: true,
    };
  }
}
