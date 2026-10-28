from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont
import qrcode


ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "assets"
OUTPUT = ASSETS / "dr-pegah-karimi-phone-card.png"
CARD_URL = "https://biocool.github.io/b4k-pegah-karimi-card/"

WIDTH, HEIGHT = 1080, 1920
NAVY = "#25347A"
DEEP_BLUE = "#094BA7"
BRIGHT_BLUE = "#198DC4"
GREEN = "#01A851"
YELLOW = "#F7C332"
RED = "#E72840"
CHARCOAL = "#212529"
PAPER = "#F8FBFF"


def font(size: int, bold: bool = False):
    candidates = [
        "/System/Library/Fonts/Supplemental/Arial Bold.ttf" if bold else "/System/Library/Fonts/Supplemental/Arial.ttf",
        "/System/Library/Fonts/Helvetica.ttc",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
    ]
    for candidate in candidates:
        if Path(candidate).exists():
            return ImageFont.truetype(candidate, size=size, index=0)
    return ImageFont.load_default()


def centered(draw, y, text, typeface, fill, spacing=0):
    if not spacing:
        box = draw.textbbox((0, 0), text, font=typeface)
        draw.text(((WIDTH - (box[2] - box[0])) / 2, y), text, font=typeface, fill=fill)
        return
    widths = [draw.textlength(letter, font=typeface) for letter in text]
    total = sum(widths) + spacing * (len(text) - 1)
    x = (WIDTH - total) / 2
    for letter, letter_width in zip(text, widths):
        draw.text((x, y), letter, font=typeface, fill=fill)
        x += letter_width + spacing


image = Image.new("RGB", (WIDTH, HEIGHT), NAVY)
pixels = image.load()
top = (34, 49, 104)
bottom = (9, 75, 167)
for y in range(HEIGHT):
    t = y / (HEIGHT - 1)
    color = tuple(round(top[i] * (1 - t) + bottom[i] * t) for i in range(3))
    for x in range(WIDTH):
        pixels[x, y] = color

shadow = Image.new("RGBA", image.size, (0, 0, 0, 0))
shadow_draw = ImageDraw.Draw(shadow)
shadow_draw.rounded_rectangle((70, 82, 1010, 1848), radius=72, fill=(0, 0, 0, 100))
shadow = shadow.filter(ImageFilter.GaussianBlur(34))
image = Image.alpha_composite(image.convert("RGBA"), shadow)

card = Image.new("RGBA", image.size, (0, 0, 0, 0))
draw = ImageDraw.Draw(card)
draw.rounded_rectangle((60, 65, 1020, 1835), radius=68, fill="white")

# Four-color brand rail.
draw.rounded_rectangle((60, 65, 1020, 105), radius=20, fill=RED)
draw.rectangle((300, 65, 540, 105), fill=GREEN)
draw.rectangle((540, 65, 780, 105), fill=BRIGHT_BLUE)
draw.rectangle((780, 65, 1020, 105), fill=YELLOW)

image = Image.alpha_composite(image, card)
draw = ImageDraw.Draw(image)

qr_code = qrcode.QRCode(
    error_correction=qrcode.constants.ERROR_CORRECT_M,
    box_size=24,
    border=4,
)
qr_code.add_data(CARD_URL)
qr_code.make(fit=True)
qr_code.make_image(fill_color=NAVY, back_color="white").convert("RGBA").save(ASSETS / "card-qr.png")

logo = Image.open(ASSETS / "b4k-logo.png").convert("RGBA")
logo = logo.resize((128, 128), Image.Resampling.LANCZOS)
image.alpha_composite(logo, ((WIDTH - 128) // 2, 146))

centered(draw, 304, "SCAN TO CONNECT", font(40, True), GREEN, spacing=8)
centered(draw, 382, "Dr. Pegah", font(72, True), CHARCOAL)
centered(draw, 460, "Karimi", font(104, True), NAVY)
centered(draw, 578, "BRICKS 4 KIDZ · LOS ANGELES VALLEY", font(26, True), DEEP_BLUE, spacing=2)

# QR frame and high-contrast code.
draw.rounded_rectangle((120, 660, 960, 1500), radius=56, fill=PAPER, outline=YELLOW, width=12)
qr = Image.open(ASSETS / "card-qr.png").convert("RGBA")
qr = qr.resize((730, 730), Image.Resampling.NEAREST)
image.alpha_composite(qr, (175, 715))

draw.rounded_rectangle((120, 1548, 960, 1662), radius=30, fill="#EFF7FD", outline="#B7C8E7", width=3)
centered(draw, 1574, "biocool.github.io/b4k-pegah-karimi-card", font(28, True), DEEP_BLUE)

centered(draw, 1702, "OPEN CAMERA  •  SCAN  •  CONNECT", font(31, True), NAVY, spacing=2)
centered(draw, 1758, "We Learn. We Build. We Play.", font(28, True), CHARCOAL)

# Small brick-inspired footer marks.
mark_y = 1805
mark_w = 52
gap = 14
total = mark_w * 4 + gap * 3
x = (WIDTH - total) // 2
for color in (RED, GREEN, BRIGHT_BLUE, YELLOW):
    draw.rounded_rectangle((x, mark_y, x + mark_w, mark_y + 14), radius=7, fill=color)
    x += mark_w + gap

image.convert("RGB").save(OUTPUT, "PNG", optimize=True)
print(OUTPUT)
