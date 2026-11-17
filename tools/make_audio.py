"""Genera música original libre de derechos (síntesis propia), efectos y ambiente, y mezcla con la locución.
Salidas: audio/music.wav, audio/sfx.wav, audio/voice.wav, audio/mix.wav (estéreo 44.1 kHz)."""
import numpy as np, json, wave, os, subprocess, sys
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
cfg = json.load(open(f"{root}/projects/transporte/config.json"))
SR = 44100; DUR = float(cfg["duration"]); N = int(SR * DUR); rng = np.random.default_rng(7)
T = np.arange(N) / SR

def write(path, x):
    x = np.clip(x, -1, 1); y = (x * 32767).astype('<i2')
    with wave.open(path, 'wb') as w:
        w.setnchannels(y.shape[1] if y.ndim > 1 else 1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(y.tobytes())
def fft_filter(x, lo=None, hi=None):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR); m = np.ones_like(f)
    if lo: m *= 1 / (1 + (lo / np.maximum(f, 1e-3)) ** 4)
    if hi: m *= 1 / (1 + (f / hi) ** 4)
    return np.fft.irfft(X * m, len(x))
def env(n, a, r):
    e = np.ones(n); na, nr = int(a * SR), int(r * SR)
    if na: e[:na] = np.linspace(0, 1, na)
    if nr: e[-nr:] *= np.linspace(1, 0, nr)
    return e
def put(buf, x, t0, gain=1.0, pan=0.0):
    i = int(t0 * SR); 
    if i >= N or i + len(x) <= 0: return
    j = min(N, i + len(x)); seg = x[max(0, -i): j - i] * gain
    buf[max(i, 0):j, 0] += seg * (1 - max(0, pan)); buf[max(i, 0):j, 1] += seg * (1 + min(0, pan))
def tone(f, d, harm=(1,), amps=(1,), a=0.005, decay=None):
    n = int(d * SR); tt = np.arange(n) / SR; x = sum(A * np.sin(2 * np.pi * f * h * tt) for h, A in zip(harm, amps))
    e = np.exp(-tt / decay) if decay else np.ones(n); return x * e * env(n, a, min(0.05, d / 3))
def noise(d): return rng.standard_normal(int(d * SR))

# ------------------------------------------------ MÚSICA
def midi(n): return 440 * 2 ** ((n - 69) / 12)
music = np.zeros((N, 2)); BPM = 96; beat = 60 / BPM; bar = 4 * beat
prog = [(57, 60, 64), (53, 57, 60), (48, 52, 55), (55, 59, 62)]
nb = int(np.ceil(DUR / bar))
for b in range(nb):
    ch = prog[b % 4] if b < 18 else (48, 52, 55) if b >= 18 and b < nb - 0 else prog[b % 4]
    if b >= 19: ch = (48, 52, 55)
    t0 = b * bar
    # pad
    for k, n in enumerate(ch):
        x = sum(tone(midi(n) * (1 + d), bar + 1.0, (1, 2, 3), (1, .35, .12), a=0.9) for d in (-0.004, 0.0, 0.004)) / 3
        put(music, x * env(len(x), 0.9, 1.0), t0, 0.07, pan=(k - 1) * 0.35)
    # bajo
    for q in (0, 2):
        put(music, tone(midi(ch[0] - 12), beat * 1.8, (1, 2), (1, .25), decay=0.9), t0 + q * beat, 0.16)
    # arpegio desde 6 s
    if t0 >= 5.0:
        pat = [0, 1, 2, 1, 2, 1, 2, 1] if b % 2 == 0 else [0, 2, 1, 2, 0, 2, 1, 2]
        for s, p in enumerate(pat):
            tt = t0 + s * beat / 2; n = ch[p] + 12
            put(music, tone(midi(n), 0.7, (1, 2, 3), (1, .3, .1), a=0.004, decay=0.28), tt, 0.085 * (1.0 if s % 2 == 0 else 0.72), pan=0.3 if s % 2 else -0.3)
    # percusión suave desde 14 s
    if t0 >= 13.9 and t0 < 45:
        for q in range(8):
            tt = t0 + q * beat / 2; sh = fft_filter(noise(0.08), lo=5000); sh *= np.exp(-np.arange(len(sh)) / SR / 0.018)
            put(music, sh, tt + (beat / 4 if q % 2 else 0) * 0, 0.022 if q % 2 else 0.012)
        for q in (0, 2):
            kk = tone(55 * np.exp(0), 0.25, (1,), (1,), decay=0.09); sweep = np.sin(2 * np.pi * np.cumsum(np.linspace(110, 48, len(kk))) / SR) * np.exp(-np.arange(len(kk)) / SR / 0.1)
            put(music, sweep, t0 + q * beat, 0.16)
# campanilla final
for i, n in enumerate((72, 76, 79, 84)):
    put(music, tone(midi(n), 2.2, (1, 2.76, 5.4), (1, .3, .1), decay=0.9), 45.4 + i * 0.18, 0.09, pan=(i - 1.5) * 0.3)
# reverb
ir = rng.standard_normal(int(1.8 * SR)) * np.exp(-np.arange(int(1.8 * SR)) / SR / 0.55); ir = fft_filter(ir, hi=5000); ir /= np.abs(ir).sum() * 0.12
for c in range(2):
    wet = np.fft.irfft(np.fft.rfft(music[:, c], N + len(ir)) * np.fft.rfft(ir, N + len(ir)))[:N]; music[:, c] = music[:, c] * 0.72 + wet * 0.5
fade = np.minimum(1, T / 1.5) * np.minimum(1, (DUR - T) / 2.5); music *= fade[:, None]
music = music / np.abs(music).max() * 0.55
write(f"{root}/audio/music.wav", music)

# ------------------------------------------------ EFECTOS Y AMBIENTE
sfx = np.zeros((N, 2))
def swell(t0, t1, a=0.2, r=0.4):
    x = np.zeros(N); i0, i1 = int(t0 * SR), int(t1 * SR); x[i0:i1] = env(i1 - i0, a, r); return x
# viento suave + pájaros (granja y camino)
wind = fft_filter(noise(DUR), lo=200, hi=900); wind = wind / np.abs(wind).max() * 0.05 * (0.7 + 0.3 * np.sin(T * 0.4))
sfx[:, 0] += wind; sfx[:, 1] += wind
def chirp(t0, f0, f1, d=0.12, g=0.04, pan=0):
    n = int(d * SR); f = np.linspace(f0, f1, n); ph = 2 * np.pi * np.cumsum(f) / SR; x = np.sin(ph) * np.sin(np.linspace(0, np.pi, n)) ** 2; put(sfx, x, t0, g, pan)
for t0 in np.sort(rng.uniform(0.3, 13, 26)):
    f = rng.uniform(2800, 4600)
    for k in range(rng.integers(2, 5)): chirp(t0 + k * 0.14, f, f * rng.uniform(0.8, 1.35), 0.1, 0.03, rng.uniform(-0.6, 0.6))
# mugidos (síntesis con formantes)
def moo(t0, f0=105, d=1.3, g=0.22):
    n = int(d * SR); tt = np.arange(n) / SR; f = f0 * (1 + 0.1 * np.sin(2 * np.pi * 5 * tt) * 0.2) * np.linspace(1.15, 0.8, n)
    ph = 2 * np.pi * np.cumsum(f) / SR; src = sum(np.sin(ph * h) / h for h in range(1, 18)); x = fft_filter(src, lo=180, hi=900) * 0.8 + fft_filter(src, lo=1000, hi=1500) * 0.15
    x *= np.sin(np.linspace(0, np.pi, n)) ** 0.7; put(sfx, x / np.abs(x).max(), t0, g, 0.2)
moo(2.6); moo(8.8, 98, 1.1, 0.14); moo(30.5, 112, 1.0, 0.1)
# golpe metálico (rampa)
def clank(t0, g=0.3):
    n = int(0.9 * SR); tt = np.arange(n) / SR; x = sum(np.sin(2 * np.pi * f * tt) * np.exp(-tt / d) for f, d in ((310, .25), (587, .18), (910, .12), (1480, .08))); x += fft_filter(noise(0.9), lo=1500)[:n] * np.exp(-tt / 0.03) * 0.8
    put(sfx, x / np.abs(x).max(), t0, g)
clank(10.55, 0.28); clank(13.5, 0.25)
def thud(t0, g=0.2, f=95):
    n = int(0.22 * SR); tt = np.arange(n) / SR; x = np.sin(2 * np.pi * f * tt * np.exp(-tt * 8)) * np.exp(-tt / 0.05) + fft_filter(noise(0.22), hi=600)[:n] * np.exp(-tt / 0.03) * 0.5; put(sfx, x, t0, g)
for k in range(14): thud(10.9 + k * 0.46 + (0.05 if k % 2 else 0), 0.14, 90 + 10 * (k % 2))
for k in range(8): thud(5.9 + k * 0.5, 0.09, 80)  # pasos de la vaca hacia la manga
# camión: marcha atrás (6.4-10.6) con avisador
def engine(t0, t1, speed_fn, g=0.2):
    i0, i1 = int(t0 * SR), int(t1 * SR); tt = np.arange(i1 - i0) / SR + t0; sp = speed_fn(tt)
    f = 34 + 55 * sp; ph = 2 * np.pi * np.cumsum(f) / SR
    x = sum(np.sin(ph * h + h) * a for h, a in ((1, 1), (2, .8), (3, .55), (4, .4), (6, .25))) * (0.7 + 0.3 * np.sin(2 * np.pi * (f / 4) * (tt - t0)))
    sm = float(sp.mean()); x = fft_filter(x, hi=520 + 900 * sm); x += fft_filter(noise(t1 - t0), lo=60, hi=300 + 1200 * sm)[:len(x)] * (0.6 + 1.2 * sp)
    x = x / np.abs(x).max() * env(len(x), 0.8, 1.2); put(sfx, x, t0, g * (0.8 + 0.5 * sp.mean()))
engine(6.4, 10.8, lambda tt: np.clip(1 - (tt - 6.4) / 4.0, 0.05, 1) ** 1.5 * 0.55, 0.16)
for k in range(5): put(sfx, tone(1050, 0.28, (1, 3), (1, .2), a=0.004), 6.9 + k * 0.7, 0.05)
engine(14.0, 25.8, lambda tt: np.clip(np.sin(np.clip((tt - 14.4) / 11.0, 0, 1) * np.pi) ** 0.6, 0.0, 1), 0.2)
road = fft_filter(noise(DUR), lo=300, hi=1800) * swell(15.5, 24.5, 1.5, 1.5) * 0.05; sfx[:, 0] += road; sfx[:, 1] += road
air = fft_filter(noise(1.6), lo=2500)[:int(1.6 * SR)] * np.exp(-np.arange(int(1.6 * SR)) / SR / 0.5); put(sfx, air / np.abs(air).max(), 25.5, 0.12)
# aparición de insignias
def pop(t0, g=0.2, f=520):
    n = int(0.35 * SR); tt = np.arange(n) / SR; fr = f * (1 + 1.6 * tt / 0.35); x = np.sin(2 * np.pi * np.cumsum(fr) / SR) * np.exp(-tt / 0.07)
    x += 0.3 * np.sin(2 * np.pi * f * 3 * tt) * np.exp(-tt / 0.05); put(sfx, x, t0, g)
for t0, f in ((15.9, 420), (17.3, 480), (18.7, 540), (20.1, 600)): pop(t0, 0.22, f)
def ding(t0, f=1318, g=0.12): put(sfx, tone(f, 1.0, (1, 2.01, 3.0), (1, .35, .12), a=0.002, decay=0.28), t0, g)
for i in range(7): ding(29.0 + i * 0.35, 1175 + 70 * i, 0.09)
# whoosh en transiciones
def whoosh(t0, d=0.9, g=0.14, up=True):
    n = int(d * SR); x = noise(d); ff = np.linspace(400, 5000, n) if up else np.linspace(5000, 400, n); y = np.zeros(n); lp = 0.0
    a = np.clip(2 * np.pi * ff / SR, 0, 0.9); 
    for i in range(n): lp += a[i] * (x[i] - lp); y[i] = lp
    y *= np.sin(np.linspace(0, np.pi, n)) ** 2; put(sfx, y / np.abs(y).max(), t0, g)
whoosh(6.0, 1.2, 0.1); whoosh(14.2, 1.0, 0.08); whoosh(20.6, 0.8, 0.08); whoosh(31.4, 1.4, 0.12, True); whoosh(44.6, 1.0, 0.1, False)
# aula: construcción + teclas
for k, t0 in enumerate(np.linspace(32.2, 35.3, 14)): pop(t0, 0.12, 380 + 40 * (k % 5))
for t0 in np.sort(rng.uniform(36.5, 44.5, 60)): put(sfx, fft_filter(noise(0.02), lo=2500) * 3, t0, 0.015, rng.uniform(-.7, .7))
write(f"{root}/audio/sfx.wav", sfx / max(1.0, np.abs(sfx).max()) * 0.95)

# ------------------------------------------------ LOCUCIÓN
voice = np.zeros((N, 2)); g = json.load(open(f"{root}/script/guion.json"))
for l in g["lines"]:
    with wave.open(f"{root}/audio/voice/{l['id']}.wav") as w:
        sr = w.getframerate(); x = np.frombuffer(w.readframes(w.getnframes()), '<i2').astype(float) / 32768
    x = np.interp(np.arange(int(len(x) * SR / sr)) / SR, np.arange(len(x)) / sr, x)
    x = x / np.abs(x).max() * 0.9; put(voice, x, cfg["voice"][l["id"]], 1.0)
write(f"{root}/audio/voice.wav", voice)
print("ok")
