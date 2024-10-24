// service-worker.js
const audioPath = 'assets/effects/';
const audioFiles = [
    'explosion.wav',
    'fastinvader1.wav',
    'fastinvader2.wav',
    'fastinvader3.wav',
    'fastinvader4.wav',
    'invaderkilled.wav',
    'shoot.wav',
    'ufo_highpitch.wav',
    'ufo_lowpitch.wav'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open('audio-cache').then(cache => {
            return cache.addAll(audioFiles.map(file => `${audioPath}${file}`));
        })
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request);
        })
    );
});

// Register the service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('Service Worker registered with scope:', registration.scope);
      })
      .catch(error => {
        console.error('Service Worker registration failed:', error);
      });
  });
}

function playCachedWav(filename) {
  // Create a new audio object with the updated path
  const audio = new Audio(`${audioPath}${filename}`);
  audio.play().catch(error => {
    console.error('Error playing audio:', error);
  });
}
