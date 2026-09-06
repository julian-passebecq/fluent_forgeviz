import { parseStory, parseVisualization } from '../core/spec.js';
import { StoryPlayer } from '../core/player.js';
import { createRenderer } from '../renderers/dom.js';

export const rendererId = 'vizforge.d3';
export interface FigureEnvelope {
  rendererId: string;
  spec: unknown;
}
/** VizForge-owned host seam. Map this to the confirmed Datapass adapter API later. */
export function mountFigure(host: HTMLElement, envelope: FigureEnvelope) {
  if (envelope.rendererId !== rendererId) throw new Error('Unsupported renderer ID');
  const isStory = typeof envelope.spec === 'object' && envelope.spec !== null && 'scenes' in envelope.spec;
  // Validate before allocating DOM so invalid payloads leave no mounted subtree.
  const spec = isStory ? parseStory(envelope.spec) : parseVisualization(envelope.spec);
  const renderer = createRenderer(host);
  if (!('scenes' in spec)) {
    renderer.update(spec);
    return { player: undefined, destroy: renderer.destroy };
  }
  const player = new StoryPlayer(spec);
  const paint = () => {
    const state = player.getState(),
      scene = player.getScene();
    renderer.update(spec.visuals.find((v) => v.id === scene.visualId)!, scene, {
      reducedMotion: state.reducedMotion,
      animate: ['next', 'previous', 'seek', 'tick'].includes(state.reason),
    });
  };
  const unsubscribe = player.subscribe(paint);
  paint();
  return {
    player,
    destroy() {
      unsubscribe();
      player.dispose();
      renderer.destroy();
    },
  };
}
