"""Channel banner generator (2560x1440, YouTube safe area 1546x423 centred).

Usage (from the repo root):
  python3 tools/branding/banner.py --name "Atlas of Time" --tagline "BATTLES · EMPIRES · TURNING POINTS"
Writes build/branding/banner.html and banner_guide.html (safe-area overlay); render.py turns them into JPGs.
The skyline (pyramids, temple, colosseum, pagoda, Mughal dome, spire) and the 3000 BCE-2000 CE ruler keep the
banner generic to a world-history channel rather than one film.
"""
import math, random, argparse, os
ap=argparse.ArgumentParser(); ap.add_argument('--name',default='Atlas of Time')
ap.add_argument('--tagline',default='BATTLES · EMPIRES · TURNING POINTS'); ap.add_argument('--out',default='build/branding')
A=ap.parse_args(); os.makedirs(A.out,exist_ok=True)
FONTS=os.path.relpath('template/public/fonts',A.out)
random.seed(7)
W,H=2560,1440; cx=W/2; HZ=896   # horizon inside the 508-931 band shown on every device
def poly(pts): return 'M'+' L'.join(f'{x:.1f},{y:.1f}' for x,y in pts)+' Z'
S=[]  # silhouette paths
# Egypt: pyramids + obelisk
S.append(poly([(60,HZ),(250,HZ-205),(440,HZ)])); S.append(poly([(330,HZ),(470,HZ-150),(610,HZ)])); S.append(poly([(560,HZ),(640,HZ-85),(720,HZ)]))
S.append(poly([(760,HZ),(768,HZ-170),(774,HZ-182),(780,HZ-170),(788,HZ)]))
# Greek temple
x=850; S.append(poly([(x,HZ),(x,HZ-18),(x+250,HZ-18),(x+250,HZ)]))
for i in range(7): S.append(f'M{x+12+i*36:.1f},{HZ-18} h18 v-120 h-18 Z')
S.append(poly([(x-6,HZ-138),(x+256,HZ-138),(x+125,HZ-200)]))
# Roman colosseum: tiered arcade
x=1150; S.append(f'M{x},{HZ} v-140 q 150,-22 300,0 v140 Z')
arches=''
for r,yy in [(0,HZ-112),(1,HZ-62)]:
    for i in range(8): arches+=f'<path d="M{x+14+i*36:.1f},{yy+40} v-22 a10,12 0 0 1 20,0 v22 Z" fill="#c9a24a" opacity="0.10"/>'
# Pagoda (East Asia)
x=1840
for k,(w,y0) in enumerate([(200,HZ),(170,HZ-58),(140,HZ-110),(112,HZ-156),(86,HZ-196)]):
    S.append(f'M{x-w/2+10},{y0} v-34 h{w-20} v34 Z')
    S.append(f'M{x-w/2-22},{y0-30} q {w/2+22},-30 {w+44},0 l -14,-10 h-{w+16} Z')
S.append(f'M{x-3},{HZ-226} h6 v-60 h-6 Z')
# Mughal dome with minarets
x=2140; S.append(f'M{x-150},{HZ} v-95 h300 v95 Z'); S.append(f'M{x-80},{HZ-95} c 0,-90 160,-90 160,0 Z')
S.append(f'M{x-90},{HZ-95} C {x-110},{HZ-200} {x-20},{HZ-215} {x},{HZ-262} C {x+20},{HZ-215} {x+110},{HZ-200} {x+90},{HZ-95} Z')
for mx in (x-200,x+188): S.append(f'M{mx},{HZ} v-210 h12 v210 Z M{mx-6},{HZ-210} h24 l-12,-24 Z')
# Gothic spire + castle tower
x=2380; S.append(f'M{x-55},{HZ} v-150 h110 v150 Z M{x-55},{HZ-150} L{x},{HZ-330} L{x+55},{HZ-150} Z')
S.append(f'M{x+80},{HZ} v-120 h70 v120 Z')
for i in range(4): S.append(f'M{x+80+i*20},{HZ-120} h12 v-16 h-12 Z')
# low rolling land between monuments
land=f'M0,{HZ} '+' '.join(f'L{x},{HZ-8-6*math.sin(x/90)}' for x in range(0,W+40,40))+f' L{W},{H} L0,{H} Z'
K=0.7
GROUPS=[(380,0,4),(915,4,13),(1300,13,14),(1840,14,25),(2140,25,30),(2420,30,36)]
sil=''.join(f'<g transform="translate({gx},{HZ}) scale({K}) translate({-gx},{-HZ})">'+''.join(f'<path d="{d}"/>' for d in S[a:b])+'</g>' for gx,a,b in GROUPS)
# stars
stars=''.join(f'<circle cx="{random.uniform(0,W):.0f}" cy="{random.uniform(0,560)**1.0:.0f}" r="{random.choice([1,1,1.4,2])}" fill="#f1e7cc" opacity="{random.uniform(0.25,0.9):.2f}"/>' for _ in range(420))
# timeline ruler on the horizon
ticks=''
labels=['3000 BCE','2000 BCE','1000 BCE','1 CE','1000 CE','1500 CE','2000 CE']
x0,x1=120,W-120
for i in range(0,121):
    x=x0+(x1-x0)*i/120; major=i%20==0
    ticks+=f'<line x1="{x:.1f}" y1="{HZ+6}" x2="{x:.1f}" y2="{HZ+(18 if major else 11)}" stroke="#e8c877" stroke-width="{3 if major else 1.5}" opacity="{0.95 if major else 0.55}"/>'
    if major: ticks+=f'<text x="{x:.1f}" y="{HZ+31}" text-anchor="middle" font-family="Spec" font-size="18" fill="#e8c877" opacity="0.85" letter-spacing="2">{labels[i//20]}</text>'
html=f'''<html><head><style>
@font-face{{font-family:Fell;src:url({FONTS}/im-fell-english-sc-latin-400-normal.woff2)}}
@font-face{{font-family:Spec;src:url({FONTS}/spectral-latin-500-normal.woff2)}}
@font-face{{font-family:SpecI;src:url({FONTS}/spectral-latin-400-italic.woff2)}}
body{{margin:0}}</style></head><body>
<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}">
<defs>
 <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0" stop-color="#03060f"/><stop offset="0.28" stop-color="#0b1838"/><stop offset="0.48" stop-color="#1c2f66"/>
  <stop offset="0.54" stop-color="#4a3560"/><stop offset="0.59" stop-color="#a65a3e"/><stop offset="0.622" stop-color="#f2a54c"/><stop offset="0.63" stop-color="#1a1220"/><stop offset="1" stop-color="#05070d"/></linearGradient>
 <radialGradient id="sun" cx="50%" cy="62%" r="40%"><stop offset="0" stop-color="#ffd27a" stop-opacity="0.75"/><stop offset="0.25" stop-color="#e88a3a" stop-opacity="0.35"/><stop offset="1" stop-color="#e88a3a" stop-opacity="0"/></radialGradient>
 <linearGradient id="goldT" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff2c4"/><stop offset="0.45" stop-color="#f0cf7a"/><stop offset="0.55" stop-color="#c9963a"/><stop offset="1" stop-color="#8a5f1e"/></linearGradient>
 <filter id="glow" x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation="14" result="b"/><feColorMatrix in="b" values="1 0 0 0 0.25  0 0.8 0 0 0.12  0 0 0.3 0 0  0 0 0 0.75 0"/><feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge></filter>
 <filter id="shadow"><feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="#000" flood-opacity="0.8"/></filter>
 <linearGradient id="rim" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e8a04a" stop-opacity="0.9"/><stop offset="0.08" stop-color="#e8a04a" stop-opacity="0"/></linearGradient>
</defs>
<rect width="{W}" height="{H}" fill="url(#sky)"/>
{stars}
<g fill="none" stroke="#c9a24a" stroke-width="1.6" opacity="0.10">{''.join(f'<ellipse cx="{cx}" cy="{HZ+900}" rx="{r}" ry="{r*0.85}"/>' for r in range(1100,2700,160))}</g>
<rect width="{W}" height="{H}" fill="url(#sun)"/>
<g fill="#060a16">{sil}<path d="{land}"/></g>
<g fill="url(#rim)" opacity="0.6">{sil}</g>
<g transform="translate(1300,{HZ}) scale(0.7) translate(-1300,{-HZ})">{arches}</g>
{''.join(f'<line x1="{cx}" y1="{HZ}" x2="{cx+(i)*260}" y2="{H}" stroke="#c9a24a" stroke-width="1.5" opacity="0.10"/>' for i in range(-14,15))}
{''.join(f'<line x1="0" y1="{HZ+d}" x2="{W}" y2="{HZ+d}" stroke="#c9a24a" stroke-width="1.2" opacity="{0.12-0.0001*d:.3f}"/>' for d in [70,150,250,380,540])}
<line x1="{x0}" y1="{HZ+6}" x2="{x1}" y2="{HZ+6}" stroke="#e8c877" stroke-width="2.5" opacity="0.9"/>
{ticks}
<text x="{cx}" y="560" text-anchor="middle" font-family="Spec" font-size="32" letter-spacing="14" fill="#e8c877" opacity="0.92">{A.tagline}</text>
<g filter="url(#glow)"><text x="{cx}" y="738" text-anchor="middle" font-family="Fell" font-size="200" letter-spacing="10" fill="url(#goldT)" filter="url(#shadow)">{A.name}</text></g>
</svg></body></html>'''
open(os.path.join(A.out,'banner.html'),'w').write(html)
open(os.path.join(A.out,'banner_guide.html'),'w').write(html.replace('</svg></body>',f'<rect x="{(W-1546)/2}" y="{(H-423)/2}" width="1546" height="423" fill="none" stroke="#ff3b30" stroke-width="5" stroke-dasharray="20 12"/><rect x="0" y="{(H-423)/2}" width="{W}" height="423" fill="none" stroke="#30d0ff" stroke-width="4" stroke-dasharray="10 10"/></svg></body>'))
