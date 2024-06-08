let audioContext;
let analyser;
let visualMainElement;
let visualElements;
const visualValueCount = 16;

function startVisualization() {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    visualMainElement = document.querySelector('main');
    createDOMElements();

    navigator.mediaDevices.getUserMedia({ audio: true, video: false })
        .then(connectStream)
        .catch((error) => {
            console.error('Error accessing microphone:', error);
            showError('Please allow access to your microphone.');
        });
}

function connectStream(stream) {
    analyser = audioContext.createAnalyser();
    const source = audioContext.createMediaStreamSource(stream);
    source.connect(analyser);
    analyser.smoothingTimeConstant = 0.5;
    analyser.fftSize = 32;

    initRenderLoop();
}

function initRenderLoop() {
    const frequencyData = new Uint8Array(analyser.frequencyBinCount);

    const renderFrame = () => {
        analyser.getByteFrequencyData(frequencyData);
        processFrame(frequencyData);

        requestAnimationFrame(renderFrame);
    };
    requestAnimationFrame(renderFrame);
}

function createDOMElements() {
    visualMainElement.innerHTML = '';
    for (let i = 0; i < visualValueCount; ++i) {
        const elm = document.createElement('div');
        visualMainElement.appendChild(elm);
    }

    visualElements = document.querySelectorAll('main div');
}

function processFrame(data) {
    const values = Object.values(data);
    let sum = 0;
    values.forEach((value) => (sum += value));
    const avg = sum / values.length;

    for (let i = 0; i < visualValueCount; ++i) {
        const value = values[i] / 255;
        const elmStyles = visualElements[i].style;
        elmStyles.transform = `scaleY(${value})`;
        elmStyles.opacity = Math.max(0.25, value);
    }
}

function showError(message) {
    visualMainElement.classList.add('error');
    visualMainElement.innerText = message;
}
