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

  // Render visualization based on audio input
  function render() {
    // Get frequency data
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteTimeDomainData(dataArray);

    // Calculate average volume
    let volume = 0;
    for (let i = 0; i < bufferLength; i++) {
      volume += Math.abs(dataArray[i] - 128);
    }
    volume /= bufferLength;

    // Adjust microphone size based on volume
    const scaleFactor = 1 + volume / 128;
    microphone.style.transform = `scale3d(${scaleFactor}, ${scaleFactor}, 1)`;

    // Call render function again
    requestAnimationFrame(render);
  }

  // Start audio processing
  document.getElementById('start-btn').addEventListener('click', async () => {
    await initAudio();
    render();
  });

  // Stop audio processing
  document.getElementById('stop-btn').addEventListener('click', () => {
    if (audioContext) {
      audioContext.close();
    }
  });
});
