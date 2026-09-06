import { parseStory, type Scene, type StorySpec } from './spec.js';

export type PlaybackReason =
  | 'init'
  | 'play'
  | 'pause'
  | 'next'
  | 'previous'
  | 'reset'
  | 'seek'
  | 'tick'
  | 'motion';
export interface PlayerState {
  readonly index: number;
  readonly playing: boolean;
  readonly reducedMotion: boolean;
  readonly reason: PlaybackReason;
  readonly revision: number;
}
export interface Scheduler {
  set(callback: () => void, delay: number): unknown;
  clear(handle: unknown): void;
}
const scheduler: Scheduler = {
  set: (callback, delay) => setTimeout(callback, delay),
  clear: (handle) => clearTimeout(handle as ReturnType<typeof setTimeout>),
};

/** A discrete clock: no hidden autoplay, loops, wall-time interpolation or ambient motion. */
export class StoryPlayer {
  readonly story: StorySpec;
  private snapshot: PlayerState;
  private listeners = new Set<() => void>();
  private timer: unknown;
  private disposed = false;
  constructor(
    input: unknown,
    reducedMotion = false,
    private clock: Scheduler = scheduler,
  ) {
    this.story = parseStory(input);
    this.snapshot = Object.freeze({ index: 0, playing: false, reducedMotion, reason: 'init', revision: 0 });
  }
  getState = (): PlayerState => this.snapshot;
  getScene = (): Scene => this.story.scenes[this.snapshot.index];
  subscribe = (listener: () => void): (() => void) => {
    if (this.disposed) return () => {};
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };
  private cancel() {
    if (this.timer !== undefined) this.clock.clear(this.timer);
    this.timer = undefined;
  }
  private update(patch: Partial<PlayerState>, reason: PlaybackReason) {
    if (this.disposed) return;
    this.snapshot = Object.freeze({
      ...this.snapshot,
      ...patch,
      reason,
      revision: this.snapshot.revision + 1,
    });
    this.listeners.forEach((listener) => listener());
  }
  private schedule() {
    this.cancel();
    if (!this.snapshot.playing || this.disposed) return;
    this.timer = this.clock.set(() => {
      const index = Math.min(this.snapshot.index + 1, this.story.scenes.length - 1);
      this.update({ index, playing: index < this.story.scenes.length - 1 }, 'tick');
      this.schedule();
    }, this.story.intervalMs);
  }
  play = () => {
    if (this.disposed || this.snapshot.playing || this.snapshot.index === this.story.scenes.length - 1)
      return;
    this.update({ playing: true }, 'play');
    this.schedule();
  };
  pause = () => {
    this.cancel();
    this.update({ playing: false }, 'pause');
  };
  next = () => {
    this.cancel();
    this.update(
      { index: Math.min(this.snapshot.index + 1, this.story.scenes.length - 1), playing: false },
      'next',
    );
  };
  previous = () => {
    this.cancel();
    this.update({ index: Math.max(0, this.snapshot.index - 1), playing: false }, 'previous');
  };
  reset = () => {
    this.cancel();
    this.update({ index: 0, playing: false }, 'reset');
  };
  seek = (index: number) => {
    if (!Number.isInteger(index) || index < 0 || index >= this.story.scenes.length)
      throw new RangeError('Scene index is out of range');
    this.cancel();
    this.update({ index, playing: false }, 'seek');
  };
  setReducedMotion = (reducedMotion: boolean) => {
    this.update({ reducedMotion }, 'motion');
  };
  dispose = () => {
    this.cancel();
    this.disposed = true;
    this.listeners.clear();
  };
}
