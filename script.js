// script.js

document.getElementById('startButton').addEventListener('click', () => {
    startSignalGeneration();
});

async function startSignalGeneration() {
    const fs = 44100; // Sampling frequency
    const frequencies = [];
    for (let f = 100; f <= 10000; f += 500) {
        frequencies.push(f);
    }

    for (let f of frequencies) {
        // Generate sine wave
        const { t, xn } = genSineWave(0.5, 5, f, 0, fs);

        // Plot first 2 cycles
        plotSineWave(t, xn, f);

        // Log frequency
        logMessage(`Playing frequency: ${f} Hz`);

        // Play sound
        await playSound(xn, fs);

        // Pause for 0.5 seconds
        //await sleep(500);
    }

    logMessage("Signal generation completed!");
}

function genSineWave(amplitude, totalTime, freq, phase, fs) {
    const Ts = 1 / fs;
    const n = Math.floor(totalTime / Ts);
    const xn = [];
    const t = [];
    for (let i = 0; i <= n; i++) {
        const time = i * Ts;
        t.push(time);
        xn.push(amplitude * Math.sin(2 * Math.PI * freq * time + phase));
    }
    return { t, xn };
}

function plotSineWave(t, xn, freq) {
    const cycles = 2;
    const period = 1 / freq;
    const timeLength = cycles * period;
    const numSamples = Math.floor(timeLength / (t[1] - t[0])) + 1;

    const trace = {
        x: t.slice(0, numSamples),
        y: xn.slice(0, numSamples),
        mode: 'lines+markers',
        type: 'scatter',
        name: `${freq} Hz`
    };

    const layout = {
        title: `Sine Wave - ${freq} Hz`,
        xaxis: { title: 'Time (s)' },
        yaxis: { title: 'Amplitude' },
        margin: { t: 50 }
    };

    Plotly.newPlot('plot', [trace], layout, {responsive: true});
}

function logMessage(message) {
    const logDiv = document.getElementById('log');
    const p = document.createElement('p');
    p.textContent = message;
    logDiv.appendChild(p);
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function playSound(xn, fs) {
    return new Promise((resolve) => {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        const audioCtx = new AudioContext();
        const buffer = audioCtx.createBuffer(1, xn.length, fs);
        const channelData = buffer.getChannelData(0);
        for (let i = 0; i < xn.length; i++) {
            channelData[i] = xn[i];
        }
        const source = audioCtx.createBufferSource();
        source.buffer = buffer;
        source.connect(audioCtx.destination);
        source.start();

        // Wait until the sound has finished playing
        source.onended = () => {
            audioCtx.close();
            resolve();
        };
    });
}
