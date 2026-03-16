// Shared synth sound-profile defaults, validation, and sanitization helpers.
import NumberUtils from '../math/numberUtils.js';

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

function validateSoundProfile(profile) {
  if (!VALID_OSC_TYPES.has(profile.oscType)) {
    throw new Error('oscType must be one of: sine, square, triangle, sawtooth.');
  }

  NumberUtils.finiteNumberInRange(profile.vibrato.frequency, 0, 20, 'vibrato.frequency');
  NumberUtils.finiteNumberInRange(profile.vibrato.depth, 0, 100, 'vibrato.depth');
  NumberUtils.finiteNumberInRange(profile.delay.time, 0, 5, 'delay.time');
  NumberUtils.finiteNumberInRange(profile.delay.feedback, 0, 0.95, 'delay.feedback');
  NumberUtils.finiteNumberInRange(profile.delay.amount, 0, 1, 'delay.amount');
  NumberUtils.finiteNumberInRange(profile.envelope.attack, 0.001, 5, 'envelope.attack');
  NumberUtils.finiteNumberInRange(profile.envelope.decay, 0, 5, 'envelope.decay');
  NumberUtils.finiteNumberInRange(profile.envelope.sustain, 0, 1, 'envelope.sustain');
  NumberUtils.finiteNumberInRange(profile.envelope.release, 0, 10, 'envelope.release');
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
  const attack = NumberUtils.boundedNumber(input.attack, limits.attack);
  const release = NumberUtils.boundedNumber(input.release, limits.release);
  const vibratoDepth = NumberUtils.boundedNumber(input.vibratoDepth, limits.vibratoDepth);
  const delayAmount = NumberUtils.boundedNumber(input.delayAmount, limits.delayAmount);

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
