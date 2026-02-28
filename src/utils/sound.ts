// ============================================================
// Sound Effects — Web Audio API (zero dependencies)
// ============================================================

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  try {
    if (!ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      ctx = new AudioCtx();
    }
    return ctx;
  } catch {
    return null;
  }
}

function beep(frequency: number, duration: number, volume: number) {
  const c = getCtx();
  if (!c) return;
  try {
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = 'sine';
    osc.frequency.value = frequency;
    gain.gain.value = volume;
    osc.connect(gain);
    gain.connect(c.destination);
    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);
    osc.stop(c.currentTime + duration + 0.01);
  } catch { /* ignore audio errors */ }
}

/** Low rumble — node went DOWN */
export function playFailure() {
  beep(180, 0.18, 0.15);
  setTimeout(() => beep(120, 0.25, 0.12), 80);
}

/** Warning tone — node DEGRADED */
export function playDegraded() {
  beep(380, 0.12, 0.1);
}

/** Triple alarm — scenario started */
export function playAlarm() {
  beep(700, 0.08, 0.08);
  setTimeout(() => beep(500, 0.08, 0.08), 100);
  setTimeout(() => beep(700, 0.08, 0.08), 200);
}

/** Positive chime — reset / recovery */
export function playReset() {
  beep(523, 0.1, 0.08);
  setTimeout(() => beep(659, 0.1, 0.08), 80);
  setTimeout(() => beep(784, 0.15, 0.08), 160);
}
