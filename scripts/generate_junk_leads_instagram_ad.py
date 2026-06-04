from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "outputs" / "marketing" / "heymies-junk-leads-instagram-feed-1080x1350.png"

W, H = 1080, 1350

NAVY = (7, 17, 31)
NAVY_2 = (6, 35, 28)
EMERALD = (16, 185, 129)
EMERALD_LIGHT = (110, 231, 183)
SKY = (56, 189, 248)
WHITE = (255, 255, 255)
SLATE_100 = (241, 245, 249)
SLATE_300 = (203, 213, 225)
SLATE_500 = (100, 116, 139)
SLATE_950 = (2, 6, 23)


def font(size, bold=False):
    name = "arialbd.ttf" if bold else "arial.ttf"
    return ImageFont.truetype(f"C:/Windows/Fonts/{name}", size)


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


def draw_multiline(draw, text, xy, fnt, fill, max_width, line_gap=10):
    x, y = xy
    for line in wrap_text(draw, text, fnt, max_width):
        draw.text((x, y), line, font=fnt, fill=fill)
        y += text_size(draw, line, fnt)[1] + line_gap
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
            # soft emerald glow on the dashboard side
            dx = (x - 820) / 520
            dy = (y - 360) / 520
            glow = max(0, 1 - (dx * dx + dy * dy)) * 42
            pix[x, y] = (min(255, r), min(255, g + int(glow)), min(255, b + int(glow * 0.35)))
    return img.convert("RGBA")


def draw_grid(draw):
    grid = (16, 185, 129, 28)
    for x in range(0, W, 42):
        draw.line((x, 0, x, H), fill=grid, width=1)
    for y in range(0, H, 42):
        draw.line((0, y, W, y), fill=grid, width=1)


def draw_logo(draw, x, y):
    rounded(draw, (x, y, x + 78, y + 78), 18, WHITE)
    rounded(draw, (x + 12, y + 12, x + 66, y + 66), 14, (236, 253, 245))
    draw.text((x + 20, y + 22), "HM", font=font(24, True), fill=SLATE_950)
    draw.text((x + 94, y + 8), "HeyMies", font=font(28, True), fill=WHITE)
    draw.text((x + 94, y + 45), "AI LEAD SCORING", font=font(13, True), fill=EMERALD_LIGHT)


def draw_notification(draw, x, y, title, value, angle=0):
    card = Image.new("RGBA", (230, 86), (0, 0, 0, 0))
    cd = ImageDraw.Draw(card)
    rounded(cd, (0, 0, 230, 86), 22, (127, 29, 29, 58), (254, 202, 202, 82), 2)
    cd.ellipse((18, 18, 36, 36), fill=(248, 113, 113))
    cd.text((48, 16), title.upper(), font=font(13, True), fill=(254, 226, 226))
    cd.text((48, 42), value, font=font(19, True), fill=WHITE)
    if angle:
        card = card.rotate(angle, expand=True, resample=Image.Resampling.BICUBIC)
    base.alpha_composite(card, (x, y))


def draw_agent(draw):
    # left card
    rounded(draw, (62, 296, 480, 1000), 44, (255, 255, 255, 18), (255, 255, 255, 32), 2)
    draw_notification(draw, 80, 326, "New enquiry", "12 unread", -5)
    draw_notification(draw, 250, 448, "Buyer replied", "maybe later", 6)
    draw_notification(draw, 70, 610, "Portal lead", "cold", 4)
    draw_notification(draw, 260, 780, "Viewing request", "no answer", -5)

    # agent body
    cx = 270
    draw.ellipse((cx - 74, 526, cx + 74, 674), fill=(215, 164, 127))
    draw.pieslice((cx - 86, 493, cx + 86, 635), 180, 360, fill=(45, 31, 24))
    draw.rectangle((cx - 62, 506, cx + 62, 558), fill=(45, 31, 24))
    draw.ellipse((cx - 36, 580, cx - 22, 594), fill=SLATE_950)
    draw.ellipse((cx + 22, 580, cx + 36, 594), fill=SLATE_950)
    draw.arc((cx - 30, 620, cx + 30, 656), 190, 350, fill=(127, 29, 29), width=5)
    rounded(draw, (cx - 135, 678, cx + 135, 958), 58, (30, 41, 59))
    draw.polygon([(cx - 72, 690), (cx, 910), (cx + 72, 690)], fill=WHITE)
    draw.polygon([(cx - 18, 690), (cx, 920), (cx + 18, 690)], fill=EMERALD)
def draw_dashboard(draw):
    x, y, w, h = 544, 284, 474, 504
    shadow = Image.new("RGBA", (w + 50, h + 50), (0, 0, 0, 0))
    sd = ImageDraw.Draw(shadow)
    rounded(sd, (25, 25, w + 25, h + 25), 44, (0, 0, 0, 95))
    shadow = shadow.filter(ImageFilter.GaussianBlur(18))
    base.alpha_composite(shadow, (x - 25, y - 10))

    rounded(draw, (x, y, x + w, y + h), 42, WHITE, (167, 243, 208), 3)
    draw.text((x + 42, y + 42), "HEYMIES DASHBOARD", font=font(17, True), fill=(4, 120, 87))
    rounded(draw, (x + 330, y + 38, x + 432, y + 72), 17, (220, 252, 231))
    draw.text((x + 346, y + 47), "LIVE", font=font(15, True), fill=(4, 120, 87))

    draw.text((x + 42, y + 104), "Buyer Score", font=font(26, True), fill=SLATE_950)
    draw.text((x + 42, y + 148), "92/100", font=font(68, True), fill=SLATE_950)
    rounded(draw, (x + 42, y + 238, x + 432, y + 258), 10, (226, 232, 240))
    rounded(draw, (x + 42, y + 238, x + 401, y + 258), 10, EMERALD)

    metrics = [
        ("Status", "High Intent"),
        ("Viewed Listing", "5 times"),
        ("Saved Properties", "3"),
    ]
    my = y + 292
    for label, value in metrics:
        rounded(draw, (x + 42, my, x + 432, my + 58), 18, SLATE_100, (226, 232, 240), 1)
        draw.text((x + 62, my + 18), label, font=font(19, True), fill=SLATE_500)
        vw = text_size(draw, value, font(21, True))[0]
        draw.text((x + 410 - vw, my + 16), value, font=font(21, True), fill=SLATE_950)
        my += 72


def draw_copy(draw):
    rounded(draw, (544, 820, 1018, 1110), 38, (8, 31, 42), (255, 255, 255, 58), 2)
    draw.text((584, 862), "BUYER SIGNAL", font=font(18, True), fill=EMERALD_LIGHT)
    draw_multiline(
        draw,
        "STOP WASTING TIME ON JUNK LEADS",
        (584, 912),
        font(48, True),
        WHITE,
        378,
        4,
    )
    draw_multiline(
        draw,
        "Let AI identify serious buyers before you spend hours following up.",
        (584, 1048),
        font(24, False),
        SLATE_300,
        380,
        8,
    )


def draw_footer(draw):
    draw.line((62, 1170, 1018, 1170), fill=(255, 255, 255, 34), width=2)
    draw.text((62, 1216), "HeyMies", font=font(40, True), fill=WHITE)
    draw.text((62, 1266), "Smart. Simple. Sorted.", font=font(24, False), fill=SLATE_300)
    rounded(draw, (750, 1206, 1018, 1284), 24, EMERALD)
    cta = "BOOK A DEMO"
    cw = text_size(draw, cta, font(26, True))[0]
    draw.text((750 + (268 - cw) / 2, 1231), cta, font=font(26, True), fill=SLATE_950)


base = make_gradient()
draw = ImageDraw.Draw(base)
draw_grid(draw)
draw_logo(draw, 62, 66)
rounded(draw, (824, 70, 1018, 116), 23, (16, 185, 129, 30), (167, 243, 208, 90), 2)
draw.text((854, 83), "ESTATE AGENTS", font=font(18, True), fill=EMERALD_LIGHT)
draw_agent(draw)
draw.text((112, 1032), "Too many alerts.", font=font(28, True), fill=SLATE_300)
draw.text((112, 1068), "Not enough context.", font=font(28, True), fill=SLATE_300)
draw_dashboard(draw)
draw_copy(draw)
draw_footer(draw)

OUT.parent.mkdir(parents=True, exist_ok=True)
base.convert("RGB").save(OUT, quality=95)
print(OUT)
