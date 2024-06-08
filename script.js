window.onload = function() {
    // Set up audio context
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const analyser = audioContext.createAnalyser();

    // Get microphone input
    navigator.mediaDevices.getUserMedia({ audio: true })
        .then(function(stream) {
            const microphone = audioContext.createMediaStreamSource(stream);
            microphone.connect(analyser);
            visualize();
        })
        .catch(function(err) {
            console.error('Error accessing microphone:', err);
        });

    // Function to visualize microphone input
    function visualize() {
        const canvas = document.getElementById('visualizer');
        const canvasCtx = canvas.getContext('2d');

        // Set canvas dimensions
        const WIDTH = canvas.width;
        const HEIGHT = canvas.height;

        // Set up visualization
        analyser.fftSize = 2048;
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);

        function draw() {
            requestAnimationFrame(draw);

            analyser.getByteTimeDomainData(dataArray);

            canvasCtx.fillStyle = 'rgb(0, 0, 0)';
            canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

            canvasCtx.lineWidth = 2;
            canvasCtx.strokeStyle = 'rgb(0, 255, 0)';

            canvasCtx.beginPath();

            const sliceWidth = WIDTH * 1.0 / bufferLength;
            let x = 0;

            for(let i = 0; i < bufferLength; i++) {
                const v = dataArray[i] / 128.0;
                const y = v * HEIGHT / 2;

                if(i === 0) {
                    canvasCtx.moveTo(x, y);
                } else {
                    canvasCtx.lineTo(x, y);
                }

                x += sliceWidth;
            }

            canvasCtx.lineTo(canvas.width, canvas.height / 2);
            canvasCtx.stroke();
        }

        draw();
    }
};
