export default class AudioManager {
    constructor() {
        this.audioCtx = null;
    }

    playSound(type, freq, duration, volume) {
        if (!this.audioCtx) {
            this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        const ctx = this.audioCtx;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        gain.gain.setValueAtTime(volume, ctx.currentTime);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + duration);
        return osc;
    }

    playDropSound() {
        const osc = this.playSound('square', 600, 0.2, 0.3);
        if (this.audioCtx) {
            osc.frequency.exponentialRampToValueAtTime(150, this.audioCtx.currentTime + 0.2);
        }
    }

    playWinSound() {
        this.playSound('sawtooth', 880, 0.4, 0.4);
    }

    playDrawSound() {
        this.playSound('triangle', 300, 0.3, 0.3);
    }
}
