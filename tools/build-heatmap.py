#!/usr/bin/env python3
"""Build assets/sayak-contributions.svg from a real GitHub contribution snapshot.

The SVG is generated only from assets/data/contributions-snapshot.json.
Nothing here invents activity: if the snapshot and its declared total disagree,
the script exits with an error instead of drawing a misleading chart.

Refresh workflow
----------------
1. Replace the snapshot with a fresh GraphQL response, e.g.:

   gh api graphql -f query='
     query { user(login:"codewithsayak") {
       contributionsCollection { contributionCalendar {
         totalContributions
         weeks { contributionDays { date contributionCount } }
       } }
     } }' --jq '.data.user.contributionsCollection.contributionCalendar' \
     > assets/data/contributions-snapshot.json

2. Run: python3 tools/build-heatmap.py
"""

from __future__ import annotations

import html
import json
import sys
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SNAPSHOT = ROOT / "assets" / "data" / "contributions-snapshot.json"
OUTPUT = ROOT / "assets" / "sayak-contributions.svg"

# Geometry
WIDTH, HEIGHT = 1000, 286
GRID_X, GRID_Y = 88, 112
CELL, STEP = 13.0, 16.4
LABEL_COLOR = "#C77B9B"

# Colour ramp: 0 (empty) -> 4 (busiest). Order is dark to light.
FILLS = ["#1B0E15", "#5C1633", "#7E1F45", "#A83A5E", "#E0A6BC"]
STROKES = ["#241320", "#5C1633", "#7E1F45", "#A83A5E", "#E0A6BC"]


def level(count: int) -> int:
    if count <= 0:
        return 0
    if count == 1:
        return 1
    if count <= 3:
        return 2
    if count <= 9:
        return 3
    return 4


def month_labels(weeks: list[list[dict]]) -> list[tuple[float, str]]:
    """One label per month, dropped when it would collide with its neighbour."""
    labels: list[tuple[float, str]] = []
    previous = None
    for index, week in enumerate(weeks):
        first = date.fromisoformat(week[0]["date"])
        if first.month == previous:
            continue
        previous = first.month
        x = GRID_X + index * STEP
        if labels and x - labels[-1][0] < 3 * STEP:  # ~49px: too tight to read
            continue
        labels.append((x, first.strftime("%b")))
    return labels


DARK = {
    "path": OUTPUT,
    "prefix": "heat",
    "bg": ["#190B12", "#150A10", "#10070C"],
    "glow": ["#701A3D", 0.42],
    "border": "#E5B5C7",
    "title": "#F8F0F3",
    "label": "#C77B9B",
    "fills": FILLS,
    "strokes": STROKES,
}

LIGHT = {
    "path": ROOT / "assets" / "sayak-contributions-light.svg",
    "prefix": "heatl",
    "bg": ["#F8F0F3", "#F4E6EC", "#EFDCE4"],
    "glow": ["#C77B9B", 0.28],
    "border": "#701A3D",
    "title": "#451126",
    "label": "#701A3D",
    "fills": ["#F1DEE5", "#E5B5C7", "#C77B9B", "#9C2A52", "#701A3D"],
    "strokes": ["#E2C8D3", "#D9A8BC", "#B3668A", "#8C2549", "#610F31"],
}

THEMES = [DARK, LIGHT]


def render(theme, weeks, days, total, *, start, end, captured) -> str:
    fills, strokes, prefix = theme["fills"], theme["strokes"], theme["prefix"]
    cells: list[str] = []
    for column, week in enumerate(weeks):
        for row, day in enumerate(week):
            x = GRID_X + column * STEP
            y = GRID_Y + row * STEP
            count = day["count"]
            value = level(count)
            when = date.fromisoformat(day["date"]).strftime("%a, %d %b %Y").lstrip("0")
            noun = "contribution" if count == 1 else "contributions"
            cells.append(
                f'    <rect x="{x:.1f}" y="{y:.1f}" width="{CELL:g}" height="{CELL:g}" '
                f'rx="2.6" fill="{fills[value]}" stroke="{strokes[value]}" stroke-width="0.8">'
                f"<title>{html.escape(f'{when} — {count} {noun}')}</title></rect>"
            )

    labels = month_labels(weeks)
    months = "\n".join(f'    <text x="{x:.1f}" y="98">{name}</text>' for x, name in labels)
    weekdays = "\n".join(
        f'    <text x="60" y="{GRID_Y + row * STEP + 10.6:.1f}" text-anchor="end">{name}</text>'
        for row, name in ((1, "Mon"), (3, "Wed"), (5, "Fri"))
    )

    legend_x = WIDTH - 210
    legend = "\n".join(
        f'      <rect x="{legend_x + 44 + index * (CELL + 5):.1f}" y="254" width="{CELL:g}" '
        f'height="{CELL:g}" rx="2.6" fill="{fills[index]}" stroke="{strokes[index]}" stroke-width="0.8"/>'
        for index in range(len(fills))
    )

    return f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {WIDTH} {HEIGHT}" width="{WIDTH}" height="{HEIGHT}" role="img" aria-labelledby="{prefix}-title {prefix}-desc">
  <title id="{prefix}-title">GitHub contribution activity for codewithsayak</title>
  <desc id="{prefix}-desc">Public GitHub contributions between {start.strftime('%d %B %Y')} and {end.strftime('%d %B %Y')}: {total} contributions in total. Illustration generated from a verified snapshot captured {captured}.</desc>
  <defs>
    <linearGradient id="{prefix}-bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="{theme['bg'][0]}"/>
      <stop offset="0.6" stop-color="{theme['bg'][1]}"/>
      <stop offset="1" stop-color="{theme['bg'][2]}"/>
    </linearGradient>
    <radialGradient id="{prefix}-glow" cx="0.82" cy="0.15" r="0.7">
      <stop offset="0" stop-color="{theme['glow'][0]}" stop-opacity="{theme['glow'][1]}"/>
      <stop offset="1" stop-color="{theme['bg'][0]}" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="{prefix}-rule" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="{theme['label']}" stop-opacity="0.55"/>
      <stop offset="1" stop-color="{theme['label']}" stop-opacity="0"/>
    </linearGradient>
  </defs>

  <rect width="{WIDTH}" height="{HEIGHT}" rx="18" fill="url(#{prefix}-bg)"/>
  <rect width="{WIDTH}" height="{HEIGHT}" rx="18" fill="url(#{prefix}-glow)"/>
  <rect x="0.6" y="0.6" width="{WIDTH - 1.2}" height="{HEIGHT - 1.2}" rx="17.4" fill="none" stroke="{theme['border']}" stroke-opacity="0.14"/>

  <text x="40" y="44" font-family="'Iowan Old Style','Palatino Linotype',Palatino,Georgia,'DejaVu Serif',serif" font-size="20" letter-spacing="2.4" fill="{theme['title']}">Contribution Activity</text>
  <text x="41" y="67" font-family="ui-monospace,'SFMono-Regular',Menlo,Consolas,'DejaVu Sans Mono',monospace" font-size="11" letter-spacing="1.7" fill="{theme['label']}">{start.strftime('%d %b %Y').lstrip('0')} → {end.strftime('%d %b %Y').lstrip('0')} · {total} PUBLIC CONTRIBUTIONS</text>
  <line x1="40" y1="80" x2="{WIDTH - 40}" y2="80" stroke="url(#{prefix}-rule)" stroke-width="1"/>

  <g font-family="ui-monospace,'SFMono-Regular',Menlo,Consolas,'DejaVu Sans Mono',monospace" font-size="10.5" letter-spacing="1.4" fill="{theme['label']}" fill-opacity="0.85">
{months}
  </g>
  <g font-family="ui-monospace,'SFMono-Regular',Menlo,Consolas,'DejaVu Sans Mono',monospace" font-size="10" letter-spacing="1.1" fill="{theme['label']}" fill-opacity="0.6">
{weekdays}
  </g>

  <g>
{chr(10).join(cells)}
  </g>

  <g font-family="ui-monospace,'SFMono-Regular',Menlo,Consolas,'DejaVu Sans Mono',monospace" font-size="10" letter-spacing="1.5" fill="{theme['label']}" fill-opacity="0.65">
    <text x="40" y="262">SNAPSHOT {captured} · PUBLIC ACTIVITY ONLY</text>
    <text x="{legend_x}" y="262">LESS</text>
{legend}
    <text x="{legend_x + 44 + len(fills) * (CELL + 5) + 6:.0f}" y="262">MORE</text>
  </g>
</svg>
"""

def main() -> int:
    data = json.loads(SNAPSHOT.read_text())
    weeks = [week["contributionDays"] for week in data["weeks"]]
    days = [day for week in weeks for day in week]
    total = sum(day["count"] for day in days)

    declared = data.get("total_contributions")
    if declared is not None and declared != total:
        print(
            f"Snapshot mismatch: file says {declared} contributions, days sum to {total}.",
            file=sys.stderr,
        )
        return 1

    start_d = date.fromisoformat(days[0]["date"])
    end_d = date.fromisoformat(days[-1]["date"])
    captured = data.get("captured_at_utc", end_d.isoformat())

    cells: list[str] = []
    for column, week in enumerate(weeks):
        for row, day in enumerate(week):
            x = GRID_X + column * STEP
            y = GRID_Y + row * STEP
            count = day["count"]
            value = level(count)
            when = date.fromisoformat(day["date"]).strftime("%a, %d %b %Y").lstrip("0")
            noun = "contribution" if count == 1 else "contributions"
            cells.append(
                f'    <rect x="{x:.1f}" y="{y:.1f}" width="{CELL:g}" height="{CELL:g}" '
                f'rx="2.6" fill="{FILLS[value]}" stroke="{STROKES[value]}" stroke-width="0.8">'
                f"<title>{html.escape(f'{when} — {count} {noun}')}</title></rect>"
            )

    labels = month_labels(weeks)
    months = "\n".join(
        f'    <text x="{x:.1f}" y="98">{name}</text>' for x, name in labels
    )
    weekdays = "\n".join(
        f'    <text x="60" y="{GRID_Y + row * STEP + 10.6:.1f}" text-anchor="end">{name}</text>'
        for row, name in ((1, "Mon"), (3, "Wed"), (5, "Fri"))
    )

    legend_x = WIDTH - 210
    legend = "\n".join(
        f'      <rect x="{legend_x + 44 + index * (CELL + 5):.1f}" y="254" width="{CELL:g}" '
        f'height="{CELL:g}" rx="2.6" fill="{FILLS[index]}" stroke="{STROKES[index]}" stroke-width="0.8"/>'
        for index in range(len(FILLS))
    )

    for theme in THEMES:
        svg = render(theme, weeks, days, total, start=start_d, end=end_d, captured=captured)
        target = theme["path"]
        target.write_text(svg)
        print(f"Wrote {target.relative_to(ROOT)} — {len(weeks)} weeks, {total} contributions.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
