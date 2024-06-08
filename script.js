document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('visualization');
  const ctx = canvas.getContext('2d');

  // Set canvas dimensions
  canvas.width = window.innerWidth * 0.8;
  canvas.height = window.innerHeight * 0.8;

  let audioContext;
  let analyser;
  let bufferLength;

  // Create gradient for visualization
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, '#00ccff');
  gradient.addColorStop(1, '#004466');

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
      ctx.fillStyle = gradient;
      ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
      x += barWidth + 1;
    }
  }

  // Start audio processing and visualization
  initAudio().then(() => {
    render();
  });
});
