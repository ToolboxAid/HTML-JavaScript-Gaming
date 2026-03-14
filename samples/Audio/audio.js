import AudioPlaybackController from '../../engine/output/audioPlaybackController.js';

const AUDIO_FILES = Object.freeze([
    'elemental-magic.mp3',
    'relaxing-guitar-loop.mp3',
    'Alesis-Sanctuary.wav',
    'Ouch-6.wav'
]);

const orchestrator = new AudioPlaybackController('./fx', AUDIO_FILES);

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

async function loadAudioFiles() {
    setStatus('Loading audio samples...');

    const result = await orchestrator.loadAudioFiles();
    if (result.ok) {
        setStatus('Audio samples loaded. Click Play to hear a sample.');
        setError('');
    } else {
        setError(result.error);
        setStatus(result.error);
    }
}

function playSelected() {
    const result = orchestrator.playSelected();
    if (result.ok) {
        setStatus(`Playing: ${result.selectedFile}`);
        setError('');
    } else {
        setError(result.error);
    }
}

function stopAllAudio() {
    const result = orchestrator.stopAll();
    if (result.ok) {
        setStatus('Stopped all active audio.');
        setError('');
    } else {
        setError(result.error);
    }
}

function setupControls() {
    const selected = document.getElementById('selected-audio');
    const playButton = document.getElementById('play-selected');
    const stopButton = document.getElementById('stop-all');

    if (!selected || !playButton || !stopButton) {
        setError('Audio controls are missing from index.html.');
        return;
    }

    selected.addEventListener('change', (event) => {
        const result = orchestrator.setSelectedFile(event.target.value);
        if (result.ok) {
            setStatus(`Selected: ${result.selectedFile}`);
            setError('');
        } else {
            setError(result.error);
        }
    });

    playButton.addEventListener('click', playSelected);
    stopButton.addEventListener('click', stopAllAudio);
}

window.addEventListener('load', async () => {
    setupControls();
    await loadAudioFiles();
});
