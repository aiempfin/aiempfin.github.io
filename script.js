document.addEventListener('DOMContentLoaded', async () => {
  // Setup Three.js scene, camera, renderer, etc.
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.getElementById('visualization').appendChild(renderer.domElement);

  // Create a sphere
  const geometry = new THREE.SphereGeometry(5, 32, 32);
  const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
  const sphere = new THREE.Mesh(geometry, material);
  scene.add(sphere);

  // Setup audio context and analyser
  let audioContext;
  let analyser;
  const bufferLength = 256;

  async function initAudio() {
    try {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const source = audioContext.createMediaStreamSource(stream);
      analyser = audioContext.createAnalyser();
      analyser.fftSize = bufferLength;
      source.connect(analyser);
    } catch (error) {
      console.error('Error initializing audio:', error);
    }
  }

  // Function to animate the sphere based on audio input
  function animate() {
    requestAnimationFrame(animate);

    // Get frequency data from analyser
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteFrequencyData(dataArray);

    // Modify sphere scale based on audio data
    const averageVolume = dataArray.reduce((acc, val) => acc + val, 0) / bufferLength;
    sphere.scale.set(1 + averageVolume / 100, 1 + averageVolume / 100, 1 + averageVolume / 100);

    renderer.render(scene, camera);
  }

  // Start audio processing and animation
  initAudio().then(() => {
    animate();
  });
});
