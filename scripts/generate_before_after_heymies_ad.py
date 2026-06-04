from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "outputs" / "marketing" / "heymies-before-after-feed-1080x1350.png"

W, H = 1080, 1350
NAVY = (7, 17, 31)
NAVY_2 = (5, 34, 31)
EMERALD = (16, 185, 129)
EMERALD_LIGHT = (110, 231, 183)
RED = (239, 68, 68)
RED_LIGHT = (254, 202, 202)
WHITE = (255, 255, 255)
SLATE_100 = (241, 245, 249)
SLATE_300 = (203, 213, 225)
SLATE_500 = (100, 116, 139)
SLATE_950 = (2, 6, 23)


def font(size, bold=False):
    return ImageFont.truetype(f"C:/Windows/Fonts/{'arialbd.ttf' if bold else 'arial.ttf'}", size)


def rounded(draw, xy, radius, fill, outline=None, width=1):
    draw.rounded_rectangle(xy, radius=radius, fill=fill, outline=outline, width=width)


def text_size(draw, text, fnt):
    box = draw.textbbox((0, 0), text, font=fnt)
    return box[2] - box[0], box[3] - box[1]


def draw_center(draw, text, y, fnt, fill):
    tw, _ = text_size(draw, text, fnt)
    draw.text(((W - tw) / 2, y), text, font=fnt, fill=fill)


def make_bg():
    img = Image.new("RGB", (W, H), NAVY)
    pix = img.load()
    for y in range(H):
        for x in range(W):
            t = y / H
            r = int(NAVY[0] * (1 - t) + NAVY_2[0] * t)
            g = int(NAVY[1] * (1 - t) + NAVY_2[1] * t)
            b = int(NAVY[2] * (1 - t) + NAVY_2[2] * t)
            edx = (x - 810) / 520
            edy = (y - 500) / 520
            rdx = (x - 220) / 470
            rdy = (y - 640) / 470
            eg = max(0, 1 - (edx * edx + edy * edy)) * 46
            rg = max(0, 1 - (rdx * rdx + rdy * rdy)) * 28
            pix[x, y] = (
                min(255, r + int(rg)),
                min(255, g + int(eg)),
                min(255, b + int(eg * 0.25)),
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


def draw_top_badge(draw):
    rounded(draw, (798, 78, 1018, 128), 25, (16, 185, 129, 38), (167, 243, 208, 88), 2)
    draw.text((839, 94), "PROPERTY TECH", font=font(17, True), fill=EMERALD_LIGHT)


def draw_notice(draw, x, y, label, angle):
    card = Image.new("RGBA", (188, 64), (0, 0, 0, 0))
    cd = ImageDraw.Draw(card)
    rounded(cd, (0, 0, 188, 64), 17, (127, 29, 29, 68), (254, 202, 202, 85), 2)
    cd.ellipse((14, 22, 28, 36), fill=(248, 113, 113))
    cd.text((40, 18), label, font=font(17, True), fill=WHITE)
    card = card.rotate(angle, expand=True, resample=Image.Resampling.BICUBIC)
    base.alpha_composite(card, (x, y))


def draw_agent(draw, x, y):
    draw_notice(draw, x + 28, y + 34, "24 unread", -6)
    draw_notice(draw, x + 198, y + 118, "No reply", 6)
    draw_notice(draw, x + 42, y + 222, "Cold lead", 3)
    cx = x + 205
    draw.ellipse((cx - 52, y + 168, cx + 52, y + 272), fill=(215, 164, 127))
    draw.pieslice((cx - 64, y + 142, cx + 64, y + 235), 180, 360, fill=(45, 31, 24))
    draw.ellipse((cx - 24, y + 210, cx - 14, y + 220), fill=SLATE_950)
    draw.ellipse((cx + 14, y + 210, cx + 24, y + 220), fill=SLATE_950)
    draw.arc((cx - 24, y + 240, cx + 24, y + 268), 190, 350, fill=(127, 29, 29), width=4)
    rounded(draw, (cx - 102, y + 270, cx + 102, y + 448), 42, (30, 41, 59))
    draw.polygon([(cx - 56, y + 280), (cx, y + 430), (cx + 56, y + 280)], fill=WHITE)
    draw.polygon([(cx - 14, y + 280), (cx, y + 430), (cx + 14, y + 280)], fill=EMERALD)


def draw_dashboard(draw, x, y):
    rounded(draw, (x + 42, y + 52, x + 382, y + 350), 32, WHITE, (167, 243, 208), 2)
    draw.text((x + 72, y + 82), "LEAD QUALITY", font=font(15, True), fill=(4, 120, 87))
    draw.text((x + 72, y + 122), "92", font=font(72, True), fill=SLATE_950)
    draw.text((x + 202, y + 158), "Buyer score", font=font(20, True), fill=SLATE_500)
    rounded(draw, (x + 72, y + 222, x + 352, y + 240), 9, (226, 232, 240))
    rounded(draw, (x + 72, y + 222, x + 330, y + 240), 9, EMERALD)
    rounded(draw, (x + 72, y + 272, x + 190, y + 312), 18, (220, 252, 231))
    draw.text((x + 94, y + 284), "Priority", font=font(16, True), fill=(4, 120, 87))
    rounded(draw, (x + 210, y + 272, x + 352, y + 312), 18, (224, 242, 254))
    draw.text((x + 232, y + 284), "AI scored", font=font(16, True), fill=(3, 105, 161))


def panel(draw, x, y, title, items, tone):
    color = EMERALD if tone == "after" else RED
    light = EMERALD_LIGHT if tone == "after" else RED_LIGHT
    rounded(draw, (x, y, x + 468, y + 732), 42, (*color, 24), (*light, 72), 2)
    draw.text((x + 34, y + 32), title, font=font(31, True), fill=light)
    if tone == "before":
        draw_agent(draw, x + 34, y + 100)
    else:
        draw_dashboard(draw, x + 34, y + 108)

    ly = y + 500
    for item in items:
        if tone == "after":
            draw.line((x + 42, ly + 20, x + 54, ly + 32, x + 78, ly + 6), fill=EMERALD_LIGHT, width=6, joint="curve")
        else:
            rounded(draw, (x + 47, ly + 8, x + 67, ly + 28), 10, RED_LIGHT)
        draw.text((x + 92, ly), item, font=font(26, True), fill=SLATE_100)
        ly += 54


def draw_footer(draw):
    draw.line((62, 1068, 1018, 1068), fill=(255, 255, 255, 40), width=2)
    draw_center(draw, "WORK SMARTER. CLOSE FASTER.", 1118, font(57, True), WHITE)
    rounded(draw, (352, 1230, 728, 1292), 24, EMERALD)
    cta = "BOOK A DEMO"
    tw, _ = text_size(draw, cta, font(25, True))
    draw.text((540 - tw / 2, 1249), cta, font=font(25, True), fill=SLATE_950)


base = make_bg()
draw = ImageDraw.Draw(base)
draw_grid(draw)
draw_logo(draw)
draw_top_badge(draw)
panel(
    draw,
    62,
    218,
    "BEFORE HEYMIES",
    ["Inbox overload", "Missed follow-ups", "Unqualified enquiries", "Agent stressed"],
    "before",
)
panel(
    draw,
    550,
    218,
    "AFTER HEYMIES",
    ["Qualified buyers", "AI scoring", "Automated nurturing", "Priority alerts"],
    "after",
)
draw_footer(draw)

OUT.parent.mkdir(parents=True, exist_ok=True)
base.convert("RGB").save(OUT, quality=95)
print(OUT)
