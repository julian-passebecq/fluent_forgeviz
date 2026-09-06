import { scaleLinear } from 'd3';
import { compact } from '../../core/format.js';
import type { ChartSpec } from '../../core/spec.js';
import { mark, text, short, domain, type Layout, type LayoutContext } from '../layout-shared.js';
export function contributionLayout(
  spec: Extract<ChartSpec, { type: 'contribution' }>,
  context: LayoutContext,
): Layout {
  const { width, phone, left, top, bottom, decorations, ink, muted, grid, fmt, add, scene } = context;

  const e = spec.encodings;
  const cumulative = [spec.baseline];
  spec.data.forEach((d) => cumulative.push(cumulative.at(-1)! + Number(d[e.value])));
  const count = Math.min(scene?.state.revealCount ?? spec.data.length, spec.data.length);
  const values = [
    { id: '$baseline', label: 'Baseline', start: 0, end: spec.baseline },
    ...spec.data.slice(0, count).map((d, i) => ({
      id: String(d[e.id]),
      label: String(d[e.label]),
      start: cumulative[i],
      end: cumulative[i + 1],
    })),
    { id: '$current', label: 'Current', start: 0, end: cumulative[count] },
  ];
  const x = scaleLinear()
    .domain([0, spec.data.length + 2])
    .range([left, width - 10]);
  const y = scaleLinear()
    .domain(domain(cumulative, true))
    .nice()
    .range([bottom - 15, top]);
  const bw = ((width - left - 10) / (spec.data.length + 2)) * 0.62;
  for (const tick of y.ticks(4)) {
    decorations.push(
      mark(`grid-${tick}`, 'line', { x1: left, x2: width - 8, y1: y(tick), y2: y(tick), stroke: grid }),
    );
    decorations.push(
      text(`tick-${tick}`, left - 8, y(tick) + 4, compact(tick), {
        fill: muted,
        'text-anchor': 'end',
        'font-size': 10,
      }),
    );
  }
  values.forEach((v, i) => {
    const index = v.id === '$current' ? spec.data.length + 1 : i;
    const cx = x(index) + 5,
      positive = v.end >= v.start;
    const fill = v.id.startsWith('$') ? ink : positive ? spec.theme.palette[0] : spec.theme.palette[1];
    add(v.id, `${v.label}: ${fmt(v.end - v.start)}`, [
      mark('bar', 'rect', {
        x: cx,
        y: Math.min(y(v.start), y(v.end)),
        width: bw,
        height: Math.max(1, Math.abs(y(v.start) - y(v.end))),
        rx: 2,
        fill,
      }),
      text('value', cx + bw / 2, Math.min(y(v.start), y(v.end)) - 8, compact(v.end - v.start), {
        fill: ink,
        'text-anchor': 'middle',
        'font-size': phone ? 10 : 12,
      }),
      text('label', cx + bw / 2, bottom + 8, short(v.label, phone ? 7 : 13), {
        fill: muted,
        'text-anchor': 'middle',
        'font-size': phone ? 9 : 11,
      }),
    ]);
    if (i > 0 && v.id !== '$current')
      decorations.push(
        mark(`bridge-${v.id}`, 'line', {
          x1: x(i - 1) + 5 + bw,
          x2: cx,
          y1: y(v.start),
          y2: y(v.start),
          stroke: muted,
          'stroke-dasharray': '3 3',
        }),
      );
  });

  return {
    width: context.width,
    height: context.height,
    entities: context.entities,
    decorations: context.decorations,
  };
}
