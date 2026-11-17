/** 程式合成音效（WebAudio），不需要音檔。只在使用者點擊後才會發聲。 */

let ctx: AudioContext | null = null;
let muted = false;

export function setMuted(v: boolean) {
  muted = v;
}

export function tone(freq: number, dur: number, type: OscillatorType = "triangle", vol = 0.12, delay = 0) {
  if (muted || typeof window === "undefined") return;
  try {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    ctx ??= new AC();
    const t = ctx.currentTime + delay;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(ctx.destination);
    o.start(t);
    o.stop(t + dur);
  } catch {
    /* 沒有音效也能玩 */
  }
}

export const sfx = {
  tap: () => tone(620, 0.06),
  erase: () => tone(380, 0.06),
  step: (n: number) => tone(440 + n * 40, 0.08),
  wrong: () => {
    tone(200, 0.14, "square", 0.06);
    tone(160, 0.16, "square", 0.06, 0.08);
  },
  win: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.18, "triangle", 0.14, i * 0.09)),
  evolve: () => [392, 523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, 0.22, "sine", 0.14, i * 0.1)),
};
