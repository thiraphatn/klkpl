/* เสียงประกอบเกม — สังเคราะห์ด้วย Web Audio API ทั้งหมด (ไม่ต้องมีไฟล์เสียง ใช้ออฟไลน์ได้)
   - เสียงบรรยากาศ (ambient) แยกตามธีมตกแต่งฟาร์ม
   - เสียงเอฟเฟกต์ เช่น ปลูก เก็บเกี่ยว ซื้อ */
const Sfx = (() => {
  let ctx = null, master = null, analyser = null, noiseBuf = null;
  let enabled = true, themeId = null, bus = null;
  const hz = m => 440 * Math.pow(2, (m - 69) / 12);
  const rnd = (a, b) => a + Math.random() * (b - a);
  const pick = arr => arr[Math.floor(Math.random() * arr.length)];

  function ensure() {
    if (ctx) return ctx;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain(); master.gain.value = 1.3;
    analyser = ctx.createAnalyser(); analyser.fftSize = 1024;
    master.connect(analyser); analyser.connect(ctx.destination);
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 3, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return ctx;
  }

  // โน้ตเดี่ยว: oscillator + envelope (หยุดเองอัตโนมัติ)
  function tone(dest, f, o = {}) {
    o = Object.assign({ dur: .5, type: "sine", gain: .15, attack: .01, to: null, vib: 0, vibRate: 5, delay: 0, lp: 0 }, o);
    const t = ctx.currentTime + o.delay;
    const osc = ctx.createOscillator(); osc.type = o.type;
    osc.frequency.setValueAtTime(f, t);
    if (o.to) osc.frequency.exponentialRampToValueAtTime(o.to, t + o.dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(o.gain, t + Math.min(o.attack, o.dur * .9));
    g.gain.exponentialRampToValueAtTime(0.0001, t + o.dur);
    if (o.lp) { const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = o.lp; osc.connect(lp); lp.connect(g); }
    else osc.connect(g);
    if (o.vib) {
      const l = ctx.createOscillator(); l.frequency.value = o.vibRate;
      const lg = ctx.createGain(); lg.gain.value = o.vib;
      l.connect(lg); lg.connect(osc.frequency); l.start(t); l.stop(t + o.dur + .1);
    }
    g.connect(dest); osc.start(t); osc.stop(t + o.dur + .05);
  }
  // เสียงกระทบสั้นๆ จาก noise
  function burst(dest, dur, o = {}) {
    o = Object.assign({ type: "lowpass", freq: 800, q: 1, gain: .2, delay: 0, attack: .01 }, o);
    const t = ctx.currentTime + o.delay;
    const s = ctx.createBufferSource(); s.buffer = noiseBuf;
    const f = ctx.createBiquadFilter(); f.type = o.type; f.frequency.value = o.freq; f.Q.value = o.q;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(o.gain, t + o.attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f); f.connect(g); g.connect(dest);
    s.start(t, rnd(0, 2)); s.stop(t + dur + .05);
  }
  // เสียงระฆัง/กล่องดนตรี: พาร์เชียลหลายชั้น
  function bell(dest, m, o = {}) {
    const f = hz(m), gain = o.gain || .05, dur = o.dur || 1.6, delay = o.delay || 0;
    tone(dest, f, { dur, gain, delay, attack: .004 });
    tone(dest, f * 2.76, { dur: dur * .5, gain: gain * .35, delay, attack: .004 });
    tone(dest, f * 5.4, { dur: dur * .25, gain: gain * .15, delay, attack: .004 });
  }
  // เสียงดีดสาย (พิณ/ขิม/พิณอู๊ด)
  function pluck(dest, m, o = {}) {
    const f = hz(m), gain = o.gain || .06, dur = o.dur || 1.1, delay = o.delay || 0;
    tone(dest, f, { type: o.type || "triangle", dur, gain, delay, attack: .004, lp: o.lp || 3500 });
    tone(dest, f * 2, { dur: dur * .5, gain: gain * .3, delay, attack: .004 });
  }

  // บัสเสียงของแต่ละธีม (มี timer และ node ที่ต้องหยุดตอนเปลี่ยนธีม)
  function makeBus() {
    const g = ctx.createGain(); g.gain.value = 0; g.connect(master);
    const timers = [], nodes = []; let dead = false;
    const A = {
      out: g, hz, rnd, pick, bell: (m, o) => bell(g, m, o), pluck: (m, o) => pluck(g, m, o),
      tone: (f, o) => tone(g, f, o), burst: (d, o) => burst(g, d, o),
      after(ms, fn) { timers.push(setTimeout(() => { if (!dead) fn(); }, ms)); },
      every(minMs, maxMs, fn) {
        const loop = () => { if (dead) return; fn(); timers.push(setTimeout(loop, rnd(minMs, maxMs))); };
        timers.push(setTimeout(loop, rnd(200, minMs)));
      },
      // เล่นลำดับโน้ตวนซ้ำ steps = [{d: ms, ...}]
      seq(steps, fn, gapMs = 4000) {
        let i = 0;
        const step = () => {
          if (dead) return;
          if (i >= steps.length) { i = 0; timers.push(setTimeout(step, gapMs)); return; }
          const s = steps[i++]; fn(s);
          timers.push(setTimeout(step, s.d));
        };
        timers.push(setTimeout(step, 600));
      },
      // noise ต่อเนื่อง (ลม คลื่น น้ำ) พร้อม LFO ปรับความแรง/ความถี่
      noise(o = {}) {
        o = Object.assign({ type: "lowpass", freq: 600, q: 1, gain: .05, lfoRate: 0, lfoDepth: 0, lfoTarget: "gain" }, o);
        const s = ctx.createBufferSource(); s.buffer = noiseBuf; s.loop = true;
        const f = ctx.createBiquadFilter(); f.type = o.type; f.frequency.value = o.freq; f.Q.value = o.q;
        const n = ctx.createGain(); n.gain.value = o.gain;
        s.connect(f); f.connect(n); n.connect(g); s.start(0, rnd(0, 2)); nodes.push(s);
        if (o.lfoRate) {
          const l = ctx.createOscillator(); l.frequency.value = o.lfoRate;
          const lg = ctx.createGain(); lg.gain.value = o.lfoDepth;
          l.connect(lg); lg.connect(o.lfoTarget === "freq" ? f.frequency : n.gain); l.start(); nodes.push(l);
        }
      },
      // เสียงพื้นยาวต่อเนื่อง (drone)
      drone(freq, o = {}) {
        o = Object.assign({ type: "sine", gain: .04, lp: 0, lfoRate: 0, lfoDepth: 0 }, o);
        const osc = ctx.createOscillator(); osc.type = o.type; osc.frequency.value = freq;
        const n = ctx.createGain(); n.gain.value = o.gain;
        let last = osc;
        if (o.lp) { const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = o.lp; osc.connect(lp); last = lp;
          if (o.lfoRate) { const l = ctx.createOscillator(); l.frequency.value = o.lfoRate; const lg = ctx.createGain(); lg.gain.value = o.lfoDepth; l.connect(lg); lg.connect(lp.frequency); l.start(); nodes.push(l); } }
        last.connect(n); n.connect(g); osc.start(); nodes.push(osc);
      },
      stop() {
        dead = true; timers.forEach(clearTimeout);
        const t = ctx.currentTime;
        g.gain.cancelScheduledValues(t); g.gain.setTargetAtTime(0, t, .35);
        setTimeout(() => { nodes.forEach(n => { try { n.stop(); } catch (e) {} }); try { g.disconnect(); } catch (e) {} }, 2500);
      }
    };
    return A;
  }

  const cricket = A => A.every(700, 2200, () => {
    const f = rnd(4200, 4800), n = 3 + Math.floor(Math.random() * 3);
    for (let i = 0; i < n; i++) A.tone(f, { dur: .05, gain: .012, delay: i * .07 });
  });
  const wolfOwl = A => A.every(16000, 32000, () => { A.tone(420, { dur: .4, gain: .05, attack: .08, lp: 900 }); A.tone(370, { dur: .6, gain: .05, delay: .5, attack: .08, lp: 900 }); });

  // ===== เสียงบรรยากาศของแต่ละธีม =====
  const ambient = {
    // ทุ่งหญ้า: ลมอ่อนๆ + นกร้อง
    meadow(A) {
      A.noise({ freq: 500, gain: .05, lfoRate: .12, lfoDepth: .03 });
      A.every(1500, 5000, () => {
        const base = rnd(2400, 3800), n = 2 + Math.floor(Math.random() * 3);
        for (let i = 0; i < n; i++) A.tone(base, { dur: .09, to: base * pick([1.3, .8, 1.15]), gain: .045, delay: i * .12 });
      });
    },
    // ซากุระ: พิณโคโตะสเกลญี่ปุ่น + ระฆังลม
    sakura(A) {
      const sc = [62, 64, 65, 69, 70, 74, 76, 77, 81];
      A.noise({ type: "bandpass", freq: 900, q: .6, gain: .025, lfoRate: .1, lfoDepth: .015 });
      A.every(900, 2600, () => A.pluck(pick(sc), { gain: .06, dur: 1.4 }));
      A.every(9000, 16000, () => [93, 96, 98].forEach((m, i) => A.bell(m, { gain: .03, delay: i * .18, dur: 1.8 })));
    },
    // ไทย: ระนาดเอก (เพนทาโทนิก) + จิ้งหรีด + น้ำคลอง
    thai(A) {
      const sc = [72, 74, 76, 79, 81, 84];
      A.noise({ type: "highpass", freq: 2500, gain: .01 });
      A.noise({ freq: 300, gain: .03, lfoRate: .2, lfoDepth: .015 });
      A.every(500, 1500, () => {
        const n = 1 + Math.floor(Math.random() * 3), s = pick([0, 1, -1]);
        let i0 = Math.floor(rnd(0, sc.length));
        for (let i = 0; i < n; i++) {
          const m = sc[Math.max(0, Math.min(sc.length - 1, i0 + i * s))];
          A.tone(hz(m), { type: "triangle", dur: .35, gain: .07, delay: i * .16, attack: .003, lp: 4000 });
          A.tone(hz(m) * 2, { dur: .18, gain: .025, delay: i * .16 });
        }
      });
      cricket(A);
    },
    // ทะเล: คลื่นซัด + นกนางนวล
    beach(A) {
      A.noise({ freq: 700, gain: .1, lfoRate: .11, lfoDepth: .085 });
      A.noise({ type: "highpass", freq: 3000, gain: .03, lfoRate: .11, lfoDepth: .025 });
      A.every(6000, 14000, () => {
        A.tone(1500, { type: "sawtooth", dur: .4, to: 1000, gain: .025, lp: 3000, vib: 40, vibRate: 12 });
        A.tone(1650, { type: "sawtooth", dur: .45, to: 1050, gain: .025, lp: 3000, delay: .5, vib: 40, vibRate: 12 });
      });
    },
    // หิมะ: ลมหวีดหวิว + กล่องดนตรีโน้ตห่างๆ
    winter(A) {
      A.noise({ type: "bandpass", freq: 450, q: 2, gain: .09, lfoRate: .07, lfoDepth: 250, lfoTarget: "freq" });
      const sc = [84, 86, 88, 91, 93];
      A.every(2500, 6000, () => A.bell(pick(sc), { gain: .045, dur: 2.2 }));
    },
    // ใบไม้ร่วง: ลม + ใบไม้เสียดสี + คอร์ดอุ่นๆ + นกฮูก
    autumn(A) {
      A.noise({ freq: 600, gain: .05, lfoRate: .09, lfoDepth: .03 });
      A.every(700, 2200, () => A.burst(rnd(.2, .5), { type: "highpass", freq: 4000, gain: .05, attack: .05 }));
      const chord = [110, 165, 220, 262];
      const pad = () => chord.forEach(f => A.tone(f, { dur: 9, attack: 3, gain: .018 }));
      pad(); A.every(7000, 9000, pad);
      wolfOwl(A);
    },
    // ฮาโลวีน: ดรอนต่ำ + เธอร์มินหลอนๆ + ค้างคาว + ฟ้าร้อง
    halloween(A) {
      A.drone(55, { type: "sawtooth", gain: .05, lp: 220, lfoRate: .08, lfoDepth: 80 });
      A.drone(55.6, { type: "sawtooth", gain: .04, lp: 200 });
      A.every(4000, 9000, () => { const f = rnd(450, 900); A.tone(f, { dur: 2.4, to: f * pick([.7, 1.4]), gain: .04, attack: .6, vib: 12, vibRate: 6 }); });
      A.every(2000, 6000, () => { const n = 2 + Math.floor(Math.random() * 3); for (let i = 0; i < n; i++) A.tone(5000, { dur: .05, to: 7500, gain: .018, delay: i * .09 }); });
      A.every(20000, 40000, () => A.burst(2.6, { freq: 160, gain: .45, attack: .3 }));
      wolfOwl(A);
    },
    // คริสต์มาส: กล่องดนตรีทำนอง Jingle Bells + กระดิ่งเลื่อนหิมะ
    christmas(A) {
      A.noise({ type: "bandpass", freq: 500, q: 1, gain: .03, lfoRate: .08, lfoDepth: .015 });
      const B = 330, notes = [[64, 1], [64, 1], [64, 2], [64, 1], [64, 1], [64, 2], [64, 1], [67, 1], [60, 1.5], [62, .5], [64, 4],
        [65, 1], [65, 1], [65, 1.5], [65, .5], [65, 1], [64, 1], [64, 1], [64, .5], [64, .5], [64, 1], [62, 1], [62, 1], [64, 1], [62, 2], [67, 2]];
      A.seq(notes.map(([m, b]) => ({ m, d: b * B })), s => A.bell(s.m + 12, { gain: .05, dur: 1.5 }), 9000);
      A.every(3500, 7500, () => { for (let i = 0; i < 6; i++) A.tone(rnd(3400, 5600), { dur: .16, gain: .02, delay: i * .06 }); });
    },
    // ทะเลทราย: ลมแห้ง + ดรอนกลวง + พิณอู๊ด สเกลอาหรับ
    desert(A) {
      A.noise({ type: "bandpass", freq: 700, q: .8, gain: .06, lfoRate: .06, lfoDepth: .04 });
      A.drone(65.4, { gain: .05, lp: 300 });
      A.drone(98, { type: "triangle", gain: .02, lp: 300 });
      const sc = [62, 63, 66, 67, 69, 70, 72, 74];
      A.every(1200, 3500, () => {
        const n = 1 + Math.floor(Math.random() * 4); let i = sc.length - 1 - Math.floor(rnd(0, 3));
        for (let k = 0; k < n; k++) { A.pluck(sc[Math.max(0, i - k)], { type: "sawtooth", lp: 1800, gain: .045, dur: .9, delay: k * .22 }); }
      });
    },
    // ป่าเวทมนตร์: พิณ Lydian + ประกายระยิบ + คอร์ดเวิ้งว้าง + จิ้งหรีดกลางคืน
    enchanted(A) {
      A.noise({ freq: 400, gain: .03, lfoRate: .1, lfoDepth: .015 });
      [48, 55, 64].forEach(m => { const p = () => A.tone(hz(m), { dur: 10, attack: 3.5, gain: .02 }); p(); A.every(8000, 9500, p); });
      const sc = [72, 74, 76, 78, 79, 81, 83, 84];
      A.every(1200, 3000, () => {
        const start = Math.floor(rnd(0, 3)), n = 4 + Math.floor(Math.random() * 3);
        for (let i = 0; i < n; i++) { const m = sc[Math.min(sc.length - 1, start + i)]; A.tone(hz(m), { dur: 1.2, gain: .045, delay: i * .12, attack: .005 }); A.tone(hz(m) * 2, { dur: .5, gain: .015, delay: i * .12 }); }
      });
      A.every(700, 2000, () => A.bell(rnd(96, 108) | 0, { gain: .02, dur: 1.2 }));
      cricket(A);
    },
    // อวกาศ: ดรอนลึก + สัญญาณวิทยุ/บลิป + สวีปเลเซอร์
    space(A) {
      A.drone(55, { gain: .06, lp: 400, lfoRate: .05, lfoDepth: 150 });
      A.drone(82.4, { gain: .035, lp: 500 });
      A.noise({ freq: 200, gain: .04 });
      A.every(1500, 5000, () => { const n = 1 + Math.floor(Math.random() * 3); for (let i = 0; i < n; i++) { const f = rnd(800, 2000); A.tone(f, { dur: .12, to: f * 1.5, gain: .03, delay: i * .18 }); } });
      A.every(9000, 16000, () => A.tone(200, { dur: 3, to: 1200, gain: .03, attack: 1, vib: 30, vibRate: 7 }));
      A.every(3000, 8000, () => { for (let i = 0; i < 3; i++) A.tone(1200, { type: "square", dur: .05, gain: .01, delay: i * .1 }); });
    },
    // ราชสำนัก: ฮาร์ปซิคอร์ดอาร์เพจจิโอ + น้ำพุ
    royal(A) {
      A.noise({ type: "highpass", freq: 2500, gain: .028, lfoRate: .3, lfoDepth: .01 });
      const chords = [[62, 66, 69, 74], [57, 61, 64, 69], [59, 62, 66, 71], [54, 57, 61, 66], [55, 59, 62, 67], [62, 66, 69, 74], [55, 59, 62, 67], [57, 61, 64, 69]];
      const order = [0, 1, 2, 3, 2, 1, 2, 3];
      const steps = [];
      chords.forEach(c => order.forEach(k => steps.push({ m: c[k % 4] + (k > 3 ? 12 : 0), d: 210 })));
      A.seq(steps, s => { A.pluck(s.m, { type: "sawtooth", lp: 2400, gain: .035, dur: .7 }); }, 5000);
    }
  };

  // ===== เสียงเอฟเฟกต์ =====
  const effects = {
    tap: d => tone(d, 700, { dur: .05, gain: .08 }),
    plant: d => { burst(d, .14, { freq: 500, gain: .3 }); tone(d, 220, { dur: .16, to: 140, gain: .25 }); },
    harvest: d => { tone(d, 988, { dur: .25, gain: .18 }); tone(d, 1319, { dur: .45, gain: .18, delay: .09 }); },
    ready: d => { tone(d, 1568, { dur: .5, gain: .1 }); tone(d, 2093, { dur: .6, gain: .08, delay: .1 }); },
    buy: d => { tone(d, 660, { type: "triangle", dur: .12, gain: .16 }); tone(d, 880, { type: "triangle", dur: .2, gain: .16, delay: .08 }); },
    theme: d => [523, 659, 784, 1047].forEach((f, i) => tone(d, f, { type: "triangle", dur: .5, gain: .16, delay: i * .09 })),
    equip: d => { tone(d, 784, { dur: .15, gain: .13 }); tone(d, 1047, { dur: .3, gain: .13, delay: .1 }); },
    error: d => tone(d, 180, { type: "sawtooth", dur: .28, to: 120, gain: .14, lp: 600 })
  };

  function startTheme() {
    if (!ctx || !enabled || !themeId || !ambient[themeId]) return;
    if (bus) bus.stop();
    bus = makeBus();
    ambient[themeId](bus);
    bus.out.gain.setTargetAtTime(1, ctx.currentTime, .6);
  }
  function unlock() {
    if (!enabled) return;
    if (!ensure()) return;
    ctx.resume().then(() => {
      if (ctx.state === "running") { if (!bus) startTheme(); ["pointerdown", "keydown", "touchend"].forEach(ev => window.removeEventListener(ev, unlock)); }
    });
  }
  ["pointerdown", "keydown", "touchend"].forEach(ev => window.addEventListener(ev, unlock));
  document.addEventListener("visibilitychange", () => {
    if (!ctx) return;
    if (document.hidden) ctx.suspend(); else if (enabled) ctx.resume();
  });

  return {
    init(on, id) { enabled = on; themeId = id; },
    setTheme(id) { themeId = id; if (ctx && ctx.state === "running") startTheme(); },
    toggle() {
      enabled = !enabled;
      if (enabled) { if (ensure()) ctx.resume().then(startTheme); }
      else if (bus) { bus.stop(); bus = null; }
      return enabled;
    },
    isOn: () => enabled,
    play(name) { if (!enabled || !ctx || ctx.state !== "running" || !effects[name]) return; effects[name](master); },
    themes: () => Object.keys(ambient),
    level() { if (!analyser) return 0; const a = new Float32Array(analyser.fftSize); analyser.getFloatTimeDomainData(a); let s = 0; for (const v of a) s += v * v; return Math.sqrt(s / a.length); }
  };
})();
