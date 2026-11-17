import sys, json, sherpa_onnx, soundfile as sf
model, speaker, speed, out, text = sys.argv[1], int(sys.argv[2]), float(sys.argv[3]), sys.argv[4], sys.argv[5]
d=model.rsplit('/',1)[0]; n=model.rsplit('/',1)[1].replace('.onnx','')
cfg=sherpa_onnx.OfflineTtsConfig(model=sherpa_onnx.OfflineTtsModelConfig(vits=sherpa_onnx.OfflineTtsVitsModelConfig(model=model,tokens=d+'/tokens.txt',data_dir=d+'/espeak-ng-data'),num_threads=4))
tts=sherpa_onnx.OfflineTts(cfg)
a=tts.generate(text,sid=speaker,speed=speed)
sf.write(out,a.samples,a.sample_rate)
print(out,len(a.samples)/a.sample_rate,"s",tts.num_speakers,"speakers")
