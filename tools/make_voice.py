"""Genera la locución (Piper, es_ES) por frase y mide duraciones -> audio/voice/*.wav + script/timing.json"""
import json, subprocess, wave, os, sys
root=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
g=json.load(open(f"{root}/script/guion.json"))
model=f"{root}/assets/voice-models/es_ES-davefx-medium.onnx"
ddir=sys.argv[1] if len(sys.argv)>1 else f"{root}/assets/voice-models"
os.makedirs(f"{root}/audio/voice",exist_ok=True)
out={}
for l in g["lines"]:
    f=f"{root}/audio/voice/{l['id']}.wav"
    subprocess.run([sys.executable,"-m","piper","-m",model,"--data-dir",ddir,"--length-scale","0.93","--noise-scale","0.5","-f",f],input=l["text"].encode(),check=True,capture_output=True)
    w=wave.open(f); out[l["id"]]=w.getnframes()/w.getframerate()
    print(l["id"],round(out[l["id"]],2))
json.dump(out,open(f"{root}/script/durations.json","w"),indent=1)
print("total",sum(out.values()))
