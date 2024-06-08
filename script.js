document.addEventListener('DOMContentLoaded', async () => {
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
  
  // Get visualization, volume, and pitch elements
  const visualization = document.getElementById('visualization');
  const volumeText = document.getElementById('volume');
  const pitchText = document.getElementById('pitch');

  // Function to update visualization based on audio levels and pitch
  function updateVisualization() {
    // Get frequency data
    analyser.getByteFrequencyData(dataArray);
    
    // Calculate average volume
    const volume = dataArray.reduce((acc, val) => acc + val, 0) / bufferLength;
    
    // Calculate dominant pitch frequency
    const pitch = getPitchFrequency(dataArray);
    
    // Update visualization size, color, volume text, and pitch text
    visualization.style.width = `${volume}px`;
    visualization.style.height = `${volume}px`;
    visualization.style.backgroundColor = `rgb(${pitch}, ${255 - pitch}, 100)`;
    volumeText.textContent = volume;
    pitchText.textContent = pitch.toFixed(2);

    // Call recursively to update in real-time
    requestAnimationFrame(updateVisualization);
  }
  
  // Start updating visualization
  updateVisualization();
});

// Function to get dominant pitch frequency from frequency data
function getPitchFrequency(dataArray) {
  const peakThreshold = 100; // Adjust this threshold to control sensitivity
  const frequencies = [];
  for (let i = 0; i < dataArray.length; i++) {
    frequencies.push({ frequency: i * audioContext.sampleRate / analyser.fftSize, amplitude: dataArray[i] });
  }
  const peak = frequencies.reduce((prev, curr) => (curr.amplitude > prev.amplitude ? curr : prev));
  return peak.frequency;
}
