document.addEventListener('DOMContentLoaded', async () => {
  const canvas = document.getElementById('visualization');
  const ctx = canvas.getContext('2d');
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

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw robotic waveform visualization
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#00ccff';
    ctx.beginPath();
    const sliceWidth = canvas.width / bufferLength;
    let x = 0;
    for (let i = 0; i < bufferLength; i++) {
      const v = dataArray[i] / 128.0;
      const y = (v * canvas.height) / 2;
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
      x += sliceWidth;
    }
    ctx.stroke();

    // Call render function again
    requestAnimationFrame(render);
  }

  // Start audio processing and visualization
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
