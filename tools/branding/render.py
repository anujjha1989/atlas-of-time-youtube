"""Render the channel branding with Playwright Chromium (pip install playwright; playwright install chromium).

From the repo root:  python3 tools/branding/banner.py  &&  python3 tools/branding/render.py
Outputs in build/branding/:
  profile.png          800x800   (Customisation -> Picture)
  banner.jpg           2560x1440 (Customisation -> Banner image; text sits inside the 1546x423 safe area)
  banner_guide.jpg     the banner with the safe areas outlined (red = all devices, blue = desktop)
  watermark.png        300x300 transparent (Customisation -> Branding -> Video watermark, "Entire video")
  watermark_preview.png the watermark at real size over light, sky, dark-olive and night frames
"""
import os, pathlib
from playwright.sync_api import sync_playwright
HERE = pathlib.Path(__file__).resolve().parent
OUT = pathlib.Path('build/branding').resolve(); OUT.mkdir(parents=True, exist_ok=True)
def page_for(svg, size):
    h = OUT / (svg.stem + '_wrap.html')
    h.write_text(f'<html><body style="margin:0;background:transparent"><img src="{svg.as_uri()}" style="width:{size}px;display:block"></body></html>')
    return h
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page()
    pg.set_viewport_size({'width': 800, 'height': 800}); pg.goto(page_for(HERE/'profile.svg', 800).as_uri()); pg.wait_for_timeout(300)
    pg.screenshot(path=str(OUT/'profile.png'))
    pg.set_viewport_size({'width': 300, 'height': 300}); pg.goto(page_for(HERE/'watermark.svg', 300).as_uri()); pg.wait_for_timeout(300)
    pg.screenshot(path=str(OUT/'watermark.png'), omit_background=True)
    bgs = ['#e8dcc0', 'linear-gradient(#7aa3c9,#c9b48a)', '#3b3a30', '#0b0f18']
    cells = ''.join(f'<div style="width:240px;height:270px;background:{g};position:relative"><img src="watermark.png" style="width:60px;position:absolute;right:16px;bottom:16px"></div>' for g in bgs)
    (OUT/'wm_preview.html').write_text(f'<html><body style="margin:0;display:flex">{cells}</body></html>')
    pg.set_viewport_size({'width': 960, 'height': 270}); pg.goto((OUT/'wm_preview.html').as_uri()); pg.wait_for_timeout(300)
    pg.screenshot(path=str(OUT/'watermark_preview.png'))
    for name in ('banner', 'banner_guide'):
        f = OUT/(name + '.html')
        if f.exists():
            pg.set_viewport_size({'width': 2560, 'height': 1440}); pg.goto(f.as_uri()); pg.wait_for_timeout(800)
            pg.screenshot(path=str(OUT/(name + '.jpg')), type='jpeg', quality=92)
    b.close()
print('wrote', *sorted(x.name for x in OUT.glob('*.png')), *sorted(x.name for x in OUT.glob('*.jpg')))
