import { group, line, scaleLinear } from 'd3';
import { compact } from '../../core/format.js';
import type { ChartSpec, DataRow } from '../../core/spec.js';
import { domain, mark, text, short, type Layout, type LayoutContext } from '../layout-shared.js';

export function smallMultiplesLayout(
  spec: Extract<ChartSpec, { type: 'small-multiples' }>,
  context: LayoutContext,
): Layout {
  const { width, phone, currentTime, add, color, ink, muted, grid, entities, decorations } = context;
  const e = spec.encodings;
  const panels = [...group(spec.data, (row) => String(row[e.id]))].sort(([a], [b]) => (a < b ? -1 : 1));
  const columns = phone ? 1 : Math.min(spec.columns, panels.length);
  const panelWidth = width / columns,
    panelHeight = 185;
  const height = Math.ceil(panels.length / columns) * panelHeight + 18;
  const xd = spec.xDomain ?? domain(spec.data.map((row) => Number(row[e.time])));
  const yd =
    spec.yDomain ??
    domain(
      spec.data.map((row) => Number(row[e.value])),
      true,
    );
  panels.forEach(([id, raw], index) => {
    const ox = (index % columns) * panelWidth,
      oy = Math.floor(index / columns) * panelHeight;
    const x = scaleLinear()
      .domain(xd)
      .range([ox + 42, ox + panelWidth - 30]);
    const y = scaleLinear()
      .domain(yd)
      .nice()
      .range([oy + 148, oy + 38]);
    const visible = raw
      .filter((row) => Number(row[e.time]) <= (currentTime ?? Infinity))
      .sort((a, b) => Number(a[e.time]) - Number(b[e.time]));
    const last = visible.at(-1),
      label = String(raw[0][e.label]);
    decorations.push(
      text(`title-${id}`, ox + 42, oy + 20, short(label, phone ? 30 : 22), { fill: ink, 'font-weight': 600 }),
    );
    for (const tick of y.ticks(3))
      decorations.push(
        mark(`grid-${id}-${tick}`, 'line', {
          x1: ox + 42,
          x2: ox + panelWidth - 30,
          y1: y(tick),
          y2: y(tick),
          stroke: grid,
        }),
        text(`tick-${id}-${tick}`, ox + 34, y(tick) + 4, compact(tick), {
          fill: muted,
          'text-anchor': 'end',
          'font-size': 10,
        }),
      );
    for (const tick of [xd[0], xd[1]])
      decorations.push(
        text(`time-${id}-${tick}`, x(tick), oy + 167, String(tick), {
          fill: muted,
          'text-anchor': 'middle',
          'font-size': 10,
        }),
      );
    if (!last) return;
    add(id, `${label}: ${context.fmt(Number(last[e.value]))} at ${last[e.time]}`, [
      mark('line', 'path', {
        d:
          line<DataRow>()
            .x((row) => x(Number(row[e.time])))
            .y((row) => y(Number(row[e.value])))(visible) ?? '',
        fill: 'none',
        stroke: color(id),
        'stroke-width': 2.5,
      }),
      mark('endpoint', 'circle', {
        cx: x(Number(last[e.time])),
        cy: y(Number(last[e.value])),
        r: 4,
        fill: color(id),
      }),
      text('value', x(Number(last[e.time])), y(Number(last[e.value])) - 10, compact(Number(last[e.value])), {
        fill: ink,
        'text-anchor': 'middle',
        'font-size': 11,
      }),
    ]);
  });
  decorations.push(
    text('shared-scale', 42, height - 2, 'Every panel uses the same x and y scales', {
      fill: muted,
      'font-size': 10,
    }),
  );
  return { width, height, entities, decorations };
}
