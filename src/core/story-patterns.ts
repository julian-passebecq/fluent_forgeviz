import { parseStory, type Scene, type StorySpec, type VisualizationSpec } from './spec.js';

export type TimelineBeat = Pick<Scene, 'id' | 'title' | 'caption'> & {
  time: number;
  chapter?: string;
  focusIds?: string[];
  annotationIds?: string[];
};
export interface StoryMessage {
  id: string;
  title: string;
  description: string;
}

/** One reusable absolute-step pattern for time, ranks, bubbles, distributions and event maps. */
export function timelineStory(
  visual: VisualizationSpec,
  beats: readonly TimelineBeat[],
  message?: StoryMessage,
): StorySpec {
  if (!('encodings' in visual) || !('time' in visual.encodings))
    throw new Error('Timeline stories require a temporal visualization');
  return parseStory({
    id: message?.id ?? `${visual.id}-story`,
    version: visual.version,
    title: message?.title ?? visual.title,
    description: message?.description ?? visual.takeaway,
    visuals: [visual],
    scenes: beats.map(({ time, ...beat }) => ({ ...beat, visualId: visual.id, state: { time } })),
  });
}

/** Compose editorial chapters; identical visual IDs must refer to identical specs. */
export function chapterStory(
  message: StoryMessage,
  chapters: readonly {
    visual: VisualizationSpec;
    scene: Pick<Scene, 'id' | 'title' | 'caption'> &
      Partial<Omit<Scene, 'id' | 'title' | 'caption' | 'visualId'>>;
  }[],
): StorySpec {
  const visuals = new Map<string, VisualizationSpec>();
  for (const { visual } of chapters) {
    const existing = visuals.get(visual.id);
    if (existing && JSON.stringify(existing) !== JSON.stringify(visual))
      throw new Error(`Conflicting visual ID ${visual.id}`);
    visuals.set(visual.id, visual);
  }
  return parseStory({
    ...message,
    version: [...visuals.values()].some((visual) => visual.version === '1.1') ? '1.1' : '1.0',
    visuals: [...visuals.values()],
    scenes: chapters.map(({ visual, scene }) => ({
      ...scene,
      visualId: visual.id,
      transition: scene.transition ?? { intent: 'scene', durationMs: 650 },
    })),
  });
}
