# ForgeViz

Standalone home for the reusable ForgeViz visualization engine.

## Status

The V1.2 engine extraction is complete and verified. `fluent_forgeviz` is now the canonical repository for future ForgeViz engine maintenance.

The extraction is pinned to the previously verified consumer source commit:

`julian-passebecq/Fluent2_J_Viz@7aaa8fa601c5fa2c9f8acfd7a4d4eb54b887b9ef`

The reusable paths `src/core`, `src/renderers`, `src/adapters`, and `src/index.ts` were copied byte-for-byte from that source and passed an independent standalone install, typecheck, render/player smoke test, typed ESM build, and package-tarball gate.

**The consumer has not been changed.** The deployed `Fluent2_J_Viz` website still embeds its verified V1.2 copy. Rewiring that consumer to this repository will be a separate change later.

## Boundary

ForgeViz owns:

- framework-neutral TypeScript core;
- StorySpec / visualization schemas and validation;
- deterministic playback;
- D3 rendering and renderer families;
- standalone DOM host adapter;
- optional thin React adapter;
- library tests and package build.

ForgeViz does **not** own:

- Fluent/Datapass application shells;
- catalog/navigation/inspector website UI;
- the deployed `fluent2jd3` consumer;
- ConceptMotion technical/algorithm renderers;
- Power BI packaging or other future host adapters unless they become proven ForgeViz responsibilities.

## Verify

Use Node 22.13+ and pnpm 11.19.0.

```sh
pnpm install --frozen-lockfile
pnpm check
```

`pnpm check` runs typecheck, standalone tests, the typed ESM build, and a package-tarball smoke test.

pnpm 11 dependency build scripts are deny-by-default. `pnpm-workspace.yaml` explicitly allows only the required `esbuild` build script.

## Package boundary

The package remains private while cross-repository consumption is being stabilized.

```ts
import { createRenderer, parseStory, StoryPlayer } from '@vizforge/engine';
import { Figure, StoryView } from '@vizforge/engine/react';
```

The React entry point is an optional thin adapter. Core and renderer code do not depend on React or Datapass.

See `SOURCE_COMMIT`, `EXTRACTION_REPORT.md`, and `MIGRATION_STATUS.md` for provenance and extraction evidence.
