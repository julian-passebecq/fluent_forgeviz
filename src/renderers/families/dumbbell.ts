import { scaleLinear } from 'd3';
import { compact } from '../../core/format.js';
import type { ChartSpec } from '../../core/spec.js';
import { mark, text, short, domain, type Layout, type LayoutContext } from '../layout-shared.js';
export function dumbbellLayout(
  spec: Extract<ChartSpec, { type: 'dumbbell' }>,
  context: LayoutContext,
): Layout {
  const { width, phone, entities, decorations, ink, muted, color, fmt, add, scene } = context;

  const e = spec.encodings,
    rows = spec.data.slice(0, scene?.state.revealCount ?? spec.data.length);
  const x = scaleLinear()
    .domain(
      domain(
        spec.data.flatMap((d) => [Number(d[e.start]), Number(d[e.end])]),
        true,
      ),
    )
    .nice()
    .range([phone ? 28 : 125, width - 55]);
  const h = rows.length * (phone ? 65 : 53) + 65;
  decorations.push(
    text('key', 10, 14, `○ ${spec.startLabel}   ● ${spec.endLabel}`, { fill: muted, 'font-size': 11 }),
  );
  for (const tick of x.ticks(4))
    decorations.push(
      text(`tick-${tick}`, x(tick), h - 8, compact(tick), {
        fill: muted,
        'text-anchor': 'middle',
        'font-size': 11,
      }),
    );
  rows.forEach((row, i) => {
    const id = String(row[e.id]),
      label = String(row[e.label]) + (e.group ? ` · ${row[e.group]}` : ''),
      y = 42 + i * (phone ? 65 : 53),
      a = Number(row[e.start]),
      b = Number(row[e.end]);
    add(id, `${label}: ${spec.startLabel} ${fmt(a)}, ${spec.endLabel} ${fmt(b)}`, [
      text('label', phone ? 28 : 112, y + (phone ? -14 : 4), short(label, 18), {
        fill: ink,
        'text-anchor': phone ? 'start' : 'end',
      }),
      mark('range', 'line', { x1: x(a), x2: x(b), y1: y, y2: y, stroke: color(id), 'stroke-width': 3 }),
      mark('start', 'circle', {
        cx: x(a),
        cy: y,
        r: 5,
        fill: spec.theme.background,
        stroke: color(id),
        'stroke-width': 2,
      }),
      mark('end', 'circle', { cx: x(b), cy: y, r: 6, fill: color(id) }),
      text('delta', width - 8, y + 4, `${b - a >= 0 ? '+' : ''}${compact(b - a)}`, {
        fill: ink,
        'text-anchor': 'end',
        'font-size': 11,
      }),
    ]);
  });
  return { width, height: h, decorations, entities };
}
