import AudioPlayer from '../../engine/output/audioPlayer.js';

const AUDIO_FILES = [
    'elemental-magic.mp3',
    'relaxing-guitar-loop.mp3',
    'Alesis-Sanctuary.wav',
    'Ouch-6.wav'
];

const audioPlayer = new AudioPlayer('./fx');
let selectedFile = AUDIO_FILES[0];

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

    try {
        await AudioPlayer.loadAllAudioFiles(AUDIO_FILES, audioPlayer);
        setStatus('Audio samples loaded. Click Play to hear a sample.');
        setError('');
    } catch (error) {
        setError(error.message);
        setStatus('Failed to load one or more audio samples.');
    }
}

async function playSelected() {
    try {
        audioPlayer.playAudio(selectedFile);
        setStatus(`Playing: ${selectedFile}`);
        setError('');
    } catch (error) {
        setError(error.message);
    }
}

function stopLooping() {
    audioPlayer.stopAllLooping();
    setStatus('Stopped all looping audio.');
}

function setupControls() {
    const selected = document.getElementById('selected-audio');
    const playButton = document.getElementById('play-selected');
    const stopButton = document.getElementById('stop-looping');

    if (!selected || !playButton || !stopButton) {
        setError('Audio controls are missing from index.html.');
        return;
    }

    selected.addEventListener('change', (event) => {
        selectedFile = event.target.value;
        setStatus(`Selected: ${selectedFile}`);
    });

    playButton.addEventListener('click', playSelected);
    stopButton.addEventListener('click', stopLooping);
}

window.addEventListener('load', async () => {
    setupControls();
    await loadAudioFiles();
});
