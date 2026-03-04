import math
import json
import sys

def generate_custom_radar(mathematics=8, programming=7, teamwork=6, discipline=5, sociability=9, name=""):
    values = [mathematics, programming, teamwork, discipline, sociability]
    labels = ["MATH", "CODE", "TEAM", "DISC", "SOC"]
    values = [max(0, min(10, v)) for v in values]

    width, height = 500, 500
    center_x, center_y = width // 2, height // 2
    max_radius = 180

    n = len(labels)
    angles = [(2 * math.pi * i) / n - math.pi / 2 for i in range(n)]

    svg = f'''<svg viewBox="0 0 {width} {height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="glow">
      <feGaussianBlur stdDeviation="4" result="g"/>
      <feMerge><feMergeNode in="g"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <filter id="glow-sm">
      <feGaussianBlur stdDeviation="2" result="g"/>
      <feMerge><feMergeNode in="g"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <radialGradient id="data-fill" cx="50%" cy="40%">
      <stop offset="0%" stop-color="#39ff14" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="#0d3b0d" stop-opacity="0.15"/>
    </radialGradient>
  </defs>

  <rect width="{width}" height="{height}" fill="transparent"/>'''

    # Pentagon grid levels
    for level in [2, 4, 6, 8, 10]:
        r = (level / 10) * max_radius
        op = 0.35 if level == 10 else 0.15
        sw = "1" if level == 10 else "0.5"
        pts = " ".join(
            f"{round(center_x + r * math.cos(a), 1)},{round(center_y + r * math.sin(a), 1)}"
            for a in angles
        )
        svg += f'\n  <polygon points="{pts}" fill="none" stroke="#39ff14" stroke-width="{sw}" opacity="{op}"/>'

    # Axis lines
    for a in angles:
        ex = center_x + max_radius * math.cos(a)
        ey = center_y + max_radius * math.sin(a)
        svg += f'\n  <line x1="{center_x}" y1="{center_y}" x2="{round(ex,1)}" y2="{round(ey,1)}" stroke="#39ff14" stroke-width="0.5" opacity="0.25"/>'

    # Data polygon
    data_pts = []
    for v, a in zip(values, angles):
        r = (v / 10) * max_radius
        data_pts.append((center_x + r * math.cos(a), center_y + r * math.sin(a)))
    pts_str = " ".join(f"{round(x,1)},{round(y,1)}" for x, y in data_pts)

    svg += f'\n  <polygon points="{pts_str}" fill="url(#data-fill)" stroke="#39ff14" stroke-width="2" filter="url(#glow)"/>'

    # Data points
    for i, (x, y) in enumerate(data_pts):
        svg += f'''
  <circle cx="{round(x,1)}" cy="{round(y,1)}" r="4" fill="#0a0a0a" stroke="#39ff14" stroke-width="2" filter="url(#glow-sm)">
    <animate attributeName="r" values="4;5.5;4" dur="2.5s" repeatCount="indefinite" begin="{i*0.3}s"/>
  </circle>'''

    # Labels & values
    for label, value, a in zip(labels, values, angles):
        ld = max_radius + 30
        lx = center_x + ld * math.cos(a)
        ly = center_y + ld * math.sin(a) + 4
        svg += f'\n  <text x="{round(lx,1)}" y="{round(ly,1)}" fill="#39ff14" font-family="monospace" font-size="11" font-weight="bold" text-anchor="middle" filter="url(#glow-sm)">{label}</text>'
        svg += f'\n  <text x="{round(lx,1)}" y="{round(ly+14,1)}" fill="#39ff14" font-family="monospace" font-size="10" text-anchor="middle" opacity="0.6">{value}</text>'

    # Center dot
    svg += f'''
  <circle cx="{center_x}" cy="{center_y}" r="3" fill="#39ff14" opacity="0.8" filter="url(#glow-sm)">
    <animate attributeName="opacity" values="0.5;1;0.5" dur="3s" repeatCount="indefinite"/>
  </circle>
</svg>'''

    return svg

def generate_team_radars():
    team_members = [
        {"name": "CHAFITA", "discipline": 6.62, "mathematics": 6.38, "programming": 6.25, "sociability": 8.88, "teamwork": 5.12},
        {"name": "CHAY", "discipline": 3.56, "mathematics": 4.56, "programming": 4.11, "sociability": 7.67, "teamwork": 5.56},
        {"name": "EDREI", "discipline": 3.78, "mathematics": 3.89, "programming": 3.56, "sociability": 4.33, "teamwork": 3.89},
        {"name": "ESTEBAN", "discipline": 6.75, "mathematics": 6.12, "programming": 6.25, "sociability": 5.50, "teamwork": 6.75},
        {"name": "HERBERT", "discipline": 6.00, "mathematics": 5.88, "programming": 6.50, "sociability": 7.75, "teamwork": 7.12},
        {"name": "ISAAC", "discipline": 6.38, "mathematics": 5.25, "programming": 8.50, "sociability": 6.50, "teamwork": 9.50},
        {"name": "JESUS CRUZ", "discipline": 7.33, "mathematics": 7.22, "programming": 7.33, "sociability": 7.66, "teamwork": 7.00},
        {"name": "NICO", "discipline": 4.62, "mathematics": 3.25, "programming": 4.12, "sociability": 7.88, "teamwork": 6.75},
        {"name": "RAMON", "discipline": 5.89, "mathematics": 6.78, "programming": 5.89, "sociability": 4.78, "teamwork": 6.22},
        {"name": "RICHARD", "discipline": 7.25, "mathematics": 7.25, "programming": 9.62, "sociability": 4.62, "teamwork": 8.12},
        {"name": "SAID", "discipline": 8.12, "mathematics": 9.12, "programming": 8.00, "sociability": 6.50, "teamwork": 8.50},
        {"name": "SERGIO", "discipline": 8.12, "mathematics": 8.00, "programming": 6.12, "sociability": 5.12, "teamwork": 7.50},
        {"name": "VALERIA", "discipline": 9.25, "mathematics": 9.25, "programming": 6.38, "sociability": 7.75, "teamwork": 7.50}
    ]
    results = []
    for m in team_members:
        svg = generate_custom_radar(
            mathematics=m['mathematics'], programming=m['programming'],
            teamwork=m['teamwork'], discipline=m['discipline'],
            sociability=m['sociability'], name=m['name']
        )
        results.append({"name": m['name'], "stats": m, "svg": svg})
    return results

if __name__ == "__main__":
    try:
        if len(sys.argv) > 1:
            input_data = json.loads(sys.argv[1])
            stats = input_data.get('stats', input_data)
            svg = generate_custom_radar(
                mathematics=float(stats.get('mathematics', 0)),
                programming=float(stats.get('programming', 0)),
                teamwork=float(stats.get('teamwork', 0)),
                discipline=float(stats.get('discipline', 0)),
                sociability=float(stats.get('sociability', 0)),
                name=input_data.get('name', '')
            )
            response = {"status": "success", "data": [{"name": input_data.get('name'), "stats": input_data, "svg": svg}]}
        else:
            response = {"status": "success", "data": generate_team_radars()}
        print(json.dumps(response))
        sys.exit(0)
    except Exception as e:
        print(json.dumps({"status": "error", "message": str(e)}), file=sys.stderr)
        sys.exit(1)
