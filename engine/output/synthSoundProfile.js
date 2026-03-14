const VALID_OSC_TYPES = new Set(['sine', 'square', 'triangle', 'sawtooth']);

const DEFAULT_SYNTH_SOUND_PROFILE = Object.freeze({
  oscType: 'triangle',
  vibrato: Object.freeze({ frequency: 5, depth: 5 }),
  delay: Object.freeze({ time: 0.2, feedback: 0.5, amount: 0.2 }),
  envelope: Object.freeze({ attack: 0.01, decay: 0.1, sustain: 0.8, release: 0.5 })
});

function cloneDefaultSoundProfile() {
  return {
    oscType: DEFAULT_SYNTH_SOUND_PROFILE.oscType,
    vibrato: { ...DEFAULT_SYNTH_SOUND_PROFILE.vibrato },
    delay: { ...DEFAULT_SYNTH_SOUND_PROFILE.delay },
    envelope: { ...DEFAULT_SYNTH_SOUND_PROFILE.envelope }
  };
}

function validateFinite(name, value, min = 0, max = Number.POSITIVE_INFINITY) {
  if (!Number.isFinite(value) || value < min || value > max) {
    throw new Error(`${name} must be a finite number between ${min} and ${max}.`);
  }
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function boundedNumber(rawValue, limits) {
  const numericValue = Number(rawValue);
  if (!Number.isFinite(numericValue)) {
    return limits.fallback;
  }
  return clamp(numericValue, limits.min, limits.max);
}

function validateSoundProfile(profile) {
  if (!VALID_OSC_TYPES.has(profile.oscType)) {
    throw new Error('oscType must be one of: sine, square, triangle, sawtooth.');
  }

  validateFinite('vibrato.frequency', profile.vibrato.frequency, 0, 20);
  validateFinite('vibrato.depth', profile.vibrato.depth, 0, 100);
  validateFinite('delay.time', profile.delay.time, 0, 5);
  validateFinite('delay.feedback', profile.delay.feedback, 0, 0.95);
  validateFinite('delay.amount', profile.delay.amount, 0, 1);
  validateFinite('envelope.attack', profile.envelope.attack, 0.001, 5);
  validateFinite('envelope.decay', profile.envelope.decay, 0, 5);
  validateFinite('envelope.sustain', profile.envelope.sustain, 0, 1);
  validateFinite('envelope.release', profile.envelope.release, 0, 10);
}

function mergeSoundProfile(currentProfile, patch = {}) {
  if (!patch || typeof patch !== 'object') {
    return currentProfile;
  }

  const nextProfile = {
    ...currentProfile,
    ...patch,
    vibrato: {
      ...currentProfile.vibrato,
      ...(patch.vibrato || {})
    },
    delay: {
      ...currentProfile.delay,
      ...(patch.delay || {})
    },
    envelope: {
      ...currentProfile.envelope,
      ...(patch.envelope || {})
    }
  };

  validateSoundProfile(nextProfile);
  return nextProfile;
}

function sanitizeSoundProfileInput(input = {}) {
  const limits = {
    attack: { min: 0.001, max: 1, fallback: DEFAULT_SYNTH_SOUND_PROFILE.envelope.attack },
    release: { min: 0.05, max: 2, fallback: DEFAULT_SYNTH_SOUND_PROFILE.envelope.release },
    vibratoDepth: { min: 0, max: 20, fallback: DEFAULT_SYNTH_SOUND_PROFILE.vibrato.depth },
    delayAmount: { min: 0, max: 0.8, fallback: DEFAULT_SYNTH_SOUND_PROFILE.delay.amount }
  };

  const selectedOscType = typeof input.oscType === 'string' ? input.oscType : DEFAULT_SYNTH_SOUND_PROFILE.oscType;
  const oscType = VALID_OSC_TYPES.has(selectedOscType) ? selectedOscType : DEFAULT_SYNTH_SOUND_PROFILE.oscType;
  const attack = boundedNumber(input.attack, limits.attack);
  const release = boundedNumber(input.release, limits.release);
  const vibratoDepth = boundedNumber(input.vibratoDepth, limits.vibratoDepth);
  const delayAmount = boundedNumber(input.delayAmount, limits.delayAmount);

  return {
    profilePatch: {
      oscType,
      vibrato: { depth: vibratoDepth },
      delay: { amount: delayAmount },
      envelope: { attack, release }
    },
    normalizedValues: {
      oscType,
      attack,
      release,
      vibratoDepth,
      delayAmount
    }
  };
}

export { DEFAULT_SYNTH_SOUND_PROFILE, cloneDefaultSoundProfile, mergeSoundProfile, sanitizeSoundProfileInput, validateSoundProfile };
