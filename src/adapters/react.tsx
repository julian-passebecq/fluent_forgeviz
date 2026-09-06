import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type KeyboardEvent,
} from 'react';
import { StoryPlayer } from '../core/player.js';
import type { Scene, StorySpec, VisualizationSpec } from '../core/spec.js';
import { createRenderer, type Renderer, type RenderOptions } from '../renderers/dom.js';

export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(
    () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches,
  );
  useEffect(() => {
    if (typeof matchMedia !== 'function') return;
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  return reduced;
}
export function useStoryPlayer(story: StorySpec, forceReducedMotion = false) {
  const systemReduced = useReducedMotion();
  const player = useMemo(() => new StoryPlayer(story, systemReduced || forceReducedMotion), [story]); // preferences update without resetting the scene
  const state = useSyncExternalStore(player.subscribe, player.getState, player.getState);
  useEffect(() => {
    player.setReducedMotion(systemReduced || forceReducedMotion);
  }, [player, systemReduced, forceReducedMotion]);
  // Pause releases the clock and remains safe when React StrictMode replays effects.
  useEffect(() => () => player.pause(), [player]);
  const scene = story.scenes[state.index],
    visual = story.visuals.find((v) => v.id === scene.visualId)!;
  return { player, state, scene, visual };
}
export function Figure({
  spec,
  scene,
  options,
}: {
  spec: VisualizationSpec;
  scene?: Scene;
  options?: RenderOptions;
}) {
  const host = useRef<HTMLDivElement>(null),
    renderer = useRef<Renderer | undefined>(undefined);
  useLayoutEffect(() => {
    renderer.current = createRenderer(host.current!);
    return () => {
      renderer.current?.destroy();
      renderer.current = undefined;
    };
  }, []);
  useLayoutEffect(() => {
    renderer.current?.update(spec, scene, options);
  }, [spec, scene, options?.animate, options?.reducedMotion, options?.width]);
  return <div ref={host} className="vf-react-figure" style={{ minWidth: 0, width: '100%' }} />;
}
export function playbackKeyboard(event: KeyboardEvent<HTMLElement>, player: StoryPlayer) {
  const target = event.target as HTMLElement;
  if (target.matches('input, textarea, select, [contenteditable=true]')) return;
  if (event.altKey || event.ctrlKey || event.metaKey) return;
  if (event.key === 'ArrowRight') {
    event.preventDefault();
    player.next();
  }
  if (event.key === 'ArrowLeft') {
    event.preventDefault();
    player.previous();
  }
  if (event.key === 'Home') {
    event.preventDefault();
    player.reset();
  }
  if (event.key === ' ' && target === event.currentTarget) {
    event.preventDefault();
    player.getState().playing ? player.pause() : player.play();
  }
}
export function PlaybackControls({ player }: { player: StoryPlayer }) {
  const state = useSyncExternalStore(player.subscribe, player.getState, player.getState);
  return (
    <div className="vf-controls" role="group" aria-label="Story playback">
      <button type="button" onClick={player.reset} aria-label="Reset story" title="Reset story (Home)">
        ↺
      </button>
      <button
        type="button"
        onClick={player.previous}
        disabled={state.index === 0}
        aria-label="Previous scene"
        title="Previous scene (←)"
      >
        ←
      </button>
      <button
        type="button"
        className="vf-play"
        onClick={state.playing ? player.pause : player.play}
        disabled={!state.playing && state.index === player.story.scenes.length - 1}
        aria-label={state.playing ? 'Pause story' : 'Play story'}
      >
        {state.playing ? 'Ⅱ Pause' : '▶ Play'}
      </button>
      <button
        type="button"
        onClick={player.next}
        disabled={state.index === player.story.scenes.length - 1}
        aria-label="Next scene"
        title="Next scene (→)"
      >
        →
      </button>
      <span className="vf-step-count">
        {String(state.index + 1).padStart(2, '0')} <span aria-hidden="true">/</span>
        <span className="vf-sr-only">of</span> {String(player.story.scenes.length).padStart(2, '0')}
      </span>
    </div>
  );
}
export function StoryView({ story, reducedMotion = false }: { story: StorySpec; reducedMotion?: boolean }) {
  const { player, state, scene, visual } = useStoryPlayer(story, reducedMotion);
  return (
    <section
      tabIndex={0}
      role="region"
      aria-label={`${story.title} story player`}
      onKeyDown={(event) => playbackKeyboard(event, player)}
    >
      <h2>{story.title}</h2>
      <Figure
        spec={visual}
        scene={scene}
        options={{
          reducedMotion: state.reducedMotion,
          animate: ['next', 'previous', 'seek', 'tick'].includes(state.reason),
        }}
      />
      <div aria-live="polite" aria-atomic="true">
        <h3>{scene.title}</h3>
        <p>{scene.caption}</p>
      </div>
      <PlaybackControls player={player} />
    </section>
  );
}
