# ForgeViz

Standalone home for the reusable ForgeViz visualization engine extracted from `julian-passebecq/Fluent2_J_Viz`.

> **Migration status:** this branch is an incomplete extraction checkpoint, not a consumable package. The verified runtime source of truth remains `julian-passebecq/Fluent2_J_Viz` at `7aaa8fa601c5fa2c9f8acfd7a4d4eb54b887b9ef` until the standalone install/typecheck/test/build gate and consumer rewire both pass.

The public website/demo remains an independent consumer in `julian-passebecq/Fluent2_J_Viz`.

## Intended boundary

ForgeViz will own:

- framework-neutral TypeScript core;
- StorySpec / visualization schemas and validation;
- deterministic playback;
- D3 rendering and renderer families;
- standalone DOM host adapter;
- optional thin React adapter;
- library tests and build.

ForgeViz will **not** own:

- Fluent/Datapass application shells;
- catalog/navigation/inspector UI;
- the deployed `fluent2jd3` website;
- ConceptMotion technical/algorithm renderers;
- Power BI packaging (future adapter only).

## Extraction checkpoint

This branch currently contains only the standalone package/configuration skeleton and the byte-identical `src/core` tree from the pinned V1.2 consumer. Renderers, adapters, the package root entry point, tests and lockfile are not migrated yet. Because `package.json` describes the intended final engine exports, those exports are not valid at this intermediate checkpoint. **Do not merge, publish, pack, or wire a consumer to this branch yet.**

Next safe step: copy the renderer and adapter layer without redesign, restore the original root export, add the engine-focused tests and lockfile, then run the standalone gate. Only after that should the consumer be changed.
