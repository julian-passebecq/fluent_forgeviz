# ForgeViz feature matrix

This file tracks what exists in the standalone ForgeViz engine and how strongly it has been verified.

It is intentionally stricter than a normal feature list: **implemented does not mean visually verified**.

Baseline date: **2026-09-06**

Standalone lineage source: `julian-passebecq/Fluent2_J_Viz@7aaa8fa601c5fa2c9f8acfd7a4d4eb54b887b9ef`

Current package: `@vizforge/engine` `1.2.0` (`private: true`).

## Verification legend

| Mark | Meaning |
| --- | --- |
| ✅ | Explicitly verified by the current standalone gate or extraction parity check. |
| ◐ | Implemented and compiled, but not independently runtime/visual-verified at family level. |
| ☐ | Planned verification or implementation work remains. |
| — | Not applicable. |

## Core engine

| Capability | Implemented | Compile | Runtime smoke | Visual QA | Notes |
| --- | ---: | ---: | ---: | ---: | --- |
| Zod-based VisualizationSpec parsing/validation | ✅ | ✅ | ✅ | — | `src/core/spec.ts`; current runtime smoke parses a ranking fixture. |
| StorySpec parsing/validation | ✅ | ✅ | ✅ | — | Story versions `1.0` and `1.1`. |
| Deterministic StoryPlayer | ✅ | ✅ | ✅ | — | Current smoke verifies deterministic index progression; broader player contract tests are backlog work. |
| Scene state: `time` | ✅ | ✅ | ✅ | ◐ | Used by current smoke; family-level coverage incomplete. |
| Scene state: `revealCount` | ✅ | ✅ | ◐ | ◐ | Implemented in schema; dedicated independent smoke still needed. |
| Scene `focusIds` | ✅ | ✅ | ◐ | ◐ | Implemented; broader semantic/visual QA needed. |
| Scene `annotationIds` | ✅ | ✅ | ◐ | ◐ | Implemented; broader semantic/visual QA needed. |
| Transition intent: `morph-update` | ✅ | ✅ | ◐ | ◐ | Schema and renderer support exist; not separately visual-regression tested in standalone repo. |
| Transition intent: `focus-reveal` | ✅ | ✅ | ◐ | ◐ | Same. |
| Transition intent: `scene` | ✅ | ✅ | ◐ | ◐ | Same. |
| Reduced-motion `instant` policy | ✅ | ✅ | ✅ | ◐ | Current standalone smoke renders with reduced motion. |
| Formatting helpers/schema | ✅ | ✅ | ◐ | ◐ | `src/core/format.ts`, `src/core/grammar.ts`. |
| Theme schema | ✅ | ✅ | ◐ | ◐ | Engine-level theme exists; theme expansion should remain generic. |
| Story pattern helpers | ✅ | ✅ | ◐ | ◐ | `src/core/story-patterns.ts`. |
| Extension schemas | ✅ | ✅ | ◐ | ◐ | `src/core/extensions.ts`. |
| Entity ID extraction | ✅ | ✅ | ◐ | — | Semantic utility in `src/core/spec.ts`. |
| Time-domain extraction | ✅ | ✅ | ◐ | — | Semantic utility in `src/core/spec.ts`. |
| Hierarchy validation | ✅ | ✅ | ◐ | — | Used by matrix schema validation. |

## Renderer families

All 15 V1.2 visualization types are present in the standalone schema and renderer tree and are included in a green TypeScript build. The current independent runtime smoke directly exercises **ranking** only. Therefore the other families are marked compile-verified rather than runtime-verified.

| Visualization type | Renderer family/source | Implemented | Compile | Runtime smoke | Visual QA |
| --- | --- | ---: | ---: | ---: | ---: |
| `ranking` | `src/renderers/families/ranking.ts` | ✅ | ✅ | ✅ | ◐ |
| `time-series` | `src/renderers/families/time.ts` | ✅ | ✅ | ◐ | ◐ |
| `scatter` | `src/renderers/families/scatter.ts` | ✅ | ✅ | ◐ | ◐ |
| `dumbbell` | `src/renderers/families/dumbbell.ts` | ✅ | ✅ | ◐ | ◐ |
| `contribution` | `src/renderers/families/contribution.ts` | ✅ | ✅ | ◐ | ◐ |
| `flow` | `src/renderers/families/flow.ts` | ✅ | ✅ | ◐ | ◐ |
| `forecast` | `src/renderers/families/time.ts` | ✅ | ✅ | ◐ | ◐ |
| `event-map` | `src/renderers/families/map.ts` | ✅ | ✅ | ◐ | ◐ |
| `table` | `src/renderers/tables.ts` | ✅ | ✅ | ◐ | ◐ |
| `matrix` | `src/renderers/tables.ts` | ✅ | ✅ | ◐ | ◐ |
| `bump` | `src/renderers/families/bump.ts` | ✅ | ✅ | ◐ | ◐ |
| `histogram` | `src/renderers/families/histogram.ts` | ✅ | ✅ | ◐ | ◐ |
| `small-multiples` | `src/renderers/families/small-multiples.ts` | ✅ | ✅ | ◐ | ◐ |
| `stacked-area` | `src/renderers/families/stacked-area.ts` | ✅ | ✅ | ◐ | ◐ |
| `choropleth` | `src/renderers/families/choropleth.ts` | ✅ | ✅ | ◐ | ◐ |

## Table/matrix analytical features

| Capability | Implemented | Compile | Runtime smoke | Visual QA | Notes |
| --- | ---: | ---: | ---: | ---: | --- |
| Typed table columns | ✅ | ✅ | ◐ | ◐ | text, number, variance, status, sparkline. |
| Table data bars | ✅ | ✅ | ◐ | ◐ | Declarative column option. |
| Table totals | ✅ | ✅ | ◐ | ◐ | sum / mean / none. |
| Table grouping | ✅ | ✅ | ◐ | ◐ | `groupBy`. |
| Table sorting | ✅ | ✅ | ◐ | ◐ | asc/desc. |
| Hierarchical matrix rows/columns | ✅ | ✅ | ◐ | ◐ | Parent hierarchy validation included. |
| Matrix measures | ✅ | ✅ | ◐ | ◐ | sum/mean aggregates; up to five measures. |
| Matrix grand totals | ✅ | ✅ | ◐ | ◐ | Declarative toggle. |

## Packaging and host integration

| Capability | Status | Evidence / gap |
| --- | --- | --- |
| Framework-neutral core/renderers | ✅ verified | Extraction test rejects `@datapass/*` and React imports from `src/core` / `src/renderers`. |
| DOM renderer API | ✅ runtime-smoke | `createRenderer()` renders and destroys a ranking figure in jsdom. |
| Optional React adapter | ✅ package-smoke | Built and present in package tarball as `@vizforge/engine/react`; independent packed React-host integration remains backlog work. |
| Typed ESM build | ✅ verified | `tsc -p tsconfig.lib.json`. |
| Declaration output | ✅ package-smoke | `dist/index.d.ts` required by tarball smoke. |
| Package tarball contract | ✅ smoke | Required files checked after `pnpm pack`. |
| Frozen dependency install | ✅ CI | `pnpm install --frozen-lockfile`. |
| pnpm 11 build-script policy | ✅ configured | `pnpm-workspace.yaml` explicitly allows `esbuild`. |
| Cross-repository consumer use | ☐ planned | Consumer still embeds its verified V1.2 copy by design. |
| Public npm publication | ☐ deferred | Package remains private until cross-repository proof/version policy exists. |

## Accessibility / semantic structure

| Capability | Status | Notes |
| --- | --- | --- |
| Visualization accessibility summary in spec | ✅ implemented | Base spec supports an accessibility summary. |
| Data accessibility helper | ✅ compile-verified | `src/renderers/data-accessibility.ts`. |
| Semantic entity IDs in DOM | ✅ runtime-smoke | Ranking smoke asserts `[data-entity-id]`. |
| All-family accessibility assertions | ☐ planned | Needs dedicated fixtures and semantics tests. |
| Keyboard interaction contract | ☐ planned | Add with explicit interaction API rather than incidental DOM selectors. |

## Current CI / release engineering

| Capability | Status | Notes |
| --- | --- | --- |
| Single permanent CI workflow | ✅ | `.github/workflows/ci.yml`. |
| Exact pinned checkout action | ✅ | Current release SHA pinned. |
| Exact pinned pnpm setup action | ✅ | Current release SHA pinned. |
| Node runtime pinned | ✅ | Node `22.16.0`. |
| pnpm pinned | ✅ | pnpm `11.19.0`. |
| Typecheck | ✅ | Runs in `pnpm check`. |
| Runtime tests | ✅ | Current suite: one file, two standalone tests. |
| Library build | ✅ | Typed ESM build. |
| Package smoke | ✅ | Tarball contents and private-package checkpoint asserted. |
| Per-family runtime smoke | ☐ | Backlog FV-P0-005. |
| Visual regression | ☐ | Backlog FV-P1-007 / FV-P2-001. |
| Cross-repo install proof | ☐ | Backlog FV-P1-009. |

## Architecture decisions currently considered stable

| Decision | Status | Rationale |
| --- | --- | --- |
| D3 owns analytical geometry/scales/layout/transitions, not the whole React application DOM | retained | Keeps the engine useful in non-React hosts and avoids React/D3 ownership conflicts. |
| React support stays a thin adapter | retained | Prevents the semantic engine from becoming React-only. |
| Semantic JSON/spec is the AI-facing authoring surface | retained | Matches the project goal: AI-editable visualization language rather than a point-and-click editor. |
| Stable semantic IDs over DOM selectors/pixel coordinates | retained | Required for reusable state, accessibility and AI authoring. |
| Story state/playback stays deterministic | retained | Makes testing, reduced motion and host integration tractable. |
| Consumer UI stays outside ForgeViz | retained | Avoids coupling Fluent/Datapass navigation and controls to visualization core. |
| Canvas/WebGL are not added pre-emptively | retained | Need measured SVG performance evidence first. |

## Deferred future feature families

Tracked but intentionally not part of the current stabilized engine scope:

- Power BI packaging and adapters;
- GeoStory / scroll storytelling;
- earthquake-style temporal geospatial storytelling;
- city/flood temporal map stories;
- actor/movie movement map stories;
- Canvas/WebGL renderers;
- Jupyter/Python adapter.

See `BACKLOG.md` for priorities and acceptance criteria.
