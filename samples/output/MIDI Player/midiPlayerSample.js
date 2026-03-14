import MidiPlayer from '../../../engine/output/midiPlayer.js';

const ALLOWED_EXTENSIONS = new Set(['mid', 'midi', 'kar']);
const midiPlayer = new MidiPlayer('filesinput', { positionInputId: 'position' });
let isDestroyed = false;

// Transport orchestration is intentionally separated from DOM wiring.
const transport = {
    play() {
        midiPlayer.play();
    },
    pause() {
        midiPlayer.pause();
    },
    stop() {
        midiPlayer.stop();
    },
    setAutoplay(enabled) {
        midiPlayer.setAutoplay(Boolean(enabled));
    },
    seek(positionTenths) {
        return midiPlayer.setPosition(positionTenths);
    },
    destroy() {
        if (isDestroyed) {
            return;
        }
        isDestroyed = true;
        midiPlayer.destroy();
    }
};

function setStatus(message) {
    const status = document.getElementById('status');
    if (status) {
        status.textContent = message;
    }
}

function setError(message = '') {
    const error = document.getElementById('error');
    if (error) {
        error.textContent = message;
    }
}

function isAllowedMidiFile(file) {
    if (!file || typeof file.name !== 'string') {
        return false;
    }

    const extension = file.name.split('.').pop()?.toLowerCase();
    return ALLOWED_EXTENSIONS.has(extension || '');
}

function handlePlay() {
    transport.play();
    setStatus('Playing MIDI file...');
    setError('');
}

function handlePause() {
    transport.pause();
    setStatus('Playback paused.');
    setError('');
}

function handleStop() {
    transport.stop();
    setStatus('Playback stopped.');
    setError('');
}

function handlePositionChange(event) {
    const positionValue = Number(event.target.value);
    const success = transport.seek(positionValue);
    if (!success) {
        setError('Position seek is not available for this MIDI runtime.');
    } else {
        setError('');
    }
}

function handleFileSelection(event) {
    const file = event.target.files?.[0];
    if (!file) {
        setStatus('No MIDI file selected.');
        return;
    }

    if (!isAllowedMidiFile(file)) {
        event.target.value = '';
        setError('Only .mid, .midi, or .kar files are supported.');
        setStatus('Invalid file type.');
        return;
    }

    setError('');
    setStatus(`Loaded file: ${file.name}`);
}

function setupControls() {
    const fileInput = document.getElementById('filesinput');
    const playButton = document.getElementById('play-button');
    const pauseButton = document.getElementById('pause-button');
    const stopButton = document.getElementById('stop-button');
    const autoplay = document.getElementById('autoplay');
    const position = document.getElementById('position');

    if (!fileInput || !playButton || !pauseButton || !stopButton || !autoplay || !position) {
        setError('MIDI controls are missing from index.html.');
        return;
    }

    fileInput.addEventListener('change', handleFileSelection);
    playButton.addEventListener('click', handlePlay);
    pauseButton.addEventListener('click', handlePause);
    stopButton.addEventListener('click', handleStop);
    autoplay.addEventListener('change', (event) => transport.setAutoplay(event.target.checked));
    position.addEventListener('input', handlePositionChange);

    setStatus('Select a MIDI file, then press Play.');
}

window.addEventListener('load', setupControls);
window.addEventListener('beforeunload', () => transport.destroy());
