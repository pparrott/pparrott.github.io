// Visual requires microphone input 

// Starting parameters
let visualization = '4';
let waves = 2;
let fills = [
    'rgb(255, 255, 255)',
    'rgb(0, 0, 0)'
];
let strokes = [
    'rgb(0, 0, 0)',
    'rgb(255, 255, 255)'
];
// Variable init
let audioStream;
let dataArray;
let dataArrayHi;
let dataArrayLo;
let bufferLength;
let bufferLengthHi;
let bufferLengthLo;
let singleWaveFill;
let singleWaveStroke;

let dualWaveArray;

// Get canvas context
const canvas = document.querySelector('canvas');
const canvasCtx = canvas.getContext('2d');

// Get audio context and create nodes
var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
var analyser = audioCtx.createAnalyser();  // for pure audio
var analyserFreq = audioCtx.createAnalyser();
var analyserHi = audioCtx.createAnalyser();
var analyserLo = audioCtx.createAnalyser();
var gainNode = audioCtx.createGain();
gainNode.gain.value = 1;
var gainLo = audioCtx.createGain();
gainLo.gain.value = 1.5;
var filterHi = audioCtx.createBiquadFilter();
filterHi.type = "highpass";
filterHi.frequency.value = 250;
var filterLo = audioCtx.createBiquadFilter();
filterLo.type = "lowpass"
filterLo.frequency.value = 150;

// Have the promise call everything relevant (including the initial draw frame)
// This grabs the mic as an input
navigator.mediaDevices.getUserMedia({audio: true, video: false})
.then(function(stream) {
    // Cut the cursor
    document.body.style.cursor = 'none';

    // Get the mic input as "audioStream"
    let options = {mediaStream: stream};
    audioStream = new MediaStreamAudioSourceNode(audioCtx, options);

    // Connect the wires
    filterHi.connect(analyserHi);
    gainNode.connect(filterHi);

    filterLo.connect(analyserLo);
    gainLo.connect(filterLo);
    gainNode.connect(gainLo);
    
    gainNode.connect(analyser);
    gainNode.connect(analyserFreq);

    audioStream.connect(gainNode);

    // Capture data using analyser methods (more are featured on the site)
    analyser.fftSize = 2048;
    analyserFreq.fftSize = 128;
    analyserFreq.smoothingTimeConstant = 0.69;
    analyserHi.fftSize = 2048;
    analyserLo.fftSize = 2048;

    bufferLength = analyser.frequencyBinCount;
    bufferLengthFreq = analyserFreq.frequencyBinCount;
    bufferLengthHi = analyserHi.frequencyBinCount;
    bufferLengthLo = analyserLo.frequencyBinCount;
    // needs to be stored in a different array due to the data type
    dataArray = new Uint8Array(bufferLength);
    dataArrayFreq = new Uint8Array(bufferLengthFreq);
    dataArrayHi = new Uint8Array(bufferLengthHi);
    dataArrayLo = new Uint8Array(bufferLengthLo);
    draw();
    console.log('initiated');

}).catch(function(err) {
    console.log(err);
});

// Change visualizer based on key input:
window.addEventListener('keydown', changeVisual, false)

function changeVisual(e) {
    switch (e.key){
        case 'z':
            visualization = '1';
            break;
        case 'x':
            visualization = '2';
            singleWaveFill = fills[1];
            singleWaveStroke = strokes[1];
            break;
        case 'c':
            visualization = '2';
            singleWaveFill = fills[0];
            singleWaveStroke = strokes[0];
            break;
        case 'v':
            visualization = '3';
            singleWaveFill = fills[1];
            break;
        case 'b':
            visualization = '4';
            singleWaveFill = fills[1];
            singleWaveStroke = strokes[1];
            break;
        case 'n':
            visualization = '5';
            singleWaveFill = fills[1];
            singleWaveStroke = strokes[1];
            break;
        case 'm':
            visualization = '5';
            singleWaveFill = fills[0];
            singleWaveStroke = strokes[0];
            break;
    }
}

// Let's make an oscilloscope with the above
function draw() {
    // Refresh canvas size every frame and clear
    canvasCtx.canvas.width = window.innerWidth;
    canvasCtx.canvas.height = window.innerHeight;
    canvasCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    
    switch(visualization) {
        case '1':
            drawDualWave();
            break;
        case '2':
            drawSingleWave();
            break;
        case '3':
            drawFreqData();
            break;
        case '4':
            drawFreqDataCircle();
            break;
        case '5':
            drawOscilloCircle();
            break;
    } 
    requestAnimationFrame(draw);
}

function drawDualWave() {
    
    analyser.getByteTimeDomainData(dataArray);
    analyserHi.getByteTimeDomainData(dataArrayHi);
    analyserLo.getByteTimeDomainData(dataArrayLo);
    
    let sliceWidth = canvas.width / bufferLength;
    
    for (let i = 0; i < waves; i++) {
        let currHeight = canvas.height / waves;
        let currWidth = canvas.width;
        let x = 0;

        if (i == 0) dualWaveArray = dataArrayHi;
        else dualWaveArray = dataArrayLo;
    
        canvasCtx.fillStyle = fills[i];
        canvasCtx.fillRect(0, currHeight * i, currWidth, currHeight);
    
        canvasCtx.lineWidth = 2;
        canvasCtx.strokeStyle = strokes[i];
        canvasCtx.beginPath();
    
        for (let j = 0; j < dualWaveArray.length; j++) {
            let v = dualWaveArray[j] / 128.0;
            let y = v * currHeight / 2 + currHeight * i;
            
            if (j === 0) canvasCtx.moveTo(x, y);
            else canvasCtx.lineTo(x, y);
    
            x += sliceWidth;
        }
    
        canvasCtx.lineTo(currWidth, currHeight / 2 + currHeight * i);
        canvasCtx.stroke();
    }
}

function drawSingleWave() {
    analyser.getByteTimeDomainData(dataArray);
    
    let sliceWidth = canvas.width / bufferLength;
    let currHeight = canvas.height;
    let currWidth = canvas.width;
    let x = 0;

    canvasCtx.fillStyle = singleWaveFill;
    canvasCtx.fillRect(0, 0, currWidth, currHeight);

    canvasCtx.lineWidth = 2;
    canvasCtx.strokeStyle = singleWaveStroke;
    canvasCtx.beginPath();

    for (let j = 0; j < bufferLength; j++) {
        let v = dataArray[j] / 128.0;
        let y = v * currHeight / 2;
        
        if (j === 0) canvasCtx.moveTo(x, y);
        else canvasCtx.lineTo(x, y);

        x += sliceWidth;
    } 
    canvasCtx.lineTo(currWidth, currHeight / 2);
    canvasCtx.stroke();
}

function drawFreqData() {
    analyserFreq.getByteFrequencyData(dataArrayFreq);

    let sliceWidth = canvas.width / bufferLengthFreq;
    let currHeight = canvas.height;
    let currWidth = canvas.width;
    let x = 0;

    // fill background
    canvasCtx.fillStyle = singleWaveFill;
    canvasCtx.fillRect(0, 0, currWidth, currHeight);

    for (let i = 0; i < bufferLengthFreq; i++) {
        let v = dataArrayFreq[i] / 256;
        let y = currHeight * (1 - v) - 1;

        let hue = Math.floor(i/bufferLengthFreq * 360);
        // canvasCtx.lineWidth = 0;
        canvasCtx.fillStyle = 'hsl(' + hue + ', 50%, 50%)';
        canvasCtx.fillRect(x, y, sliceWidth, currHeight - y);
        x += sliceWidth;
    }
}

function drawFreqDataCircle() {
    analyserFreq.getByteFrequencyData(dataArrayFreq);
    analyserLo.getByteTimeDomainData(dataArrayLo);
    analyserHi.getByteTimeDomainData(dataArrayHi);

    let currHeight = canvas.height;
    let currWidth = canvas.width;

    // fill background
    canvasCtx.fillStyle = singleWaveFill;
    canvasCtx.fillRect(0, 0, currWidth, currHeight);

    for (let i = 0; i < bufferLengthFreq; i++) {
        let v = dataArrayFreq[i] / 256;
        let theta = i / bufferLengthFreq * 2 * Math.PI;
        let thetaMovement = 1 / bufferLengthFreq * Math.PI;  
        let circleRadius = currHeight / 100;
        let barHeight = currHeight / 2 * (v) - circleRadius;

        let centerX = currWidth / 2;
        let centerY = currHeight / 2;

        let hue = Math.floor(barHeight / (currHeight / 2) * 360);
        // circle co-ordinates
        let x1 = Math.cos(theta + thetaMovement); 
        let x2 = Math.cos(theta - thetaMovement);
        let y1 = Math.sin(theta + thetaMovement); 
        let y2 = Math.sin(theta - thetaMovement);

        canvasCtx.beginPath();
        canvasCtx.moveTo(centerX + x1 * circleRadius, centerY + y1 * circleRadius);
        canvasCtx.lineTo(centerX + x1 * (circleRadius + barHeight), centerY + y1 * (circleRadius + barHeight));
        canvasCtx.lineTo(centerX + x2 * (circleRadius + barHeight), centerY + y2 * (circleRadius + barHeight));
        canvasCtx.lineTo(centerX + x2 * circleRadius, centerY + y2 * circleRadius);
        // canvasCtx.lineWidth = 0;
        canvasCtx.fillStyle = 'hsl(' + hue + ', 58%, 36%)';
        canvasCtx.fill();
    }

    // Left side of screen, low frequencies

    let sliceWidth = canvas.height / bufferLength;
    let y = 0;
    let xRange = (currWidth - currHeight) / 4;

    canvasCtx.lineWidth = 2;
    canvasCtx.strokeStyle = singleWaveStroke;
    canvasCtx.beginPath();

    for (let i = 0; i < bufferLength; i++) {
        let v = dataArrayLo[i] / 128;
        let x = v * xRange;

        if (i === 0) canvasCtx.moveTo(x, y);
        else canvasCtx.lineTo(x, y);

        y += sliceWidth;
    }

    y = 0;

    for (let i = 0; i < bufferLength; i++) {
        let v = dataArrayHi[i] / 128;
        let x = currWidth - v * xRange;

        if (i === 0) canvasCtx.moveTo(x, y);
        else canvasCtx.lineTo(x, y);

        y += sliceWidth;
    }

    canvasCtx.stroke();
}

function drawOscilloCircle() {
    analyserLo.getByteTimeDomainData(dataArrayLo);
    analyserHi.getByteTimeDomainData(dataArrayHi);
    
    let currHeight = canvas.height;
    let currWidth = canvas.width;

    let centerCornX;
    let centerCornY;
    let cornerVel;

    if (currHeight > currWidth / 2) cornerVel = (currWidth - currHeight) / 4;
    else cornerVel = currHeight / 4;

    canvasCtx.fillStyle = singleWaveFill;
    canvasCtx.fillRect(0, 0, currWidth, currHeight);

    canvasCtx.lineWidth = 2;
    canvasCtx.strokeStyle = singleWaveStroke;
    canvasCtx.beginPath();

    let centerX = currWidth / 2;
    let centerY = currHeight / 2;

    //  centered lowFreq waveform in a circle
    for (let j = 0; j < bufferLengthLo; j++) {
        let v = dataArrayLo[j] / 128.0;
        let theta = j / bufferLengthLo * 2 * Math.PI;
        let circleRadius = 0;
        let vel = currHeight / 2 * v / 2; 

        let x = Math.cos(theta) * (circleRadius + vel) + centerX;
        let y = Math.sin(theta) * (circleRadius + vel) + centerY;
        
        if (j === 0) canvasCtx.moveTo(x, y);
        else canvasCtx.lineTo(x, y);
    } 

    for (let i = 0; i < 4; i++) {
        switch(i) {
            case 0:
                centerCornX = (currWidth - currHeight) / 4;
                centerCornY = currHeight / 4;
                break;
            case 1:
                centerCornX = currWidth - (currWidth - currHeight) / 4;
                centerCornY = currHeight / 4;
                break;
            case 2:
                centerCornX = (currWidth - currHeight) / 4;
                centerCornY = currHeight - currHeight / 4;
                break;
            case 3:
                centerCornX = currWidth - (currWidth - currHeight) / 4;
                centerCornY = currHeight - currHeight / 4;
                break;
        }

        for (let j = 0; j < bufferLengthHi; j++) {
            let v = dataArrayHi[j] / 128.0;
            let theta = j / bufferLengthLo * 2 * Math.PI;
            let circleRadius = 0;
            let vel = cornerVel * v / 2; 

            let x = Math.cos(theta) * (circleRadius + vel) + centerCornX;
            let y = Math.sin(theta) * (circleRadius + vel) + centerCornY;

            if (j === 0) canvasCtx.moveTo(x ,y);
            else canvasCtx.lineTo(x, y);
        }
    } 
    
    canvasCtx.stroke();

}