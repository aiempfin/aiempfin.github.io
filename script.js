document.addEventListener('DOMContentLoaded', async () => {
  // Import required classes from Three.js library
  const { Scene, PerspectiveCamera, WebGLRenderer, SphereGeometry, Mesh, ShaderMaterial, Clock } = THREE;

  // Setup scene, camera, and renderer
  const scene = new Scene();
  const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 20;
  const renderer = new WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.getElementById('visualization').appendChild(renderer.domElement);

  // Create a sphere geometry (globe)
  const geometry = new SphereGeometry(10, 64, 64);
  const material = new ShaderMaterial({
    vertexShader: `
      varying vec3 vNormal;

      void main() {
        vNormal = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      varying vec3 vNormal;
      uniform vec3 color;

      void main() {
        float intensity = pow(0.5 - dot(vNormal, vec3(0.0, 0.0, 0.5)), 1.0);
        gl_FragColor = vec4(color * intensity, 1.0);
      }
    `,
    uniforms: {
      color: { value: new THREE.Color(0x00ff00) }
    },
    wireframe: true
  });
  const globe = new Mesh(geometry, material);
  scene.add(globe);

  // Setup audio context and analyzer
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

  const clock = new Clock();

  // Function to animate the globe based on audio input
  function animate() {
    requestAnimationFrame(animate);

    const time = clock.getElapsedTime();

    const intensity = Math.sin(time * 2.0) * 0.5 + 0.5;

    // Get frequency data
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteFrequencyData(dataArray);

    // Modify globe color intensity based on audio data
    const averageVolume = dataArray.reduce((acc, val) => acc + val, 0) / bufferLength;
    material.uniforms.color.value.set(0x00ff00 + intensity * 0xff0000 + averageVolume * 10);

    renderer.render(scene, camera);
  }

  // Start audio processing and animation
  initAudio().then(() => {
    animate();
  });
});
