from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "outputs" / "marketing" / "heymies-which-buyer-would-you-call-feed-1080x1350.png"

W, H = 1080, 1350
NAVY = (7, 17, 31)
NAVY_2 = (4, 32, 30)
EMERALD = (16, 185, 129)
EMERALD_LIGHT = (110, 231, 183)
RED = (248, 113, 113)
AMBER = (251, 191, 36)
WHITE = (255, 255, 255)
SLATE_50 = (248, 250, 252)
SLATE_100 = (241, 245, 249)
SLATE_200 = (226, 232, 240)
SLATE_300 = (203, 213, 225)
SLATE_500 = (100, 116, 139)
SLATE_800 = (30, 41, 59)
SLATE_950 = (2, 6, 23)


def font(size, bold=False):
    return ImageFont.truetype(f"C:/Windows/Fonts/{'arialbd.ttf' if bold else 'arial.ttf'}", size)


def rounded(draw, xy, radius, fill, outline=None, width=1):
    draw.rounded_rectangle(xy, radius=radius, fill=fill, outline=outline, width=width)


def text_size(draw, text, fnt):
    box = draw.textbbox((0, 0), text, font=fnt)
    return box[2] - box[0], box[3] - box[1]


def draw_center(draw, text, y, fnt, fill, max_width=None, line_gap=6):
    if max_width is None:
        tw, _ = text_size(draw, text, fnt)
        draw.text(((W - tw) / 2, y), text, font=fnt, fill=fill)
        return y + text_size(draw, text, fnt)[1]

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

    for line in lines:
        tw, th = text_size(draw, line, fnt)
        draw.text(((W - tw) / 2, y), line, font=fnt, fill=fill)
        y += th + line_gap
    return y


def make_bg():
    img = Image.new("RGB", (W, H), NAVY)
    pix = img.load()
    for y in range(H):
        for x in range(W):
            t = y / H
            r = int(NAVY[0] * (1 - t) + NAVY_2[0] * t)
            g = int(NAVY[1] * (1 - t) + NAVY_2[1] * t)
            b = int(NAVY[2] * (1 - t) + NAVY_2[2] * t)
            edx = (x - 815) / 520
            edy = (y - 570) / 520
            rdx = (x - 235) / 480
            rdy = (y - 625) / 480
            eg = max(0, 1 - (edx * edx + edy * edy)) * 48
            rg = max(0, 1 - (rdx * rdx + rdy * rdy)) * 23
            pix[x, y] = (
                min(255, r + int(rg)),
                min(255, g + int(eg)),
                min(255, b + int(eg * 0.28)),
            )
    return img.convert("RGBA")


def draw_grid(draw):
    for x in range(0, W, 42):
        draw.line((x, 0, x, H), fill=(16, 185, 129, 24), width=1)
    for y in range(0, H, 42):
        draw.line((0, y, W, y), fill=(16, 185, 129, 24), width=1)


def draw_logo(draw):
    x, y = 62, 62
    rounded(draw, (x, y, x + 76, y + 76), 18, WHITE)
    rounded(draw, (x + 12, y + 12, x + 64, y + 64), 14, (236, 253, 245))
    draw.text((x + 20, y + 22), "HM", font=font(24, True), fill=SLATE_950)
    draw.text((x + 96, y + 17), "HeyMies", font=font(34, True), fill=WHITE)


def draw_badge(draw):
    rounded(draw, (762, 78, 1018, 128), 25, (16, 185, 129, 38), (167, 243, 208, 88), 2)
    draw.text((810, 94), "AI LEAD SCORING", font=font(17, True), fill=EMERALD_LIGHT)


def draw_bullet(draw, x, y, w, label, serious=False):
    fill = SLATE_50 if serious else (30, 41, 59)
    outline = SLATE_200 if serious else (71, 85, 105)
    rounded(draw, (x, y, x + w, y + 62), 18, fill, outline, 1)
    dot = EMERALD if serious else RED
    draw.ellipse((x + 22, y + 24, x + 38, y + 40), fill=dot)
    text_fill = SLATE_800 if serious else WHITE
    draw.text((x + 58, y + 18), label, font=font(20, True), fill=text_fill)


def draw_fake_visual(draw, x, y):
    rounded(draw, (x + 44, y + 14, x + 264, y + 172), 48, SLATE_100)
    rounded(draw, (x + 44, y + 98, x + 264, y + 218), 42, SLATE_100)
    draw.ellipse((x + 104, y + 82, x + 121, y + 99), fill=SLATE_950)
    draw.ellipse((x + 184, y + 82, x + 201, y + 99), fill=SLATE_950)
    draw.line((x + 126, y + 136, x + 186, y + 136), fill=SLATE_950, width=6)
    rounded(draw, (x + 222, y, x + 324, y + 52), 22, (248, 113, 113, 46), (254, 202, 202, 70), 2)
    draw.text((x + 246, y + 15), "gone", font=font(17, True), fill=(254, 202, 202))


def draw_score_visual(draw, x, y, w):
    rounded(draw, (x, y, x + w, y + 176), 30, (236, 253, 245), (167, 243, 208), 2)
    draw.text((x + 28, y + 24), "92", font=font(68, True), fill=SLATE_950)
    draw.text((x + 142, y + 61), "AI score", font=font(24, True), fill=SLATE_500)
    rounded(draw, (x + w - 150, y + 34, x + w - 28, y + 76), 21, (187, 247, 208))
    draw.text((x + w - 128, y + 47), "Ready", font=font(18, True), fill=(4, 120, 87))
    rounded(draw, (x + 28, y + 120, x + w - 28, y + 138), 9, WHITE)
    rounded(draw, (x + 28, y + 120, x + w - 52, y + 138), 9, EMERALD)


def draw_card(draw, x, y, w, h, title, badge, items, serious=False):
    fill = WHITE if serious else (15, 23, 42)
    outline = (167, 243, 208) if serious else (100, 116, 139)
    rounded(draw, (x, y, x + w, y + h), 34, fill, outline, 2)

    badge_fill = (220, 252, 231) if serious else RED
    badge_text = (4, 120, 87) if serious else (254, 202, 202)
    rounded(draw, (x + 30, y + 30, x + 206, y + 70), 20, badge_fill)
    draw.text((x + 50, y + 42), badge, font=font(15, True), fill=badge_text)

    title_fill = SLATE_950 if serious else WHITE
    draw.text((x + 30, y + 104), title, font=font(38, True), fill=title_fill)

    ly = y + 174
    for item in items:
        draw_bullet(draw, x + 30, ly, w - 60, item, serious)
        ly += 78

    if serious:
        draw_score_visual(draw, x + 30, y + h - 218, w - 60)
    else:
        draw_fake_visual(draw, x + 52, y + h - 226)


img = make_bg()
draw = ImageDraw.Draw(img)
draw_grid(draw)
draw_logo(draw)
draw_badge(draw)

draw_center(draw, "Which Buyer Would You Rather Call?", 195, font(68, True), WHITE, 940, 8)

draw_card(
    draw,
    62,
    372,
    472,
    676,
    "Fake Buyer",
    "MAYBE SOMEDAY",
    ["Just browsing", "No budget", "No pre-approval", "Ghosts after one message"],
    False,
)
draw_card(
    draw,
    566,
    372,
    452,
    676,
    "Serious Buyer",
    "CALL THIS ONE",
    ["High AI score", "Multiple property views", "Saved listings", "Ready to move"],
    True,
)

draw.line((62, 1102, 1018, 1102), fill=(255, 255, 255, 38), width=2)
cta = "Let HeyMies tell the difference."
rounded(draw, (194, 1166, 886, 1246), 28, EMERALD)
tw, _ = text_size(draw, cta, font(31, True))
draw.text(((W - tw) / 2, 1192), cta, font=font(31, True), fill=SLATE_950)

OUT.parent.mkdir(parents=True, exist_ok=True)
img.convert("RGB").save(OUT, quality=95)
print(OUT)
