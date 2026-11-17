# INOKUO · Sistema de Reels 3D (Three.js + GSAP + FFmpeg)

Proyecto reutilizable para producir Reels verticales 9:16 de animación 3D low-poly isométrica. Primer vídeo: **«Lo que ocurre durante el transporte de un animal»** (50 s, 1080×1920, 30 fps, H.264 + AAC).

**Entregable final:** `output/inokuo_reel_transporte.mp4` · subtítulos `output/subtitulos.srt` · guion `script/GUION.md`.

## Cómo funciona
Todo es geometría 3D procedural (sin imágenes planas ni servicios de pago). Cada fotograma se calcula de forma **determinista**: `renderFrame(t)` mueve la línea de tiempo de GSAP a `t`, actualiza las animaciones procedurales, renderiza con Three.js (WebGL por software en Chromium headless) y se captura en JPEG. FFmpeg monta vídeo + audio.

```
index.html                  Lienzo 1080×1920: canvas WebGL + capas HTML (títulos, subtítulos, etiquetas, cierre de marca)
src/engine/                 stage.js (renderer, luces, sombras, rig de cámara) · overlay.js (textos y marca) · main.js
src/lib/                    kit.js (materiales/primitivas/paleta) · people.js · animals.js · vehicles.js · props.js
src/scenes/                 farm.js · truck.js · road.js · arrival.js · classroom.js  (un módulo por decorado)
projects/transporte/        config.json (tiempos, títulos, marca) · project.js (cámara y línea de tiempo)
script/                     guion.json (fuente del guion) · GUION.md · timing.json (palabras/subtítulos, generado) · durations.json
tools/                      make_voice.py (TTS) · make_timing.mjs (subtítulos+SRT) · make_audio.py (música/FX/mezcla) · contact.py
render/                     serve.mjs · render.mjs (fotogramas en paralelo) · frames.mjs (capturas sueltas) · mux.sh · export_models.mjs
audio/                      voice/*.wav (locución por frase) · voice.wav · music.wav · sfx.wav · mix.wav
models/                     GLB de los modelos (vaca, oveja, cerdo, personas, camión, granero…)
assets/brand/               Coloca aquí logo.png para activar el logotipo
```

## Requisitos
Node ≥ 20, Python 3, FFmpeg, Playwright con Chromium (`npm i`, y `pip install piper-tts sherpa-onnx numpy`).
La voz se descarga de <https://github.com/k2-fsa/sherpa-onnx/releases/tag/tts-models> (`vits-piper-es_ES-davefx-medium`) y se coloca en `assets/voice-models/` (`.onnx`, `.onnx.json`, `espeak-ng-data/`).

## Volver a renderizar
```bash
npm install
python3 tools/make_voice.py                          # locución por frase + duraciones
node tools/make_timing.mjs projects/transporte/config.json   # palabras, subtítulos y SRT
python3 tools/make_audio.py                          # música original, efectos y mezcla base
node render/render.mjs --workers 3                   # fotogramas JPEG en render/_frames (≈ 12 min)
bash render/mux.sh                                   # MP4 final en output/
```
Previsualizar fotogramas sueltos (rápido, 360×640): `node render/frames.mjs transporte 360 640 /tmp/shots 5 12 30` y `python3 tools/contact.py /tmp/shots hoja.png 5`.
Para ver las zonas seguras de Instagram añade `DEBUG=1`. `render.mjs` acepta `--scale 0.5`, `--from/--to` y `--step`. Reanuda automáticamente: no vuelve a renderizar fotogramas existentes (bórralos si cambias algo).

## Qué editar
| Quiero cambiar… | Dónde |
|---|---|
| Texto de la locución | `script/guion.json` → `make_voice.py` → `make_timing.mjs` → `make_audio.py` |
| Cuándo suena cada frase | `projects/transporte/config.json` → `voice` |
| Títulos en pantalla | `config.json` → `titles` (`*palabra*` = resaltada en verde) |
| Palabras destacadas en subtítulos | `script/guion.json` → `hl` |
| Duración | `config.json` → `duration` y los fotogramas clave de `project.js` |
| Logotipo, web y llamada a la acción | `assets/brand/logo.png` y `config.json` → `brand.web`, `brand.cta` |
| Cámara | `project.js` → lista `keys` (target, yaw, pitch, dist, fov por instante) |
| Personajes / animales | `src/lib/people.js`, `animals.js` (colores, ropa, pelo, sombrero…) |
| Decorados | `src/scenes/*.js` |
| Paleta | `src/lib/kit.js` (`C`) y variables CSS de `index.html` |

## Crear un Reel nuevo
1. Copia `projects/transporte` a `projects/<nuevo>` y edita `config.json` y `project.js`.
2. Escribe `script/guion.json`, crea nuevos módulos en `src/scenes/` reutilizando `src/lib/*` (todas las piezas son funciones `makeX()` parametrizadas).
3. Renderiza con `node render/render.mjs --project <nuevo>`.

## Notas
- **Logotipo:** no se incluye ni se inventa. Si existe `assets/brand/logo.png` se muestra en el cierre; si no, el cierre usa el nombre en tipografía y deja libres los huecos de web y CTA (`brand.web`, `brand.cta`).
- **Música:** composición original sintetizada con `tools/make_audio.py` (libre de derechos). Los efectos también son sintéticos.
- **Datos:** el vídeo no muestra cifras ni límites legales.
- **Zonas seguras de Instagram:** títulos en y=250–575 px, subtítulos en y≈1215–1400 px, interfaz de IG en la franja inferior (>1500 px) libre de texto.
