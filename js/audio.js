// Procedural WebAudio SFX (no audio files)
G.sfx = (function () {
  let ac = null, noiseBuf = null;
  function ensure() {
    if (!ac) {
      try { ac = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return null; }
    }
    if (ac.state === 'suspended') ac.resume();
    return ac;
  }
  // automated tests set sessionStorage 'aodai_test_mute' (or open with ?mute) so playtesting stays silent
  let testMute = /[?&]mute\b/.test(location.search);
  try { testMute = testMute || sessionStorage.getItem('aodai_test_mute') === '1'; } catch (e) { /* storage off */ }
  const muted = () => testMute || (G.state && G.state.muted);

  function tone(freq, dur, type, vol, when, slide) {
    const a = ensure();
    if (!a || muted()) return;
    const t = a.currentTime + (when || 0);
    const o = a.createOscillator();
    const g = a.createGain();
    o.type = type || 'sine';
    o.frequency.setValueAtTime(freq, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(40, freq * slide), t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol || 0.15, t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(a.destination);
    o.start(t);
    o.stop(t + dur + 0.02);
  }

  function noise(dur, vol, freq, q, when) {
    const a = ensure();
    if (!a || muted()) return;
    if (!noiseBuf) {
      noiseBuf = a.createBuffer(1, a.sampleRate * 0.5, a.sampleRate);
      const d = noiseBuf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    const t = a.currentTime + (when || 0);
    const src = a.createBufferSource();
    src.buffer = noiseBuf;
    const f = a.createBiquadFilter();
    f.type = 'bandpass';
    f.frequency.value = freq || 3000;
    f.Q.value = q || 1;
    const g = a.createGain();
    g.gain.setValueAtTime(vol || 0.2, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f).connect(g).connect(a.destination);
    src.start(t, Math.random() * 0.3);
    src.stop(t + dur + 0.02);
  }

  // ---------- background music: a slow, generative đàn tranh melody in the northern pentatonic ----------
  // Plucked notes (triangle + octave sine, long decay), the occasional "nhấn" bend up and back, a soft drone.
  const SCALE = [220, 246.94, 293.66, 329.63, 392, 440, 493.88, 587.33, 659.26]; // A3 B3 D4 E4 G4 A4 B4 D5 E5
  const RHYTHMS = [[1, 1, 2], [2, 1, 1], [1, 1, 1, 1], [3, 1], [2, 2]];
  const music = { on: false, next: 0, idx: 4, bar: 0, gain: null, timer: null, notes: 0 };
  function pluck(freq, when, dur, vol, bend) {
    const a = ac, o = a.createOscillator(), o2 = a.createOscillator(), g = a.createGain();
    o.type = 'triangle'; o2.type = 'sine';
    o.frequency.setValueAtTime(freq, when); o2.frequency.setValueAtTime(freq * 2, when);
    if (bend) { // nhấn: press the string after plucking, then let it go
      o.frequency.linearRampToValueAtTime(freq * 1.122, when + 0.18); o.frequency.linearRampToValueAtTime(freq, when + 0.42);
      o2.frequency.linearRampToValueAtTime(freq * 2.244, when + 0.18); o2.frequency.linearRampToValueAtTime(freq * 2, when + 0.42);
    }
    g.gain.setValueAtTime(0.0001, when); g.gain.exponentialRampToValueAtTime(vol, when + 0.006); g.gain.exponentialRampToValueAtTime(0.0001, when + dur);
    const g2 = a.createGain(); g2.gain.value = 0.25;
    o.connect(g); o2.connect(g2).connect(g); g.connect(music.gain);
    o.start(when); o2.start(when); o.stop(when + dur + 0.05); o2.stop(when + dur + 0.05);
    music.notes++;
  }
  function drone(freq, when, dur) {
    const o = ac.createOscillator(), g = ac.createGain(); o.type = 'sine'; o.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, when); g.gain.linearRampToValueAtTime(0.03, when + 1.2); g.gain.linearRampToValueAtTime(0.0001, when + dur);
    o.connect(g).connect(music.gain); o.start(when); o.stop(when + dur + 0.1);
  }
  function phrase(t0) {
    const E = 0.36; let t = t0;
    if (music.bar % 4 === 0) drone(146.83, t0, E * 16); // a low D under every four phrases
    const rh = G.pick(RHYTHMS).concat(G.pick(RHYTHMS));
    rh.forEach((len, i) => {
      const step = G.pick([-2, -1, -1, 1, 1, 2]);
      music.idx = G.clamp(music.idx + step, 0, SCALE.length - 1);
      const last = i === rh.length - 1, f = last ? SCALE[Math.random() < 0.6 ? 2 : 5] : SCALE[music.idx];
      if (Math.random() < 0.15 && !last) pluck(f * 1.122, t - 0.06, 0.25, 0.025); // grace note
      pluck(f, t, 0.8 + len * 0.5, 0.055, len >= 2 && Math.random() < 0.55);
      t += len * E;
    });
    music.bar++;
    return t + E * G.pick([2, 3, 4]); // breathe between phrases
  }
  function musicTick() {
    if (!ac || !music.on) return;
    music.gain.gain.setTargetAtTime(muted() ? 0 : 0.9, ac.currentTime, 0.3);
    if (music.next < ac.currentTime) music.next = ac.currentTime + 0.1;
    while (music.next < ac.currentTime + 1.2) music.next = phrase(music.next);
  }
  function startMusic() {
    const a = ensure(); if (!a || music.on) return;
    music.on = true; music.gain = a.createGain(); music.gain.gain.value = 0; music.gain.connect(a.destination);
    music.next = a.currentTime + 0.5; musicTick();
    music.timer = setInterval(musicTick, 250);
  }

  let lastSnip = 0, lastStitch = 0, lastSnag = 0;
  return {
    unlock() { const a = ensure(); if (a) startMusic(); return a; },
    music,
    click() { tone(660, 0.05, 'triangle', 0.08); },
    snip() {
      const n = performance.now();
      if (n - lastSnip < 70) return;
      lastSnip = n;
      noise(0.045, 0.22, G.rand(2800, 4200), 2);
      tone(G.rand(1800, 2200), 0.02, 'square', 0.02);
    },
    // one stitch of a heavy vintage machine: a low "thunk" as the needle drops, plus the click of the feed dog
    stitch() {
      const n = performance.now();
      if (n - lastStitch < 45) return;
      lastStitch = n;
      tone(G.rand(88, 104), 0.07, 'sine', 0.16, 0, 0.6);
      tone(G.rand(150, 170), 0.03, 'square', 0.025);
      noise(0.025, 0.07, 2200, 4);
    },
    // the thread catching when the fabric drifts off the line
    snag() {
      const n = performance.now();
      if (n - lastSnag < 320) return;
      lastSnag = n;
      noise(0.14, 0.12, 900, 6);
      tone(120, 0.16, 'sawtooth', 0.04, 0, 0.75);
    },
    // the shop cat purring: a soft low rumble pulsing about 22 times a second
    purr() { for (let i = 0; i < 26; i++) noise(0.035, 0.07, 160, 1.2, i * 0.045); },
    // a seam finished beautifully
    cheer() { noise(0.09, 0.14, 3200, 0.7); [659, 784, 988, 1319].forEach((f, i) => tone(f, 0.22, 'triangle', 0.09, 0.05 + i * 0.06)); },
    coin() { tone(988, 0.08, 'sine', 0.15); tone(1319, 0.2, 'sine', 0.15, 0.07); },
    bell() { tone(1568, 0.6, 'sine', 0.12); tone(2093, 0.5, 'sine', 0.07, 0.12); },
    // a close friend's own doorbell tune (♥5): you learn who is coming before they walk in
    tune(freqs) { (freqs || []).forEach((f, i) => { tone(f * 2, 0.42, 'sine', 0.1, i * 0.16); tone(f * 4, 0.3, 'sine', 0.03, i * 0.16); }); },
    paper() { noise(0.12, 0.25, 500, 0.8); tone(180, 0.1, 'sine', 0.12); },
    place() { tone(330, 0.06, 'triangle', 0.1); },
    bad() { tone(220, 0.18, 'sawtooth', 0.05, 0, 0.7); },
    good() { [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.25, 'sine', 0.11, i * 0.08)); },
    done() { [784, 988].forEach((f, i) => tone(f, 0.18, 'triangle', 0.1, i * 0.07)); },
    stamp() { noise(0.08, 0.12, 600, 1); tone(500, 0.08, 'sine', 0.08, 0, 1.6); }
  };
})();
