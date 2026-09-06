# ForgeViz V1.2 extraction report

Source consumer: `julian-passebecq/Fluent2_J_Viz`

Source commit: `7aaa8fa601c5fa2c9f8acfd7a4d4eb54b887b9ef`

This checkpoint copies `src/core`, `src/renderers`, `src/adapters`, and `src/index.ts` byte-for-byte from the verified V1.2 source. No visual behavior or schema was redesigned during extraction.

The standalone gate verifies:

- exact source parity for reusable engine paths;
- framework-neutral core/renderers;
- TypeScript typecheck;
- independent jsdom parse/player/render smoke tests;
- typed ESM library build;
- private package tarball contents including the React adapter;
- generated pnpm lockfile.

Consumers are deliberately not modified by this extraction.
