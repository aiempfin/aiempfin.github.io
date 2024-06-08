const startButton = document.getElementById('startButton');
const visualizationCanvas = document.getElementById('visualizationCanvas');
const canvasCtx = visualizationCanvas.getContext('2d');

let audioContext;
let analyser;
let bufferLength;

startButton.addEventListener('click', () => {
  // Request access to the user's microphone for speech recognition
  const recognition = new webkitSpeechRecognition() || new SpeechRecognition();
  recognition.continuous = true; // Enable continuous recognition
  recognition.lang = 'en-US'; // Set language to English (United States)
  
  // Start speech recognition when the button is clicked
  recognition.start();

  // Event listener for when speech is recognized
  recognition.onresult = (event) => {
    const transcript = event.results[event.results.length - 1][0].transcript;
    visualizeTranscript(transcript);
    visualizeSpeaking(); // Add visual effect when speaking
  };

  // Event listener for errors
  recognition.onerror = (event) => {
    console.error('Speech recognition error:', event.error);
    alert('Speech recognition encountered an error. Please try again.');
  };

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

function visualizeTranscript(transcript) {
  // Display the transcript on the webpage
  const p = document.createElement('p');
  p.textContent = transcript;
  visualizationCanvas.parentNode.insertBefore(p, visualizationCanvas.nextSibling);
}

function visualizeSpeaking() {
  // Add visual effect when speaking
  visualizationCanvas.style.backgroundColor = '#ffcc00'; // Change background color
  setTimeout(() => {
    visualizationCanvas.style.backgroundColor = ''; // Reset background color after a short delay
  }, 300);
}

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
