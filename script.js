document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('visualizer');
  const ctx = canvas.getContext('2d');
  let audioContext;
  let analyser;
  let bufferLength;

  // Initialize audio context and analyzer
  async function initAudio() {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const source = audioContext.createMediaStreamSource(stream);
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    source.connect(analyser);
    bufferLength = analyser.frequencyBinCount;
  }

  // Render visualization based on audio input
  function render() {
    requestAnimationFrame(render);

    // Get frequency data
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteFrequencyData(dataArray);

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw visualization
    const barWidth = (canvas.width / bufferLength) * 2.5;
    let x = 0;
    for (let i = 0; i < bufferLength; i++) {
      const barHeight = dataArray[i] / 2;
      ctx.fillStyle = `rgb(${barHeight + 100}, 50, 50)`;
      ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
      x += barWidth + 1;
    }
  }

  // Start audio processing and visualization
  document.getElementById('start-btn').addEventListener('click', async () => {
    await initAudio();
    render();
  });

  // Stop audio processing
  document.getElementById('stop-btn').addEventListener('click', () => {
    audioContext.close();
  });
});
