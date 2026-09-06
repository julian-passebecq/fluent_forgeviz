import { scaleLinear } from 'd3';
import { compact } from '../../core/format.js';
import type { ChartSpec } from '../../core/spec.js';
import { mark, text, short, type Layout, type LayoutContext } from '../layout-shared.js';
export function rankingLayout(spec: Extract<ChartSpec, { type: 'ranking' }>, context: LayoutContext): Layout {
  const { width, phone, entities, decorations, ink, muted, grid, color, fmt, add, currentTime, snapshot } =
    context;

  const e = spec.encodings;
  const rows = snapshot(spec.data, e.id, e.time)
    .sort((a, b) => Number(b[e.value]) - Number(a[e.value]) || String(a[e.id]).localeCompare(String(b[e.id])))
    .slice(0, spec.topN);
  const max = Math.max(1, ...spec.data.map((d) => Number(d[e.value])));
  const barLeft = phone ? 27 : 140,
    barRight = width - (phone ? 55 : 78);
  const x = scaleLinear().domain([0, max]).range([barLeft, barRight]);
  const rowHeight = phone ? 55 : 48;
  const h = Math.max(240, rows.length * rowHeight + 48);
  const time = currentTime ?? Math.max(...spec.data.map((d) => Number(d[e.time])));
  const priorTime = Math.max(...spec.data.map((d) => Number(d[e.time])).filter((t) => t < time));
  const previous = spec.data
    .filter((d) => d[e.time] === priorTime)
    .sort(
      (a, b) => Number(b[e.value]) - Number(a[e.value]) || String(a[e.id]).localeCompare(String(b[e.id])),
    );
  for (const tick of x.ticks(phone ? 3 : 5)) {
    decorations.push(
      mark(`grid-${tick}`, 'line', { x1: x(tick), x2: x(tick), y1: 8, y2: h - 25, stroke: grid }),
    );
    decorations.push(
      text(`tick-${tick}`, x(tick), h - 6, compact(tick), {
        fill: muted,
        'font-size': 11,
        'text-anchor': 'middle',
      }),
    );
  }
  rows.forEach((row, i) => {
    const id = String(row[e.id]),
      label = String(row[e.label]),
      value = Number(row[e.value]);
    const y = 15 + i * rowHeight + (phone ? 18 : 0);
    const oldRank = previous.findIndex((d) => d[e.id] === id);
    const delta =
      oldRank === -1 ? '—' : oldRank - i === 0 ? '·' : oldRank > i ? `↑${oldRank - i}` : `↓${i - oldRank}`;
    add(id, `${i + 1}. ${label}: ${fmt(value)}, rank change ${delta}`, [
      mark('bar', 'rect', {
        x: barLeft,
        y,
        width: Math.max(0, x(value) - barLeft),
        height: phone ? 22 : 30,
        rx: 3,
        fill: color(id),
      }),
      text('rank', phone ? 7 : 8, y + (phone ? 15 : 20), String(i + 1).padStart(2, '0'), {
        fill: muted,
        'font-size': 11,
      }),
      text('label', phone ? barLeft : barLeft - 12, y + (phone ? -6 : 20), short(label, phone ? 28 : 17), {
        fill: ink,
        'text-anchor': phone ? 'start' : 'end',
        'font-weight': 600,
      }),
      text('value', x(value) + 8, y + (phone ? 16 : 20), compact(value), { fill: ink, 'font-weight': 600 }),
      text('delta', width - 8, y + (phone ? 16 : 20), delta, {
        fill: muted,
        'text-anchor': 'end',
        'font-size': 11,
      }),
    ]);
  });
  return { width, height: h, entities, decorations };
}
