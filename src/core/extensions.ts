import { z } from 'zod';
import { base, id, finite, data, temporal, domains } from './grammar.js';

const v11 = { ...base, version: z.literal('1.1') };
const seriesEncodings = z.object({ ...temporal, value: id }).strict();
export const bump = z
  .object({
    ...v11,
    type: z.literal('bump'),
    data,
    encodings: seriesEncodings,
    order: z.enum(['descending', 'ascending']).default('descending'),
  })
  .strict();
export const histogram = z
  .object({
    ...v11,
    type: z.literal('histogram'),
    data,
    encodings: seriesEncodings,
    binCount: z.number().int().min(3).max(30).default(8),
    normalization: z.enum(['count', 'probability']).default('count'),
    xDomain: domains.xDomain,
  })
  .strict();
export const smallMultiples = z
  .object({
    ...v11,
    type: z.literal('small-multiples'),
    data,
    encodings: seriesEncodings,
    columns: z.number().int().min(1).max(4).default(2),
    ...domains,
  })
  .strict();
export const stackedArea = z
  .object({
    ...v11,
    type: z.literal('stacked-area'),
    data,
    encodings: seriesEncodings,
    normalize: z.boolean().default(false),
  })
  .strict();
const position = z.tuple([finite.min(-180).max(180), finite.min(-90).max(90)]);
const ring = z.array(position).min(4).max(2000);
const polygon = z.array(ring).min(1).max(20);
export const choropleth = z
  .object({
    ...v11,
    type: z.literal('choropleth'),
    data,
    encodings: seriesEncodings,
    regions: z
      .array(
        z
          .object({
            id,
            label: id,
            geometry: z.discriminatedUnion('type', [
              z.object({ type: z.literal('Polygon'), coordinates: polygon }).strict(),
              z
                .object({ type: z.literal('MultiPolygon'), coordinates: z.array(polygon).min(1).max(50) })
                .strict(),
            ]),
          })
          .strict(),
      )
      .min(1)
      .max(250),
    valueDomain: z.tuple([finite, finite]).optional(),
  })
  .strict();
type Extension = z.infer<
  typeof bump | typeof histogram | typeof smallMultiples | typeof stackedArea | typeof choropleth
>;

export function validateExtension(spec: Extension) {
  const e = spec.encodings;
  const ids = [...new Set(spec.data.map((row) => String(row[e.id])))];
  const times = [...new Set(spec.data.map((row) => Number(row[e.time])))];
  if (spec.type === 'small-multiples' && ids.length > 12)
    throw new Error('Small multiples support at most 12 panels');
  if (spec.type === 'bump' && ids.length > 15) throw new Error('Bump supports at most 15 ranked entities');
  if (spec.type === 'bump' || spec.type === 'stacked-area') {
    if (spec.type === 'stacked-area' && ids.length > 10)
      throw new Error('Stacked area supports at most 10 series');
    if (ids.length * times.length !== spec.data.length)
      throw new Error('Bump and composition require a complete entity/time grid; missing is not zero');
  }
  if (spec.type === 'stacked-area') {
    if (spec.data.some((row) => Number(row[e.value]) < 0))
      throw new Error('Composition values must be nonnegative');
    if (
      spec.normalize &&
      times.some((time) => spec.data.filter((row) => row[e.time] === time).every((row) => row[e.value] === 0))
    )
      throw new Error('Normalized composition requires a positive total at every time');
  }
  if (
    spec.type === 'histogram' &&
    spec.xDomain &&
    spec.data.some(
      (row) => Number(row[e.value]) < spec.xDomain![0] || Number(row[e.value]) > spec.xDomain![1],
    )
  )
    throw new Error('Histogram domain must contain all observations');
  if (spec.type === 'choropleth') {
    const regionIds = spec.regions.map((region) => region.id);
    if (new Set(regionIds).size !== regionIds.length) throw new Error('Region IDs must be unique');
    if (ids.some((id) => !regionIds.includes(id)))
      throw new Error('Map values must reference a known region');
    if (spec.valueDomain && spec.valueDomain[0] >= spec.valueDomain[1])
      throw new Error('valueDomain must be increasing');
    if (
      spec.valueDomain &&
      spec.data.some(
        (row) => Number(row[e.value]) < spec.valueDomain![0] || Number(row[e.value]) > spec.valueDomain![1],
      )
    )
      throw new Error('Map valueDomain must contain all values');
    for (const region of spec.regions) {
      const polygons =
        region.geometry.type === 'Polygon' ? [region.geometry.coordinates] : region.geometry.coordinates;
      for (const polygon of polygons)
        for (const ring of polygon) {
          if (ring[0][0] !== ring.at(-1)![0] || ring[0][1] !== ring.at(-1)![1])
            throw new Error('GeoJSON rings must be closed');
          const area = ring
            .slice(1)
            .reduce((sum, point, index) => sum + ring[index][0] * point[1] - point[0] * ring[index][1], 0);
          if (Math.abs(area) < 1e-9) throw new Error('GeoJSON rings must enclose an area');
        }
    }
  }
}
