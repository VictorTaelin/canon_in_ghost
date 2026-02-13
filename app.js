(() => {
  if (typeof SCORE_DATA === "undefined") {
    throw new Error("Missing SCORE_DATA. Ensure score-data.js is loaded first.");
  }

  const NOTES = SCORE_DATA.notes
    .map(([t, d, m, s]) => ({ t, d, m, s }))
    .sort((a, b) => a.t - b.t || a.s - b.s || a.m - b.m || a.d - b.d);
  const TOTAL_BEATS = SCORE_DATA.totalBeats;
  const BASE_TEMPO = Math.round(SCORE_DATA.tempo || 100);
  const MIN_MIDI = SCORE_DATA.midiRange[0];
  const MAX_MIDI = SCORE_DATA.midiRange[1];

  const KEYBOARD_WIDTH = 0;
  const BEAT_WIDTH = 20;
  const ROW_HEIGHT = 14;
  const VOICE_COLORS = {
    1: { fill: "#bcded7", stroke: "#89b4ad" },
    2: { fill: "#d2d5ee", stroke: "#9ba1c8" },
    3: { fill: "#ebe3c5", stroke: "#baa97a" },
    4: { fill: "#d7e5c9", stroke: "#9fb889" },
  };
  const VOICE_TIMBRES = {
    1: {
      gain: 0.132,
      pan: -0.3,
      detuneCents: [-4.8, 2.8],
      glide: 0.064,
      coreType: "triangle",
      layerType: "sine",
      shimmerType: "sine",
      shimmerRatio: 2.0,
      shimmerGain: 0.04,
      shimmerGainLow: 0.056,
      vibratoRate: 4.8,
      vibratoDepth: 0.0032,
      vibratoDelayRatio: 0.31,
      driftRate: 0.14,
      driftDepth: 0.00058,
      highpassHz: 98,
      lowpassMul: 2.55,
      lowpassMin: 1450,
      lowpassMax: 4300,
      lowpassPeakMul: 1.2,
      lowpassPeakMin: 1800,
      lowpassPeakMax: 5300,
      lowpassQ: 0.68,
      vowelHz: 910,
      vowelQ: 0.95,
      vowelGain: 2.8,
      airHz: 3400,
      airGain: -1.9,
      shaperDrive: 1.2,
      attackMul: 0.19,
      attackMin: 0.018,
      attackMax: 0.085,
      releaseMul: 0.53,
      releaseMin: 0.16,
      releaseMax: 0.5,
    },
    2: {
      gain: 0.129,
      pan: -0.08,
      detuneCents: [-3.9, 2.5],
      glide: 0.059,
      coreType: "triangle",
      layerType: "sine",
      shimmerType: "sine",
      shimmerRatio: 2.0,
      shimmerGain: 0.037,
      shimmerGainLow: 0.05,
      vibratoRate: 5.05,
      vibratoDepth: 0.003,
      vibratoDelayRatio: 0.29,
      driftRate: 0.16,
      driftDepth: 0.00056,
      highpassHz: 106,
      lowpassMul: 2.42,
      lowpassMin: 1420,
      lowpassMax: 4100,
      lowpassPeakMul: 1.18,
      lowpassPeakMin: 1760,
      lowpassPeakMax: 5200,
      lowpassQ: 0.66,
      vowelHz: 1020,
      vowelQ: 1.0,
      vowelGain: 2.55,
      airHz: 3250,
      airGain: -1.85,
      shaperDrive: 1.18,
      attackMul: 0.185,
      attackMin: 0.017,
      attackMax: 0.082,
      releaseMul: 0.52,
      releaseMin: 0.15,
      releaseMax: 0.48,
    },
    3: {
      gain: 0.126,
      pan: 0.22,
      detuneCents: [-4.2, 3.8],
      glide: 0.056,
      coreType: "triangle",
      layerType: "sine",
      shimmerType: "sine",
      shimmerRatio: 2.02,
      shimmerGain: 0.045,
      shimmerGainLow: 0.06,
      vibratoRate: 5.3,
      vibratoDepth: 0.00345,
      vibratoDelayRatio: 0.27,
      driftRate: 0.18,
      driftDepth: 0.0006,
      highpassHz: 114,
      lowpassMul: 2.62,
      lowpassMin: 1520,
      lowpassMax: 4550,
      lowpassPeakMul: 1.23,
      lowpassPeakMin: 1880,
      lowpassPeakMax: 5600,
      lowpassQ: 0.7,
      vowelHz: 1160,
      vowelQ: 0.98,
      vowelGain: 2.95,
      airHz: 3500,
      airGain: -2.0,
      shaperDrive: 1.22,
      attackMul: 0.18,
      attackMin: 0.016,
      attackMax: 0.08,
      releaseMul: 0.51,
      releaseMin: 0.145,
      releaseMax: 0.47,
    },
    4: {
      gain: 0.168,
      pan: 0.03,
      detuneCents: [-1.6, 1.1],
      glide: 0.046,
      coreType: "sine",
      layerType: "triangle",
      shimmerType: "sine",
      shimmerRatio: 1.0,
      shimmerGain: 0.13,
      shimmerGainLow: 0.16,
      subRatio: 0.5,
      subGain: 0.2,
      vibratoRate: 3.9,
      vibratoDepth: 0.0013,
      vibratoDelayRatio: 0.38,
      driftRate: 0.09,
      driftDepth: 0.00035,
      highpassHz: 24,
      lowpassMul: 3.25,
      lowpassMin: 250,
      lowpassMax: 1450,
      lowpassPeakMul: 1.15,
      lowpassPeakMin: 320,
      lowpassPeakMax: 2000,
      lowpassQ: 0.86,
      vowelHz: 530,
      vowelQ: 0.92,
      vowelGain: 1.6,
      airHz: 1700,
      airGain: -2.9,
      shaperDrive: 1.26,
      attackMul: 0.23,
      attackMin: 0.024,
      attackMax: 0.11,
      releaseMul: 0.58,
      releaseMin: 0.24,
      releaseMax: 0.66,
    },
  };

  const LOOKAHEAD_SECONDS = 0.5;
  const SCHEDULER_MS = 20;
  const RESUME_OFFSET_SECONDS = 0.05;
  const MAX_SUSTAIN_BEATS = 4;
  const EPSILON_GAIN = 0.00001;

  const playPauseBtn = document.getElementById("playPauseBtn");
  const tempoRange = document.getElementById("tempoRange");
  const tempoOut = document.getElementById("tempoOut");
  const statusText = document.getElementById("statusText");
  const pianoLabels = document.getElementById("pianoLabels");
  const labelsCanvas = document.getElementById("labelsCanvas");
  const rollViewport = document.getElementById("rollViewport");
  const rollContent = document.getElementById("rollContent");
  const rollCanvas = document.getElementById("rollCanvas");
  const playhead = document.getElementById("playhead");
  const ctx2d = rollCanvas.getContext("2d", { alpha: false });
  const labelsCtx = labelsCanvas.getContext("2d", { alpha: false });

  const state = {
    tempo: BASE_TEMPO,
    isPlaying: false,
    loop: true,
    currentBeat: 0,
    startBeat: 0,
    startCtxTime: 0,
    nextIndex: 0,
    schedulerId: null,
    vibratoAmount: 1,
    volume: 58,
  };

  let audioCtx = null;
  let masterGain = null;
  let effectInput = null;
  let leadInPadding = 0;
  let tailPadding = 0;
  let rowHeight = ROW_HEIGHT;
  const activeVoices = new Set();

  function midiToHz(midi) {
    return 440 * Math.pow(2, (midi - 69) / 12);
  }

  function midiToLabel(midi) {
    const names = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
    const name = names[midi % 12];
    const octave = Math.floor(midi / 12) - 1;
    return `${name}${octave}`;
  }

  function clamp(v, min, max) {
    return Math.min(max, Math.max(min, v));
  }

  function centsToRatio(cents) {
    return Math.pow(2, cents / 1200);
  }

  function noteVariation(note, salt) {
    const seed = note.t * 12.9898 + note.m * 78.233 + note.s * 37.719 + salt * 19.123;
    const x = Math.sin(seed) * 43758.5453123;
    return (x - Math.floor(x)) * 2 - 1;
  }

  function isNear(value, target, epsilon = 0.03) {
    return Math.abs(value - target) <= epsilon;
  }

  function metricalAccent(beat) {
    const beatInBar = ((beat % 4) + 4) % 4;
    if (isNear(beatInBar, 0)) {
      return 1.08;
    }
    if (isNear(beatInBar, 2)) {
      return 1.01;
    }
    if (isNear(beatInBar, 1) || isNear(beatInBar, 3)) {
      return 0.965;
    }
    return 0.94;
  }

  function phraseDynamics(beat) {
    const cycleBeats = 32;
    const phase = (((beat % cycleBeats) + cycleBeats) % cycleBeats) / cycleBeats;
    return 0.94 + 0.11 * Math.sin(Math.PI * phase);
  }

  function noteDynamics(note, durationBeats) {
    const accent = metricalAccent(note.t);
    const phrase = phraseDynamics(note.t + durationBeats * 0.5);
    const voiceBias = note.s === 4 ? 0.97 : 1.0;
    const human = 1 + noteVariation(note, 17) * 0.03;
    return accent * phrase * voiceBias * human;
  }

  function beatToSeconds(beat) {
    return (beat * 60) / state.tempo;
  }

  function formatClock(beats) {
    const totalSeconds = Math.floor(beatToSeconds(beats));
    const min = Math.floor(totalSeconds / 60);
    const sec = totalSeconds % 60;
    return `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  }

  function formatBarBeat(beat) {
    const bar = Math.floor(beat / 4) + 1;
    const beatInBar = (beat % 4) + 1;
    return `Bar ${bar}, Beat ${beatInBar.toFixed(2)}`;
  }

  function getCurrentBeatAt(time) {
    return clamp(state.startBeat + ((time - state.startCtxTime) * state.tempo) / 60, 0, TOTAL_BEATS);
  }

  function getCurrentBeat() {
    if (!state.isPlaying || !audioCtx) {
      return state.currentBeat;
    }
    return getCurrentBeatAt(audioCtx.currentTime);
  }

  function timeForBeat(beat) {
    return state.startCtxTime + ((beat - state.startBeat) * 60) / state.tempo;
  }

  function binarySearchByStart(targetBeat) {
    let lo = 0;
    let hi = NOTES.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (NOTES[mid].t < targetBeat) {
        lo = mid + 1;
      } else {
        hi = mid;
      }
    }
    return lo;
  }

  function findStartIndex(beat) {
    return binarySearchByStart(Math.max(0, beat - MAX_SUSTAIN_BEATS));
  }

  function createImpulseResponse(context, seconds = 5.2, decay = 2.4) {
    const sampleRate = context.sampleRate;
    const length = Math.floor(sampleRate * seconds);
    const impulse = context.createBuffer(2, length, sampleRate);

    for (let c = 0; c < 2; c += 1) {
      const channel = impulse.getChannelData(c);
      for (let i = 0; i < length; i += 1) {
        const t = i / length;
        const n = Math.random() * 2 - 1;
        const falloff = Math.pow(1 - t, decay);
        const early = i < sampleRate * 0.12 ? (Math.random() * 2 - 1) * Math.exp(-i / (sampleRate * 0.03)) * 0.26 : 0;
        const darkening = 1 - t * 0.5;
        const stereoSpread = c === 0 ? 1 : 0.985;
        channel[i] = (n * falloff * darkening + early) * stereoSpread;
      }
    }

    return impulse;
  }

  function ensureAudio() {
    if (audioCtx) {
      return;
    }

    const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioContextCtor();

    masterGain = audioCtx.createGain();
    masterGain.gain.value = state.volume / 100;

    const outputBus = audioCtx.createGain();
    outputBus.gain.value = 0.96;

    const toneHighpass = audioCtx.createBiquadFilter();
    toneHighpass.type = "highpass";
    toneHighpass.frequency.value = 34;
    toneHighpass.Q.value = 0.68;

    const toneLowpass = audioCtx.createBiquadFilter();
    toneLowpass.type = "lowpass";
    toneLowpass.frequency.value = 7600;
    toneLowpass.Q.value = 0.72;

    const compressor = audioCtx.createDynamicsCompressor();
    compressor.threshold.value = -23;
    compressor.knee.value = 16;
    compressor.ratio.value = 2.5;
    compressor.attack.value = 0.012;
    compressor.release.value = 0.26;

    const limiter = audioCtx.createDynamicsCompressor();
    limiter.threshold.value = -4;
    limiter.knee.value = 0;
    limiter.ratio.value = 12;
    limiter.attack.value = 0.002;
    limiter.release.value = 0.09;

    const dryGain = audioCtx.createGain();
    dryGain.gain.value = 0.58;

    const reverbPreDelay = audioCtx.createDelay(0.15);
    reverbPreDelay.delayTime.value = 0.032;

    const reverbInputHp = audioCtx.createBiquadFilter();
    reverbInputHp.type = "highpass";
    reverbInputHp.frequency.value = 140;
    reverbInputHp.Q.value = 0.6;

    const reverbInputLp = audioCtx.createBiquadFilter();
    reverbInputLp.type = "lowpass";
    reverbInputLp.frequency.value = 6200;
    reverbInputLp.Q.value = 0.65;

    const convolver = audioCtx.createConvolver();
    convolver.buffer = createImpulseResponse(audioCtx, 5.2, 2.4);
    const reverbGain = audioCtx.createGain();
    reverbGain.gain.value = 0.37;

    const chorusDelayLeft = audioCtx.createDelay(0.08);
    const chorusDelayRight = audioCtx.createDelay(0.08);
    chorusDelayLeft.delayTime.value = 0.014;
    chorusDelayRight.delayTime.value = 0.021;

    const chorusLfoLeft = audioCtx.createOscillator();
    const chorusLfoRight = audioCtx.createOscillator();
    chorusLfoLeft.type = "sine";
    chorusLfoRight.type = "sine";
    chorusLfoLeft.frequency.value = 0.11;
    chorusLfoRight.frequency.value = 0.16;

    const chorusDepthLeft = audioCtx.createGain();
    const chorusDepthRight = audioCtx.createGain();
    chorusDepthLeft.gain.value = 0.0015;
    chorusDepthRight.gain.value = 0.0019;

    const chorusPanLeft = audioCtx.createStereoPanner();
    const chorusPanRight = audioCtx.createStereoPanner();
    chorusPanLeft.pan.value = -0.36;
    chorusPanRight.pan.value = 0.36;

    const chorusTone = audioCtx.createBiquadFilter();
    chorusTone.type = "lowpass";
    chorusTone.frequency.value = 4900;
    chorusTone.Q.value = 0.65;

    const chorusMix = audioCtx.createGain();
    chorusMix.gain.value = 0.14;

    const echoTone = audioCtx.createBiquadFilter();
    echoTone.type = "lowpass";
    echoTone.frequency.value = 3200;
    echoTone.Q.value = 0.7;

    const echoHighpass = audioCtx.createBiquadFilter();
    echoHighpass.type = "highpass";
    echoHighpass.frequency.value = 220;
    echoHighpass.Q.value = 0.72;

    const echoDelay = audioCtx.createDelay(0.5);
    echoDelay.delayTime.value = 0.19;
    const echoFeedback = audioCtx.createGain();
    echoFeedback.gain.value = 0.11;
    const echoMix = audioCtx.createGain();
    echoMix.gain.value = 0.055;

    masterGain.connect(dryGain);
    dryGain.connect(outputBus);

    masterGain.connect(reverbPreDelay);
    reverbPreDelay.connect(reverbInputHp);
    reverbInputHp.connect(reverbInputLp);
    reverbInputLp.connect(convolver);
    convolver.connect(reverbGain);
    reverbGain.connect(outputBus);

    masterGain.connect(chorusDelayLeft);
    masterGain.connect(chorusDelayRight);
    chorusDelayLeft.connect(chorusPanLeft);
    chorusDelayRight.connect(chorusPanRight);
    chorusPanLeft.connect(chorusTone);
    chorusPanRight.connect(chorusTone);
    chorusTone.connect(chorusMix);
    chorusMix.connect(outputBus);

    masterGain.connect(echoTone);
    echoTone.connect(echoHighpass);
    echoHighpass.connect(echoDelay);
    echoDelay.connect(echoFeedback);
    echoFeedback.connect(echoDelay);
    echoDelay.connect(echoMix);
    echoMix.connect(outputBus);

    chorusLfoLeft.connect(chorusDepthLeft);
    chorusDepthLeft.connect(chorusDelayLeft.delayTime);
    chorusLfoRight.connect(chorusDepthRight);
    chorusDepthRight.connect(chorusDelayRight.delayTime);

    outputBus.connect(toneHighpass);
    toneHighpass.connect(toneLowpass);
    toneLowpass.connect(compressor);
    compressor.connect(limiter);
    limiter.connect(audioCtx.destination);

    const startupTime = audioCtx.currentTime + 0.01;
    chorusLfoLeft.start(startupTime);
    chorusLfoRight.start(startupTime);

    effectInput = masterGain;
  }

  function createWaveshaper(context, drive = 1.35) {
    const shaper = context.createWaveShaper();
    const samples = 1024;
    const curve = new Float32Array(samples);
    const norm = Math.tanh(drive);
    for (let i = 0; i < samples; i++) {
      const x = (i * 2) / samples - 1;
      curve[i] = Math.tanh(x * drive) / norm;
    }
    shaper.curve = curve;
    shaper.oversample = "4x";
    return shaper;
  }

  function cleanupVoice(voice) {
    if (voice.osc1) {
      voice.osc1.onended = null;
    }
    voice.nodes.forEach((node) => {
      try {
        node.disconnect();
      } catch (_) {
        // noop
      }
    });
    activeVoices.delete(voice);
  }

  function scheduleNote(note, startTime, durationBeatsOverride) {
    if (!audioCtx || !effectInput) {
      return;
    }

    const durationBeats = durationBeatsOverride || note.d;
    if (durationBeats <= 0) {
      return;
    }

    const now = audioCtx.currentTime;
    const timbre = VOICE_TIMBRES[note.s] || VOICE_TIMBRES[1];
    const isBass = note.s === 4;
    const beatInBar = ((note.t % 4) + 4) % 4;
    const strongBeat = isNear(beatInBar, 0) || isNear(beatInBar, 2);
    const microTiming = noteVariation(note, 31) * (isBass ? 0.0024 : strongBeat ? 0.0018 : 0.0052);
    const safeStart = Math.max(startTime + microTiming, now + 0.004);
    const durSec = Math.max(0.065, (durationBeats * 60) / state.tempo * (isBass ? 1.02 : 1.015));
    const isShort = durSec < 0.24;
    const noteEnd = safeStart + durSec;
    const attackTime = isShort
      ? clamp(
          durSec * (timbre.attackMul + 0.03),
          timbre.attackMin,
          Math.min(timbre.attackMax, isBass ? 0.058 : 0.046)
        )
      : clamp(durSec * timbre.attackMul, timbre.attackMin, timbre.attackMax);
    const releaseTime = isShort
      ? clamp(timbre.releaseMin * 0.9, 0.11, 0.34)
      : clamp(durSec * timbre.releaseMul, timbre.releaseMin, timbre.releaseMax);
    const stopTime = noteEnd + Math.max(0.2, releaseTime * 2.3);
    const freq = midiToHz(note.m);
    const profileSpread = noteVariation(note, 1);
    const vibratoSpread = noteVariation(note, 2);
    const driftSpread = noteVariation(note, 3);
    const dynamic = noteDynamics(note, durationBeats);

    const osc1 = audioCtx.createOscillator();
    const osc2 = audioCtx.createOscillator();
    const osc3 = audioCtx.createOscillator();
    const osc1Gain = audioCtx.createGain();
    const osc2Gain = audioCtx.createGain();
    const osc3Gain = audioCtx.createGain();
    const subOsc = timbre.subGain ? audioCtx.createOscillator() : null;
    const subGain = subOsc ? audioCtx.createGain() : null;
    const shaper = createWaveshaper(audioCtx, timbre.shaperDrive);
    const highpass = audioCtx.createBiquadFilter();
    const lowpass = audioCtx.createBiquadFilter();
    const vowel = audioCtx.createBiquadFilter();
    const airTrim = audioCtx.createBiquadFilter();
    const gain = audioCtx.createGain();
    const vibLfo = audioCtx.createOscillator();
    const vibDepth = audioCtx.createGain();
    const vibEnv = audioCtx.createGain();
    const driftLfo = audioCtx.createOscillator();
    const driftDepth = audioCtx.createGain();
    const pan = typeof audioCtx.createStereoPanner === "function" ? audioCtx.createStereoPanner() : null;

    const lowBoost = clamp(1.0 + (62 - note.m) * 0.016, 0.9, isBass ? 1.42 : 1.24);
    const peakGain = timbre.gain * lowBoost * dynamic;
    const sustainTarget = peakGain * (isShort ? 0.95 : isBass ? 0.84 : 0.81);
    const sustainStart = Math.min(noteEnd, safeStart + attackTime + Math.min(0.026, durSec * 0.13));

    gain.gain.cancelScheduledValues(safeStart);
    gain.gain.setValueAtTime(EPSILON_GAIN, safeStart);
    gain.gain.linearRampToValueAtTime(peakGain, safeStart + attackTime);
    gain.gain.linearRampToValueAtTime(sustainTarget, sustainStart);
    gain.gain.setTargetAtTime(EPSILON_GAIN, noteEnd, Math.max(0.032, releaseTime * 0.42));
    gain.gain.linearRampToValueAtTime(EPSILON_GAIN, stopTime - 0.006);

    osc1.type = timbre.coreType || "triangle";
    osc2.type = timbre.layerType || "sine";
    osc3.type = timbre.shimmerType || "sine";
    if (subOsc) {
      subOsc.type = "sine";
    }

    const glideTime = Math.min(timbre.glide, durSec * 0.38);
    const detune1 = timbre.detuneCents[0] * (1 + profileSpread * 0.06);
    const detune2 = timbre.detuneCents[1] * (1 - profileSpread * 0.05);
    const targetRatio1 = centsToRatio(detune1);
    const targetRatio2 = centsToRatio(detune2);
    const startRatio1 = centsToRatio(detune1 - (isBass ? 2.1 : 3.8));
    const startRatio2 = centsToRatio(detune2 - (isBass ? 1.6 : 2.8));
    osc1.frequency.setValueAtTime(Math.max(18, freq * startRatio1), safeStart);
    osc1.frequency.exponentialRampToValueAtTime(Math.max(18, freq * targetRatio1), safeStart + glideTime);
    osc2.frequency.setValueAtTime(Math.max(18, freq * startRatio2), safeStart);
    osc2.frequency.exponentialRampToValueAtTime(
      Math.max(18, freq * targetRatio2),
      safeStart + Math.max(0.01, glideTime * 0.88)
    );
    const shimmerRatio = timbre.shimmerRatio * (1 + profileSpread * 0.0025);
    osc3.frequency.setValueAtTime(Math.max(18, freq * shimmerRatio), safeStart);
    if (subOsc && subGain) {
      subOsc.frequency.setValueAtTime(Math.max(18, freq * timbre.subRatio), safeStart);
    }

    osc1Gain.gain.setValueAtTime(isBass ? 1.0 : 0.92, safeStart);
    osc2Gain.gain.setValueAtTime(isBass ? 0.62 : 0.7, safeStart);
    const shimmerLevelBase = note.m < 65 ? timbre.shimmerGainLow : timbre.shimmerGain;
    const shimmerLevel = isShort ? shimmerLevelBase * 0.9 : shimmerLevelBase;
    osc3Gain.gain.setValueAtTime(shimmerLevel, safeStart);
    if (subGain) {
      subGain.gain.setValueAtTime(timbre.subGain, safeStart);
    }

    vibLfo.type = "sine";
    vibLfo.frequency.setValueAtTime(Math.max(3.0, timbre.vibratoRate + vibratoSpread * 0.16), safeStart);
    vibDepth.gain.setValueAtTime(
      freq * timbre.vibratoDepth * state.vibratoAmount * (0.88 + dynamic * 0.09),
      safeStart
    );

    vibEnv.gain.setValueAtTime(0.0, safeStart);
    if (isShort) {
      vibEnv.gain.linearRampToValueAtTime(isBass ? 0.18 : 0.26, safeStart + attackTime * 0.8);
    } else {
      const vibDelay = clamp(durSec * timbre.vibratoDelayRatio, isBass ? 0.13 : 0.09, isBass ? 0.32 : 0.24);
      vibEnv.gain.setValueAtTime(0.0, safeStart + vibDelay * 0.42);
      vibEnv.gain.linearRampToValueAtTime(1.0, safeStart + vibDelay);
    }
    vibEnv.gain.setTargetAtTime(0.0, noteEnd, Math.max(0.026, releaseTime * 0.3));

    driftLfo.type = "sine";
    driftLfo.frequency.setValueAtTime(Math.max(0.04, timbre.driftRate + driftSpread * 0.018), safeStart);
    driftDepth.gain.setValueAtTime(freq * timbre.driftDepth, safeStart);

    vibLfo.connect(vibDepth);
    vibDepth.connect(vibEnv);
    vibEnv.connect(osc1.frequency);
    vibEnv.connect(osc2.frequency);
    driftLfo.connect(driftDepth);
    driftDepth.connect(osc1.frequency);
    driftDepth.connect(osc2.frequency);

    highpass.type = "highpass";
    highpass.frequency.setValueAtTime(Math.max(22, timbre.highpassHz + profileSpread * (isBass ? 0.8 : 3.2)), safeStart);
    highpass.Q.setValueAtTime(0.68, safeStart);

    lowpass.type = "lowpass";
    const lowMult = note.m < 65 ? 1.18 : 1.0;
    const brightness = 0.94 + dynamic * 0.12;
    const baseCutoff = clamp(freq * timbre.lowpassMul * lowMult * brightness, timbre.lowpassMin, timbre.lowpassMax);
    const peakCutoff = clamp(baseCutoff * timbre.lowpassPeakMul, timbre.lowpassPeakMin, timbre.lowpassPeakMax);
    lowpass.frequency.setValueAtTime(baseCutoff, safeStart);
    lowpass.frequency.linearRampToValueAtTime(peakCutoff, safeStart + attackTime);
    lowpass.frequency.setTargetAtTime(baseCutoff, noteEnd, 0.18);
    lowpass.Q.setValueAtTime(timbre.lowpassQ, safeStart);

    vowel.type = "peaking";
    vowel.frequency.setValueAtTime(timbre.vowelHz * (1 + profileSpread * 0.07), safeStart);
    vowel.Q.setValueAtTime(timbre.vowelQ, safeStart);
    vowel.gain.setValueAtTime(timbre.vowelGain + dynamic * 0.24, safeStart);

    airTrim.type = "peaking";
    airTrim.frequency.setValueAtTime(timbre.airHz, safeStart);
    airTrim.Q.setValueAtTime(1.18, safeStart);
    airTrim.gain.setValueAtTime(timbre.airGain, safeStart);

    if (pan) {
      pan.pan.setValueAtTime(clamp(timbre.pan + noteVariation(note, 41) * 0.035, -0.85, 0.85), safeStart);
    }

    osc1.connect(osc1Gain);
    osc2.connect(osc2Gain);
    osc3.connect(osc3Gain);
    osc1Gain.connect(shaper);
    osc2Gain.connect(shaper);
    osc3Gain.connect(shaper);
    if (subOsc && subGain) {
      subOsc.connect(subGain);
      subGain.connect(shaper);
    }
    shaper.connect(highpass);
    highpass.connect(lowpass);
    lowpass.connect(vowel);
    vowel.connect(airTrim);
    airTrim.connect(gain);
    if (pan) {
      gain.connect(pan);
      pan.connect(effectInput);
    } else {
      gain.connect(effectInput);
    }

    const voice = {
      osc1,
      nodes: [
        osc1,
        osc2,
        osc3,
        osc1Gain,
        osc2Gain,
        osc3Gain,
        shaper,
        highpass,
        lowpass,
        vowel,
        airTrim,
        vibLfo,
        vibDepth,
        vibEnv,
        driftLfo,
        driftDepth,
        gain,
      ],
    };
    if (subOsc && subGain) {
      voice.nodes.push(subOsc, subGain);
    }
    if (pan) {
      voice.nodes.push(pan);
    }
    activeVoices.add(voice);

    osc1.onended = () => cleanupVoice(voice);

    osc1.start(safeStart);
    osc2.start(safeStart);
    osc3.start(safeStart);
    if (subOsc) {
      subOsc.start(safeStart);
    }
    vibLfo.start(safeStart);
    driftLfo.start(safeStart);

    osc1.stop(stopTime);
    osc2.stop(stopTime);
    osc3.stop(stopTime);
    if (subOsc) {
      subOsc.stop(stopTime);
    }
    vibLfo.stop(stopTime);
    driftLfo.stop(stopTime);
  }

  function stopAllVoices() {
    if (!audioCtx) {
      return;
    }

    const now = audioCtx.currentTime;
    activeVoices.forEach((voice) => {
      voice.nodes.forEach((node) => {
        try {
          if (node instanceof GainNode) {
            node.gain.cancelScheduledValues(now);
            const held = Math.max(EPSILON_GAIN, node.gain.value || EPSILON_GAIN);
            node.gain.setValueAtTime(held, now);
            node.gain.setTargetAtTime(EPSILON_GAIN, now, 0.03);
          }
          if (node instanceof OscillatorNode) {
            node.stop(now + 0.08);
          }
        } catch (_) {
          // noop
        }
      });
    });
  }

  function stopScheduler() {
    if (state.schedulerId !== null) {
      clearInterval(state.schedulerId);
      state.schedulerId = null;
    }
  }

  function schedulerTick() {
    if (!state.isPlaying || !audioCtx) {
      return;
    }

    const now = audioCtx.currentTime;
    const currentBeat = getCurrentBeatAt(now);
    const lookaheadBeats = currentBeat + (state.tempo * LOOKAHEAD_SECONDS) / 60;

    while (state.nextIndex < NOTES.length) {
      const note = NOTES[state.nextIndex];
      if (note.t > lookaheadBeats) {
        break;
      }

      const noteEnd = note.t + note.d;
      if (noteEnd > currentBeat - 0.001) {
        if (note.t >= currentBeat) {
          scheduleNote(note, timeForBeat(note.t));
        } else {
          scheduleNote(note, now + 0.01, noteEnd - currentBeat);
        }
      }

      state.nextIndex += 1;
    }

    if (currentBeat >= TOTAL_BEATS - 0.0001) {
      if (state.loop) {
        restartFromBeat(0, true);
      } else {
        stopPlayback();
      }
    }
  }

  function startScheduler() {
    stopScheduler();
    schedulerTick();
    state.schedulerId = setInterval(schedulerTick, SCHEDULER_MS);
  }

  function restartFromBeat(beat, keepPlaying) {
    if (!audioCtx) {
      return;
    }

    stopScheduler();
    stopAllVoices();

    const clamped = clamp(beat, 0, TOTAL_BEATS);
    state.currentBeat = clamped;
    state.startBeat = clamped;
    state.startCtxTime = audioCtx.currentTime + RESUME_OFFSET_SECONDS;
    state.nextIndex = findStartIndex(clamped);

    if (keepPlaying) {
      state.isPlaying = true;
      startScheduler();
    }
    followPlayhead(true);
  }

  async function play() {
    ensureAudio();
    if (!audioCtx) {
      return;
    }

    if (audioCtx.state === "suspended") {
      await audioCtx.resume();
    }

    if (state.isPlaying) {
      return;
    }

    restartFromBeat(state.currentBeat, true);
    updatePlayPauseLabel();
  }

  function pause() {
    if (!state.isPlaying) {
      return;
    }

    state.currentBeat = getCurrentBeat();
    state.isPlaying = false;
    stopScheduler();
    stopAllVoices();
    updatePlayPauseLabel();
  }

  function stopPlayback() {
    pause();
    state.currentBeat = 0;
    updateSeekAndStatus();
    followPlayhead(true);
  }

  function setTempo(nextTempo) {
    const tempo = clamp(Number(nextTempo) || BASE_TEMPO, 40, 100);
    if (tempo === state.tempo) {
      return;
    }

    const wasPlaying = state.isPlaying;
    const beat = getCurrentBeat();
    state.tempo = tempo;

    if (wasPlaying && audioCtx) {
      restartFromBeat(beat, true);
    } else {
      state.currentBeat = beat;
    }

    tempoOut.value = String(tempo);
    updateSeekAndStatus();
  }

  function updatePlayPauseLabel() {
    playPauseBtn.textContent = state.isPlaying ? "⏸" : "▶";
    playPauseBtn.setAttribute("aria-label", state.isPlaying ? "Pause" : "Play");
  }

  function yForMidi(midi) {
    return (MAX_MIDI - midi) * rowHeight;
  }

  function refreshHorizontalPadding() {
    const center = (rollViewport.clientWidth || 0) * 0.5;
    leadInPadding = Math.max(0, center - KEYBOARD_WIDTH);
    tailPadding = center;
  }

  function xForBeat(beat) {
    return leadInPadding + KEYBOARD_WIDTH + beat * BEAT_WIDTH;
  }

  function setupCanvas(canvas, context, cssWidth, cssHeight) {
    const dpr = window.devicePixelRatio || 1;
    const w = Math.max(1, Math.round(cssWidth));
    const h = Math.max(1, Math.round(cssHeight));
    canvas.width = Math.max(1, Math.round(w * dpr));
    canvas.height = Math.max(1, Math.round(h * dpr));
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { w, h };
  }

  function syncLabelScroll() {
    const offsetY = -Math.round(rollViewport.scrollTop || 0);
    labelsCanvas.style.transform = `translate3d(0, ${offsetY}px, 0)`;
  }

  function updatePlayheadPosition() {
    const labelWidth = pianoLabels.clientWidth || 0;
    const viewportCenter = (rollViewport.clientWidth || 0) * 0.5;
    playhead.style.left = `${labelWidth + viewportCenter}px`;
  }

  function drawLabels(height) {
    const width = pianoLabels.clientWidth || 66;
    const size = setupCanvas(labelsCanvas, labelsCtx, width, height);
    const canvasWidth = size.w;
    labelsCtx.fillStyle = "#f7f2e4";
    labelsCtx.fillRect(0, 0, canvasWidth, height);
    labelsCtx.textAlign = "center";
    labelsCtx.textBaseline = "middle";
    const labelFontSize = Math.floor(clamp(rowHeight * 0.68, 6, 10));
    labelsCtx.font = `bold ${labelFontSize}px Menlo, monospace`;

    for (let midi = MIN_MIDI; midi <= MAX_MIDI; midi += 1) {
      const y = yForMidi(midi);
      const note = midi % 12;
      const isBlack = [1, 3, 6, 8, 10].includes(note);
      labelsCtx.fillStyle = isBlack ? "#f0e9d8" : "#f7f2e4";
      labelsCtx.fillRect(0, y, canvasWidth, rowHeight);
      labelsCtx.strokeStyle = "#e2d9be";
      labelsCtx.beginPath();
      labelsCtx.moveTo(0, y + 0.5);
      labelsCtx.lineTo(canvasWidth, y + 0.5);
      labelsCtx.stroke();

      labelsCtx.fillStyle = "#586e75";
      labelsCtx.fillText(midiToLabel(midi), canvasWidth * 0.5, y + rowHeight * 0.5 + 1);
    }
  }

  function drawRoll() {
    refreshHorizontalPadding();
    const noteCount = MAX_MIDI - MIN_MIDI + 1;
    const viewportHeight = Math.max(1, rollViewport.clientHeight || noteCount * ROW_HEIGHT);
    rowHeight = viewportHeight / noteCount;
    const scoreWidth = Math.ceil(leadInPadding + KEYBOARD_WIDTH + TOTAL_BEATS * BEAT_WIDTH + tailPadding);
    const width = Math.max(scoreWidth, rollViewport.clientWidth || 0);
    const height = viewportHeight;

    setupCanvas(rollCanvas, ctx2d, width, height);
    rollContent.style.width = `${width}px`;
    rollContent.style.height = `${height}px`;

    const c = ctx2d;

    c.fillStyle = "#fdf6e3";
    c.fillRect(0, 0, width, height);

    for (let midi = MIN_MIDI; midi <= MAX_MIDI; midi += 1) {
      const y = yForMidi(midi);
      const note = midi % 12;
      const isBlack = [1, 3, 6, 8, 10].includes(note);
      c.fillStyle = isBlack ? "#f1ead9" : "#f7f2e4";
      c.fillRect(0, y, width, rowHeight);

      c.strokeStyle = "#e3dac0";
      c.beginPath();
      c.moveTo(0, y + 0.5);
      c.lineTo(width, y + 0.5);
      c.stroke();
    }

    for (let beat = 0; beat <= TOTAL_BEATS; beat += 1) {
      const x = xForBeat(beat) + 0.5;
      const measureLine = beat % 4 === 0;
      c.strokeStyle = measureLine ? "#93a1a1" : "#dcd3b8";
      c.lineWidth = measureLine ? 1.5 : 1;
      c.beginPath();
      c.moveTo(x, 0);
      c.lineTo(x, height);
      c.stroke();

      if (measureLine) {
        c.fillStyle = "#657b83";
        c.font = "11px Menlo, monospace";
        c.fillText(String(beat / 4 + 1), x + 3, 13);
      }
    }

    NOTES.forEach((note) => {
      const x = xForBeat(note.t);
      const y = yForMidi(note.m) + 1;
      const w = Math.max(2, note.d * BEAT_WIDTH - 1.4);
      const h = Math.max(1, rowHeight - 1.2);
      const color = VOICE_COLORS[note.s] || VOICE_COLORS[1];
      const fill = color.fill;
      const stroke = color.stroke;
      c.fillStyle = fill;
      c.fillRect(x, y, w, h);
      c.strokeStyle = stroke;
      c.strokeRect(x + 0.5, y + 0.5, Math.max(1, w - 1), h - 1);
    });

    drawLabels(height);
    updatePlayheadPosition();
    syncLabelScroll();
  }

  function followPlayhead(force = false) {
    if (!state.isPlaying && !force) {
      return;
    }

    const beat = state.isPlaying ? getCurrentBeat() : state.currentBeat;
    const targetX = xForBeat(beat);
    const viewWidth = rollViewport.clientWidth || 1;
    const maxScroll = Math.max(0, rollContent.scrollWidth - viewWidth);
    const targetScroll = clamp(targetX - viewWidth * 0.5, 0, maxScroll);
    rollViewport.scrollLeft = targetScroll;
  }

  function updateSeekAndStatus() {
    const beat = getCurrentBeat();
    statusText.textContent = `${formatClock(beat)} / ${formatClock(TOTAL_BEATS)}`;
  }

  function animationLoop() {
    if (state.isPlaying) {
      state.currentBeat = getCurrentBeat();
    }
    updateSeekAndStatus();
    followPlayhead();
    requestAnimationFrame(animationLoop);
  }

  function wireUi() {
    tempoRange.value = String(BASE_TEMPO);
    tempoOut.value = String(BASE_TEMPO);

    playPauseBtn.addEventListener("click", async () => {
      if (state.isPlaying) {
        pause();
      } else {
        await play();
      }
      updateSeekAndStatus();
    });

    tempoRange.addEventListener("input", () => {
      setTempo(tempoRange.value);
    });

    document.addEventListener("keydown", async (event) => {
      if (event.code !== "Space" || event.repeat) {
        return;
      }
      event.preventDefault();
      if (state.isPlaying) {
        pause();
      } else {
        await play();
      }
      updateSeekAndStatus();
    });

    window.addEventListener("resize", () => {
      drawRoll();
      updateSeekAndStatus();
      followPlayhead(true);
    });

    rollViewport.addEventListener("scroll", () => {
      syncLabelScroll();
    });
  }

  function init() {
    drawRoll();
    wireUi();
    updatePlayPauseLabel();
    updateSeekAndStatus();
    followPlayhead(true);
    syncLabelScroll();
    requestAnimationFrame(animationLoop);
  }

  init();
})();
