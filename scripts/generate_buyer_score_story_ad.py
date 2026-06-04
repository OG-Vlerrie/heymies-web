from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "outputs" / "marketing" / "heymies-buyer-score-story-reel-1080x1920.png"

W, H = 1080, 1920
NAVY = (6, 17, 31)
NAVY_2 = (4, 30, 28)
EMERALD = (16, 185, 129)
EMERALD_LIGHT = (110, 231, 183)
WHITE = (255, 255, 255)
SLATE_100 = (241, 245, 249)
SLATE_300 = (203, 213, 225)
SLATE_950 = (2, 6, 23)


def font(size, bold=False):
    return ImageFont.truetype(f"C:/Windows/Fonts/{'arialbd.ttf' if bold else 'arial.ttf'}", size)


def rounded(draw, xy, radius, fill, outline=None, width=1):
    draw.rounded_rectangle(xy, radius=radius, fill=fill, outline=outline, width=width)


def text_size(draw, text, fnt):
    box = draw.textbbox((0, 0), text, font=fnt)
    return box[2] - box[0], box[3] - box[1]


def wrap_text(draw, text, fnt, max_width):
    words = text.split()
    lines = []
    current = ""
    for word in words:
        trial = word if not current else f"{current} {word}"
        if text_size(draw, trial, fnt)[0] <= max_width:
            current = trial
        else:
            if current:
                lines.append(current)
            current = word
    if current:
        lines.append(current)
    return lines


def draw_multiline(draw, text, xy, fnt, fill, max_width, line_gap=12, align="left"):
    x, y = xy
    for line in wrap_text(draw, text, fnt, max_width):
        lw, lh = text_size(draw, line, fnt)
        lx = x + (max_width - lw) / 2 if align == "center" else x
        draw.text((lx, y), line, font=fnt, fill=fill)
        y += lh + line_gap
    return y


def make_gradient():
    img = Image.new("RGB", (W, H), NAVY)
    pix = img.load()
    for y in range(H):
        for x in range(W):
            t = y / H
            r = int(NAVY[0] * (1 - t) + NAVY_2[0] * t)
            g = int(NAVY[1] * (1 - t) + NAVY_2[1] * t)
            b = int(NAVY[2] * (1 - t) + NAVY_2[2] * t)
            dx = (x - 540) / 560
            dy = (y - 570) / 560
            glow = max(0, 1 - (dx * dx + dy * dy)) * 55
            pix[x, y] = (r, min(255, g + int(glow)), min(255, b + int(glow * 0.35)))
    return img.convert("RGBA")


def draw_grid(draw):
    for x in range(0, W, 54):
        draw.line((x, 0, x, H), fill=(16, 185, 129, 25), width=1)
    for y in range(0, H, 54):
        draw.line((0, y, W, y), fill=(16, 185, 129, 25), width=1)


def draw_logo(draw):
    x, y = 76, 78
    rounded(draw, (x, y, x + 88, y + 88), 22, WHITE)
    rounded(draw, (x + 14, y + 14, x + 74, y + 74), 16, (236, 253, 245))
    draw.text((x + 23, y + 27), "HM", font=font(27, True), fill=SLATE_950)
    draw.text((x + 108, y + 10), "HeyMies", font=font(34, True), fill=WHITE)
    draw.text((x + 108, y + 54), "Smart. Simple. Sorted.", font=font(20), fill=SLATE_300)


def draw_top_badge(draw):
    rounded(draw, (790, 96, 1004, 148), 26, (16, 185, 129, 42), (167, 243, 208, 90), 2)
    draw.text((838, 112), "AI SCORED", font=font(18, True), fill=EMERALD_LIGHT)


def draw_score_badge(draw):
    # glow
    glow = Image.new("RGBA", (640, 640), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow)
    gd.ellipse((80, 80, 560, 560), fill=(16, 185, 129, 72))
    glow = glow.filter(ImageFilter.GaussianBlur(42))
    base.alpha_composite(glow, (220, 280))

    cx, cy = 540, 615
    draw.ellipse((cx - 255, cy - 255, cx + 255, cy + 255), fill=(16, 185, 129, 30), outline=(167, 243, 208, 90), width=3)
    draw.ellipse((cx - 178, cy - 178, cx + 178, cy + 178), fill=EMERALD)
    score = "92/100"
    sw, sh = text_size(draw, score, font(82, True))
    draw.text((cx - sw / 2, cy - 58), score, font=font(82, True), fill=SLATE_950)
    label = "BUYER SCORE"
    lw, _ = text_size(draw, label, font(18, True))
    draw.text((cx - lw / 2, cy + 48), label, font=font(18, True), fill=SLATE_950)


def draw_copy(draw):
    rounded(draw, (280, 920, 800, 982), 31, (16, 185, 129, 36), (167, 243, 208, 90), 2)
    status = "High Intent Buyer"
    stw, sth = text_size(draw, status, font(29, True))
    draw.text((540 - stw / 2, 938), status, font=font(29, True), fill=EMERALD_LIGHT)

    draw_multiline(
        draw,
        "THIS BUYER SCORED 92/100",
        (126, 1048),
        font(82, True),
        WHITE,
        828,
        8,
        "center",
    )
    draw_multiline(
        draw,
        "Would you know which enquiries deserve your attention?",
        (164, 1248),
        font(38),
        SLATE_300,
        752,
        10,
        "center",
    )


def draw_signals(draw):
    x, y, w, h = 126, 1392, 828, 238
    rounded(draw, (x, y, x + w, y + h), 40, (8, 31, 42), (255, 255, 255, 58), 2)
    signals = [
        "Viewed listings repeatedly",
        "Saved properties",
        "Requested bond assistance",
    ]
    sy = y + 44
    for signal in signals:
        draw.line((x + 58, sy + 22, x + 70, sy + 34, x + 94, sy + 8), fill=EMERALD_LIGHT, width=7, joint="curve")
        draw.text((x + 106, sy + 2), signal, font=font(34, True), fill=SLATE_100)
        sy += 62


def draw_footer(draw):
    draw.line((76, 1688, 1004, 1688), fill=(255, 255, 255, 38), width=2)
    rounded(draw, (166, 1738, 914, 1824), 28, EMERALD)
    cta = "SEE HOW HEYMIES WORKS"
    cw, _ = text_size(draw, cta, font(32, True))
    draw.text((540 - cw / 2, 1765), cta, font=font(32, True), fill=SLATE_950)
    draw.text((76, 1848), "HeyMies", font=font(34, True), fill=WHITE)
    draw.text((252, 1855), "Smart. Simple. Sorted.", font=font(25), fill=SLATE_300)


base = make_gradient()
draw = ImageDraw.Draw(base)
draw_grid(draw)
draw_logo(draw)
draw_top_badge(draw)
draw_score_badge(draw)
draw_copy(draw)
draw_signals(draw)
draw_footer(draw)

OUT.parent.mkdir(parents=True, exist_ok=True)
base.convert("RGB").save(OUT, quality=95)
print(OUT)
