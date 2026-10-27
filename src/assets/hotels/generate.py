"""Generate original geometric demo room illustrations. Requires Pillow only."""
from pathlib import Path

from PIL import Image, ImageDraw

PALETTES = {
    "city-grand": ("#e6d7c6", "#8b624b", "#45576e", "#b8d8e6"),
    "river-view": ("#d9e5e8", "#6e8d96", "#2e6978", "#9bc9de"),
    "garden-house": ("#e5e8d7", "#a0916d", "#6a8059", "#b9d8b0"),
    "modern-loft": ("#dedbd6", "#8d7766", "#596166", "#bbced2"),
    "atrium": ("#e9dfd0", "#b18d5e", "#517b77", "#b7d9dc"),
    "classic-suite": ("#e2d0c5", "#93684e", "#70526b", "#c4d2de"),
}

for name, (wall, wood, accent, sky) in PALETTES.items():
    image = Image.new("RGB", (960, 640), wall)
    draw = ImageDraw.Draw(image)
    draw.polygon([(0, 440), (960, 440), (960, 640), (0, 640)], fill=wood)
    draw.polygon([(0, 0), (150, 90), (150, 440), (0, 530)], fill="#cec8bf")
    draw.rectangle((610, 80, 875, 365), fill="#faf6ee")
    draw.rectangle((623, 93, 862, 352), fill=sky)
    for x, y, width, height in [(625, 270, 50, 80), (683, 245, 55, 105), (747, 290, 45, 60), (800, 220, 62, 130)]:
        draw.rectangle((x, y, x + width, y + height), fill="#a5b5b8")
    draw.rectangle((739, 90, 747, 355), fill="#faf6ee")
    draw.rectangle((620, 205, 865, 213), fill="#faf6ee")
    draw.rectangle((584, 65, 615, 385), fill=accent)
    draw.rectangle((870, 65, 901, 385), fill=accent)
    draw.rounded_rectangle((190, 246, 570, 440), radius=18, fill=accent)
    draw.rectangle((175, 392, 585, 535), fill="#d9d1c6")
    draw.polygon([(175, 392), (585, 392), (620, 510), (147, 510)], fill="#faf7f1")
    draw.rounded_rectangle((215, 325, 360, 395), radius=12, fill="#ffffff")
    draw.rounded_rectangle((386, 325, 531, 395), radius=12, fill="#ffffff")
    draw.polygon([(162, 460), (605, 460), (620, 510), (147, 510)], fill=accent)
    draw.rectangle((655, 415, 758, 490), fill=wood)
    draw.rectangle((697, 350, 705, 415), fill="#514b46")
    draw.polygon([(670, 350), (732, 350), (720, 302), (682, 302)], fill="#f7edda")
    draw.rectangle((815, 428, 861, 504), fill="#ac8d71")
    draw.line((838, 428, 835, 330), fill="#55745a", width=9)
    draw.ellipse((800, 310, 838, 380), fill="#6c8c65")
    draw.ellipse((835, 335, 880, 400), fill="#7c9c70")
    draw.rounded_rectangle((20, 590, 300, 625), radius=5, fill="#faf7f1")
    draw.text((34, 601), "DEMO / PROJECT ILLUSTRATION", fill="#4c4b49")
    image.save(Path(__file__).parent / f"{name}.webp", "WEBP", quality=82, method=6)
