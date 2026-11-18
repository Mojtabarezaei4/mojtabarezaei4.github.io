# Volleyrot – backlog

Status: `[x]` built (MVP, branch `mvp`) · `[~]` in progress · `[ ]` not started

## Built in the MVP
- [x] System picker (6-6, 5-1, 6-2, 4-2)
- [x] Tilted court view, our half only, net at the top
- [x] Colour-coded tokens with short codes + full-name legend
- [x] Rotation counter (1–6) with jump buttons
- [x] Play / pause / step, adjustable speed slider
- [x] Libero toggle (replaces back-row middle)
- [x] Phases: Lineup · Serve · Receive · Switch
- [x] Defense mode (perimeter defense, attack from left / middle / right)
- [x] Phone view

- [x] Picker cards open the player already set to that system
- [x] GitHub Pages deploy workflow
- [x] Pick your position – follow one player: highlight, "your job" note per rotation/phase, zone path (2026-11-18)

## Next up
- [ ] 5-1 serve + serve receive from the owner's chart – applied then undone 2026-11-18, waiting for owner to confirm the chart (data in `.ai/pending/chart51.ts.txt`)
- [ ] 6-2 and 4-2 (and 6-6) serve receive from a trusted chart/source, like the 5-1
- [ ] Quiz mode – hide labels, drag tokens to the right spot, get checked

## Later
- [ ] Overlap checker – drag freely, flag illegal positions and explain which neighbours are out of order
- [ ] Rally playback – serve → pass → set → attack → transition, with the ball
- [ ] More defenses – rotational defense, middle-up, single vs. double block
- [ ] Formation editor – let a coach adjust spots and save a team playbook
- [ ] Rules cards – libero, back-row attack, overlap, substitutions, linked to the moment they apply
- [ ] Offline / installable (PWA) for courtside use
- [ ] Custom domain: add `public/CNAME` (base is already `/`), DNS at registrar, verify domain, enforce HTTPS

## Open questions
- Which rule set to follow (FIVB vs. school/club, e.g. libero serving)?
- Web app only, or also native phone app?
