"""ムニ助電卓のアイコンを生成するスクリプト (python3 tools/make_icons.py)
images/munisuke.png(背景透明のムニスケ)をオレンジの背景に乗せて作ります。
先に tools/make_character.py で images/munisuke.png を作っておいてください。
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter

S = 1024
ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "icons"
CHAR = ROOT / "images" / "munisuke.png"


def background():
    top, bottom = (255, 200, 110), (245, 130, 50)
    grad = Image.new("RGB", (1, S))
    for y in range(S):
        t = y / (S - 1)
        grad.putpixel((0, y), tuple(int(top[i] + (bottom[i] - top[i]) * t) for i in range(3)))
    img = grad.resize((S, S)).convert("RGBA")
    # 中央をふんわり明るく
    glow = Image.new("L", (S, S), 0)
    ImageDraw.Draw(glow).ellipse([S * 0.12, S * 0.1, S * 0.88, S * 0.86], fill=120)
    glow = glow.filter(ImageFilter.GaussianBlur(S * 0.08))
    img = Image.composite(Image.new("RGBA", (S, S), (255, 240, 210, 255)), img, glow)
    return img


def draw_icon(fill=0.86):
    """fill: キャラクターがアイコンに占める大きさ(マスカブル用は小さめ)"""
    img = background()
    ch = Image.open(CHAR).convert("RGBA")
    size = int(S * fill)
    ch = ch.resize((size, int(size * ch.height / ch.width)), Image.LANCZOS)
    x = (S - ch.width) // 2
    y = (S - ch.height) // 2 + int(S * 0.02)
    # 影
    shadow = Image.new("RGBA", img.size, (0, 0, 0, 0))
    a = ch.getchannel("A").point(lambda v: v * 0.35)
    shadow.paste(Image.new("RGBA", ch.size, (150, 60, 10, 255)), (x, y + int(S * 0.015)), a)
    img.alpha_composite(shadow.filter(ImageFilter.GaussianBlur(S * 0.012)))
    img.alpha_composite(ch, (x, y))
    return img.convert("RGB")


def main():
    OUT.mkdir(exist_ok=True)
    full = draw_icon()
    for name, size in [("apple-touch-icon.png", 180), ("icon-192.png", 192),
                       ("icon-512.png", 512), ("favicon-32.png", 32)]:
        full.resize((size, size), Image.LANCZOS).save(OUT / name, optimize=True)
    draw_icon(fill=0.66).resize((512, 512), Image.LANCZOS).save(OUT / "icon-maskable-512.png", optimize=True)


if __name__ == "__main__":
    main()
