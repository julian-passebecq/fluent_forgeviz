# Migration status

ForgeViz V1.2 has now been extracted as a standalone engine checkpoint.

Pinned source: `julian-passebecq/Fluent2_J_Viz@7aaa8fa601c5fa2c9f8acfd7a4d4eb54b887b9ef`.

Verified on GitHub Actions:

- `src/core`, `src/renderers`, `src/adapters`, and `src/index.ts` match the pinned source byte-for-byte;
- standalone dependency install succeeds under pnpm 11 with only `esbuild` explicitly allowed to run its build script;
- TypeScript typecheck passes;
- independent jsdom parse/player/render smoke tests pass without Datapass;
- typed ESM library build passes;
- package tarball smoke verifies the root and React adapter exports.

Consumers remain deliberately untouched. `Fluent2_J_Viz` is still the deployed consumer and still embeds its verified V1.2 copy until a later, separate consumer-rewire change.
