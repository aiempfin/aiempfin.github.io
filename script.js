const startButton = document.getElementById('startButton');
const visualizationCanvas = document.getElementById('visualizationCanvas');
const canvasCtx = visualizationCanvas.getContext('2d');
let audioContext;
let analyser;
let bufferLength;

startButton.addEventListener('click', () => {
  // Initialize audio context and analyzer
  audioContext = new (window.AudioContext || window.webkitAudioContext)();
  analyser = audioContext.createAnalyser();
  analyser.fftSize = 256;
  bufferLength = analyser.frequencyBinCount;

  // Connect microphone input to analyzer
  navigator.mediaDevices.getUserMedia({ audio: true })
    .then((stream) => {
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
    })
    .catch((error) => {
      console.error('Error accessing microphone:', error);
      alert('Error accessing microphone. Please try again.');
    });

  // Start drawing waveform
  drawWaveform();
});

function drawWaveform() {
  const dataArray = new Uint8Array(bufferLength);

  function draw() {
    const WIDTH = visualizationCanvas.width;
    const HEIGHT = visualizationCanvas.height;

    analyser.getByteTimeDomainData(dataArray);

    canvasCtx.fillStyle = 'rgb(200, 200, 200)';
    canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

    canvasCtx.lineWidth = 2;
    canvasCtx.strokeStyle = 'rgb(0, 0, 0)';
    canvasCtx.beginPath();

    const sliceWidth = (WIDTH * 1.0) / bufferLength;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
      const v = dataArray[i] / 128.0;
      const y = (v * HEIGHT) / 2;

      if (i === 0) {
        canvasCtx.moveTo(x, y);
      } else {
        canvasCtx.lineTo(x, y);
      }

      x += sliceWidth;
    }

    canvasCtx.lineTo(visualizationCanvas.width, visualizationCanvas.height / 2);
    canvasCtx.stroke();

    requestAnimationFrame(draw);
  }

  draw();
}
