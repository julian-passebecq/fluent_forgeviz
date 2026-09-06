import { geoEquirectangular, geoGraticule, geoPath, line, scaleSqrt } from 'd3';
import type { ChartSpec } from '../../core/spec.js';
import { mark, text, short, domain, type Layout, type LayoutContext } from '../layout-shared.js';
export function mapLayout(spec: Extract<ChartSpec, { type: 'event-map' }>, context: LayoutContext): Layout {
  const { width, phone, height, decorations, ink, muted, grid, color, add, snapshot, scene } = context;

  const e = spec.encodings;
  const points = [
    ...spec.data.map((d) => [Number(d[e.x]), Number(d[e.y])]),
    ...spec.regions.flatMap((d) => d.points),
  ];
  const xd = spec.xDomain ?? domain(points.map((p) => p[0])),
    yd = spec.yDomain ?? domain(points.map((p) => p[1]));
  const projection = geoEquirectangular().scale(1).translate([0, 0]);
  const projected = [
    [xd[0], yd[0]],
    [xd[1], yd[1]],
  ].map((p) => (spec.coordinates === 'geographic' ? projection([p[0], p[1]])! : [p[0], -p[1]]));
  const px = domain(projected.map((p) => p[0])),
    py = domain(projected.map((p) => p[1]));
  const factor = Math.min((width - 60) / (px[1] - px[0]), (height - 65) / (py[1] - py[0]));
  const project = (p: number[]): [number, number] => {
    if (spec.coordinates === 'schematic')
      return [
        30 + ((p[0] - xd[0]) / (xd[1] - xd[0])) * (width - 60),
        height - 30 - ((p[1] - yd[0]) / (yd[1] - yd[0])) * (height - 65),
      ];
    const q = projection([p[0], p[1]])!;
    return [
      width / 2 + (q[0] - (px[0] + px[1]) / 2) * factor,
      height / 2 + (q[1] - (py[0] + py[1]) / 2) * factor,
    ];
  };
  decorations.push(
    mark('map-surface', 'rect', {
      x: 1,
      y: 1,
      width: width - 2,
      height: height - 2,
      rx: 8,
      fill: '#f1f5f2',
      stroke: grid,
    }),
  );
  if (spec.coordinates === 'geographic') {
    const mapProjection = geoEquirectangular()
      .scale(factor)
      .translate([width / 2 - ((px[0] + px[1]) / 2) * factor, height / 2 - ((py[0] + py[1]) / 2) * factor]);
    decorations.push(
      mark('graticule', 'path', {
        d:
          geoPath(mapProjection)(
            geoGraticule()
              .extent([
                [Math.max(-180, xd[0]), Math.max(-89.9, yd[0])],
                [Math.min(180, xd[1]), Math.min(89.9, yd[1])],
              ])
              .step([xd[1] - xd[0] < 20 ? 1 : 10, yd[1] - yd[0] < 20 ? 1 : 10])(),
          ) ?? '',
        fill: 'none',
        stroke: grid,
        opacity: 0.6,
      }),
    );
    const coordinate = (value: number, positive: string, negative: string) =>
      `${Math.abs(value)}°${value < 0 ? negative : positive}`;
    decorations.push(
      text(
        'map-bounds',
        12,
        20,
        `${coordinate(yd[0], 'N', 'S')}–${coordinate(yd[1], 'N', 'S')} · ${coordinate(xd[0], 'E', 'W')}–${coordinate(xd[1], 'E', 'W')}`,
        { fill: muted, 'font-size': 10 },
      ),
    );
  }
  for (const region of spec.regions) {
    decorations.push(
      mark(`region-${region.id}`, 'path', {
        d:
          (line<number[]>()
            .x((p) => project(p)[0])
            .y((p) => project(p)[1])(region.points) ?? '') + 'Z',
        fill: '#e1e9df',
        stroke: '#b6c7b4',
        'stroke-width': 1.2,
      }),
    );
    const center = project([
      region.points.reduce((s, p) => s + p[0], 0) / region.points.length,
      region.points.reduce((s, p) => s + p[1], 0) / region.points.length,
    ]);
    decorations.push(
      text(`region-label-${region.id}`, center[0], center[1], region.label, {
        fill: muted,
        'text-anchor': 'middle',
        'font-size': 10,
        'letter-spacing': 1,
      }),
    );
  }
  const radius = scaleSqrt()
    .domain([0, Math.max(1, ...spec.data.map((d) => (e.size ? Number(d[e.size]) : 1)))])
    .range([0, phone ? 15 : 23]);
  for (const row of snapshot(spec.data, e.id, e.time)) {
    const id = String(row[e.id]),
      label = String(row[e.label]),
      [cx, cy] = project([Number(row[e.x]), Number(row[e.y])]);
    const r = e.size ? radius(Number(row[e.size])) : 7;
    add(id, `${label}, time ${row[e.time]}${e.size ? `, magnitude ${row[e.size]}` : ''}`, [
      mark('symbol', 'circle', {
        cx,
        cy,
        r,
        fill: color(id),
        'fill-opacity': 0.3,
        stroke: color(id),
        'stroke-width': 2,
      }),
      mark('center', 'circle', { cx, cy, r: 2.5, fill: color(id) }),
      text('label', Math.max(60, Math.min(width - 60, cx)), cy - r - 7, short(label, phone ? 16 : 24), {
        fill: ink,
        'text-anchor': 'middle',
        'font-size': 11,
        // Dense nearby events retain their markers; focus selects the direct label.
        opacity: scene?.focusIds.length && !scene.focusIds.includes(id) ? 0 : 1,
      }),
    ]);
  }
  decorations.push(
    text(
      'map-key',
      12,
      height - 12,
      `${spec.coordinates === 'schematic' ? 'Schematic · not to scale' : 'Equirectangular projection'}${e.size ? ` · area: ${e.size}` : ''}`,
      { fill: muted, 'font-size': 10 },
    ),
  );

  return {
    width: context.width,
    height: context.height,
    entities: context.entities,
    decorations: context.decorations,
  };
}
