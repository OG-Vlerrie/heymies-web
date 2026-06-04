from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "outputs" / "marketing"
FACEBOOK = OUT / "heymies-property-leads-broken-facebook-1080x1350.png"
LINKEDIN = OUT / "heymies-property-leads-broken-linkedin-1200x628.png"

NAVY = (7, 17, 31)
NAVY_2 = (4, 32, 30)
EMERALD = (16, 185, 129)
EMERALD_LIGHT = (110, 231, 183)
SKY = (56, 189, 248)
WHITE = (255, 255, 255)
SLATE_100 = (241, 245, 249)
SLATE_300 = (203, 213, 225)
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


def draw_multiline(draw, text, xy, fnt, fill, max_width, line_gap=10):
    x, y = xy
    for line in wrap_text(draw, text, fnt, max_width):
        draw.text((x, y), line, font=fnt, fill=fill)
        y += text_size(draw, line, fnt)[1] + line_gap
    return y


def make_bg(w, h):
    img = Image.new("RGB", (w, h), NAVY)
    pix = img.load()
    for y in range(h):
        for x in range(w):
            t = y / h
            r = int(NAVY[0] * (1 - t) + NAVY_2[0] * t)
            g = int(NAVY[1] * (1 - t) + NAVY_2[1] * t)
            b = int(NAVY[2] * (1 - t) + NAVY_2[2] * t)
            dx = (x - w * 0.74) / (w * 0.48)
            dy = (y - h * 0.36) / (h * 0.42)
            glow = max(0, 1 - (dx * dx + dy * dy)) * 48
            pix[x, y] = (r, min(255, g + int(glow)), min(255, b + int(glow * 0.35)))
    return img.convert("RGBA")


def draw_grid(draw, w, h, step):
    for x in range(0, w, step):
        draw.line((x, 0, x, h), fill=(16, 185, 129, 24), width=1)
    for y in range(0, h, step):
        draw.line((0, y, w, y), fill=(16, 185, 129, 24), width=1)


def draw_logo(draw, x, y, scale=1):
    size = int(76 * scale)
    rounded(draw, (x, y, x + size, y + size), int(18 * scale), WHITE)
    rounded(draw, (x + int(12 * scale), y + int(12 * scale), x + int(64 * scale), y + int(64 * scale)), int(14 * scale), (236, 253, 245))
    draw.text((x + int(20 * scale), y + int(22 * scale)), "HM", font=font(int(24 * scale), True), fill=SLATE_950)
    draw.text((x + int(96 * scale), y + int(17 * scale)), "HeyMies", font=font(int(34 * scale), True), fill=WHITE)


def draw_agent_panel(draw, x, y, w, h, small=False):
    rounded(draw, (x, y, x + w, y + h), 34, (255, 255, 255, 18), (255, 255, 255, 42), 2)
    panel_fill = SLATE_100
    if small:
        draw.text((x + 24, y + 30), "AGENT REVIEWING LEADS", font=font(13, True), fill=SLATE_500)
        leads = [("New lead", AMBER), ("No reply", RED)]
        ly = y + 76
        for label, color in leads:
            rounded(draw, (x + 24, ly, x + w - 24, ly + 48), 16, panel_fill, (226, 232, 240), 1)
            draw.ellipse((x + 42, ly + 18, x + 56, ly + 32), fill=color)
            draw.text((x + 72, ly + 14), label, font=font(15, True), fill=SLATE_950)
            ly += 58
        cx = x + w // 2
        by = y + h - 28
        draw.ellipse((cx - 42, by - 172, cx + 42, by - 88), fill=(215, 164, 127))
        draw.pieslice((cx - 52, by - 194, cx + 52, by - 124), 180, 360, fill=(45, 31, 24))
        draw.ellipse((cx - 20, by - 126, cx - 12, by - 118), fill=SLATE_950)
        draw.ellipse((cx + 12, by - 126, cx + 20, by - 118), fill=SLATE_950)
        draw.arc((cx - 18, by - 98, cx + 18, by - 78), 190, 350, fill=(127, 29, 29), width=3)
        rounded(draw, (cx - 86, by - 78, cx + 86, by + 24), 34, (30, 41, 59))
        return
    else:
        draw.text((x + 32, y + 30), "ESTATE AGENT REVIEWING LEADS", font=font(16, True), fill=SLATE_500)
    leads = [("New lead", AMBER), ("Follow-up due", RED), ("No reply", RED)]
    ly = y + 86
    for label, color in leads:
        rounded(draw, (x + 32, ly, x + w - 32, ly + 66), 18, panel_fill, (226, 232, 240) if small else (255, 255, 255, 58), 1)
        draw.ellipse((x + 56, ly + 24, x + 74, ly + 42), fill=color)
        draw.text((x + 92, ly + 20), label, font=font(21 if not small else 17, True), fill=SLATE_950)
        ly += 82
    cx = x + w // 2
    by = y + h - 35
    draw.ellipse((cx - 52, by - 236, cx + 52, by - 132), fill=(215, 164, 127))
    draw.pieslice((cx - 64, by - 262, cx + 64, by - 170), 180, 360, fill=(45, 31, 24))
    draw.ellipse((cx - 24, by - 194, cx - 14, by - 184), fill=SLATE_950)
    draw.ellipse((cx + 14, by - 194, cx + 24, by - 184), fill=SLATE_950)
    draw.arc((cx - 24, by - 164, cx + 24, by - 136), 190, 350, fill=(127, 29, 29), width=4)
    rounded(draw, (cx - 104, by - 132, cx + 104, by + 36), 42, (30, 41, 59))


def metric(draw, x, y, w, label, value, f=20):
    rounded(draw, (x, y, x + w, y + 52), 16, SLATE_100, (226, 232, 240), 1)
    draw.text((x + 18, y + 16), label, font=font(f, True), fill=SLATE_500)
    vw, _ = text_size(draw, value, font(f, True))
    draw.text((x + w - 18 - vw, y + 16), value, font=font(f, True), fill=SLATE_950)


def draw_dashboard(draw, x, y, w, h, compact=False):
    rounded(draw, (x, y, x + w, y + h), 34, WHITE, (167, 243, 208), 3)
    draw.text((x + 36, y + 34), "AI DASHBOARD", font=font(18 if not compact else 16, True), fill=(4, 120, 87))
    draw.text((x + 36, y + 84), "Qualified buyers", font=font(31 if not compact else 25, True), fill=SLATE_950)
    draw.text((x + 36, y + 134), "92", font=font(72 if not compact else 56, True), fill=SLATE_950)
    rounded(draw, (x + w - 164, y + 140, x + w - 36, y + 178), 19, (220, 252, 231))
    draw.text((x + w - 142, y + 151), "Ready", font=font(18 if not compact else 16, True), fill=(4, 120, 87))
    rounded(draw, (x + 36, y + 230, x + w - 36, y + 248), 9, (226, 232, 240))
    rounded(draw, (x + 36, y + 230, x + w - 72, y + 248), 9, EMERALD)
    fy = y + (244 if compact else 292)
    gap = 56 if compact else 68
    metric(draw, x + 36, fy, w - 72, "AI scoring", "Active", 16 if compact else 20)
    metric(draw, x + 36, fy + gap, w - 72, "Nurture", "Auto", 16 if compact else 20)
    metric(draw, x + 36, fy + gap * 2, w - 72, "Priority alert", "Now", 16 if compact else 20)


def render_facebook():
    w, h = 1080, 1350
    img = make_bg(w, h)
    draw = ImageDraw.Draw(img)
    draw_grid(draw, w, h, 42)
    draw_logo(draw, 62, 62)
    rounded(draw, (782, 78, 1018, 128), 25, (16, 185, 129, 38), (167, 243, 208, 88), 2)
    draw.text((830, 94), "SAAS FOR AGENTS", font=font(17, True), fill=EMERALD_LIGHT)
    draw_agent_panel(draw, 62, 210, 430, 600)
    draw_dashboard(draw, 542, 210, 476, 600)
    draw.line((62, 870, 1018, 870), fill=(255, 255, 255, 38), width=2)
    draw_multiline(draw, "Property Leads Are Broken", (62, 926), font(68, True), WHITE, 860, 8)
    body = "You pay for leads.\nYou follow up.\nMost never reply.\n\nHeyMies uses AI to identify serious buyers and automatically nurture the rest."
    y = 1075
    for para in body.split("\n"):
        if not para:
            y += 12
            continue
        y = draw_multiline(draw, para, (62, y), font(30), SLATE_300, 806, 6)
    rounded(draw, (720, 1216, 1018, 1284), 24, EMERALD)
    cta = "SEE THE DEMO"
    tw, _ = text_size(draw, cta, font(25, True))
    draw.text((720 + (298 - tw) / 2, 1238), cta, font=font(25, True), fill=SLATE_950)
    return img


def render_linkedin():
    w, h = 1200, 628
    img = make_bg(w, h)
    draw = ImageDraw.Draw(img)
    draw_grid(draw, w, h, 36)
    draw_logo(draw, 50, 42, 0.82)
    rounded(draw, (960, 52, 1142, 94), 21, (16, 185, 129, 38), (167, 243, 208, 88), 2)
    draw.text((994, 65), "B2B SAAS", font=font(15, True), fill=EMERALD_LIGHT)
    draw_multiline(draw, "Property Leads Are Broken", (56, 152), font(54, True), WHITE, 480, 4)
    body_lines = ["You pay for leads.", "You follow up.", "Most never reply."]
    y = 296
    for line in body_lines:
        draw.text((56, y), line, font=font(28), fill=SLATE_300)
        y += 42
    draw_multiline(
        draw,
        "HeyMies uses AI to identify serious buyers and automatically nurture the rest.",
        (56, 436),
        font(25),
        SLATE_300,
        500,
        6,
    )
    rounded(draw, (56, 540, 292, 594), 20, EMERALD)
    cta = "SEE THE DEMO"
    tw, _ = text_size(draw, cta, font(20, True))
    draw.text((56 + (236 - tw) / 2, 558), cta, font=font(20, True), fill=SLATE_950)
    draw_agent_panel(draw, 594, 126, 242, 438, True)
    draw_dashboard(draw, 862, 126, 286, 438, True)
    return img


OUT.mkdir(parents=True, exist_ok=True)
render_facebook().convert("RGB").save(FACEBOOK, quality=95)
render_linkedin().convert("RGB").save(LINKEDIN, quality=95)
print(FACEBOOK)
print(LINKEDIN)
