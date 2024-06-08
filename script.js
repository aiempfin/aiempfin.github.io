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

  // Render circular waveform visualization based on audio input
  function render() {
    // Get frequency data
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteFrequencyData(dataArray);

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw circular waveform visualization
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const maxRadius = Math.min(centerX, centerY);
    const sliceAngle = (Math.PI * 2) / bufferLength;
    const lineWidth = 4;

    for (let i = 0; i < bufferLength; i++) {
      const v = dataArray[i] / 128.0;
      const radius = maxRadius * (v / 2);
      const angle = sliceAngle * i;

      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, angle, angle + sliceAngle);
      ctx.strokeStyle = `rgba(0, 204, 255, ${1 - i / bufferLength})`;
      ctx.lineWidth = lineWidth;
      ctx.stroke();
    }

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
