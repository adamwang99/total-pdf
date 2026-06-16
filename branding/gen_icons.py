#!/usr/bin/env python3
"""Generate full Total PDF icon set from Adam's source logo files.
Square icon  -> file_129 (1254x1254)
Wordmark     -> file_131 (1280x256)
"""
import os
from PIL import Image

INBOX = "/home/tiep/.openclaw/media/inbound"
SQ_SRC = os.path.join(INBOX, "file_129---55b2e44d-8737-4ceb-beb7-dc6febdc8e1c.jpg")
WM_SRC = os.path.join(INBOX, "file_131---fb3f559e-e094-4848-9188-20f32192ff01.jpg")

ROOT = "/home/tiep/.openclaw/workspace/projects/total-pdf"
NEAR_WHITE = 232  # pixels with min channel >= this -> transparent

def to_rgba_transparent(im):
    im = im.convert("RGB")
    px = im.load()
    out = Image.new("RGBA", im.size, (0, 0, 0, 0))
    op = out.load()
    w, h = im.size
    for y in range(h):
        for x in range(w):
            r, g, b = px[x, y]
            if min(r, g, b) >= NEAR_WHITE:
                op[x, y] = (r, g, b, 0)
            else:
                op[x, y] = (r, g, b, 255)
    return out

def bbox_nonwhite(rgba):
    return rgba.split()[3].getbbox()

def square_master():
    im = Image.open(SQ_SRC)
    rgba = to_rgba_transparent(im)
    bb = bbox_nonwhite(rgba)
    cropped = rgba.crop(bb)
    side = max(cropped.size)
    pad = int(side * 0.12)
    canvas = side + 2 * pad
    sq = Image.new("RGBA", (canvas, canvas), (0, 0, 0, 0))
    ox = (canvas - cropped.size[0]) // 2
    oy = (canvas - cropped.size[1]) // 2
    sq.paste(cropped, (ox, oy), cropped)
    return sq

def on_white(rgba):
    bg = Image.new("RGBA", rgba.size, (255, 255, 255, 255))
    bg.alpha_composite(rgba)
    return bg.convert("RGB")

def resize(master, size):
    return master.resize((size, size), Image.LANCZOS)

def save_png(master, path, size, white=False):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    img = resize(master, size)
    if white:
        img = on_white(img)
    img.save(path)
    return path

def save_rect_png(master, path, w, h, white=True):
    """Center square master onto WxH canvas (for mstile wide)."""
    os.makedirs(os.path.dirname(path), exist_ok=True)
    s = min(w, h)
    icon = resize(master, int(s * 0.9))
    if white:
        canvas = Image.new("RGB", (w, h), (255, 255, 255))
    else:
        canvas = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    ox = (w - icon.size[0]) // 2
    oy = (h - icon.size[1]) // 2
    if icon.mode == "RGBA":
        canvas.paste(icon, (ox, oy), icon)
    else:
        canvas.paste(icon, (ox, oy))
    canvas.save(path)
    return path

def main():
    master = square_master()
    master.save(os.path.join(ROOT, "branding/total-pdf-icon-master.png"))

    T = os.path.join(ROOT, "frontend/editor/src-tauri/icons")
    S = os.path.join(ROOT, "app/core/src/main/resources/static")

    # Tauri square sizes
    sizes = {
        "16x16.png": 16, "32x32.png": 32, "64x64.png": 64,
        "128x128.png": 128, "128x128@2x.png": 256, "192x192.png": 192,
        "icon.png": 1024,
        "android-chrome-192x192.png": 192, "android-chrome-512x512.png": 512,
        "Square30x30Logo.png": 30, "Square44x44Logo.png": 44,
        "Square71x71Logo.png": 71, "Square89x89Logo.png": 89,
        "Square107x107Logo.png": 107, "Square142x142Logo.png": 142,
        "Square150x150Logo.png": 150, "Square284x284Logo.png": 284,
        "Square310x310Logo.png": 310, "StoreLogo.png": 50,
        "mstile-70x70.png": 70, "mstile-144x144.png": 144,
        "mstile-150x150.png": 150, "mstile-310x310.png": 310,
    }
    for name, sz in sizes.items():
        save_png(master, os.path.join(T, name), sz)

    # mstile wide (rectangular)
    save_rect_png(master, os.path.join(T, "mstile-310x150.png"), 310, 150, white=False)

    # iOS icons (need opaque white bg per Apple guidelines)
    ios = {
        "AppIcon-20x20@1x.png": 20, "AppIcon-20x20@2x.png": 40, "AppIcon-20x20@2x-1.png": 40,
        "AppIcon-20x20@3x.png": 60, "AppIcon-29x29@1x.png": 29, "AppIcon-29x29@2x.png": 58,
        "AppIcon-29x29@2x-1.png": 58, "AppIcon-29x29@3x.png": 87, "AppIcon-40x40@1x.png": 40,
        "AppIcon-40x40@2x.png": 80, "AppIcon-40x40@2x-1.png": 80, "AppIcon-40x40@3x.png": 120,
        "AppIcon-60x60@2x.png": 120, "AppIcon-60x60@3x.png": 180, "AppIcon-76x76@1x.png": 76,
        "AppIcon-76x76@2x.png": 152, "AppIcon-83.5x83.5@2x.png": 167, "AppIcon-512@2x.png": 1024,
    }
    for name, sz in ios.items():
        save_png(master, os.path.join(T, "ios", name), sz, white=True)

    # Android mipmaps
    mip = {"mdpi": 48, "hdpi": 72, "xhdpi": 96, "xxhdpi": 144, "xxxhdpi": 192}
    for d, sz in mip.items():
        base = os.path.join(T, "android", f"mipmap-{d}")
        save_png(master, os.path.join(base, "ic_launcher.png"), sz)
        save_png(master, os.path.join(base, "ic_launcher_round.png"), sz)
        save_png(master, os.path.join(base, "ic_launcher_foreground.png"), sz)

    # .ico (multi-size) and .icns
    ico_sizes = [(16, 16), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)]
    on_white(resize(master, 256)).save(os.path.join(T, "icon.ico"), sizes=ico_sizes)
    on_white(resize(master, 1024)).save(os.path.join(T, "icon.icns"))

    # Static resources (Spring Boot)
    static = {
        "favicon-16x16.png": 16, "favicon-32x32.png": 32, "favicon.png": 256,
        "apple-touch-icon.png": 180, "android-chrome-192x192.png": 192,
        "android-chrome-512x512.png": 512, "mstile-144x144.png": 144,
        "mstile-150x150.png": 150, "mstile-70x70.png": 70, "mstile-310x310.png": 310,
    }
    for name, sz in static.items():
        save_png(master, os.path.join(S, name), sz)
    save_rect_png(master, os.path.join(S, "mstile-310x150.png"), 310, 150, white=False)
    on_white(resize(master, 256)).save(os.path.join(S, "favicon.ico"), sizes=ico_sizes)
    on_white(resize(master, 1024)).save(os.path.join(S, "favicon.icns"))

    # Frontend public + dist logo sets
    for base in ["frontend/editor/public", "frontend/editor/dist"]:
        for variant in ["classic-logo", "modern-logo"]:
            d = os.path.join(ROOT, base, variant)
            if not os.path.isdir(d):
                continue
            save_png(master, os.path.join(d, "logo192.png"), 192)
            save_png(master, os.path.join(d, "logo512.png"), 512)
            on_white(resize(master, 64)).save(os.path.join(d, "favicon.ico"), sizes=[(16,16),(32,32),(48,48),(64,64)])

    print("DONE icon set generated")

if __name__ == "__main__":
    main()
