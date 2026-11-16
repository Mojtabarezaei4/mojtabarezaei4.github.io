# Volleyrot – instructions for Claude

Before doing anything in this project, read `.ai/STATUS.md`. It says which place holds the newest version of each thing (design canvas, local files, code) and what to do next.

Rules:
1. **Find the latest first.** For each item in the STATUS "Sources of truth" table, compare the timestamps/versions listed there with what you can see (canvas version via the artifact tools, file dates, `git log`). Work from whichever is newest. If the canvas is newer than `.ai/design/`, refresh the mirror before using it.
2. **Update STATUS.md at the end of every session**: what changed, new versions/timestamps, next step. Log real decisions in `.ai/decisions.md`.
3. The owner is a volleyball beginner: explain volleyball terms in plain words, keep UI copy simple.
4. Plan to execute: `docs/superpowers/plans/2026-11-16-volleyrot-mvp.md` (spec next to it in `docs/superpowers/specs/`). Ideas not in the plan go to `BACKLOG.md`.
5. Don't start building features the owner hasn't asked for; ask when the next step isn't in STATUS.md.
