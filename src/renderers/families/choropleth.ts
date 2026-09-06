import { geoArea, geoEqualEarth, geoPath, interpolateRgb, scaleLinear } from 'd3';
import type { ChartSpec } from '../../core/spec.js';
import { domain, mark, text, short, type LayoutContext, type Layout } from '../layout-shared.js';

// Normalize RFC 7946 or clockwise input for D3's spherical winding convention.
// Regions represent areas smaller than a hemisphere; holes use opposite winding.
export function normalizedGeometry(
  geometry: Extract<ChartSpec, { type: 'choropleth' }>['regions'][number]['geometry'],
) {
  const normalize = (rings: number[][][]) =>
    rings.map((ring, index) => {
      const large = geoArea({ type: 'Polygon', coordinates: [ring] }) > 2 * Math.PI;
      return large === (index === 0) ? ring.slice().reverse() : ring;
    });
  return geometry.type === 'Polygon'
    ? { type: 'Polygon' as const, coordinates: normalize(geometry.coordinates) }
    : { type: 'MultiPolygon' as const, coordinates: geometry.coordinates.map(normalize) };
}

export function choroplethLayout(
  spec: Extract<ChartSpec, { type: 'choropleth' }>,
  context: LayoutContext,
): Layout {
  const { width, height, phone, snapshot, ink, muted, grid, entities, decorations } = context;
  const e = spec.encodings;
  const extent = spec.valueDomain ?? domain(spec.data.map((row) => Number(row[e.value])));
  const scale = scaleLinear().domain(extent).range([0.12, 1]).clamp(true);
  const shade = interpolateRgb(spec.theme.background, spec.theme.palette[0]);
  const features = spec.regions.map((region) => ({
    type: 'Feature' as const,
    properties: { id: region.id, label: region.label },
    geometry: normalizedGeometry(region.geometry),
  }));
  const collection = { type: 'FeatureCollection' as const, features };
  const projection = geoEqualEarth().fitExtent(
    [
      [18, 16],
      [width - 18, height - 80],
    ],
    collection,
  );
  const path = geoPath(projection);
  const rows = new Map(snapshot(spec.data, e.id, e.time).map((row) => [String(row[e.id]), row]));
  for (const feature of features) {
    const id = feature.properties.id,
      row = rows.get(id);
    const value = row ? Number(row[e.value]) : undefined;
    const label = `${feature.properties.label}: ${value === undefined ? 'No data' : context.fmt(value)}`;
    const [cx, cy] = path.centroid(feature);
    const bounds = path.bounds(feature);
    entities.push({
      id,
      label,
      opacity: !context.scene?.focusIds.length || context.scene.focusIds.includes(id) ? 1 : 0.22,
      marks: [
        mark('region', 'path', {
          d: path(feature) ?? '',
          fill: value === undefined ? grid : shade(scale(value)),
          stroke: spec.theme.background,
          'stroke-width': 2,
          'stroke-dasharray': value === undefined ? '3 3' : 'none',
        }),
        ...(Number.isFinite(cx) && Number.isFinite(cy) && bounds[1][0] - bounds[0][0] > 38
          ? [
              text('label', cx, cy - 3, short(feature.properties.label, phone ? 10 : 18), {
                fill: ink,
                'text-anchor': 'middle',
                'font-size': 10,
                'paint-order': 'stroke',
                stroke: spec.theme.background,
                'stroke-width': 3,
              }),
              text('value', cx, cy + 12, value === undefined ? 'No data' : context.fmt(value), {
                fill: ink,
                'text-anchor': 'middle',
                'font-size': 10,
                'paint-order': 'stroke',
                stroke: spec.theme.background,
                'stroke-width': 3,
              }),
            ]
          : []),
      ],
    });
  }
  const legendWidth = (width - 60) / 5;
  for (let index = 0; index < 5; index++)
    decorations.push(
      mark(`legend-${index}`, 'rect', {
        x: 30 + index * legendWidth,
        y: height - 59,
        width: legendWidth + 0.5,
        height: 10,
        fill: shade(0.12 + index * 0.22),
      }),
    );
  for (const [fraction, anchor] of [
    [0, 'start'],
    [0.5, 'middle'],
    [1, 'end'],
  ] as const)
    decorations.push(
      text(
        `legend-label-${fraction}`,
        30 + fraction * (width - 60),
        height - 32,
        context.fmt(extent[0] + fraction * (extent[1] - extent[0])),
        { fill: muted, 'text-anchor': anchor, 'font-size': 11 },
      ),
    );
  decorations.push(
    text('map-note', 30, height - 8, 'Equal Earth · gray = no data · fixed scale', {
      fill: muted,
      'font-size': 10,
    }),
  );
  return { width, height, entities, decorations };
}
