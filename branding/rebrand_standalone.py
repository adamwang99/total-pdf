#!/usr/bin/env python3
"""Replace leftover standalone 'Stirling' brand word -> 'Total PDF'.

Earlier pass only handled 'Stirling PDF'/'Stirling-PDF'/'StirlingPDF'.
Standalone 'Stirling' (Welcome to Stirling, Stirling Cloud, alt text, locales)
was missed. This pass fixes those while protecting code identifiers + legal.

PROTECTED (line skipped entirely if it contains any token):
  - Java package / path: stirling.software , stirling/software
  - Type identifiers: StirlingFile (covers StirlingFile, StirlingFileStub, etc.)
  - HTTP header contract: X-Stirling
  - Upstream URLs / images: Stirling-Tools , raw.githubusercontent , stirlingpdf.com,
    stirlingtools , docker.stirling , ghcr.io/stirling , stirling-transparent
  - Copyright / license notices
Regex `Stirling\b` does NOT match 'StirlingFile' (no boundary between g and F),
but we still skip those lines for safety.
"""
import os
import re

ROOT = "/home/tiep/.openclaw/workspace/projects/total-pdf"
SCAN_DIRS = ["app", "frontend/editor/src", "frontend/editor/public"]
EXTS = (".java", ".ts", ".tsx", ".toml", ".yml", ".yaml", ".properties", ".json", ".html")

PROTECT = [
    "stirling.software", "stirling/software",
    "StirlingFile",            # type identifiers
    "X-Stirling",
    "Stirling-Tools", "raw.githubusercontent", "stirlingpdf.com",
    "stirlingtools", "docker.stirling", "ghcr.io/stirling",
    "stirling-transparent",
    "Copyright", "copyright",
]

# match 'Stirling' as a standalone word: not part of StirlingFile etc.
PAT = re.compile(r"Stirling\b")

def main():
    changed_files = 0
    changed_lines = 0
    for d in SCAN_DIRS:
        base = os.path.join(ROOT, d)
        for dirpath, _, files in os.walk(base):
            if "/dist/" in dirpath or "/node_modules/" in dirpath or "/.git/" in dirpath:
                continue
            for fn in files:
                if not fn.endswith(EXTS):
                    continue
                fp = os.path.join(dirpath, fn)
                try:
                    with open(fp, "r", encoding="utf-8") as f:
                        lines = f.readlines()
                except (UnicodeDecodeError, OSError):
                    continue
                out = []
                file_hit = 0
                for ln in lines:
                    if any(tok in ln for tok in PROTECT):
                        out.append(ln)
                        continue
                    if "Stirling" not in ln:
                        out.append(ln)
                        continue
                    new = PAT.sub("Total PDF", ln)
                    if new != ln:
                        file_hit += new.count("Total PDF") - ln.count("Total PDF")
                    out.append(new)
                if file_hit:
                    with open(fp, "w", encoding="utf-8") as f:
                        f.writelines(out)
                    changed_files += 1
                    changed_lines += file_hit
    print(f"changed {changed_lines} occurrences across {changed_files} files")

if __name__ == "__main__":
    main()
