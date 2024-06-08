const startButton = document.getElementById('startButton');
const visualization = document.getElementById('visualization');

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
  };

  // Event listener for errors
  recognition.onerror = (event) => {
    console.error('Speech recognition error:', event.error);
    alert('Speech recognition encountered an error. Please try again.');
  };
});

function visualizeTranscript(transcript) {
  // Display the transcript on the webpage
  const p = document.createElement('p');
  p.textContent = transcript;
  visualization.appendChild(p);
}
