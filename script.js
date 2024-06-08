document.addEventListener('DOMContentLoaded', async () => {
  const siri = document.getElementById('siri');

  // Create audio context and analyzer
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const analyser = audioContext.createAnalyser();
  analyser.fftSize = 2048;
  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);

  // Get microphone input
  navigator.mediaDevices.getUserMedia({ audio: true })
    .then(stream => {
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
    })
    .catch(error => {
      console.error('Error accessing microphone:', error);
    });

  // Function to update Siri animation based on voice input
  function updateSiri() {
    // Get frequency data
    analyser.getByteFrequencyData(dataArray);

    // Calculate average volume
    const volume = dataArray.reduce((acc, val) => acc + val, 0) / bufferLength;

    // Adjust Siri animation based on volume level
    if (volume > 100) {
      siri.style.animationPlayState = 'running';
    } else {
      siri.style.animationPlayState = 'paused';
    }

    // Call recursively to update in real-time
    requestAnimationFrame(updateSiri);
  }

  // Start updating Siri animation
  updateSiri();
});
