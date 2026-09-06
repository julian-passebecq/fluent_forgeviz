# Migration status

This branch is a conservative extraction checkpoint for ForgeViz V1.2.

Pinned source: `julian-passebecq/Fluent2_J_Viz@7aaa8fa601c5fa2c9f8acfd7a4d4eb54b887b9ef`.

The repository extraction gate must materialize and verify the complete reusable engine paths (`src/core`, `src/renderers`, `src/adapters`, `src/index.ts`) before this branch is considered mergeable. Consumers remain untouched during this phase.

The first automated extraction attempt proved source copying worked but pnpm 11 correctly blocked the transitive `esbuild` postinstall until explicitly allowlisted. The base extraction gate now declares `esbuild` in `pnpm.onlyBuiltDependencies`; this commit re-triggers the gate with that policy fix.
