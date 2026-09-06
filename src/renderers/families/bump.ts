import { group, line, scaleLinear } from 'd3';
import type { ChartSpec } from '../../core/spec.js';
import { domain, mark, text, short, type LayoutContext, type Layout } from '../layout-shared.js';

export function bumpLayout(spec: Extract<ChartSpec, { type: 'bump' }>, context: LayoutContext): Layout {
  const {
    width,
    height,
    phone,
    left,
    right,
    top,
    bottom,
    axes,
    add,
    color,
    ink,
    muted,
    currentTime,
    entities,
    decorations,
  } = context;
  const e = spec.encodings;
  const periods = [...group(spec.data, (row) => Number(row[e.time]))].sort(([a], [b]) => a - b);
  const count = periods[0][1].length;
  const ranks = new Map<string, { time: number; rank: number; value: number; label: string }[]>();
  for (const [time, rows] of periods) {
    rows.sort(
      (a, b) =>
        (spec.order === 'descending' ? -1 : 1) * (Number(a[e.value]) - Number(b[e.value])) ||
        (String(a[e.id]) < String(b[e.id]) ? -1 : 1),
    );
    rows.forEach((row, index) => {
      const id = String(row[e.id]);
      ranks.set(id, [
        ...(ranks.get(id) ?? []),
        { time, rank: index + 1, value: Number(row[e.value]), label: String(row[e.label]) },
      ]);
    });
  }
  const x = scaleLinear()
    .domain(domain(periods.map(([time]) => time)))
    .range([left, right]);
  const y = scaleLinear()
    .domain([1, Math.max(2, count)])
    .range([top, bottom]);
  axes(x, y, undefined, 'Rank · 1 leads');
  // Rankings are discrete: no fractional ticks, even for two entities.
  for (let index = decorations.length - 1; index >= 0; index--) {
    if (/^(grid|ytick)-/.test(decorations[index].key)) decorations.splice(index, 1);
  }
  for (let rank = 1; rank <= count; rank++)
    decorations.push(
      mark(`rank-grid-${rank}`, 'line', {
        x1: left,
        x2: right,
        y1: y(rank),
        y2: y(rank),
        stroke: context.grid,
      }),
      text(`rank-tick-${rank}`, left - 10, y(rank) + 4, String(rank), {
        fill: muted,
        'text-anchor': 'end',
        'font-size': 11,
      }),
    );
  for (const [id, points] of ranks) {
    const visible = points.filter((point) => point.time <= (currentTime ?? Infinity));
    if (!visible.length) continue;
    const last = visible.at(-1)!;
    add(id, `${last.label}: rank ${last.rank}, value ${context.fmt(last.value)}`, [
      mark('trail', 'path', {
        d:
          line<typeof last>()
            .x((point) => x(point.time))
            .y((point) => y(point.rank))(visible) ?? '',
        fill: 'none',
        stroke: color(id),
        'stroke-width': 3,
      }),
      ...visible.map((point) =>
        mark(`rank-${point.time}`, 'circle', { cx: x(point.time), cy: y(point.rank), r: 3, fill: color(id) }),
      ),
      mark('endpoint', 'circle', {
        cx: x(last.time),
        cy: y(last.rank),
        r: 5,
        fill: color(id),
        stroke: spec.theme.background,
        'stroke-width': 2,
      }),
      text('label', x(last.time) + 9, y(last.rank) + 4, `${last.rank} ${short(last.label, phone ? 7 : 13)}`, {
        fill: ink,
        'font-size': 11,
      }),
    ]);
  }
  decorations.push(
    text('tie-note', left, height - 5, 'Ties ordered by stable ID', { fill: muted, 'font-size': 10 }),
  );
  return { width, height, entities, decorations };
}
