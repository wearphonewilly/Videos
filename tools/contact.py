import sys, glob
from PIL import Image, ImageDraw
d, out = sys.argv[1], sys.argv[2]; cols=int(sys.argv[3]) if len(sys.argv)>3 else 5
fs = sorted(glob.glob(d+'/f_*.png'), key=lambda f: float(f.split('f_')[1][:-4]))
ims=[Image.open(f).convert('RGB') for f in fs]; w,h=ims[0].size; sc=0.62 if w>400 else 1
tw,th=int(w*sc),int(h*sc); rows=(len(ims)+cols-1)//cols
sheet=Image.new('RGB',(tw*cols,th*rows),'white'); dr=ImageDraw.Draw(sheet)
for i,(f,im) in enumerate(zip(fs,ims)):
    sheet.paste(im.resize((tw,th)),((i%cols)*tw,(i//cols)*th)); dr.text(((i%cols)*tw+6,(i//cols)*th+6),f.split('f_')[1][:-4],fill='red')
sheet.save(out); print(sheet.size)
