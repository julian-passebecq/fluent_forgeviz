# ForgeViz

Standalone reusable visualization engine extracted from `julian-passebecq/Fluent2_J_Viz`.

This repository is the source of truth for the **ForgeViz engine**: semantic analytical/editorial specs, deterministic story playback, D3 renderers, SVG/HTML output, accessibility helpers, and the thin optional React adapter.

The public website/demo remains an independent consumer in `julian-passebecq/Fluent2_J_Viz`.

## Boundary

ForgeViz owns:

- framework-neutral TypeScript core;
- StorySpec / visualization schemas and validation;
- deterministic playback;
- D3 rendering and renderer families;
- standalone DOM host adapter;
- optional thin React adapter;
- library tests and build.

ForgeViz does **not** own:

- Fluent/Datapass application shells;
- catalog/navigation/inspector UI;
- the deployed `fluent2jd3` website;
- ConceptMotion technical/algorithm renderers;
- Power BI packaging (future adapter only).

## Migration status

The initial extraction is intentionally conservative: move the existing working engine without redesigning it. After CI is green here, the consumer will be switched to a pinned ForgeViz dependency and the duplicated engine source will be removed from the consumer repository.
