# ForgeViz development pass log

Append-only maintenance and development ledger for `julian-passebecq/fluent_forgeviz`.

The purpose is to preserve enough evidence that a future AI or maintainer can answer:

- what changed;
- why it changed;
- which model performed the pass;
- what commit the pass started from;
- what implementation commits it produced;
- what tests/gates actually ran;
- what was not tested;
- which backlog/feature statuses changed.

## Logging convention

Each pass gets a stable ID: `FV-YYYY-MM-DD-NNN`.

`Result head` means the repository commit containing the completed implementation **immediately before the `PASS_LOG.md` append commit**. This avoids an impossible recursive requirement where a commit would have to contain its own SHA. The append commit itself is available from this file's Git history and should use a message beginning with `log:` or an unambiguous documentation message.

Do not rewrite old pass records to make them look cleaner. If a material historical fact is wrong, append a correction subsection referencing the original pass ID.

### Required fields for every future pass

```text
Pass ID:
Date:
Model:
Pass type:
Base commit:
Implementation commits:
Result head:
Scope:
Features/backlog IDs:
Files/areas touched:
Verification performed:
Result:
Known gaps / not verified:
Next recommended action:
```

For source-changing passes, include the exact test commands or CI gate names. For documentation-only passes, explicitly say that no runtime behavior changed.

---

## FV-2026-09-06-001 — standalone V1.2 extraction

**Date:** 2026-09-06  
**Model:** GPT-5.6 Sol  
**Pass type:** repository extraction / package boundary stabilization

**Source lineage:** `julian-passebecq/Fluent2_J_Viz@7aaa8fa601c5fa2c9f8acfd7a4d4eb54b887b9ef`

**Base state:** newly established `julian-passebecq/fluent_forgeviz` extraction repository.

**Primary implementation/result commit:** `27e9213e5ba7ae642fa0d3d883229d7ae1cf6c61` — merge of `Extract standalone ForgeViz V1.2 engine`.

**Supporting extraction commits included work such as:**

- standalone TypeScript/library build configuration;
- extraction of grammar/spec/player/story helpers;
- exact V1.2 engine materialization;
- pnpm 11 `esbuild` allow policy;
- extraction reporting and migration notes.

**Scope:**

- extract reusable ForgeViz V1.2 engine from the consumer repository;
- keep consumer runtime untouched;
- establish `@vizforge/engine` and optional React adapter package boundary;
- prove reusable engine source parity before treating the new repo as canonical.

**Features/backlog represented:**

- standalone core/spec/player;
- D3 renderer tree;
- optional React adapter;
- private package checkpoint;
- extraction provenance.

**Verification performed:**

- byte-for-byte parity for `src/core`, `src/renderers`, `src/adapters`, `src/index.ts` against the pinned consumer source;
- framework-neutral check for core/renderers;
- TypeScript typecheck;
- independent jsdom parse/player/ranking render smoke;
- typed ESM build;
- `pnpm pack` tarball smoke including root declarations and React adapter.

**Result:** PASS.

**Known gaps / not verified:**

- standalone smoke covered ranking, not all 15 families;
- consumer had not yet been rewired to consume the new package;
- package intentionally remained private;
- no all-family visual regression gate.

**Next recommended action at the time:** replace migration-specific machinery with normal frozen-install CI while preserving exact engine behavior.

---

## FV-2026-09-06-002 — post-extraction CI and repository hardening

**Date:** 2026-09-06  
**Model:** GPT-5.6 Sol  
**Pass type:** maintenance / CI stabilization

**Base commit:** `27e9213e5ba7ae642fa0d3d883229d7ae1cf6c61`

**Implementation commits:**

- `df7cb2e2242c9e95dbdfe209afad106bd5a11d0d` — clean pnpm 11 package metadata;
- `87c16d4f10027908938938d9cff78dc7934d3af7` — add normal standalone ForgeViz verification;
- `de758f16b8e30dd1db56602cef1852406d300fb4` — remove migration-only extraction gate;
- `910aea1e4264bb91d145d13629349d6312a3d3fe` — mark standalone extraction verified in docs;
- `2bb825478a1b076c89c664d28af502f2353b1741` — pin current checkout/pnpm setup actions;
- `ddf5cbf0dedfb1da20b63a2075a03a27b02c5d5e` — minimize CI verification surface.

**Result head:** `ddf5cbf0dedfb1da20b63a2075a03a27b02c5d5e`

**Scope:**

- convert temporary migration automation into one permanent CI workflow;
- use frozen lockfile verification;
- remove stale pnpm metadata;
- pin CI setup actions/runtimes;
- remove unnecessary dependency cache and persisted checkout credentials;
- keep renderer/spec source untouched.

**Files/areas touched:** package metadata, pnpm workspace policy, `.github/workflows/ci.yml`, README/migration documentation.

**Verification performed:** final `ForgeViz CI` on `main` completed successfully with:

1. exact pinned checkout action;
2. pinned pnpm/Node setup;
3. `pnpm install --frozen-lockfile`;
4. `pnpm check`;
5. TypeScript typecheck;
6. Vitest standalone suite — 1 file / 2 tests passed;
7. typed ESM library build;
8. package tarball smoke — passed.

**Result:** PASS.

**Known gaps / not verified:**

- test breadth still limited to two standalone tests;
- family-level runtime/visual coverage not yet established;
- cross-repository consumer integration still intentionally deferred.

**Next recommended action:** strengthen authoring documentation and family-level fixtures/tests before broad V2 feature expansion.

---

## FV-2026-09-06-003 — durable backlog, feature matrix and pass ledger

**Date:** 2026-09-06  
**Model:** GPT-5.6 Sol  
**Pass type:** documentation / governance / maintenance traceability

**Base commit:** `ddf5cbf0dedfb1da20b63a2075a03a27b02c5d5e`

**Implementation commits before ledger append:**

- `915e513d3cd22f5e1f80c43c60f3cb307dd4d792` — add prioritized ForgeViz backlog and maintenance protocol;
- `d16c6bbdaf468feebf139d13e20f3d4f05513a10` — add feature and verification matrix;
- `6c51603fc0c3af670901029a1b683494ac7767ab` — link project tracking from README.

**Result head:** `6c51603fc0c3af670901029a1b683494ac7767ab`

**Scope:**

- create a durable, repository-local backlog;
- define a strict feature verification vocabulary;
- record all 15 current visualization families from the actual V1.2 schema;
- distinguish compile verification from runtime smoke and visual QA;
- capture deferred V5/future ideas without authorizing their implementation;
- establish an append-only AI pass ledger with date/model/commit/test evidence.

**Features/backlog IDs:**

- FV-P0-001 durable repository tracking — implemented;
- initial P0/P1/P2/deferred backlog established;
- renderer and platform feature baseline recorded.

**Files/areas touched:** `BACKLOG.md`, `FEATURE_MATRIX.md`, `README.md`, `PASS_LOG.md`.

**Verification performed:**

- repository/schema inspection confirmed 15 visualization types in `src/core/spec.ts`;
- renderer/core directory inspection used to map implemented features to actual source paths;
- no runtime source changed in this pass;
- normal CI is expected to run because documentation commits land on `main`; its result should remain green if no unrelated repository issue exists.

**Result:** documentation/governance implementation complete; runtime behavior unchanged.

**Known gaps / not verified:**

- feature matrix intentionally does not claim all-family runtime or visual verification;
- historical commit list focuses on the material extraction/stabilization checkpoints rather than reproducing every transient bootstrap commit;
- future passes must keep the matrix/backlog synchronized with actual implementation evidence.

**Next recommended action:** FV-P0-002 — create the concise agent/AI authoring guide, followed by canonical fixtures and all-family schema/render smoke coverage.
