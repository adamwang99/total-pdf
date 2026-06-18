#!/usr/bin/env python3
"""Fix leftover 'Stirling' brand stem in locale .toml display strings.

Standalone pass used \\b which missed inflected forms in many languages:
  Stirlingu, Stirlingsben, Stirlingovom, Stirling의, Stirlingen, Stirlinget, ...
These are user-visible Welcome/Login/API-key/onboarding strings (the screens
Sếp saw). We replace the brand stem 'Stirling' -> 'Total PDF' wherever it
appears in a quoted value, dropping any language case-suffix that was glued on.

Scope: locale .toml files only. Code identifiers/URLs/packages do not appear
in these translation value strings, but we still skip protected tokens for
safety.
"""
import os
import re

ROOT = "/home/tiep/.openclaw/workspace/projects/total-pdf"
LOCALE_DIR = os.path.join(ROOT, "frontend/editor/public/locales")

PROTECT = [
    "stirling.software", "stirling/software", "StirlingFile", "X-Stirling",
    "Stirling-Tools", "raw.githubusercontent", "stirlingpdf.com",
    "stirlingtools", "docker.stirling", "ghcr.io/stirling",
    "stirling-transparent", "Copyright", "copyright",
]

# brand stem + optional trailing lowercase/unicode declension letters glued on
# e.g. Stirlingu, Stirlinget, Stirlingovom, Stirlingsben, Stirling의(handled sep)
# Latin suffix handling: strip [a-zA-Zа-яё'’]* that immediately follow.
PAT_LATIN = re.compile(r"Stirling(?:-PDF)?[A-Za-zÀ-ÿ'’]*")
# Non-spacing scripts (Korean/Indic/etc): just replace the literal stem.
PAT_BARE = re.compile(r"Stirling(?:-PDF)?")


def main():
    changed_files = 0
    changed_lines = 0
    for dirpath, _, files in os.walk(LOCALE_DIR):
        for fn in files:
            if not fn.endswith(".toml"):
                continue
            fp = os.path.join(dirpath, fn)
            with open(fp, "r", encoding="utf-8") as f:
                lines = f.readlines()
            out = []
            hit = 0
            for ln in lines:
                if any(tok in ln for tok in PROTECT) or "Stirling" not in ln:
                    out.append(ln)
                    continue
                new = PAT_LATIN.sub("Total PDF", ln)
                new = PAT_BARE.sub("Total PDF", new)
                if new != ln:
                    hit += 1
                out.append(new)
            if hit:
                with open(fp, "w", encoding="utf-8") as f:
                    f.writelines(out)
                changed_files += 1
                changed_lines += hit
    print(f"changed {changed_lines} lines across {changed_files} locale files")


if __name__ == "__main__":
    main()
