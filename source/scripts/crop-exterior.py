"""Usage: uv run --with pillow python source/scripts/crop-exterior.py ORIGINAL_JPEG
Crop native Poly Haven panorama to the rear/side window sightlines, no upscaling.
"""
import sys
from PIL import Image
from pathlib import Path
image=Image.open(sys.argv[1]);w,h=image.size
out=Path(__file__).resolve().parents[2]/'assets/cockpit'
for name,a,b,bottom in [('rear',.30,.65,.72),('side',.65,.95,.78)]:
 box=tuple(round(v) for v in (w*a,h*.28,w*b,h*bottom))
 tile=image.crop(box);tile.save(out/f'forest-window-{name}.webp',quality=82,method=4)
 print(name,tile.size)
