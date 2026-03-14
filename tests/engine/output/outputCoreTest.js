import AudioPlayer from '../../../engine/output/audioPlayer.js';
import AudioFrequency from '../../../engine/output/audioFrequency.js';
import AudioPlaybackController from '../../../engine/output/audioPlaybackController.js';
import Synthesizer from '../../../engine/synthesizer/synthesizer.js';

function installAudioContextMock() {
    class MockAudioContext {
        constructor() {
            this.currentTime = 0;
            this.destination = {};
            this.state = 'running';
            this.closed = false;
        }

        createOscillator() {
            return {
                frequency: { setValueAtTime() {}, value: 0 },
                connect() {},
                disconnect() {},
                start() {},
                stop() {
                    if (typeof this.onended === 'function') {
                        this.onended();
                    }
                },
                onended: null,
                type: 'sine'
            };
        }

        createBufferSource() {
            return {
                connect() {},
                start() {},
                stop() {},
                buffer: null,
                loop: false,
                onended: null,
                isFinished: false
            };
        }

        createGain() {
            return {
                gain: { value: 1 },
                connect() {},
                disconnect() {}
            };
        }

        createDelay() {
            return {
                delayTime: { value: 0 },
                connect() {},
                disconnect() {}
            };
        }

        createConvolver() {
            return {
                connect() {},
                disconnect() {}
            };
        }

        decodeAudioData() {
            return Promise.resolve({ decoded: true });
        }

        close() {
            this.closed = true;
            return Promise.resolve();
        }

        resume() {
            this.state = 'running';
            return Promise.resolve();
        }
    }

    return MockAudioContext;
}

function testSynthesizerStatics(assert) {
    const signature = Synthesizer.bpmToSignature(100, 4, 4);
    assert(signature.measureDuration === '2.40', 'Synthesizer.bpmToSignature should compute measure duration');
    assert(signature.timeSignature === '4/4', 'Synthesizer.bpmToSignature should return signature string');

    const bpm = Synthesizer.signatureToBpm(2.4, 4, 4);
    assert(bpm === 100, 'Synthesizer.signatureToBpm should invert bpmToSignature for simple case');
}

function testAudioPlayerLifecycle(assert) {
    const originalAudioContext = window.AudioContext;
    const originalWebkitAudioContext = window.webkitAudioContext;

    const MockAudioContext = installAudioContextMock();
    window.AudioContext = MockAudioContext;
    window.webkitAudioContext = null;

    try {
        const player = new AudioPlayer('/audio');
        player.audioCache.set('/audio/test.wav', { decoded: true });
        player.playAudio('test.wav', 0.5, true);
        player.stopLooping('test.wav');
        player.destroy();
        assert(player.audioContext === null, 'AudioPlayer destroy should clear audioContext reference');
    } finally {
        window.AudioContext = originalAudioContext;
        window.webkitAudioContext = originalWebkitAudioContext;
    }
}

function testAudioPlaybackControllerAllowlist(assert) {
    const originalAudioContext = window.AudioContext;
    const originalWebkitAudioContext = window.webkitAudioContext;

    const MockAudioContext = installAudioContextMock();
    window.AudioContext = MockAudioContext;
    window.webkitAudioContext = null;

    try {
        const controller = new AudioPlaybackController('/audio', ['valid.wav']);
        const invalidSelection = controller.setSelectedFile('invalid.wav');
        assert(invalidSelection.ok === false, 'AudioPlaybackController should reject non-allowlisted audio selections');
        controller.destroy();
    } finally {
        window.AudioContext = originalAudioContext;
        window.webkitAudioContext = originalWebkitAudioContext;
    }
}

function testAudioFrequencyValidation(assert) {
    let threw = false;
    try {
        AudioFrequency.play(0, 1);
    } catch (error) {
        threw = error.message.includes('frequency');
    }
    assert(threw, 'AudioFrequency should validate frequency input');
}

function testSynthesizerRepeatedStopSafety(assert) {
    const originalAudioContext = window.AudioContext;
    const originalWebkitAudioContext = window.webkitAudioContext;

    const MockAudioContext = installAudioContextMock();
    window.AudioContext = MockAudioContext;
    window.webkitAudioContext = null;

    try {
        const synthesizer = new Synthesizer();

        for (let i = 0; i < 10; i += 1) {
            synthesizer.playNoteDirectly('C', '4n', 3);
            synthesizer.stopAllNotes();
        }

        assert(synthesizer.activeNodes.size === 0, 'Synthesizer stopAllNotes should not leak active audio nodes after repeated calls');
    } finally {
        window.AudioContext = originalAudioContext;
        window.webkitAudioContext = originalWebkitAudioContext;
    }
}

export function testOutputCore(assert) {
    testSynthesizerStatics(assert);
    testSynthesizerRepeatedStopSafety(assert);
    testAudioPlayerLifecycle(assert);
    testAudioPlaybackControllerAllowlist(assert);
    testAudioFrequencyValidation(assert);
}
