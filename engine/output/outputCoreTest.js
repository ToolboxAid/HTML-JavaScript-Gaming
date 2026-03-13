import AudioPlayer from './audioPlayer.js';
import AudioFrequency from './audioFrequency.js';
import Synthesizer from './synthesizer.js';

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
                start() {},
                stop() {},
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
                connect() {}
            };
        }

        createDelay() {
            return {
                delayTime: { value: 0 },
                connect() {}
            };
        }

        createConvolver() {
            return {
                connect() {}
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

function testAudioFrequencyValidation(assert) {
    let threw = false;
    try {
        AudioFrequency.play(0, 1);
    } catch (error) {
        threw = error.message.includes('frequency');
    }
    assert(threw, 'AudioFrequency should validate frequency input');
}

export function testOutputCore(assert) {
    testSynthesizerStatics(assert);
    testAudioPlayerLifecycle(assert);
    testAudioFrequencyValidation(assert);
}
