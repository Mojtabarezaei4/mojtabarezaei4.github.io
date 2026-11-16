# Volleyrot MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Volleyrot rotation trainer as a static web app matching the approved design: system picker, animated tilted-court player with five phases, desktop and phone layouts.

**Architecture:** A pure TypeScript domain layer (`src/domain`) turns `(system, rotation, phase, attack, libero)` into placed players; it has no React and carries most tests. A view layer (`src/view`) projects court meters to SVG and renders the court, tokens and controls in React. App state is one `useReducer`; routing is a hash (`#/` picker, `#/play?system=5-1`).

**Tech Stack:** Vite 6, React 19, TypeScript 5 (strict), Vitest + @testing-library/react + jsdom, plain CSS with custom properties. No UI library, no router library.

**Spec:** `docs/superpowers/specs/2026-11-16-volleyrot-design.md`. Visual reference and the working prototype logic: `.ai/design/Animation.dc.html` (script block: `receive()`, `DEF`, `slotOf()`, `geometry()` are the reference algorithms; port them, don't reinvent).

## Global Constraints
- Node ≥ 20; package manager npm.
- Rotation order clockwise: 2→1, 1→6, 6→5, 5→4, 4→3, 3→2.
- Projection: `s = 1322/(26−d)`, `x' = 500+(x−4.5)·s`, `y' = −592+(15.4−z)·s`, viewBox `0 0 1000 860`.
- Speed 0.25–2, step 0.25, default 1. Move duration `950/speed` ms. Autoplay interval `2600/speed` ms.
- Colors, fonts and role codes exactly as the spec's "Visual system" and "Players" sections.
- Touch targets ≥ 44 px; text contrast ≥ 4.5:1; every control is a real `<button>`/`<input>` with a label.
- Phone layout at viewport width ≤ 640 px.

## Review Focus
1. Changing system while autoplay runs → rotation resets to 1, phase is kept, no second timer starts. (Task 8 test)
2. Moving the speed slider while playing → the next tick uses the new interval; still exactly one pending timer. (Task 8 test)
3. Libero toggle in 6-6 → toggle is hidden and no player shows as L. (Task 3 test, Task 9 test)
4. Leaving the player screen → autoplay timer is cleared. (Task 8 test)
5. `prefers-reduced-motion: reduce` → tokens jump with no transition. (Task 7 test)

## File Structure
```
src/domain/types.ts        Role, SystemKey, Phase, Attack, Zone, Spot, Player, PlacedPlayer
src/domain/systems.ts      SYSTEMS (lineups, legend roles), ROLE_INFO (name, color, job)
src/domain/rotation.ts     rotZone, playersAt
src/domain/roles.ts        displayRole (libero), setsThisRally
src/domain/overlap.ts      overlapViolations
src/domain/formations.ts   spotsFor(phase,…) – lineup, serve, switch, defense
src/domain/receive.ts      receiveSpots
src/domain/place.ts        placePlayers – single entry point for the view
src/view/projection.ts     project, courtGeometry
src/view/Court.tsx         SVG court, net, overlays per phase
src/view/Tokens.tsx        player tokens + ghost rings
src/view/Controls.tsx      transport, speed, libero, attack chooser
src/view/Header.tsx        system chips, RotationCounter, PhaseTabs
src/view/Sidebar.tsx       phase text, legend, rotation info
src/view/PlayerScreen.tsx  layout (desktop + phone via CSS)
src/view/PickerScreen.tsx  system picker
src/state/reducer.ts       State, Action, reducer, initialState
src/state/useAutoplay.ts   autoplay hook
src/app/App.tsx            hash routing
src/styles/tokens.css, src/styles/app.css
tests mirror src under tests/
```

---

### Task 1: Scaffold project

**Files:** Create `package.json`, `vite.config.ts`, `tsconfig.json`, `index.html`, `src/main.tsx`, `src/app/App.tsx`, `src/styles/tokens.css`, `tests/app/App.test.tsx`, `.gitignore`

**Interfaces:** Produces `App(): JSX.Element`; CSS variables `--ground --panel --border --text --text-2 --muted --accent --court --court-front --free` and font stacks `--f-display --f-body --f-mono`.

- [x] **Step 1:** `git init`; `npm create vite@latest . -- --template react-ts`; add `vitest @testing-library/react @testing-library/jest-dom jsdom`; Vitest `environment: 'jsdom'`.
- [x] **Step 2: Failing test** `tests/app/App.test.tsx` – `renders brand`: `render(<App/>)`; expect `getByText('VOLLEYROT')`.
- [x] **Step 3:** Run `npx vitest run` → FAIL.
- [x] **Step 4:** App renders a header with `VOLLEYROT`; `tokens.css` holds the spec colors; Google Fonts link for Barlow Condensed 500–800, Barlow 400–600, JetBrains Mono 500/700 in `index.html`.
- [x] **Step 5:** `npx vitest run` → PASS; `npm run build` succeeds.
- [x] **Step 6:** Commit `chore: scaffold vite react ts app`.

### Task 2: Domain types, systems, rotation

**Files:** Create `src/domain/types.ts`, `systems.ts`, `rotation.ts`; Test `tests/domain/rotation.test.ts`

**Interfaces:**
- `type SystemKey = '5-1'|'6-2'|'4-2'|'6-6'`; `type Role = 'S'|'OH'|'MB'|'OPP'|'L'|'P'`; `type Zone = 1|2|3|4|5|6`; `type Phase = 'lineup'|'serve'|'receive'|'switch'|'defense'`; `type Attack = 'left'|'middle'|'right'`; `type Spot = { x: number; d: number }`
- `interface Player { id: string; code: string; role: Role; startZone: Zone; zone: Zone; front: boolean }` (`id` = start code, stable across rotations – the view keys on it)
- `SYSTEMS: Record<SystemKey, { start: Record<Zone,string>; legend: Role[] }>`; `ROLE_INFO: Record<Role,{name:string;color:string;job:string}>`
- `rotZone(z: Zone, steps: number): Zone`; `playersAt(system: SystemKey, rotation: number): Player[]` (rotation 0–5, always returned in start-zone order 1..6)

- [x] **Step 1: Failing tests:** `rotZone(2,1)===1`, `rotZone(1,1)===6`, `rotZone(3,6)===3`; `playersAt('5-1',0)` S in zone 1; `playersAt('5-1',1)` S in zone 6; `playersAt('5-1',5)` S in zone 2; every rotation of every system has zones {1..6} exactly once; `playersAt('5-1',3).map(p=>p.id)` equals `playersAt('5-1',0).map(p=>p.id)` (order stable).
- [x] **Step 2:** Run → FAIL. **Step 3:** Implement; lineups and ROLE_INFO copied from spec. **Step 4:** Run → PASS. **Step 5:** Commit `feat(domain): systems and rotation`.

### Task 3: Display role and who sets

**Files:** Create `src/domain/roles.ts`; Test `tests/domain/roles.test.ts`

**Interfaces:** `displayRole(p: Player, system: SystemKey, phase: Phase, libero: boolean): { role: Role; code: string }`; `setsThisRally(p: Player, system: SystemKey): boolean`

- [x] **Step 1: Failing tests:** 5-1 rot 0, MB2 (zone 6) with libero → `{role:'L',code:'L'}`; libero off → MB2; MB in zone 1 phase `serve` → MB, phase `receive` → L; 6-6 libero on → never L (Review Focus 3); `setsThisRally`: 5-1 S always true; 6-2 rot 0 S1 (zone 1) true, S2 (zone 4) false; 4-2 rot 0 S2 true; 6-6 only the zone-3 player.
- [x] **Step 2–4:** FAIL → implement per spec "Libero" and "Who sets" → PASS. **Step 5:** Commit `feat(domain): libero and setter rules`.

### Task 4: Overlap checker

**Files:** Create `src/domain/overlap.ts`; Test `tests/domain/overlap.test.ts`

**Interfaces:** `overlapViolations(spots: Record<Zone, Spot>): string[]` – checks left/right order in each row (4<3<2, 5<6<1 by x) and front ahead of back in pairs (4/5, 3/6, 2/1 by d). Messages like `"zone 4 must be left of zone 3"`. Empty array = legal.

- [x] **Step 1: Failing tests:** base lineup spots → `[]`; swap x of zones 4 and 3 → contains `"zone 4 must be left of zone 3"`; zone 2 at d 7, zone 1 at d 6.4 → contains `"zone 2 must be in front of zone 1"`.
- [x] **Step 2–4:** FAIL → implement → PASS. **Step 5:** Commit `feat(domain): overlap rule checker`.

### Task 5: Lineup, serve, switch, defense spots

**Files:** Create `src/domain/formations.ts`; Test `tests/domain/formations.test.ts`

**Interfaces:** `BASE: Record<Zone,Spot>`, `SERVE_SPOT`, `SWITCH_SPOT`, `DEFENSE: Record<Attack, Record<Slot,{spot:Spot;job:Tag}>>` (values from spec / design `DEF`); `type Slot = 'FL'|'FM'|'FR'|'BL'|'BM'|'BR'`; `type Tag = 'SERVE'|'PASS'|'SETS'|'BLOCK'|'TIP'|'LINE'|'CROSS'|'DIG'|'DEEP'`; `slotOf(p: Player, system: SystemKey): Slot`; `spotFor(p: Player, ctx: { system: SystemKey; phase: Exclude<Phase,'receive'>; attack: Attack }): { spot: Spot; tag?: Tag }`

- [x] **Step 1: Failing tests:** serve: zone-1 player at (7.6,10.5) tag SERVE; switch 5-1 rot 3 (S front) S at FR spot, rot 0 S at SET; switch 6-6 equals BASE; defense right 5-1 rot 0: OPP (slot FR) tag BLOCK and MB1 (slot FM) tag BLOCK, OH1 (slot FL) tag TIP, back MB/L tag DEEP; defense middle exactly one BLOCK.
- [x] **Step 2–4:** FAIL → port from design script → PASS. **Step 5:** Commit `feat(domain): phase formations`.

### Task 6: Serve receive

**Files:** Create `src/domain/receive.ts`; Test `tests/domain/receive.test.ts`

**Interfaces:** `receiveSpots(system: SystemKey, rotation: number): { spots: Record<string, Spot>; passers: Set<string> }` keyed by `Player.id`.

- [x] **Step 1: Failing tests:** for every system × rotation 0–5: `overlapViolations` of the spots (re-keyed by current zone) is `[]`; passers count is 3 (5 in 6-6); in 5-1/6-2/4-2 passers are exactly the two OH plus the back-row MB.
- [x] **Step 2–4:** FAIL → port `receive()` from the design script (rule placement + order/depth correction) → PASS. If any case fails the overlap test, fix the correction pass, not the test. **Step 5:** Commit `feat(domain): serve receive formations`.

### Task 7: Placement, projection, court and tokens

**Files:** Create `src/domain/place.ts`, `src/view/projection.ts`, `src/view/Court.tsx`, `src/view/Tokens.tsx`, `src/styles/app.css`; Tests `tests/domain/place.test.ts`, `tests/view/projection.test.ts`, `tests/view/Tokens.test.tsx`

**Interfaces:**
- `interface PlacedPlayer extends Player { show: {role:Role; code:string; color:string}; spot: Spot; home: Spot; tag?: Tag }`
- `placePlayers(s: { system; rotation; phase; attack; libero }): PlacedPlayer[]` (start-zone order)
- `project(x:number, d:number, z?:number): {x:number;y:number;s:number}`; `courtGeometry(): CourtGeometry` (all strings/segments `Court` needs)
- `<Court phase attack showPath />`, `<Tokens players={PlacedPlayer[]} durationMs showGhosts />`

- [x] **Step 1: Failing tests:** `project(4.5,0).x===500`; width at d=9 > width at d=0; `placePlayers` receive 5-1 rot 0 has 3 tags PASS and one SETS; Tokens renders 6 tokens whose `data-id` stays stable across rerender with new rotation; with `matchMedia('(prefers-reduced-motion: reduce)')` mocked true, token style has `transition: none` (Review Focus 5).
- [x] **Step 2–4:** FAIL → implement (token left/top as % of 1000×860, `scale(s/70)`, CSS transition on left/top/transform for `durationMs`) → PASS. **Step 5:** Commit `feat(view): court projection and tokens`.

### Task 8: State and autoplay

**Files:** Create `src/state/reducer.ts`, `src/state/useAutoplay.ts`; Tests `tests/state/reducer.test.ts`, `tests/state/useAutoplay.test.tsx`

**Interfaces:**
- `interface State { system:SystemKey; rotation:number; phase:Phase; attack:Attack; libero:boolean; playing:boolean; speed:number }`; `initialState(system?: SystemKey): State` (rotation 0, phase lineup, attack right, libero true, playing true, speed 1)
- `type Action = {type:'next'}|{type:'prev'}|{type:'jump';rotation:number}|{type:'system';system:SystemKey}|{type:'phase';phase:Phase}|{type:'attack';attack:Attack}|{type:'libero';on:boolean}|{type:'toggle'}|{type:'speed';speed:number}`
- `useAutoplay(state: State, dispatch: Dispatch<Action>): void`

- [x] **Step 1: Failing tests:** next from 5 → 0, prev from 0 → 5; `system` resets rotation to 0 and keeps phase (Review Focus 1); speed clamps to [0.25,2]. Hook with fake timers: after 2600 ms one `next`; set speed 2 → next `next` after 1300 ms and `vi.getTimerCount()===1` (Review Focus 2); `toggle` to paused → no dispatch after 10 s; unmount → `vi.getTimerCount()===0` (Review Focus 4); system change while playing → still one timer.
- [x] **Step 2–4:** FAIL → implement (single `setTimeout` re-armed in an effect keyed on `playing, speed, rotation, system`) → PASS. **Step 5:** Commit `feat(state): reducer and autoplay`.

### Task 9: Player screen (desktop)

**Files:** Create `src/view/Header.tsx`, `Controls.tsx`, `Sidebar.tsx`, `PlayerScreen.tsx`; Test `tests/view/PlayerScreen.test.tsx`

**Interfaces:** `PlayerScreen({ initialSystem }: { initialSystem: SystemKey })`. Copy and texts: phase titles/texts from the design script `PHASE_TXT`; sidebar line: Serve/Lineup `"<code> serves from zone 1."`, Receive `"Opponent serves. <a>, <b>, <c> take the pass."`, Defense `"Attack from the <side>. <a> + <b> block."`.

- [x] **Step 1: Failing tests:** click "Next rotation" → counter shows `2`; click rotation `4` → counter `4`; click tab Defense → buttons Left/Middle/Right visible, hidden on Lineup; system 6-6 → no "Libero" checkbox (Review Focus 3); speed slider change to 2 → label `2×`; legend lists "Setter" and "Libero" for 5-1.
- [x] **Step 2–4:** FAIL → implement matching the canvas artboard "2 · Rotation player" → PASS. **Step 5:** Commit `feat(view): rotation player screen`.

### Task 10: Picker screen and routing

**Files:** Create `src/view/PickerScreen.tsx`; Modify `src/app/App.tsx`; Test `tests/app/routing.test.tsx`

**Interfaces:** `parseRoute(hash: string): { screen:'picker' } | { screen:'play'; system:SystemKey }` (unknown system → `'5-1'`); cards link to `#/play?system=<key>`.

- [x] **Step 1: Failing tests:** `parseRoute('')` → picker; `parseRoute('#/play?system=6-2')` → play 6-2; `parseRoute('#/play?system=9-9')` → 5-1; rendering App at `#/play?system=4-2` shows the 4-2 chip pressed.
- [x] **Step 2–4:** FAIL → implement matching artboard "1 · Choose a system" → PASS. **Step 5:** Commit `feat(app): system picker and hash routing`.

### Task 11: Phone layout

**Files:** Modify `src/styles/app.css`, `src/view/PlayerScreen.tsx`

- [x] **Step 1:** Add `@media (max-width: 640px)` layout per artboards "3 · Phone – receive" / "4 · Phone – defense": header row, counter row, scrolling middle, docked bottom controls (`position: sticky; bottom: 0`), compact legend, libero as an "L" toggle button with `aria-pressed`.
- [x] **Step 2: Verify:** `npm run dev`, open at 390×844 in browser dev tools: no horizontal scroll, all buttons ≥ 44 px, controls stay docked while middle scrolls. Existing tests still PASS.
- [x] **Step 3:** Commit `feat(view): phone layout`.

### Task 12: Release, GitHub Pages deploy and handover

**Files:** Create `.github/workflows/deploy.yml`; Modify `vite.config.ts`, `README.md`

**Interfaces:** Site URL `https://<user>.github.io/volleyrot/` → Vite `base: '/volleyrot/'`. Custom domain later: set `base: '/'`, add `public/CNAME` with the domain (logged in BACKLOG).

- [x] **Step 1:** `deploy.yml`: on push to `main` + `workflow_dispatch`; jobs: `actions/checkout@v4`, `actions/setup-node@v4` (node 20, npm cache), `npm ci`, `npx vitest run`, `npm run build`, `actions/upload-pages-artifact@v3` (`path: dist`), then `actions/deploy-pages@v4` with `permissions: pages: write, id-token: write` and `environment: github-pages`.
- [x] **Step 1b:** `npm run build` → `dist/index.html` references assets under `/volleyrot/`; `npx vitest run` all PASS.
- [x] **Step 2:** Manual pass on desktop and phone: every system × every phase, autoplay at 0.25× and 2×.
- [x] **Step 3:** Tick done items in `BACKLOG.md`; update `.ai/STATUS.md` (phase, last session, next step).
- [x] **Step 4:** Commit `chore: mvp release`.
