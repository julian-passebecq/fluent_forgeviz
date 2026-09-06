import { extent, group, scaleLinear } from 'd3';
import { compact, formatValue } from '../core/format.js';
import { entityIds, type ChartSpec, type DataRow, type Scene } from '../core/spec.js';
export interface Mark {
  key: string;
  tag: 'rect' | 'circle' | 'line' | 'path' | 'text';
  attrs: Record<string, string | number>;
  text?: string;
}
export interface Entity {
  id: string;
  label: string;
  marks: Mark[];
  opacity: number;
}
export interface Layout {
  width: number;
  height: number;
  decorations: Mark[];
  entities: Entity[];
}
export const mark = (key: string, tag: Mark['tag'], attrs: Mark['attrs'], text?: string): Mark => ({
  key,
  tag,
  attrs,
  text,
});
export const text = (key: string, x: number, y: number, label: string, attrs: Mark['attrs'] = {}) =>
  mark(key, 'text', { x, y, 'font-size': 12, ...attrs }, label);
export const short = (label: string, length: number) =>
  label.length > length ? label.slice(0, length - 1) + '…' : label;
export function domain(values: number[], zero = false): [number, number] {
  let [lo, hi] = extent(values) as [number, number];
  if (lo === undefined) return [0, 1];
  if (zero) {
    lo = Math.min(lo, 0);
    hi = Math.max(hi, 0);
  }
  if (lo === hi) return [lo - (lo ? Math.abs(lo) * 0.1 : 1), hi + (hi ? Math.abs(hi) * 0.1 : 1)];
  return [lo, hi];
}
export function createLayoutContext(spec: ChartSpec, scene: Scene | undefined, width: number) {
  width = Math.max(280, width);
  const phone = width < 540;
  const height = phone ? 330 : 390;
  const left = 48,
    right = width - (phone ? 70 : 100),
    top = 30,
    bottom = height - 48;
  const entities: Entity[] = [],
    decorations: Mark[] = [];
  const ink = spec.theme.ink,
    muted = spec.theme.muted,
    grid = spec.theme.grid;
  const ids = entityIds(spec).slice().sort();
  const color = (id: string) => spec.theme.palette[Math.max(0, ids.indexOf(id)) % spec.theme.palette.length];
  const fmt = (n: number) => formatValue(n, spec.formatting);
  function add(id: string, label: string, marks: Mark[]) {
    entities.push({
      id,
      label,
      marks,
      opacity: !scene?.focusIds.length || scene.focusIds.includes(id) ? 1 : 0.22,
    });
  }
  function axes(
    x: ReturnType<typeof scaleLinear<number, number>>,
    y: ReturnType<typeof scaleLinear<number, number>>,
    xLabel?: string,
    yLabel?: string,
  ) {
    for (const tick of y.ticks(4)) {
      decorations.push(
        mark(`grid-${tick}`, 'line', {
          x1: left,
          x2: right,
          y1: y(tick),
          y2: y(tick),
          stroke: grid,
          'stroke-dasharray': '3 4',
        }),
      );
      decorations.push(
        text(`ytick-${tick}`, left - 10, y(tick) + 4, compact(tick), {
          fill: muted,
          'text-anchor': 'end',
          'font-size': 11,
        }),
      );
    }
    for (const tick of x.ticks(phone ? 3 : 5))
      decorations.push(
        text(`xtick-${tick}`, x(tick), bottom + 22, String(Number(tick.toFixed(2))), {
          fill: muted,
          'text-anchor': 'middle',
          'font-size': 11,
        }),
      );
    if (xLabel)
      decorations.push(
        text('x-title', (left + right) / 2, height - 3, xLabel, {
          fill: muted,
          'text-anchor': 'middle',
          'font-size': 11,
        }),
      );
    if (yLabel) decorations.push(text('y-title', left, 13, yLabel, { fill: muted, 'font-size': 11 }));
  }
  const currentTime = scene?.state.time;
  function snapshot(data: DataRow[], idField: string, timeField: string): DataRow[] {
    const time = currentTime ?? Math.max(...data.map((d) => Number(d[timeField])));
    return [
      ...group(
        data.filter((d) => Number(d[timeField]) <= time),
        (d) => String(d[idField]),
      ).values(),
    ].map((rows) => rows.reduce((a, b) => (Number(a[timeField]) > Number(b[timeField]) ? a : b)));
  }

  return {
    scene,
    width,
    phone,
    height,
    left,
    right,
    top,
    bottom,
    entities,
    decorations,
    ink,
    muted,
    grid,
    ids,
    color,
    fmt,
    add,
    axes,
    currentTime,
    snapshot,
  };
}
export type LayoutContext = ReturnType<typeof createLayoutContext>;
