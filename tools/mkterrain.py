# Recolour Natural Earth shaded relief (SR_HR.tif, public domain) into the lapis-and-gold map terrain.
# Set LON0/LON1/LAT0/LAT1 for your region, and point the two paths below at your SR_HR.tif and a land TopoJSON.
# Output: public/terrain.jpg at 120 px per degree (MapPlate assumes this).
from PIL import Image, ImageFilter, ImageDraw
import numpy as np, json, sys
Image.MAX_IMAGE_PIXELS=None
LON0,LON1,LAT0,LAT1=58,92,20,43
im=Image.open('raw/SR_HR.tif')
x0,x1=(LON0+180)*60,(LON1+180)*60; y0,y1=(90-LAT1)*60,(90-LAT0)*60
c=im.crop((x0,y0,x1,y1)); W,H=c.size
c=c.resize((W*2,H*2),Image.LANCZOS)
a=np.asarray(c).astype(np.float32)/255.
t=json.load(open('/home/claude/atlasoftime/site/data/land.json'))
sx,sy=t['transform']['scale']; tx,ty=t['transform']['translate']
arcs=[]
for arc in t['arcs']:
    x=y=0; pts=[]
    for dx,dy in arc: x+=dx;y+=dy; pts.append((x*sx+tx,y*sy+ty))
    arcs.append(pts)
def ring(idx):
    out=[]
    for i in idx:
        p=arcs[i] if i>=0 else arcs[~i][::-1]
        out+= p if not out else p[1:]
    return out
mask=Image.new('L',(W*2,H*2),0); d=ImageDraw.Draw(mask)
geo=t['objects']['land']; geoms=geo['geometries'] if 'geometries' in geo else [geo]
P=lambda lon,lat:((lon-LON0)*120,(LAT1-lat)*120)
for gm in geoms:
    for poly in (gm['arcs'] if gm['type']=='MultiPolygon' else [gm['arcs']]):
        for k,r in enumerate(poly):
            pts=[P(*p) for p in ring(r)]
            if len(pts)>2: d.polygon(pts,fill=255 if k==0 else 0)
m=np.asarray(mask.filter(ImageFilter.GaussianBlur(1.5))).astype(np.float32)/255.
med=float(np.median(a[m>0.5]))
v=a-med
def mix(c0,c1,f): return np.array(c0,np.float32)*(1-f[...,None])+np.array(c1,np.float32)*f[...,None]
sh=np.clip(-v/0.32,0,1); li=np.clip(v/0.13,0,1)**0.85
land=mix((30,47,90),(5,10,26),sh)
land=land*(1-li[...,None])+mix((30,47,90),(232,196,112),li)*li[...,None]
R=np.random.default_rng(1); nz=Image.fromarray((R.random((H//10,W//10))*255).astype(np.uint8)).resize((W*2,H*2),Image.BICUBIC)
n=np.asarray(nz).astype(np.float32)/255.; land*=(0.92+0.16*n)[...,None]
sea=np.zeros_like(land); sea[:]=(5,9,22)
img=land*m[...,None]+sea*(1-m[...,None])
edge=np.asarray(mask.filter(ImageFilter.FIND_EDGES).filter(ImageFilter.GaussianBlur(1.2))).astype(np.float32)/255.
e=np.clip(edge*3,0,1)[...,None]; img=img*(1-e)+np.array((201,162,74))*e
out=Image.fromarray(np.clip(img,0,255).astype(np.uint8)); out.save('panipat/public/terrain.jpg',quality=92)
out.crop((1400,600,3200,1800)).save('t_prev.jpg')
