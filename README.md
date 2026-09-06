# ForgeViz

Standalone home for the reusable ForgeViz visualization engine extracted from `julian-passebecq/Fluent2_J_Viz`.

> **Migration status:** extraction is in progress. Until the standalone engine has completed its own install/typecheck/test/build gate and the consumer has been rewired successfully, the verified runtime source of truth remains `julian-passebecq/Fluent2_J_Viz` at the pinned source commit recorded on the extraction branch. Do not treat this repository's `main` branch as a consumable engine package yet.

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

## Current extraction work

The active migration branch is `extract-v1.2-engine`. The extraction is intentionally conservative: copy the existing working engine without redesigning it, preserve byte-identical engine source where possible, add standalone package/test infrastructure, prove it green, then switch the consumer to an exact ForgeViz commit. Only after that proof will duplicated engine source be removed from the consumer repository.
