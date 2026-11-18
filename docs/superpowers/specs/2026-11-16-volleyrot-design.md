# Volleyrot – design spec

Date: 2026-11-16 · Status: approved design, not built
Visual source: canvas https://claude.ai/artifact/G39uxkopfZBCyutwXixjj2 (mirror in `.ai/design/`)

## Purpose
A web app that teaches a beginner how volleyball rotations, serve receive, the switch and defense work, by animating one team on a tilted court.

## Screens
1. **System picker** – four systems, in this order (changed 2026-11-18): 6-6 (Start here), 5-1 (Most common), 6-2 (Intermediate), 4-2 (Recreational). System chips use the same order. Each card: mini lineup, one-line explanation, "Watch it rotate →". Also a zone map (4-3-2 front, 5-6-1 back, zone 1 serves) and a "Who's who" legend. A card opens the player **already set to that system**.
2. **Rotation player** – desktop: header (brand, system chips, rotation counter with jump 1–6 and "who sets" line, phase tabs), court, control bar, sidebar (phase explanation, legend with full names, front/back row of this rotation + server/passers/blockers line).
3. **Phone layout** of the player (≤640 px wide): header with system chips, counter row, scrolling middle (court, phase tabs, attack chooser, info card, compact legend), docked bottom controls (prev, play/pause, next, libero "L" toggle, speed slider).

## Court
- Our half only, seen from behind our end line, net at the top; opponent side not shown (label "OPPONENT SIDE · NOT SHOWN").
- Perspective projection (meters → SVG 1000×860): `s = 1322 / (26 − d)`, `x' = 500 + (x − 4.5)·s`, `y' = −592 + (15.4 − z)·s`. x = 0..9 across (left→right), d = meters from net (0 net, 9 end line), z = height.
- Draw: free zone, court, front-zone tint, zone dividers at x=3 and x=6 (dashed), attack line at d=3 with dashed extensions, floor zone numerals (zone 1 amber), dashed clockwise rotation loop (toggleable), net (band z 1.43–2.43, mesh, tape), posts at x=−1 and x=10, red/white antennae at x=0 and x=9 up to z 3.23, "YOUR END LINE" label.

## Players
- Tokens: colored disc with short code, stem and floor shadow, scaled by `s/70`, standing on their floor point; optional tag pill above (SERVE, PASS, SETS, BLOCK, TIP, LINE, CROSS, DIG, DEEP).
- Roles and colors: S Setter `#FFD84D`, OH Outside Hitter `#5CE1E6`, MB Middle Blocker `#A3E635`, OPP Opposite `#FF6F59`, L Libero `#C4A1FF`, P Player (6-6) `#E6E1D6`.
- Starting lineups (zone → code), setter in zone 1:
  - 5-1: 1 S, 2 OH1, 3 MB1, 4 OPP, 5 OH2, 6 MB2
  - 6-2 and 4-2: 1 S1, 2 OH1, 3 MB1, 4 S2, 5 OH2, 6 MB2
  - 6-6: zone n → Pn
- Rotation: clockwise, each step zone 2→1, 1→6, 6→5, 5→4, 4→3, 3→2. Rotation N = N−1 steps.
- Who sets: 5-1 the S always; 6-2 the back-row S; 4-2 the front-row S; 6-6 whoever is in zone 3.
- Libero (toggle, default on, not in 6-6): replaces the back-row MB; in zone 1 the MB stays during Lineup and Serve, the libero is shown in Receive, Switch, Defense.

## Phases
| Phase | Positions |
|---|---|
| Lineup | base zone spots: front d=2.0, back d=6.4, x = 1.5 / 4.5 / 7.5 |
| Serve | as Lineup, zone-1 player at (7.6, 10.5), tag SERVE |
| Receive | 3 passers (both OH + back MB/L) on a passing line; others stacked at net or tucked; setter-who-sets tucked behind front partner; must pass the overlap rule. 6-6: 5-person W, zone 3 at net. Passing band shown, "OPPONENT SERVES". |
| Switch | specialist spots FL(1.1,1.5) FM(4.5,1.1) FR(7.9,1.5) SET(6.1,0.9) BL(1.8,6.9) BM(4.5,7.7) BR(7.2,6.9); 6-6 stays in Lineup spots |
| Defense | perimeter defense, attack from left / middle / right (screen side); see defense table in the design script `DEF`; attack ball + line and cross arrows |

**Rally** (added 2026-11-18): one side-out point – Serve (opponent serves to the middle passer), Pass (to the setter's target), Set (high to the front-row outside hitter; 6-6: zone-4 player), Attack (over the net, two nearest teammates COVER), Base (switch spots). The ball flies in a parabola with a floor shadow and must stay inside the picture. Autoplay: one step every `1800 / speed` ms, after Base the team rotates.

Ghost rings (dashed, at the player's official zone spot) show in every phase except Lineup.

## Controls
- Prev / Play-Pause / Next, jump 1–6, phase tabs, system chips, attack chooser (Defense only), libero toggle.
- Speed slider 0.25×–2× step 0.25, default 1×. Movement duration `950 / speed` ms; autoplay advances one rotation every `2600 / speed` ms. Autoplay on by default.

## Visual system
Ground `#0F1318`, panel `#171C23`, border `#2A313B`, text `#EDE8DF`, secondary `#C9C3B8`, muted `#9AA3AE`, accent amber `#FFB24D`, court `#2E5E8E`, front zone `#336898`, free zone `#1E3A57`. Fonts: Barlow Condensed (display), Barlow (body), JetBrains Mono (numbers/labels). Touch targets ≥ 44 px, text contrast ≥ 4.5:1, no emoji, icons are inline stroke SVG.

## Out of scope for MVP
Everything in BACKLOG.md under "Next up" and "Later".
