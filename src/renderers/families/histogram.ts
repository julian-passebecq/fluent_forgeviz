import { bin, group, median, scaleLinear } from 'd3';
import type { ChartSpec, DataRow } from '../../core/spec.js';
import { domain, mark, text, type LayoutContext, type Layout } from '../layout-shared.js';

export function histogramLayout(
  spec: Extract<ChartSpec, { type: 'histogram' }>,
  context: LayoutContext,
): Layout {
  const { width, height, phone, left, top, bottom, axes, snapshot, muted, ink, entities, decorations } =
    context;
  const e = spec.encodings;
  const extent = spec.xDomain ?? domain(spec.data.map((row) => Number(row[e.value])));
  const edges = Array.from(
    { length: spec.binCount - 1 },
    (_, index) => extent[0] + ((index + 1) * (extent[1] - extent[0])) / spec.binCount,
  );
  const histogram = bin<DataRow, number>()
    .value((row) => Number(row[e.value]))
    .domain(extent)
    .thresholds(edges);
  const rows = snapshot(spec.data, e.id, e.time);
  const bins = histogram(rows);
  const probability = spec.normalization === 'probability';
  const counts = [...new Set(spec.data.map((row) => Number(row[e.time])))].flatMap((time) => {
    const sample = [
      ...group(
        spec.data.filter((row) => Number(row[e.time]) <= time),
        (row) => String(row[e.id]),
      ).values(),
    ].map((rows) => rows.reduce((a, b) => (Number(a[e.time]) > Number(b[e.time]) ? a : b)));
    return histogram(sample).map((bin) => (probability ? bin.length / sample.length : bin.length));
  });
  const x = scaleLinear().domain(extent).range([left, context.right]);
  const y = scaleLinear()
    .domain([0, Math.max(probability ? 0.1 : 1, ...counts)])
    .nice()
    .range([bottom, top]);
  axes(x, y, spec.formatting.unit ?? e.value, probability ? 'Share of observations' : 'Observation count');
  if (!probability)
    for (let index = decorations.length - 1; index >= 0; index--) {
      const tick = decorations[index].key.match(/^(?:grid|ytick)-(.+)$/);
      if (tick && !Number.isInteger(Number(tick[1]))) decorations.splice(index, 1);
    }
  bins.forEach((bucket) => {
    const id = `$bin:${bucket.x0}:${bucket.x1}`;
    const value = probability ? bucket.length / Math.max(1, rows.length) : bucket.length;
    const label = `${context.fmt(bucket.x0!)}–${context.fmt(bucket.x1!)}: ${bucket.length} observations`;
    entities.push({
      id,
      label,
      opacity:
        !context.scene?.focusIds.length ||
        bucket.some((row) => context.scene!.focusIds.includes(String(row[e.id])))
          ? 1
          : 0.22,
      marks: [
        mark('bar', 'rect', {
          x: x(bucket.x0!) + 1,
          y: y(value),
          width: Math.max(0, x(bucket.x1!) - x(bucket.x0!) - 2),
          height: bottom - y(value),
          fill: spec.theme.palette[0],
          rx: 1,
        }),
        ...(!phone || spec.binCount <= 10
          ? [
              text(
                'count',
                (x(bucket.x0!) + x(bucket.x1!)) / 2,
                y(value) - 7,
                probability ? `${Math.round(value * 100)}%` : String(value),
                { fill: ink, 'text-anchor': 'middle', 'font-size': 10 },
              ),
            ]
          : []),
      ],
    });
  });
  const middle = median(rows, (row) => Number(row[e.value]));
  if (middle !== undefined)
    decorations.push(
      mark('median', 'line', {
        x1: x(middle),
        x2: x(middle),
        y1: top,
        y2: bottom,
        stroke: muted,
        'stroke-dasharray': '4 4',
      }),
      text('median-label', Math.min(width - 80, x(middle) + 5), top + 12, `Median ${context.fmt(middle)}`, {
        fill: ink,
        'font-size': 10,
      }),
    );
  return { width, height, entities, decorations };
}
