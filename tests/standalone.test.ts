import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, resolve, sep } from 'node:path';
import { createRenderer, parseStory, parseVisualization, StoryPlayer } from '../src/index.js';

const ranking = parseVisualization({
  id: 'smoke-ranking',
  version: '1.0',
  type: 'ranking',
  title: 'Smoke ranking',
  takeaway: 'A deterministic standalone figure.',
  source: 'Synthetic test fixture',
  note: 'No external data.',
  accessibility: { summary: 'Two entities ranked at two times.' },
  encodings: { id: 'id', label: 'label', time: 'year', value: 'value' },
  data: [
    { id: 'a', label: 'Alpha', year: 2025, value: 10 },
    { id: 'b', label: 'Beta', year: 2025, value: 8 },
    { id: 'a', label: 'Alpha', year: 2026, value: 9 },
    { id: 'b', label: 'Beta', year: 2026, value: 11 }
  ]
});

describe('standalone ForgeViz package boundary', () => {
  it('parses, plays and renders without Datapass', () => {
    const story = parseStory({
      id: 'smoke-story',
      version: '1.0',
      title: 'Smoke story',
      description: 'Two deterministic scenes.',
      intervalMs: 4000,
      visuals: [ranking],
      scenes: [
        { id: 's1', visualId: ranking.id, title: 'Start', caption: 'Start', state: { time: 2025 } },
        { id: 's2', visualId: ranking.id, title: 'End', caption: 'End', state: { time: 2026 } }
      ]
    });
    const player = new StoryPlayer(story, true);
    expect(player.getState().index).toBe(0);
    player.next();
    expect(player.getState().index).toBe(1);
    const host = document.createElement('div');
    const renderer = createRenderer(host);
    renderer.update(ranking, story.scenes[1], { width: 720, reducedMotion: true });
    expect(host.querySelector('figure.vf-figure')).not.toBeNull();
    expect(host.querySelectorAll('[data-entity-id]')).toHaveLength(2);
    renderer.destroy();
    expect(host.childElementCount).toBe(0);
    player.dispose();
  });

  it('keeps core and renderers independent of host frameworks', () => {
    for (const directory of ['src/core', 'src/renderers']) {
      for (const file of (readdirSync(directory, { recursive: true }) as string[]).filter((f) => f.endsWith('.ts'))) {
        const path = `${directory}/${file}`;
        const source = readFileSync(path, 'utf8');
        expect(source).not.toMatch(/@datapass\//);
        expect(source).not.toMatch(/from ['\"]react/);
        for (const match of source.matchAll(/\b(?:from\s*|import\s*\(?\s*)['\"]([^'\"]+)['\"]/g)) {
          const name = match[1];
          if (!name.startsWith('.')) continue;
          const target = resolve(dirname(path), name);
          expect(
            ['src/core', 'src/renderers'].some((root) => target.startsWith(resolve(root) + sep)),
            target
          ).toBe(true);
        }
      }
    }
  });
});
