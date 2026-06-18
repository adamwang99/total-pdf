#!/usr/bin/env python3
"""Context-aware Stirling -> Total PDF display-string rebrand.

Rules:
- Only touch safe text file extensions.
- Skip a whole LINE if it contains any PROTECTED token (package, docker image,
  upstream URL, header contract, license/copyright, docker volume path).
- Otherwise apply 3 brand-form replacements (longest first).
- Fix the known broken artifact `Stirling-Tools/Total PDF` -> `Stirling-Tools/Stirling-PDF`.
"""
import os
import re
import sys

ROOT = "/home/tiep/.openclaw/workspace/projects/total-pdf"

SKIP_DIRS = {".git", "node_modules", "dist", "build", ".gradle", "target"}
SKIP_FILES = {"LICENSE", "package-lock.json", "rebrand_strings.py"}
EXTS = {".tsx", ".ts", ".js", ".jsx", ".java", ".toml", ".md", ".html", ".htm",
        ".css", ".json", ".yml", ".yaml", ".xml", ".properties", ".kt", ".rs",
        ".eml", ".txt"}

# If any of these appear in a line, the line is left UNTOUCHED.
PROTECTED = [
    "stirling.software",
    "stirling/software",
    "Stirling-Tools",
    "stirling-tools",
    "stirlingtools/",
    "stirlingpdf.com",
    "X-Stirling-Tool",
    "x-stirling-tool",
    "ghcr.io",
    "githubusercontent.com",
    "Copyright", "copyright", "All rights reserved", "rights reserved",
    "stirling-network", "stirling-data", "stirling-config", "stirling-logs",
    "./stirling/", "../stirling/", "../../stirling/",
    "stirling/latest", "stirling/data", "stirling/config", "stirling/logs",
    "stirling/customFiles", "stirling/pipeline",
    "docker.stirlingpdf",
    "image: docker", "image: ghcr",
]

# Ordered longest-first to avoid partial clobbering.
REPLACERS = [
    ("StirlingPDF", "TotalPDF"),
    ("Stirling-PDF", "Total-PDF"),
    ("Stirling PDF", "Total PDF"),
]

BROKEN_URL = ("Stirling-Tools/Total PDF", "Stirling-Tools/Stirling-PDF")


def process(path):
    try:
        with open(path, "r", encoding="utf-8") as f:
            lines = f.readlines()
    except (UnicodeDecodeError, IsADirectoryError):
        return 0
    changed = 0
    out = []
    for line in lines:
        # 1) always repair the known broken artifact
        if BROKEN_URL[0] in line:
            line = line.replace(BROKEN_URL[0], BROKEN_URL[1])
            changed += 1
        # 2) skip protected lines for brand replace
        if any(tok in line for tok in PROTECTED):
            out.append(line)
            continue
        new = line
        for a, b in REPLACERS:
            if a in new:
                new = new.replace(a, b)
        if new != line:
            changed += 1
        out.append(new)
    if changed:
        with open(path, "w", encoding="utf-8") as f:
            f.writelines(out)
    return changed


def main():
    total = 0
    files = 0
    changed_files = []
    for dirpath, dirnames, filenames in os.walk(ROOT):
        dirnames[:] = [d for d in dirnames if d not in SKIP_DIRS]
        for fn in filenames:
            if fn in SKIP_FILES:
                continue
            ext = os.path.splitext(fn)[1].lower()
            if ext not in EXTS:
                continue
            p = os.path.join(dirpath, fn)
            c = process(p)
            if c:
                total += c
                files += 1
                changed_files.append((c, os.path.relpath(p, ROOT)))
    changed_files.sort(reverse=True)
    print(f"changed {total} occurrences across {files} files")
    for c, rel in changed_files[:40]:
        print(f"  {c:4d}  {rel}")

if __name__ == "__main__":
    main()
