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
    analyser.getByteFrequencyData(dataArray);

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw visualization
    const barWidth = (canvas.width / bufferLength) * 2.5;
    let x = 0;
    for (let i = 0; i < bufferLength; i++) {
      const barHeight = dataA
