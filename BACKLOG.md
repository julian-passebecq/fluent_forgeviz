# ForgeViz backlog

This is the canonical prioritized backlog for the standalone ForgeViz engine.

The backlog is deliberately conservative: stabilize the extracted V1.2 engine first, improve one reusable capability at a time, and avoid pulling consumer-specific UI or deferred V5 work into the engine.

## Tracking rules

Every development or maintenance pass should update this file and append an entry to `PASS_LOG.md`.

Each pass records:

- pass ID;
- date in `YYYY-MM-DD`;
- model used;
- repository base commit;
- implementation/result commit or commit range;
- scope;
- features touched;
- tests/gates run;
- result;
- regressions or known gaps;
- backlog items closed, added, deferred, or reprioritized.

Do not mark a feature `VERIFIED` merely because TypeScript compiles. Use the status vocabulary below.

## Status vocabulary

| Status | Meaning |
| --- | --- |
| `PLANNED` | Accepted backlog item, not started. |
| `IN PROGRESS` | Active work exists but the acceptance gate is not complete. |
| `IMPLEMENTED` | Code exists, but verification is incomplete. |
| `COMPILE-VERIFIED` | Included in a green typecheck/build. |
| `RUNTIME-SMOKE` | Exercised by a deterministic runtime test. |
| `VISUAL-VERIFIED` | Rendered/inspected with an explicit visual or screenshot gate. |
| `RELEASE-VERIFIED` | Passed the release gate appropriate to the package. |
| `DEFERRED` | Intentionally postponed; do not start opportunistically. |
| `REJECTED` | Explicitly out of scope or superseded. |

## Current baseline

Baseline date: **2026-09-06**

Canonical repository: `julian-passebecq/fluent_forgeviz`

Extracted source lineage: `julian-passebecq/Fluent2_J_Viz@7aaa8fa601c5fa2c9f8acfd7a4d4eb54b887b9ef`

Current standalone package: `@vizforge/engine` `1.2.0` (`private: true` while cross-repository consumption remains unproven).

Current package boundaries:

- `@vizforge/engine` — framework-neutral schema, story/player and renderer API;
- `@vizforge/engine/react` — optional thin React adapter.

Current verification gate:

1. `pnpm install --frozen-lockfile`;
2. TypeScript typecheck;
3. independent jsdom runtime tests;
4. typed ESM build;
5. package tarball smoke check.

The deployed `Fluent2_J_Viz` consumer remains intentionally untouched and still embeds the verified V1.2 engine copy. Rewiring it is a separate future integration pass.

---

# Prioritized backlog

## P0 — stabilization and authorability

These are the next capabilities to improve before broadening visualization scope.

| ID | Item | Status | Acceptance criteria |
| --- | --- | --- | --- |
| FV-P0-001 | Durable repository tracking | `IMPLEMENTED` | `BACKLOG.md`, `FEATURE_MATRIX.md`, and append-only `PASS_LOG.md` exist; every future AI pass records model/date/commits/gates/result. |
| FV-P0-002 | Agent/AI authoring guide | `PLANNED` | Concise guide explains the semantic JSON language, valid visualization families, StorySpec, scene state, transitions, annotations/focus, minimal examples, and common invalid patterns. No consumer internals. |
| FV-P0-003 | Canonical spec fixtures | `PLANNED` | One small canonical valid fixture per renderer family plus representative invalid fixtures; fixtures are usable by docs and tests. |
| FV-P0-004 | Family-level schema tests | `PLANNED` | All 15 visualization types have positive parse coverage and at least one invalid-spec assertion where meaningful. |
| FV-P0-005 | Family-level render smoke | `PLANNED` | All 15 renderer families render and destroy in jsdom with deterministic minimal fixtures; no claim of pixel correctness. |
| FV-P0-006 | Public API contract test | `PLANNED` | Package tarball is installed/loaded as a consumer would use it; root and React export surfaces are checked without source-relative imports. |
| FV-P0-007 | Stable JSON presentation/theme options | `PLANNED` | Extend semantic spec only where repeated real use cases prove the need; presentation options remain declarative and renderer-neutral where possible. Backward compatibility tests required. |
| FV-P0-008 | Player/playhead API hardening | `PLANNED` | Explicit play/pause/reset/seek/next/previous state; autoplay/continuous behavior is deterministic; reduced-motion behavior preserved; no duplicated timer ownership in React hosts. |
| FV-P0-009 | Versioning and compatibility policy | `PLANNED` | Document StorySpec/VisualizationSpec compatibility, additive vs breaking schema changes, deprecation policy, and private-to-publish release criteria. |

## P1 — high-value reusable capability

| ID | Item | Status | Acceptance criteria |
| --- | --- | --- | --- |
| FV-P1-001 | Event-annotated time-series | `PLANNED` | Time-series can declaratively place semantic events/labels/bands without authored SVG coordinates; keyboard/reduced-motion behavior defined. |
| FV-P1-002 | Richer story choreography | `PLANNED` | Add only reusable transition/state primitives proven by multiple story patterns; preserve deterministic scene state and semantic IDs. |
| FV-P1-003 | Spec inspector / developer diagnostics API | `PLANNED` | Validation errors and normalized spec output are easy for an AI/tool to consume; no Fluent UI dependency. |
| FV-P1-004 | Text/JSON authoring playground | `PLANNED` | Small repository-owned dev/example surface: edit JSON/text, validate, render, inspect normalized output. It is not a point-and-click diagram editor and is not part of the runtime package. |
| FV-P1-005 | Export contract | `PLANNED` | Define portable SVG export first; evaluate PNG export through an adapter/host without coupling rasterization to the semantic core. |
| FV-P1-006 | Broader accessibility assertions | `PLANNED` | Every family has meaningful accessible summary/data fallback behavior; add automated semantic assertions where practical. |
| FV-P1-007 | Visual regression harness | `PLANNED` | Deterministic reference rendering for representative families at desktop and narrow width; separate structural tests from screenshot/pixel tests. |
| FV-P1-008 | React adapter integration proof | `PLANNED` | Packed package consumed from a minimal independent React host, with strict ownership of player/timers and cleanup verified. |
| FV-P1-009 | Cross-repository consumer proof | `PLANNED` | One consumer pins exact ForgeViz commit/package, passes its own build/QA, and removes duplicated engine code only after parity is proven. |

## P2 — renderer quality and scale

| ID | Item | Status | Acceptance criteria |
| --- | --- | --- | --- |
| FV-P2-001 | Renderer-family visual QA matrix | `PLANNED` | Representative desktop/mobile/reduced-motion checks for all 15 families with known limitations recorded. |
| FV-P2-002 | Interaction/event contract | `PLANNED` | Semantic hover/focus/select callbacks use stable entity IDs and do not expose DOM selectors as authoring API. |
| FV-P2-003 | Theme/token refinement | `PLANNED` | Theme supports reusable analytical semantics without hard-coding consumer/provider concepts such as Bronze/Silver/Gold architecture stages. |
| FV-P2-004 | Performance benchmark fixtures | `PLANNED` | Establish SVG/D3 practical ceilings for rows/nodes/points before considering alternate renderers. |
| FV-P2-005 | Story/data fixture provenance convention | `PLANNED` | Canonical optional provenance/source metadata and documentation support real-data examples without leaking consumer-specific importer internals. |

## Deferred / future investigation

These are tracked so they are not forgotten, but are **not authorization to implement them during V4 stabilization**.

| ID | Item | Status | Reason |
| --- | --- | --- | --- |
| FV-D-001 | Canvas renderer | `DEFERRED` | Only justify after measured SVG performance limits. |
| FV-D-002 | WebGL renderer | `DEFERRED` | Same; avoid parallel renderer architecture without evidence. |
| FV-D-003 | Power BI custom visual packaging | `DEFERRED` | Explicit V5 work; first prove the engine API and cross-repository package boundary. |
| FV-D-004 | D3 → Power BI adapters | `DEFERRED` | Explicit V5 work. |
| FV-D-005 | GeoStory / reusable narrative map engine | `DEFERRED` | Explicit V5 work after current consumers. |
| FV-D-006 | Earthquake-style temporal geospatial storytelling family | `DEFERRED` | Valuable future flagship, but should emerge from reusable map/time/story primitives rather than bespoke one-off code. |
| FV-D-007 | City/Paris flood narrative visualization family | `DEFERRED` | Same as above. |
| FV-D-008 | Actor/movie geographic movement story | `DEFERRED` | Same; first stabilize generic temporal path/map semantics. |
| FV-D-009 | Scroll-driven storytelling | `DEFERRED` | Needs a clear host/engine responsibility model before implementation. |
| FV-D-010 | Jupyter/Python adapter | `DEFERRED` | Treat as adapter work only after JS package contract is proven. |

## Explicit non-goals / ownership boundaries

The following should not be pulled into ForgeViz merely because a consumer needs them:

- Fluent/Datapass application shells, navigation, cards, settings, global page controls;
- ConceptMotion technical/algorithm state renderers;
- WorkflowSpec DAG/orchestration behavior;
- provider-specific cloud architecture semantics;
- Bronze/Silver/Gold architecture colors as hard-coded engine semantics;
- authentication, backend persistence, cloud sync;
- a universal point-and-click chart/diagram editor;
- fake SQL/Spark/Python execution;
- consumer deployment code.

ForgeViz should remain the semantic analytical/editorial visualization engine: schemas, deterministic story state/playback, D3 rendering, accessibility contracts and thin host adapters.

---

# Recommended next pass order

Unless a concrete bug changes priority, use this order:

1. FV-P0-002 — agent/AI authoring guide;
2. FV-P0-003 — canonical fixtures;
3. FV-P0-004 — all-family schema tests;
4. FV-P0-005 — all-family render smoke;
5. FV-P0-006 — public API/package consumer contract;
6. FV-P0-008 — player/playhead hardening;
7. FV-P0-007 — proven JSON presentation options;
8. P1 features only after the P0 gate is materially stronger.

Do not start a broad V2 renderer expansion while P0 coverage remains incomplete.
