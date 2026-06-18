#!/usr/bin/env python3
"""Generate Total PDF wordmark + mark SVGs (base64-embedded) from Adam's source files.

Code references (useLogoAssets / useLogoPath) expect, per logo folder:
  TotalPDFLogoBlackText.svg   wordmark, dark text  -> light theme
  TotalPDFLogoGreyText.svg    wordmark, muted grey
  TotalPDFLogoWhiteText.svg   wordmark, white text -> dark theme
  TotalPDFLogoNoTextDark.svg  mark only, for dark theme
  TotalPDFLogoNoTextLight.svg mark only, for light theme
"""
import base64
import io
import os
from PIL import Image

INBOX = "/home/tiep/.openclaw/media/inbound"
WM_SRC = os.path.join(INBOX, "file_131---fb3f559e-e094-4848-9188-20f32192ff01.jpg")
SQ_SRC = os.path.join(INBOX, "file_129---55b2e44d-8737-4ceb-beb7-dc6febdc8e1c.jpg")

ROOT = "/home/tiep/.openclaw/workspace/projects/total-pdf"
PUBLIC_DIRS = [
    os.path.join(ROOT, "frontend/editor/public/modern-logo"),
    os.path.join(ROOT, "frontend/editor/public/classic-logo"),
    os.path.join(ROOT, "frontend/editor/dist/modern-logo"),
    os.path.join(ROOT, "frontend/editor/dist/classic-logo"),
]
NEAR_WHITE = 232


def to_transparent(im):
    im = im.convert("RGB")
    px = im.load()
    out = Image.new("RGBA", im.size, (0, 0, 0, 0))
    op = out.load()
    w, h = im.size
    for y in range(h):
        for x in range(w):
            r, g, b = px[x, y]
            if min(r, g, b) >= NEAR_WHITE:
                op[x, y] = (0, 0, 0, 0)
            else:
                op[x, y] = (r, g, b, 255)
    return out


def crop_alpha(rgba):
    bb = rgba.split()[3].getbbox()
    return rgba.crop(bb) if bb else rgba


def recolor_dark(rgba, target):
    """Recolor near-navy (dark) pixels to target, keep bright cyan/blue accent."""
    px = rgba.load()
    w, h = rgba.size
    out = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    op = out.load()
    tr, tg, tb = target
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if a == 0:
                continue
            # accent = bright + blue/cyan dominant -> keep
            is_accent = b > 120 and (b - r) > 40
            if is_accent:
                op[x, y] = (r, g, b, a)
            else:
                op[x, y] = (tr, tg, tb, a)
    return out


def svg_wrap(rgba, path):
    w, h = rgba.size
    buf = io.BytesIO()
    rgba.save(buf, format="PNG")
    b64 = base64.b64encode(buf.getvalue()).decode()
    svg = (
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" '
        f'viewBox="0 0 {w} {h}">\n'
        f'<image width="{w}" height="{h}" '
        f'xlink:href="data:image/png;base64,{b64}" '
        f'xmlns:xlink="http://www.w3.org/1999/xlink"/>\n</svg>\n'
    )
    with open(path, "w") as f:
        f.write(svg)


def main():
    wm = crop_alpha(to_transparent(Image.open(WM_SRC)))
    mark = crop_alpha(to_transparent(Image.open(SQ_SRC)))

    black = wm  # navy text as-is (light theme)
    grey = recolor_dark(wm, (100, 116, 139))   # slate-500
    white = recolor_dark(wm, (255, 255, 255))  # dark theme

    for d in PUBLIC_DIRS:
        if not os.path.isdir(d):
            continue
        svg_wrap(black, os.path.join(d, "TotalPDFLogoBlackText.svg"))
        svg_wrap(grey, os.path.join(d, "TotalPDFLogoGreyText.svg"))
        svg_wrap(white, os.path.join(d, "TotalPDFLogoWhiteText.svg"))
        svg_wrap(mark, os.path.join(d, "TotalPDFLogoNoTextDark.svg"))
        svg_wrap(mark, os.path.join(d, "TotalPDFLogoNoTextLight.svg"))

    # branding/ HC variant referenced by OnboardingModalSlide
    bdir = os.path.join(ROOT, "frontend/editor/public/branding")
    os.makedirs(bdir, exist_ok=True)
    svg_wrap(mark, os.path.join(bdir, "TotalPDFLogoNoTextLightHC.svg"))
    bdir2 = os.path.join(ROOT, "frontend/editor/dist/branding")
    if os.path.isdir(os.path.join(ROOT, "frontend/editor/dist")):
        os.makedirs(bdir2, exist_ok=True)
        svg_wrap(mark, os.path.join(bdir2, "TotalPDFLogoNoTextLightHC.svg"))

    print("DONE logos:", wm.size, mark.size)


if __name__ == "__main__":
    main()
