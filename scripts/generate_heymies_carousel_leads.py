from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "outputs" / "marketing" / "heymies-property-leads-carousel"

W, H = 1080, 1350
NAVY = (7, 17, 31)
NAVY_2 = (4, 32, 30)
EMERALD = (16, 185, 129)
EMERALD_LIGHT = (110, 231, 183)
SKY = (56, 189, 248)
WHITE = (255, 255, 255)
SLATE_100 = (241, 245, 249)
SLATE_300 = (203, 213, 225)
SLATE_400 = (148, 163, 184)
SLATE_500 = (100, 116, 139)
SLATE_950 = (2, 6, 23)
RED = (248, 113, 113)
AMBER = (251, 191, 36)


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


def draw_multiline(draw, text, xy, fnt, fill, max_width, line_gap=12, center=False):
    x, y = xy
    for line in wrap_text(draw, text, fnt, max_width):
        lw, lh = text_size(draw, line, fnt)
        lx = x + (max_width - lw) / 2 if center else x
        draw.text((lx, y), line, font=fnt, fill=fill)
        y += lh + line_gap
    return y


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
            dx = (x - 770) / 560
            dy = (y - 430) / 560
            glow = max(0, 1 - (dx * dx + dy * dy)) * 44
            pix[x, y] = (r, min(255, g + int(glow)), min(255, b + int(glow * 0.35)))
    return img.convert("RGBA")


def draw_grid(draw):
    for x in range(0, W, 45):
        draw.line((x, 0, x, H), fill=(16, 185, 129, 24), width=1)
    for y in range(0, H, 45):
        draw.line((0, y, W, y), fill=(16, 185, 129, 24), width=1)


def draw_logo(draw):
    x, y = 62, 62
    rounded(draw, (x, y, x + 76, y + 76), 18, WHITE)
    rounded(draw, (x + 12, y + 12, x + 64, y + 64), 14, (236, 253, 245))
    draw.text((x + 20, y + 22), "HM", font=font(24, True), fill=SLATE_950)
    draw.text((x + 96, y + 17), "HeyMies", font=font(34, True), fill=WHITE)


def draw_slide_marker(draw, index):
    rounded(draw, (874, 74, 1018, 124), 25, (16, 185, 129, 38), (167, 243, 208, 88), 2)
    label = f"{index}/5"
    tw, _ = text_size(draw, label, font(20, True))
    draw.text((946 - tw / 2, 88), label, font=font(20, True), fill=EMERALD_LIGHT)


def draw_footer(draw):
    draw.line((62, 1170, 1018, 1170), fill=(255, 255, 255, 38), width=2)
    draw.text((62, 1218), "HeyMies", font=font(36, True), fill=WHITE)
    draw.text((62, 1264), "Smart. Simple. Sorted.", font=font(23), fill=SLATE_300)


def draw_base(index):
    img = make_bg()
    draw = ImageDraw.Draw(img)
    draw_grid(draw)
    draw_logo(draw)
    draw_slide_marker(draw, index)
    return img, draw


def lead_card(draw, xy, title, status, color):
    x, y, w, h = xy
    rounded(draw, (x, y, x + w, y + h), 22, (255, 255, 255, 24), (255, 255, 255, 52), 2)
    draw.ellipse((x + 24, y + 24, x + 48, y + 48), fill=color)
    draw.text((x + 66, y + 20), title, font=font(23, True), fill=WHITE)
    draw.text((x + 66, y + 56), status, font=font(18), fill=SLATE_300)


def icon_nowhere(draw):
    rounded(draw, (190, 470, 890, 820), 44, (255, 255, 255, 18), (255, 255, 255, 42), 2)
    lead_card(draw, (238, 520, 360, 92), "Lead #1042", "No response", RED)
    lead_card(draw, (482, 630, 360, 92), "Lead #1043", "Not qualified", AMBER)
    lead_card(draw, (286, 708, 360, 92), "Lead #1044", "Ghosted", RED)
    draw.line((260, 590, 770, 590, 770, 558), fill=SLATE_400, width=8)
    draw.line((770, 558, 748, 578), fill=SLATE_400, width=8)
    draw.line((770, 558, 792, 578), fill=SLATE_400, width=8)
    draw.text((332, 432), "Enquiries in. Momentum out.", font=font(30, True), fill=SLATE_300)


def icon_disappear(draw):
    rounded(draw, (210, 440, 870, 820), 44, (255, 255, 255, 18), (255, 255, 255, 42), 2)
    rounded(draw, (280, 520, 650, 624), 26, (255, 255, 255, 28), (255, 255, 255, 56), 2)
    draw.text((314, 548), "Is this still available?", font=font(25, True), fill=WHITE)
    rounded(draw, (390, 660, 420, 690), 15, SLATE_400)
    rounded(draw, (440, 660, 470, 690), 15, SLATE_400)
    rounded(draw, (490, 660, 520, 690), 15, SLATE_400)
    draw.line((672, 572, 782, 572), fill=RED, width=7)
    draw.line((727, 518, 727, 626), fill=RED, width=7)
    draw.text((300, 742), "Then silence.", font=font(44, True), fill=RED)


def icon_hours(draw):
    cx, cy = 540, 620
    draw.ellipse((cx - 170, cy - 170, cx + 170, cy + 170), fill=(255, 255, 255, 24), outline=(255, 255, 255, 60), width=3)
    draw.ellipse((cx - 132, cy - 132, cx + 132, cy + 132), outline=EMERALD_LIGHT, width=7)
    draw.line((cx, cy, cx, cy - 90), fill=WHITE, width=9)
    draw.line((cx, cy, cx + 78, cy + 44), fill=WHITE, width=9)
    draw.ellipse((cx - 12, cy - 12, cx + 12, cy + 12), fill=EMERALD)
    draw.text((320, 844), "Manual follow-up burns time.", font=font(36, True), fill=SLATE_300)


def icon_solution(draw):
    rounded(draw, (194, 410, 886, 840), 44, WHITE, (167, 243, 208), 3)
    draw.text((250, 462), "HEYMIES AI PIPELINE", font=font(22, True), fill=(4, 120, 87))
    steps = [("Score", "92/100"), ("Nurture", "Auto"), ("Alert", "Priority")]
    x = 250
    for label, value in steps:
        rounded(draw, (x, 560, x + 170, 710), 26, (241, 245, 249), (226, 232, 240), 2)
        draw.text((x + 32, 594), label, font=font(24, True), fill=SLATE_950)
        draw.text((x + 32, 642), value, font=font(30, True), fill=(4, 120, 87))
        x += 206
    draw.line((416, 634, 456, 634), fill=EMERALD, width=7)
    draw.line((622, 634, 662, 634), fill=EMERALD, width=7)
    draw.text((262, 778), "Score. Nurture. Hand over when serious.", font=font(27, True), fill=SLATE_500)


def icon_cta(draw):
    draw.ellipse((322, 378, 758, 814), fill=(16, 185, 129, 36), outline=(167, 243, 208, 90), width=3)
    draw.ellipse((392, 448, 688, 744), fill=EMERALD)
    draw.text((450, 548), "92", font=font(108, True), fill=SLATE_950)
    draw.text((438, 654), "HIGH INTENT", font=font(24, True), fill=SLATE_950)
    rounded(draw, (258, 854, 822, 930), 28, (8, 31, 42), (255, 255, 255, 58), 2)
    draw.text((348, 876), "Focus on serious buyers", font=font(33, True), fill=WHITE)


slides = [
    {
        "title": "Most Property Leads Go Nowhere",
        "label": "THE PROBLEM",
        "body": "",
        "icon": icon_nowhere,
    },
    {
        "title": "Buyers disappear after one enquiry",
        "label": "PROBLEM",
        "body": "One message is rarely enough to know who is serious.",
        "icon": icon_disappear,
    },
    {
        "title": "Agents waste hours following up",
        "label": "PROBLEM",
        "body": "Cold leads, repeated messages, and poor-fit buyers slow your team down.",
        "icon": icon_hours,
    },
    {
        "title": "HeyMies automatically scores and nurtures buyers",
        "label": "SOLUTION",
        "body": "AI watches buyer signals and keeps the maybes warm before agent handover.",
        "icon": icon_solution,
    },
    {
        "title": "Focus on serious buyers",
        "label": "CTA",
        "body": "Book a demo today",
        "icon": icon_cta,
    },
]


def render_slide(index, slide):
    img, draw = draw_base(index)
    rounded(draw, (62, 184, 300, 236), 26, (16, 185, 129, 38), (167, 243, 208, 88), 2)
    draw.text((92, 199), slide["label"], font=font(18, True), fill=EMERALD_LIGHT)

    title_size = 74 if index in [1, 5] else 58
    draw_multiline(draw, slide["title"], (62, 270), font(title_size, True), WHITE, 918, 10)

    if slide["body"]:
        draw_multiline(draw, slide["body"], (62, 960), font(32), SLATE_300, 860, 10)

    slide["icon"](draw)

    if index == 5:
        rounded(draw, (322, 1018, 758, 1090), 28, EMERALD)
        cta = "BOOK A DEMO TODAY"
        tw, _ = text_size(draw, cta, font(26, True))
        draw.text((540 - tw / 2, 1040), cta, font=font(26, True), fill=SLATE_950)

    draw_footer(draw)
    return img


OUT_DIR.mkdir(parents=True, exist_ok=True)
rendered = []
for i, slide in enumerate(slides, start=1):
    img = render_slide(i, slide)
    path = OUT_DIR / f"heymies-carousel-slide-{i:02d}.png"
    img.convert("RGB").save(path, quality=95)
    rendered.append(img.convert("RGB"))
    print(path)

thumb_w = 216
thumb_h = 270
sheet = Image.new("RGB", (thumb_w * len(rendered), thumb_h), NAVY)
for index, img in enumerate(rendered):
    sheet.paste(img.resize((thumb_w, thumb_h), Image.Resampling.LANCZOS), (index * thumb_w, 0))
sheet_path = OUT_DIR / "heymies-carousel-contact-sheet.png"
sheet.save(sheet_path, quality=95)
print(sheet_path)
