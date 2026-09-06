# ForgeViz V1.2 extraction report

Source consumer: `julian-passebecq/Fluent2_J_Viz`

Source commit: `7aaa8fa601c5fa2c9f8acfd7a4d4eb54b887b9ef`

`src/core`, `src/renderers`, `src/adapters`, and `src/index.ts` are copied byte-for-byte from the verified V1.2 source. No visual behavior or schema was redesigned during extraction.

The standalone gate verifies exact source parity, framework-neutral core/renderers, TypeScript typecheck, independent parse/player/render smoke tests, typed ESM build, package tarball contents, and a generated pnpm lockfile. Consumers remain untouched.
