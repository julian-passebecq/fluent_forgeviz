import { area, group, line, scaleLinear } from 'd3';
import { compact } from '../../core/format.js';
import type { ChartSpec, DataRow } from '../../core/spec.js';
import { mark, text, short, domain, type Layout, type Mark, type LayoutContext } from '../layout-shared.js';
export function timeLayout(
  spec: Extract<ChartSpec, { type: 'time-series' | 'forecast' }>,
  context: LayoutContext,
): Layout {
  const {
    phone,
    left,
    right,
    top,
    bottom,
    entities,
    decorations,
    muted,
    color,
    fmt,
    add,
    axes,
    currentTime,
  } = context;

  const e = spec.encodings;
  const x = scaleLinear()
    .domain(spec.xDomain ?? domain(spec.data.map((d) => Number(d[e.time]))))
    .range([left, right]);
  const allY = spec.data.flatMap((d) =>
    spec.type === 'forecast'
      ? [Number(d[spec.encodings.lower]), Number(d[spec.encodings.upper])]
      : [Number(d[e.value])],
  );
  if (spec.type === 'time-series' && spec.comparisonBaseline !== undefined)
    allY.push(spec.comparisonBaseline);
  const y = scaleLinear()
    .domain(spec.yDomain ?? domain(allY, true))
    .nice()
    .range([bottom, top]);
  axes(x, y, undefined, spec.formatting.unit);
  const time = currentTime ?? Math.max(...spec.data.map((d) => Number(d[e.time])));
  decorations.push(
    mark('focus-time', 'line', {
      x1: x(time),
      x2: x(time),
      y1: top,
      y2: bottom,
      stroke: muted,
      'stroke-dasharray': '3 5',
      opacity: 0.5,
    }),
  );
  if (spec.type === 'time-series' && spec.comparisonBaseline !== undefined) {
    decorations.push(
      mark('baseline', 'line', {
        x1: left,
        x2: right,
        y1: y(spec.comparisonBaseline),
        y2: y(spec.comparisonBaseline),
        stroke: muted,
        'stroke-dasharray': '5 4',
      }),
    );
    decorations.push(
      text(
        'baseline-label',
        right,
        y(spec.comparisonBaseline) - 8,
        `Baseline ${compact(spec.comparisonBaseline)}`,
        { fill: muted, 'text-anchor': 'end', 'font-size': 10 },
      ),
    );
  }
  const groups = [...group(spec.data, (d) => String(d[e.id]))];
  const labelPositions: { id: string; y: number }[] = [];
  for (const [id, raw] of groups) {
    const points = raw
      .filter((d) => Number(d[e.time]) <= time)
      .sort((a, b) => Number(a[e.time]) - Number(b[e.time]));
    if (!points.length) continue;
    const last = points.at(-1)!,
      label = String(last[e.label]);
    const path = line<DataRow>()
      .x((d) => x(Number(d[e.time])))
      .y((d) => y(Number(d[e.value])));
    const marks: Mark[] = [];
    if (spec.type === 'forecast') {
      const fe = spec.encodings;
      const firstForecast = points.findIndex((d) => d[fe.forecast] === true);
      const observed = firstForecast === -1 ? points : points.slice(0, firstForecast);
      const projected = firstForecast === -1 ? [] : points.slice(Math.max(0, firstForecast - 1));
      marks.push(
        mark('interval', 'path', {
          d:
            area<DataRow>()
              .x((d) => x(Number(d[e.time])))
              .y0((d) => y(Number(d[fe.lower])))
              .y1((d) => y(Number(d[fe.upper])))(projected) ?? '',
          fill: color(id),
          opacity: 0.17,
        }),
      );
      marks.push(
        mark('observed', 'path', {
          d: path(observed) ?? '',
          fill: 'none',
          stroke: color(id),
          'stroke-width': 3,
        }),
      );
      marks.push(
        mark('forecast', 'path', {
          d: path(projected) ?? '',
          fill: 'none',
          stroke: color(id),
          'stroke-width': 3,
          'stroke-dasharray': '6 4',
        }),
      );
    } else {
      if (spec.area)
        marks.push(
          mark('area', 'path', {
            d:
              area<DataRow>()
                .x((d) => x(Number(d[e.time])))
                .y0(y(0))
                .y1((d) => y(Number(d[e.value])))(points) ?? '',
            fill: color(id),
            opacity: 0.09,
          }),
        );
      marks.push(
        mark('line', 'path', {
          d: path(points) ?? '',
          fill: 'none',
          stroke: color(id),
          'stroke-width': 3,
          'stroke-linecap': 'round',
          'stroke-linejoin': 'round',
        }),
      );
    }
    marks.push(
      mark('focus-point', 'circle', {
        cx: x(Number(last[e.time])),
        cy: y(Number(last[e.value])),
        r: 4,
        fill: color(id),
        stroke: spec.theme.background,
        'stroke-width': 2,
      }),
    );
    labelPositions.push({ id, y: y(Number(last[e.value])) });
    marks.push(
      text('label', right + 9, y(Number(last[e.value])) - 4, short(label, phone ? 9 : 14), {
        fill: color(id),
        'font-weight': 600,
        'font-size': phone ? 10 : 12,
      }),
    );
    marks.push(
      text('value', right + 9, y(Number(last[e.value])) + 11, compact(Number(last[e.value])), {
        fill: muted,
        'font-size': 10,
      }),
    );
    add(id, `${label}: ${fmt(Number(last[e.value]))} at ${last[e.time]}`, marks);
  }
  // Resolve direct-label collisions in pixel space; data positions stay truthful.
  labelPositions.sort((a, b) => a.y - b.y);
  const gap = 31;
  labelPositions.forEach((p, i) => {
    p.y = Math.max(top + 4, p.y, i ? labelPositions[i - 1].y + gap : top);
  });
  for (let i = labelPositions.length - 1; i >= 0; i--)
    labelPositions[i].y = Math.min(
      labelPositions[i].y,
      i === labelPositions.length - 1 ? bottom - 12 : labelPositions[i + 1].y - gap,
    );
  for (const pos of labelPositions) {
    const entity = entities.find((d) => d.id === pos.id)!;
    entity.marks.find((d) => d.key === 'label')!.attrs.y = pos.y - 4;
    entity.marks.find((d) => d.key === 'value')!.attrs.y = pos.y + 11;
  }

  return {
    width: context.width,
    height: context.height,
    entities: context.entities,
    decorations: context.decorations,
  };
}
