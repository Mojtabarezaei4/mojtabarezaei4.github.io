# SDD ledger — plan: docs/superpowers/plans/2026-11-16-volleyrot-mvp.md
Executor: native (executing-plans), branch mvp from main 36c4a93
Pre-flight:
- T2→T3,T5,T6,T7: Player/SystemKey/Zone/Spot/Phase types consumed — consistent.
- T4→T6: overlapViolations(Record<Zone,Spot>) consumed by receive test (spots re-keyed by zone) — consistent.
- T5→T7: spotFor/slotOf/Tag consumed by placePlayers — consistent.
- T6→T7: receiveSpots keyed by Player.id — consistent.
- T7/T8→T9: placePlayers, State, Action, useAutoplay — consistent.
- T9→T10: PlayerScreen({initialSystem}) — consistent.
- T9→T3 Review Focus 3: plan's Task 9 test says "no Libero checkbox" in 6-6 — spec says libero not in 6-6 → consistent.
Task 1: Ruling: template gives Vite 8 / TS 7 / Vitest 5 (plan said Vite 6 / TS 5) — used current versions — low cost, same APIs
Task 1: complete (commits 36c4a93..0d279cb, tests: npx vitest run →    Duration  659ms (environment 74%, setup 16%, tests 4%, transform 3%, import 2%, worker 1%))
Task 2: complete (commits 0d279cb..f7df0d2, tests: npx vitest run →              at least ~528ms faster with isolate: false — reuses workers across files instead of one per file)
Task 3: complete (commits f7df0d2..bde1bcc, tests: npx vitest run →              at least ~1.03s faster with isolate: false — reuses workers across files instead of one per file)
Task 4: Ruling: overlap test uses BASE from formations.ts, so BASE was added in Task 4 (rest of formations in Task 5) — avoids duplicating spots — none
Task 4: complete (commits bde1bcc..40a5848, tests: npx vitest run →              at least ~1.48s faster with isolate: false — reuses workers across files instead of one per file)
Task 5: Ruling: Lineup also tags the zone-1 player SERVE (as in the design) — matches canvas — none
Task 5: complete (commits 40a5848..0d920d4, tests: npx vitest run →              learn more: https://vitest.dev/guide/improving-performance#test-environments)
Task 6: added an extra test: all receive spots stay on our side (d>0) and within x -1..10
Task 6: complete (commits 0d920d4..457abc1, tests: npx vitest run →              learn more: https://vitest.dev/guide/improving-performance#test-environments)
Task 7: Ruling: added useReducedMotion hook + Court tests (passing line only in receive, attack only in defense) — needed by Review Focus 5 and to pin overlays — none
Task 7: Ruling: token size uses CSS var --tok-scale so the phone layout can shrink tokens without new props — none
Task 7: complete (commits 457abc1..4af3a10, tests: npx vitest run →              learn more: https://vitest.dev/guide/improving-performance#test-environments)
Task 8: complete (commits 4af3a10..980bc6b, tests: npx vitest run →              learn more: https://vitest.dev/guide/improving-performance#test-environments)
Task 9: Ruling: 6-6 receive/switch get their own explanation text (W formation / no switch) — design had this for switch only; avoids telling 6-6 users about OH+libero — none
Task 9: complete (commits 980bc6b..4f77cd7, tests: npx vitest run →              learn more: https://vitest.dev/guide/improving-performance#test-environments)
Task 10: Ruling: PlayerScreen keyed by system so a new #/play link restarts state — expected behaviour for links — none
Task 10: complete (commits 4f77cd7..0a56b5c, tests: npx vitest run →              learn more: https://vitest.dev/guide/improving-performance#test-environments)
Task 11: Ruling: projection HY -592 → -552 (spec value) so the top labels clear the net; tests pin antenna > y48 and end label < 855 — visual only — none
Task 11: Ruling: only one top label at a time (NOT SHOWN / OPPONENT SERVES / attack ball) — avoids overlap — none
Task 11: verified with headless Chrome screenshots at 1440x1000 and 390x844: no horizontal scroll, controls docked
Task 11: complete (commits 0a56b5c..7f51544, tests: npx vitest run →              learn more: https://vitest.dev/guide/improving-performance#test-environments)
Task 12: Ruling: node 22 in workflow (plan said 20) — matches local toolchain; Vite 8 needs ≥20.19 — none
Task 12: Ruling: added public/favicon.svg — removes a 404 on every load — none
Task 12: complete (commits 7f51544..ea8457a, tests: npx vitest run →              learn more: https://vitest.dev/guide/improving-performance#test-environments)
Final review: fresh reviewer (fable) — verdict "ready with fixes", 0 critical, 4 important
Final: fixed switch summary said "L serves from zone 1" — tests/view/summary.test.ts RED→GREEN, suite 170/170
Final: fixed tucked setter covered a teammate in receive (offset 0.8→1.3 m) — receive spacing ≥1.2 m test RED(9 cases)→GREEN, suite 170/170
Final: fixed touch targets <44px (pips, phase tabs, slider) — shots/check.py browser check RED→GREEN
Final: fixed tokens not scaling with court at 641–900px — container query units (cqw) with px floors; check.py ratio test RED→GREEN
Final: minor (deferred): rotation counter <output> is a live region (announces every tick)
Final: minor (deferred): receive copy says "the libero" even when libero is off
Final: minor (deferred): 6-6 W passers sit partly outside the PASSING LINE band
Final: minor (deferred): URL not updated when switching system chips
Final: minor (deferred): picker legend omits P (Player)
Final: minor (deferred): phone header overflows at 320px wide
Final: minor (deferred): autoplay timer not reset on phase change
Final: minor (deferred): spec still says HY -592 (code -552)
Final: minor (deferred): display:contents may drop landmarks in old Safari; no h1 on player screen
Final: minor (deferred): picker card hover animation ignores reduced motion
Final: Ruling: autoplay stays on under reduced motion — spec only asks for no transitions; tokens jump instead of glide — a motion-sensitive user may still want autoplay off
Final: Ruling: libero never serves (FIVB-style) — spec rule; US school/club rules allow one rotation — wrong for US rec players
