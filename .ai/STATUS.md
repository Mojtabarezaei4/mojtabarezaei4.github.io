# Volleyrot – status

**Phase:** Live at https://mojtabarezaei4.github.io/ ; 2026-11-18 update: system order 6-6/5-1/6-2/4-2 (5-1 chart change undone, pending confirmation); Pick your position added
**Last session:** 2026-11-18 (system order; 5-1 chart applied then undone)
**Next step:** Owner commits + pushes the 2026-11-18 changes. Owner confirms the 5-1 chart (transcription ready in `.ai/pending/chart51.ts.txt`); get sources for 6-2/4-2; deferred minors in `.ai/build-ledger.md`.

## Sources of truth (newest wins)

| What | Where | Version / updated | Notes |
|---|---|---|---|
| Visual design + working prototype logic | Canvas https://claude.ai/artifact/G39uxkopfZBCyutwXixjj2 (slug `79c60f73-04d3-41b7-a9ee-2f6c91447955`) | version `1794841504-bf13`, 2026-11-16 16:05 CET | Owner may edit the canvas by hand. If its version differs from this row, it is newer: re-read it and refresh `.ai/design/`. |
| Design mirror (offline copy) | `.ai/design/` | copied from canvas version `1794841504-bf13` (sha256 of each file in `.ai/design/SHA256SUMS`; compare with the canvas list_files sha256 to spot hand edits) | Read-only snapshot. `Animation.dc.html` script = reference algorithms (receive, defense, projection). |
| Spec | `docs/superpowers/specs/2026-11-16-volleyrot-design.md` | 2026-11-16 | Update if the canvas changes behaviour. |
| Implementation plan | `docs/superpowers/plans/2026-11-16-volleyrot-mvp.md` | 2026-11-16, 12/12 tasks done | Build ledger with all rulings and deferred minors: `.ai/build-ledger.md`. |
| Backlog | `BACKLOG.md` | 2026-11-16 | Ideas outside the plan. |
| Code | `src/`, `tests/` | built 2026-11-16 19:xx CET; once in git, `git log -1` | Newest code = newest commit. Live site: https://mojtabarezaei4.github.io/ (user site, Vite base `/`). |

## Canvas artboards
1. `Main.dc.html` – system picker
2. `Animation.dc.html` – rotation player (desktop), interactive
3. `Phone.dc.html` – phone, opens on Receive
4. `PhoneDefense.dc.html` – phone, opens on Defense (imports Phone)

## Known gaps
- The design canvas still shows the old system order; code + spec are newer.
- 6-2 / 4-2 / 6-6 receive is still rule-based (no external source).
- Receive and defense spots are rule-based approximations, not hand-set per rotation (backlog).
- Projection HY is -552 in code (spec said -592) so labels clear the net.
- On phones the two BLOCK tags at the net can overlap slightly.

## Session log
- 2026-11-18 – Pick your position: Follow picker, JobCard (`src/domain/jobs.ts`), token highlight. 186 tests.
- 2026-11-18 – System order 6-6, 5-1, 6-2, 4-2. 5-1 chart applied, then undone at owner's request (kept in `.ai/pending/`).
- 2026-11-16 evening – Built MVP natively from the plan (Vite 8, React 19, TS 7, Vitest 5). Deploy workflow for GitHub Pages at /volleyrot/.
- 2026-11-16 – Designed picker, player, receive, defense, phone views on canvas. Wrote BACKLOG.md, spec, plan, CLAUDE.md, this folder.
- Note: this folder is `.ai/` because writing to `.claude/` on the owner's PC is blocked for remote tools.
