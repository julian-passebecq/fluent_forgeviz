import { scaleLinear, scaleSqrt } from 'd3';
import type { ChartSpec } from '../../core/spec.js';
import { mark, text, short, domain, type Layout, type LayoutContext } from '../layout-shared.js';
export function scatterLayout(spec: Extract<ChartSpec, { type: 'scatter' }>, context: LayoutContext): Layout {
  const { width, phone, left, right, top, bottom, ink, color, add, axes, snapshot } = context;

  const e = spec.encodings;
  const x = scaleLinear()
    .domain(
      spec.xDomain ??
        domain(
          spec.data.map((d) => Number(d[e.x])),
          true,
        ),
    )
    .nice()
    .range([left + 10, right - 10]);
  const y = scaleLinear()
    .domain(
      spec.yDomain ??
        domain(
          spec.data.map((d) => Number(d[e.y])),
          true,
        ),
    )
    .nice()
    .range([bottom - 10, top + 15]);
  const size = scaleSqrt()
    .domain([0, Math.max(1, ...spec.data.map((d) => (e.size ? Number(d[e.size]) : 1)))])
    .range([0, phone ? 19 : 29]);
  axes(x, y, spec.xLabel, spec.yLabel);
  const categories = e.category ? [...new Set(spec.data.map((d) => String(d[e.category!])))].sort() : [];
  for (const row of snapshot(spec.data, e.id, e.time)) {
    const id = String(row[e.id]),
      label = String(row[e.label]),
      cx = x(Number(row[e.x])),
      cy = y(Number(row[e.y]));
    const r = e.size ? size(Number(row[e.size])) : 7;
    const labelText = short(label, phone ? 10 : 20);
    const labelWidth = labelText.length * 6;
    const labelRight = cx + r + 7 + labelWidth < width - 8;
    const labelX = labelRight ? cx + r + 7 : cx - r - 7;
    const fill = e.category
      ? spec.theme.palette[categories.indexOf(String(row[e.category])) % spec.theme.palette.length]
      : color(id);
    add(
      id,
      `${label}: ${spec.xLabel} ${row[e.x]}, ${spec.yLabel} ${row[e.y]}${e.size ? `, size ${row[e.size]}` : ''}`,
      [
        mark('bubble', 'circle', {
          cx,
          cy,
          r,
          fill,
          'fill-opacity': 0.72,
          stroke: fill,
          'stroke-width': 1.5,
        }),
        text('label', labelX, cy + 4, labelText, {
          fill: ink,
          'text-anchor': labelRight ? 'start' : 'end',
          'font-size': 11,
        }),
      ],
    );
  }

  return {
    width: context.width,
    height: context.height,
    entities: context.entities,
    decorations: context.decorations,
  };
}
