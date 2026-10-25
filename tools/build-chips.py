#!/usr/bin/env python3
"""Generate the burgundy link chips used in README.md.

Chips are hand-built SVG instead of third-party badge services, so they cannot
break when an external host is slow or retired. Run after editing CHIPS:

    python3 tools/build-chips.py
"""

from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "assets" / "chips"

# slug -> visible label
CHIPS = {
    "live": "LIVE SITE",
    "source": "SOURCE",
    "portfolio": "PORTFOLIO",
    "github": "GITHUB",
    "telegram": "TELEGRAM",
    "instagram": "INSTAGRAM",
    "email": "EMAIL",
}

HEIGHT = 34
CHAR = 7.9          # advance per character at 10.5px with 2.2 letter-spacing
PAD_L, PAD_R = 30, 44


def chip(slug: str, label: str) -> str:
    width = PAD_L + round(len(label) * CHAR) + PAD_R
    mid = HEIGHT / 2
    return f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {HEIGHT}" width="{width}" height="{HEIGHT}" role="img" aria-label="{label.title()}">
  <title>{label.title()}</title>
  <defs>
    <linearGradient id="chip-{slug}-fill" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#1A0C13"/>
      <stop offset="1" stop-color="#10070C"/>
    </linearGradient>
    <linearGradient id="chip-{slug}-edge" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#C77B9B" stop-opacity="0.55"/>
      <stop offset="0.6" stop-color="#701A3D" stop-opacity="0.9"/>
      <stop offset="1" stop-color="#451126"/>
    </linearGradient>
  </defs>
  <rect x="0.75" y="0.75" width="{width - 1.5}" height="{HEIGHT - 1.5}" rx="{mid - 0.75}" fill="url(#chip-{slug}-fill)" stroke="url(#chip-{slug}-edge)" stroke-width="1.4"/>
  <rect x="14" y="{mid - 3:.1f}" width="6" height="6" transform="rotate(45 17 {mid:.1f})" fill="#701A3D" stroke="#C77B9B" stroke-opacity="0.85" stroke-width="0.9"/>
  <text x="{PAD_L - 4}" y="{mid + 3.6:.1f}" font-family="ui-monospace,'SFMono-Regular','SF Mono',Menlo,Consolas,'DejaVu Sans Mono',monospace" font-size="10.5" letter-spacing="2.2" fill="#E5B5C7">{label}</text>
  <g stroke="#C77B9B" stroke-opacity="0.9" stroke-width="1.2" fill="none" stroke-linecap="round" stroke-linejoin="round">
    <path d="M{width - 25} {mid + 3.5:.1f} L{width - 18} {mid - 3.5:.1f}"/>
    <path d="M{width - 23.6} {mid - 3.5:.1f} L{width - 18} {mid - 3.5:.1f} L{width - 18} {mid + 1.9:.1f}"/>
  </g>
</svg>
"""


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    for slug, label in CHIPS.items():
        path = OUT / f"{slug}.svg"
        path.write_text(chip(slug, label))
        print(f"Wrote {path.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
