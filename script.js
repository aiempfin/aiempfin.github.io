document.addEventListener('DOMContentLoaded', async () => {
  const visualization = document.getElementById('visualization');
  const microphone = document.createElement('div');
  microphone.classList.add('microphone');
  visualization.appendChild(microphone);
  
  let audioContext;
  let analyser;
  let bufferLength;

  // Initialize audio context and analyzer
  async function initAudio() {
    try {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const source = audioContext.createMediaStreamSource(stream);
      analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      bufferLength = analyser.frequencyBinCount;
    } catch (error) {
      console.error('Error initializing audio:', error);
    }
  }

  // Start audio processing
  document.getElementById('start-btn').addEventListener('click', async () => {
    await initAudio();
    microphone.classList.add('bounce');
  });

  // Stop audio processing
  document.getElementById('stop-btn').addEventListener('click', () => {
    if (audioContext) {
      audioContext.close();
      microphone.classList.remove('bounce');
    }
  });
});
