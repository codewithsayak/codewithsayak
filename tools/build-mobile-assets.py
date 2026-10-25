#!/usr/bin/env python3
"""Generate the compact hero and footer used on narrow screens.

GitHub renders README images at roughly 330-350px on phones, so the wide
1280px artwork would shrink its supporting type to about 3px. These variants
use a 620px canvas with proportionally larger type, so labels stay legible at
phone width; README.md picks them through <picture> media queries.

    python3 tools/build-mobile-assets.py
"""

from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "assets"

SERIF = "'Iowan Old Style','Palatino Linotype',Palatino,'Book Antiqua',Georgia,'DejaVu Serif',serif"
MONO = "ui-monospace,'SFMono-Regular','SF Mono',Menlo,Consolas,'DejaVu Sans Mono',monospace"

DARK = {
    "suffix": "",
    "prefix": "skm",
    "bg": ("#190B12", "#14090F", "#10070C"),
    "glow": ("#701A3D", "0.5"),
    "grid": ("#E5B5C7", "0.07"),
    "grid_major": ("#C77B9B", "0.11"),
    "name": ("#F8F0F3", "#E5B5C7"),
    "accent": "#C77B9B",
    "strong": "#E5B5C7",
    "wine": "#701A3D",
    "mono_bg": "#140A10",
    "mono_ring": "#451126",
    "mono_ink": "#F8F0F3",
    "body": "#E5B5C7",
    "edge": ("#E5B5C7", "0.1"),
    "shadow": ("#0B0508", "0.65"),
}

LIGHT = {
    "suffix": "-light",
    "prefix": "skml",
    "bg": ("#F8F0F3", "#F6E9EE", "#F1DEE5"),
    "glow": ("#C77B9B", "0.32"),
    "grid": ("#701A3D", "0.08"),
    "grid_major": ("#451126", "0.11"),
    "name": ("#451126", "#701A3D"),
    "accent": "#701A3D",
    "strong": "#451126",
    "wine": "#C77B9B",
    "mono_bg": "#F8F0F3",
    "mono_ring": "#C77B9B",
    "mono_ink": "#451126",
    "body": "#451126",
    "edge": ("#701A3D", "0.12"),
    "shadow": ("#701A3D", "0.2"),
}


def hero(c: dict) -> str:
    p = c["prefix"]
    return f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 620 430" width="620" height="430" preserveAspectRatio="xMidYMid meet" role="img" aria-labelledby="{p}-title {p}-desc">
  <title id="{p}-title">Sayak Karmakar — UI/UX Designer, Full-Stack Developer, Creative Technologist</title>
  <desc id="{p}-desc">Compact burgundy nameplate for narrow screens, with a fine grid and a small orbital monogram.</desc>
  <defs>
    <linearGradient id="{p}-bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="{c['bg'][0]}"/>
      <stop offset="0.55" stop-color="{c['bg'][1]}"/>
      <stop offset="1" stop-color="{c['bg'][2]}"/>
    </linearGradient>
    <radialGradient id="{p}-glow" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="{c['glow'][0]}" stop-opacity="{c['glow'][1]}"/>
      <stop offset="1" stop-color="{c['glow'][0]}" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="{p}-name" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="{c['name'][0]}"/>
      <stop offset="0.7" stop-color="{c['name'][0]}"/>
      <stop offset="1" stop-color="{c['name'][1]}"/>
    </linearGradient>
    <linearGradient id="{p}-rule" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="{c['strong']}"/>
      <stop offset="0.5" stop-color="{c['wine']}"/>
      <stop offset="1" stop-color="{c['wine']}" stop-opacity="0"/>
    </linearGradient>
    <pattern id="{p}-grid" width="34" height="34" patternUnits="userSpaceOnUse">
      <path d="M34 0H0V34" fill="none" stroke="{c['grid'][0]}" stroke-opacity="{c['grid'][1]}" stroke-width="1"/>
    </pattern>
    <radialGradient id="{p}-fade" cx="0.8" cy="0.35" r="0.6">
      <stop offset="0" stop-color="#FFFFFF" stop-opacity="0.95"/>
      <stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/>
    </radialGradient>
    <mask id="{p}-fade-mask">
      <rect width="620" height="430" fill="url(#{p}-fade)"/>
    </mask>
    <filter id="{p}-soft" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="6"/>
    </filter>
    <style>
      @keyframes {p}-breathe {{ 0%, 100% {{ opacity: 0.5; }} 50% {{ opacity: 1; }} }}
      @keyframes {p}-drift {{ 0%, 100% {{ transform: translate(0, 0); }} 50% {{ transform: translate(10px, -8px); }} }}
      .{p}-breathe {{ animation: {p}-breathe 7s ease-in-out infinite; }}
      .{p}-drift {{ animation: {p}-drift 18s ease-in-out infinite; }}
      @media (prefers-reduced-motion: reduce) {{
        .{p}-breathe, .{p}-drift {{ animation: none !important; }}
        .{p}-motion {{ display: none; }}
      }}
    </style>
  </defs>

  <rect width="760" height="440" fill="url(#{p}-bg)"/>
  <g class="{p}-drift">
    <ellipse cx="508" cy="120" rx="220" ry="160" fill="url(#{p}-glow)"/>
    <ellipse cx="70" cy="392" rx="280" ry="140" fill="url(#{p}-glow)" opacity="0.55"/>
  </g>
  <g mask="url(#{p}-fade-mask)">
    <rect width="620" height="430" fill="url(#{p}-grid)"/>
  </g>

  <g transform="translate(508 116) rotate(-16)">
    <circle r="78" fill="none" stroke="{c['accent']}" stroke-opacity="0.26" stroke-width="1"/>
    <ellipse rx="70" ry="30" fill="none" stroke="{c['strong']}" stroke-opacity="0.2" stroke-width="1"/>
    <ellipse rx="46" ry="66" fill="none" stroke="{c['accent']}" stroke-opacity="0.16" stroke-width="1" stroke-dasharray="2 8"/>
    <g class="{p}-motion">
      <circle r="3" fill="{c['strong']}" fill-opacity="0.6" filter="url(#{p}-soft)">
        <animateMotion dur="22s" repeatCount="indefinite" path="M70,0 A70,30 0 1,1 -70,0 A70,30 0 1,1 70,0"/>
      </circle>
      <circle r="1.8" fill="{c['strong']}">
        <animateMotion dur="22s" repeatCount="indefinite" path="M70,0 A70,30 0 1,1 -70,0 A70,30 0 1,1 70,0"/>
      </circle>
    </g>
    <g transform="rotate(16)">
      <circle r="38" fill="{c['mono_bg']}" stroke="{c['mono_ring']}" stroke-width="1"/>
      <text x="0" y="4" text-anchor="middle" font-family="{SERIF}" font-size="21" letter-spacing="2" fill="{c['mono_ink']}">SK</text>
      <line x1="-9" y1="15" x2="9" y2="15" stroke="{c['accent']}" stroke-opacity="0.6" stroke-width="1"/>
    </g>
  </g>

  <rect x="34" y="196" width="7" height="7" transform="rotate(45 37.5 199.5)" fill="none" stroke="{c['accent']}" stroke-opacity="0.8"/>
  <text x="54" y="204" font-family="{MONO}" font-size="15" letter-spacing="4.6" fill="{c['accent']}">DESIGN × CODE</text>

  <text x="32" y="288" font-family="{SERIF}" font-size="58" letter-spacing="0.2" fill="url(#{p}-name)">Sayak Karmakar</text>

  <g class="{p}-breathe">
    <rect x="34" y="306" width="330" height="6" rx="3" fill="{c['wine']}" fill-opacity="0.42" filter="url(#{p}-soft)"/>
  </g>
  <rect x="34" y="309" width="330" height="2.4" rx="1.2" fill="url(#{p}-rule)"/>

  <text x="34" y="348" font-family="{MONO}" font-size="17" letter-spacing="1.5" fill="{c['body']}" fill-opacity="0.96">UI/UX · FULL-STACK · CREATIVE TECHNOLOGIST</text>
  <text x="34" y="380" font-family="{SERIF}" font-size="22" font-style="italic" fill="{c['body']}" fill-opacity="0.74">Calm interfaces, built with care.</text>

  <g font-family="{MONO}" font-size="15" letter-spacing="1.8" fill="{c['accent']}" fill-opacity="0.85">
    <text x="34" y="414">INDIA · REMOTE · OPEN TO COLLABORATION</text>
  </g>

  <rect x="0.6" y="0.6" width="618.8" height="428.8" fill="none" stroke="{c['edge'][0]}" stroke-opacity="{c['edge'][1]}"/>
</svg>
"""


def footer(c: dict) -> str:
    p = c["prefix"]
    return f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 620 240" width="620" height="240" role="img" aria-labelledby="{p}-foot-title {p}-foot-desc">
  <title id="{p}-foot-title">Sayak Karmakar — closing plate</title>
  <desc id="{p}-foot-desc">Compact closing plate reading: Designing quietly, shipping deliberately.</desc>
  <defs>
    <linearGradient id="{p}-foot-bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="{c['bg'][2]}"/>
      <stop offset="1" stop-color="{c['bg'][0]}"/>
    </linearGradient>
    <linearGradient id="{p}-foot-line" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="{c['accent']}" stop-opacity="0"/>
      <stop offset="0.5" stop-color="{c['accent']}" stop-opacity="0.45"/>
      <stop offset="1" stop-color="{c['accent']}" stop-opacity="0"/>
    </linearGradient>
    <radialGradient id="{p}-foot-glow" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="{c['glow'][0]}" stop-opacity="0.4"/>
      <stop offset="1" stop-color="{c['glow'][0]}" stop-opacity="0"/>
    </radialGradient>
    <style>
      @keyframes {p}-foot-pulse {{ 0%, 100% {{ opacity: 0.55; }} 50% {{ opacity: 1; }} }}
      .{p}-foot-pulse {{ animation: {p}-foot-pulse 8s ease-in-out infinite; }}
      @media (prefers-reduced-motion: reduce) {{ .{p}-foot-pulse {{ animation: none; opacity: 0.85; }} }}
    </style>
  </defs>

  <rect width="620" height="240" fill="url(#{p}-foot-bg)"/>
  <ellipse cx="310" cy="222" rx="270" ry="105" fill="url(#{p}-foot-glow)"/>
  <line x1="0" y1="40" x2="620" y2="40" stroke="url(#{p}-foot-line)" stroke-width="1"/>

  <g class="{p}-foot-pulse">
    <rect x="303" y="33" width="14" height="14" transform="rotate(45 310 40)" fill="none" stroke="{c['accent']}" stroke-opacity="0.8" stroke-width="1"/>
    <rect x="307" y="37" width="6" height="6" transform="rotate(45 310 40)" fill="{c['wine']}"/>
  </g>

  <text x="310" y="132" text-anchor="middle" font-family="{SERIF}" font-size="27" font-style="italic" fill="{c['body']}" fill-opacity="0.92">Designing quietly,</text>
  <text x="310" y="164" text-anchor="middle" font-family="{SERIF}" font-size="27" font-style="italic" fill="{c['body']}" fill-opacity="0.92">shipping deliberately.</text>
  <g font-family="{MONO}" font-size="15" letter-spacing="2.4" fill="{c['accent']}" fill-opacity="0.82">
    <text x="310" y="202" text-anchor="middle">SAYAK KARMAKAR</text>
  </g>
</svg>
"""


def main() -> None:
    for colours in (DARK, LIGHT):
        for name, builder in (("sayak-hero-mobile", hero), ("sayak-footer-mobile", footer)):
            path = OUT / f"{name}{colours['suffix']}.svg"
            path.write_text(builder(colours))
            print(f"Wrote {path.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
