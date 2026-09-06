import type { ChartSpec, Scene } from '../core/spec.js';
import { createLayoutContext, type Layout } from './layout-shared.js';
export type { Mark, Entity, Layout } from './layout-shared.js';
import { rankingLayout } from './families/ranking.js';
import { timeLayout } from './families/time.js';
import { scatterLayout } from './families/scatter.js';
import { dumbbellLayout } from './families/dumbbell.js';
import { contributionLayout } from './families/contribution.js';
import { flowLayout } from './families/flow.js';
import { mapLayout } from './families/map.js';
import { bumpLayout } from './families/bump.js';
import { histogramLayout } from './families/histogram.js';
import { smallMultiplesLayout } from './families/small-multiples.js';
import { stackedAreaLayout } from './families/stacked-area.js';
import { choroplethLayout } from './families/choropleth.js';
export function layoutChart(spec: ChartSpec, scene: Scene | undefined, width: number): Layout {
  const context = createLayoutContext(spec, scene, width);
  switch (spec.type) {
    case 'bump':
      return bumpLayout(spec, context);
    case 'histogram':
      return histogramLayout(spec, context);
    case 'small-multiples':
      return smallMultiplesLayout(spec, context);
    case 'stacked-area':
      return stackedAreaLayout(spec, context);
    case 'choropleth':
      return choroplethLayout(spec, context);
    case 'ranking':
      return rankingLayout(spec, context);
    case 'time-series':
    case 'forecast':
      return timeLayout(spec, context);
    case 'scatter':
      return scatterLayout(spec, context);
    case 'dumbbell':
      return dumbbellLayout(spec, context);
    case 'contribution':
      return contributionLayout(spec, context);
    case 'flow':
      return flowLayout(spec, context);
    case 'event-map':
      return mapLayout(spec, context);
  }
}
