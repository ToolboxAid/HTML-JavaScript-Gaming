// Shared audio context lifecycle helpers for output modules and samples.
function ensureAudioContextReady(audioContext) {
  if (!audioContext || typeof audioContext !== 'object') {
    throw new Error('audioContext is required.');
  }

  if (audioContext.state === 'suspended' && typeof audioContext.resume === 'function') {
    return audioContext.resume();
  }

  return Promise.resolve();
}

export { ensureAudioContextReady };
