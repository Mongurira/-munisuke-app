"""ムニ助電卓のアイコンを生成するスクリプト (python3 tools/make_icons.py)"""
import math
from pathlib import Path
from PIL import Image, ImageDraw

S = 1024
OUT = Path(__file__).resolve().parent.parent / "icons"


def lerp(a, b, t):
    return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))


def draw_icon(scale=1.0):
    """scale < 1 でマスカブル用に中身を小さく描く"""
    img = Image.new("RGB", (S, S))
    # 背景グラデーション(上:オレンジ → 下:濃いオレンジ)
    top, bottom = (255, 184, 77), (240, 112, 40)
    px = img.load()
    for y in range(S):
        c = lerp(top, bottom, y / (S - 1))
        for x in range(S):
            px[x, y] = c
    d = ImageDraw.Draw(img)

    def r(v):  # 中心基準でスケール
        return S / 2 + (v - S / 2) * scale

    def box(x0, y0, x1, y1):
        return [r(x0), r(y0), r(x1), r(y1)]

    # 影
    d.rounded_rectangle(box(232, 150, 812, 914), radius=96 * scale, fill=(190, 80, 20))
    # 電卓本体
    d.rounded_rectangle(box(212, 120, 792, 884), radius=96 * scale, fill=(38, 38, 48))

    # 時計(表示部分)
    cx, cy, cr = 502, 330, 150
    d.ellipse(box(cx - cr, cy - cr, cx + cr, cy + cr), fill=(255, 211, 107))
    d.ellipse(box(cx - cr + 22, cy - cr + 22, cx + cr - 22, cy + cr - 22), fill=(255, 248, 230))
    for i in range(12):
        a = math.radians(i * 30)
        l = 26 if i % 3 == 0 else 14
        ro = cr - 40
        x0, y0 = cx + math.sin(a) * ro, cy - math.cos(a) * ro
        x1, y1 = cx + math.sin(a) * (ro - l), cy - math.cos(a) * (ro - l)
        d.line([r(x0), r(y0), r(x1), r(y1)], fill=(38, 38, 48), width=max(1, int((10 if i % 3 == 0 else 6) * scale)))
    # 針(10:10)
    def hand(angle_deg, length, width, color):
        a = math.radians(angle_deg)
        d.line([r(cx), r(cy), r(cx + math.sin(a) * length), r(cy - math.cos(a) * length)],
               fill=color, width=int(width * scale))
    hand(305, 62, 20, (38, 38, 48))
    hand(60, 88, 14, (38, 38, 48))
    d.ellipse(box(cx - 16, cy - 16, cx + 16, cy + 16), fill=(240, 112, 40))

    # ボタン 4列 x 3行
    cols, rows = 4, 3
    gx0, gy0, gx1, gy1 = 262, 528, 742, 834
    gap = 24
    bw = (gx1 - gx0 - gap * (cols - 1)) / cols
    bh = (gy1 - gy0 - gap * (rows - 1)) / rows
    for row in range(rows):
        for col in range(cols):
            x = gx0 + col * (bw + gap)
            y = gy0 + row * (bh + gap)
            color = (255, 159, 10) if col == cols - 1 else (92, 92, 106)
            d.rounded_rectangle(box(x, y, x + bw, y + bh), radius=min(bw, bh) / 2 * scale, fill=color)
    return img


def main():
    OUT.mkdir(exist_ok=True)
    full = draw_icon()
    for name, size in [("apple-touch-icon.png", 180), ("icon-192.png", 192),
                       ("icon-512.png", 512), ("favicon-32.png", 32)]:
        full.resize((size, size), Image.LANCZOS).save(OUT / name, optimize=True)
    draw_icon(scale=0.78).resize((512, 512), Image.LANCZOS).save(OUT / "icon-maskable-512.png", optimize=True)
    full.save(OUT / "icon-1024.png", optimize=True)


if __name__ == "__main__":
    main()
