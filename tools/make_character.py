"""ムニスケ画像の白背景を透明にしてアプリ用に縮小する (python3 tools/make_character.py 元画像.png)"""
import sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter

src = Path(sys.argv[1])
out = Path(__file__).resolve().parent.parent / "images" / "munisuke.png"
out.parent.mkdir(exist_ok=True)

im = Image.open(src).convert("RGB")
w, h = im.size
# 外周から白っぽい部分を塗りつぶし、その部分を背景とみなす
mask_src = im.copy()
MARK = (255, 0, 255)
for x in range(0, w, 8):
    for y in (0, h - 1):
        if sum(mask_src.getpixel((x, y))) > 700:
            ImageDraw.floodfill(mask_src, (x, y), MARK, thresh=40)
for y in range(0, h, 8):
    for x in (0, w - 1):
        if sum(mask_src.getpixel((x, y))) > 700:
            ImageDraw.floodfill(mask_src, (x, y), MARK, thresh=40)

alpha = Image.new("L", (w, h), 255)
ap, mp = alpha.load(), mask_src.load()
for y in range(h):
    for x in range(w):
        if mp[x, y] == MARK:
            ap[x, y] = 0
# 境界を少しなめらかに
alpha = alpha.filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(1.2))

rgba = im.copy()
rgba.putalpha(alpha)
rgba = rgba.crop(rgba.getbbox())
rgba.thumbnail((600, 600), Image.LANCZOS)
rgba.save(out, optimize=True)
print(out, rgba.size, out.stat().st_size)
