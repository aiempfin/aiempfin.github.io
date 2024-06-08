document.addEventListener('DOMContentLoaded', () => {
  const orb = document.getElementById('orb');
  let isListening = false;
  let audioContext;
  let analyser;
  let dataArray;

  const startButton = document.getElementById('start-button');
  startButton.addEventListener('click', async () => {
    if (!isListening) {
      // Start listening
      startButton.textContent = 'Stop Listening';
      isListening = true;
      await startListening();
    } else {
      // Stop listening
      startButton.textContent = 'Start Listening';
      isListening = false;
      stopListening();
    }
  });

  // Function to start listening to microphone input
  async function startListening() {
    try {
      // Request access to user's microphone
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Create audio context and analyzer
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
      analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);

      // Create a Uint8Array to store frequency data
      dataArray = new Uint8Array(analyser.frequencyBinCount);

      // Start processing audio input
      processAudio();
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  }

  // Function to stop listening and release resources
  function stopListening() {
    audioContext.close();
  }

  // Function to process audio input
  function processAudio() {
    if (!isListening) return;

    // Get frequency data
    analyser.getByteFrequencyData(dataArray);

    // Calculate average amplitude
    const sum = dataArray.reduce((acc, val) => acc + val, 0);
    const averageAmplitude = sum / dataArray.length;

    // Adjust orb size based on average amplitude
    const scale = 1 + averageAmplitude / 200; // Adjust scale based on amplitude
    orb.style.transform = `scale(${scale})`;

    // Continue processing audio input
    requestAnimationFrame(processAudio);
  }
});
