import { area, group, scaleLinear, stack, stackOffsetExpand, stackOffsetNone } from 'd3';
import { compact } from '../../core/format.js';
import type { ChartSpec } from '../../core/spec.js';
import { domain, mark, text, short, type LayoutContext, type Layout } from '../layout-shared.js';

export function stackedAreaLayout(
  spec: Extract<ChartSpec, { type: 'stacked-area' }>,
  context: LayoutContext,
): Layout {
  const {
    width,
    height,
    phone,
    left,
    right,
    top,
    bottom,
    currentTime,
    axes,
    add,
    color,
    ink,
    muted,
    ids,
    entities,
    decorations,
  } = context;
  const e = spec.encodings;
  const rows = [...group(spec.data, (row) => Number(row[e.time]))]
    .sort(([a], [b]) => a - b)
    .map(([time, data]) => ({
      time,
      values: Object.fromEntries(data.map((row) => [String(row[e.id]), Number(row[e.value])])),
    }));
  const series = stack<(typeof rows)[number]>()
    .keys(ids)
    .value((row, key) => row.values[key])
    .offset(spec.normalize ? stackOffsetExpand : stackOffsetNone)(rows);
  const x = scaleLinear()
    .domain(domain(rows.map((row) => row.time)))
    .range([left, right]);
  const y = scaleLinear()
    .domain([
      0,
      spec.normalize
        ? 1
        : Math.max(1, ...rows.map((row) => Object.values(row.values).reduce((sum, value) => sum + value, 0))),
    ])
    .range([bottom, top]);
  axes(x, y, undefined, spec.normalize ? 'Share · 1 = 100%' : (spec.formatting.unit ?? 'Total'));
  const labels: { id: string; y: number; target: number; label: string; x: number }[] = [];
  for (const layer of series) {
    const points = layer.filter((point) => point.data.time <= (currentTime ?? Infinity));
    const last = points.at(-1);
    if (!last) continue;
    const label = String(spec.data.find((row) => row[e.id] === layer.key)![e.label]);
    const value = spec.normalize
      ? `${((last[1] - last[0]) * 100).toFixed(0)}%`
      : compact(last.data.values[layer.key]);
    const target = y((last[0] + last[1]) / 2);
    add(layer.key, `${label}: ${value} at ${last.data.time}`, [
      mark('area', 'path', {
        d:
          area<typeof last>()
            .x((point) => x(point.data.time))
            .y0((point) => y(point[0]))
            .y1((point) => y(point[1]))(points) ?? '',
        fill: color(layer.key),
        'fill-opacity': 0.8,
        stroke: spec.theme.background,
        'stroke-width': 1,
      }),
      mark('slice', 'rect', {
        x: x(last.data.time) - 4,
        y: y(last[1]),
        width: 8,
        height: y(last[0]) - y(last[1]),
        fill: color(layer.key),
      }),
    ]);
    labels.push({
      id: layer.key,
      y: target,
      target,
      x: x(last.data.time),
      label: `${short(label, phone ? 7 : 12)} ${value}`,
    });
  }
  labels.sort((a, b) => a.y - b.y);
  labels.forEach((label, index) => {
    label.y = Math.max(top + 5, label.y, index ? labels[index - 1].y + 15 : top);
  });
  for (let index = labels.length - 1; index >= 0; index--)
    labels[index].y = Math.min(labels[index].y, bottom - (labels.length - 1 - index) * 15);
  for (const label of labels)
    entities
      .find((entity) => entity.id === label.id)!
      .marks.push(
        mark('leader', 'line', {
          x1: label.x,
          x2: right + 5,
          y1: label.target,
          y2: label.y,
          stroke: color(label.id),
          'stroke-width': 1,
        }),
        text('label', right + 7, label.y + 4, label.label, { fill: ink, 'font-size': phone ? 9 : 10 }),
      );
  decorations.push(
    text(
      'composition-note',
      left,
      height - 5,
      spec.normalize ? 'Each period totals 100%' : 'Band thickness encodes contribution',
      { fill: muted, 'font-size': 10 },
    ),
  );
  return { width, height, entities, decorations };
}
