export const bgm = new Audio('https://incompetech.com/music/royalty-free/mp3-royaltyfree/Cipher2.mp3');
bgm.hidden = true;
document.body.append(bgm);
bgm.loop = true;
bgm.preload = 'none';
bgm.volume = .24;
let context;
export let effects = true;
export function toggleEffects() { effects = !effects; }
export async function music() { if (!bgm.paused) {
    bgm.pause();
    return;
} await bgm.play(); }
export function sound(kind) {
    if (!effects || document.hidden)
        return;
    try {
        context ??= new AudioContext();
        void context.resume();
        const notes = kind === 'result' ? [392, 494, 587, 784] : kind === 'attack' ? [140, 65] : kind === 'spell' ? [440, 660, 880] : [330, 494];
        notes.forEach((f, i) => { const o = context.createOscillator(), g = context.createGain(), t = context.currentTime + i * .07; o.type = kind === 'attack' ? 'triangle' : 'sine'; o.frequency.setValueAtTime(f, t); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.045, t + .012); g.gain.exponentialRampToValueAtTime(.001, t + .2); o.connect(g); g.connect(context.destination); o.start(t); o.stop(t + .22); });
    }
    catch { /* Audio is optional; gameplay remains available. */ }
}
document.addEventListener('visibilitychange', () => { if (document.hidden)
    bgm.pause(); });
window.addEventListener('pagehide', () => { bgm.pause(); void context?.suspend(); });
