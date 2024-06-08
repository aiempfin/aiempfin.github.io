class AudioVisualizer {
  constructor(audioContext, processFrame, processError) {
    this.audioContext = audioContext;
    this.processFrame = processFrame;
    this.connectStream = this.connectStream.bind(this);
    navigator.mediaDevices.getUserMedia({ audio: true, video: false })
      .then(this.connectStream)
      .catch((error) => {
        if (processError) {
          processError(error);
        }
      });
  }

  connectStream(stream) {
    this.analyser = this.audioContext.createAnalyser();
    const source = this.audioContext.createMediaStreamSource(stream);
    source.connect(this.analyser);
    this.analyser.smoothingTimeConstant = 0.5;
    this.analyser.fftSize = 32;

    this.initRenderLoop(this.analyser);
  }

  initRenderLoop() {
    const frequencyData = new Uint8Array(this.analyser.frequencyBinCount);
    const processFrame = this.processFrame || (() => {});

    const renderFrame = () => {
      this.analyser.getByteFrequencyData(frequencyData);
      processFrame(frequencyData);

      requestAnimationFrame(renderFrame);
    };
    requestAnimationFrame(renderFrame);
  }
}

const visualMainElement = document.querySelector('main');
const visualValueCount = 16;
let visualElements;
const createDOMElements = () => {
  for (let i = 0; i < visualValueCount; ++i) {
    const elm = document.createElement('div');
    visualMainElement.appendChild(elm);
  }

  visualElements = document.querySelectorAll('main div');
};
createDOMElements();

const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const audioVisualizer = new AudioVisualizer(audioContext, processFrame);

function processFrame(data) {
  const values = Object.values(data);
  let sum = 0;
  values.forEach((value) => sum += value);
  const avg = sum / values.length;

  for (let i = 0; i < visualValueCount; ++i) {
    const value = values[i] / 255;
    const elmStyles = visualElements[i].style;
    elmStyles.transform = `scaleY(${value})`;
    elmStyles.opacity = Math.max(0.25, value);
  }
}
