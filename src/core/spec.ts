import { z } from 'zod';
import {
  id,
  finite,
  base,
  data,
  temporal,
  entity,
  domains,
  row,
  formatSchema,
  themeSchema,
} from './grammar.js';
export { formatSchema, themeSchema } from './grammar.js';
import { bump, histogram, smallMultiples, stackedArea, choropleth, validateExtension } from './extensions.js';
const ranking = z
  .object({
    ...base,
    type: z.literal('ranking'),
    data,
    encodings: z.object({ ...temporal, value: id }).strict(),
    topN: z.number().int().min(1).max(30).default(8),
  })
  .strict();
const line = z
  .object({
    ...base,
    type: z.literal('time-series'),
    data,
    encodings: z.object({ ...temporal, value: id }).strict(),
    area: z.boolean().default(false),
    comparisonBaseline: finite.optional(),
    ...domains,
  })
  .strict();
const scatter = z
  .object({
    ...base,
    type: z.literal('scatter'),
    data,
    encodings: z.object({ ...temporal, x: id, y: id, size: id.optional(), category: id.optional() }).strict(),
    xLabel: z.string(),
    yLabel: z.string(),
    ...domains,
  })
  .strict();
const dumbbell = z
  .object({
    ...base,
    type: z.literal('dumbbell'),
    data,
    encodings: z.object({ ...entity, start: id, end: id, group: id.optional() }).strict(),
    startLabel: z.string().default('Before'),
    endLabel: z.string().default('After'),
  })
  .strict();
const contribution = z
  .object({
    ...base,
    type: z.literal('contribution'),
    data,
    encodings: z.object({ ...entity, value: id }).strict(),
    baseline: finite,
    kpi: z
      .object({
        label: z.string(),
        comparison: finite,
        target: finite,
        direction: z.enum(['up', 'down']).default('up'),
        sparkline: z.array(finite).min(2).optional(),
      })
      .strict(),
  })
  .strict();
const sankey = z
  .object({
    ...base,
    type: z.literal('flow'),
    nodes: z
      .array(z.object({ id, label: z.string().min(1) }).strict())
      .min(2)
      .max(100),
    links: z
      .array(z.object({ id, source: id, target: id, value: finite.positive() }).strict())
      .min(1)
      .max(500),
  })
  .strict();
const forecast = z
  .object({
    ...base,
    type: z.literal('forecast'),
    data,
    encodings: z.object({ ...temporal, value: id, lower: id, upper: id, forecast: id }).strict(),
    intervalLabel: z.string().default('80% scenario interval'),
    ...domains,
  })
  .strict();
const eventMap = z
  .object({
    ...base,
    type: z.literal('event-map'),
    data,
    encodings: z.object({ ...temporal, x: id, y: id, size: id.optional() }).strict(),
    coordinates: z.enum(['schematic', 'geographic']).default('schematic'),
    regions: z
      .array(z.object({ id, label: z.string(), points: z.array(z.tuple([finite, finite])).min(3) }).strict())
      .default([]),
    ...domains,
  })
  .strict();
export const columnSchema = z
  .object({
    key: id,
    label: z.string().min(1),
    type: z.enum(['text', 'number', 'variance', 'status', 'sparkline']),
    format: formatSchema.default({}),
    dataBar: z.boolean().default(false),
    total: z.enum(['sum', 'mean', 'none']).default('none'),
  })
  .strict();
const table = z
  .object({
    ...base,
    type: z.literal('table'),
    data,
    rowId: id,
    columns: z.array(columnSchema).min(1).max(30),
    totalLabel: z.string().default('Total'),
    groupBy: id.optional(),
    sort: z
      .object({ key: id, direction: z.enum(['asc', 'desc']) })
      .strict()
      .optional(),
  })
  .strict();
const hierarchy = z
  .array(z.object({ id, label: z.string().min(1), parentId: id.optional() }).strict())
  .min(1)
  .max(100);
const matrix = z
  .object({
    ...base,
    type: z.literal('matrix'),
    rowLabel: z.string().min(1).default('Rows'),
    rows: hierarchy,
    columns: hierarchy,
    measures: z
      .array(
        z
          .object({
            key: id,
            label: z.string().min(1),
            format: formatSchema.default({}),
            aggregate: z.enum(['sum', 'mean']),
            dataBar: z.boolean().default(false),
          })
          .strict(),
      )
      .min(1)
      .max(5),
    data: z.array(z.object({ rowId: id, columnId: id, values: z.record(finite) }).strict()).min(1),
    grandTotals: z.boolean().default(true),
  })
  .strict();
export const visualizationSchema = z.discriminatedUnion('type', [
  ranking,
  line,
  scatter,
  dumbbell,
  contribution,
  sankey,
  forecast,
  eventMap,
  table,
  matrix,
  bump,
  histogram,
  smallMultiples,
  stackedArea,
  choropleth,
]);
export type VisualizationSpec = z.infer<typeof visualizationSchema>;
export type ChartSpec = Exclude<VisualizationSpec, { type: 'table' | 'matrix' }>;
export type TableSpec = Extract<VisualizationSpec, { type: 'table' }>;
export type MatrixSpec = Extract<VisualizationSpec, { type: 'matrix' }>;
export type DataRow = z.infer<typeof row>;
export type NumberFormat = z.infer<typeof formatSchema>;
export type Theme = z.infer<typeof themeSchema>;
export type HierarchyNode = z.infer<typeof hierarchy>[number];

export const sceneSchema = z
  .object({
    id,
    visualId: id,
    chapter: z.string().optional(),
    title: z.string().min(1),
    caption: z.string().min(1),
    state: z
      .object({ time: finite.optional(), revealCount: z.number().int().positive().optional() })
      .strict()
      .default({}),
    focusIds: z.array(id).default([]),
    annotationIds: z.array(id).default([]),
    transition: z
      .object({
        intent: z.enum(['morph-update', 'focus-reveal', 'scene']),
        durationMs: z.number().int().min(0).max(2000).default(650),
      })
      .strict()
      .default({ intent: 'morph-update' }),
  })
  .strict();
export const storySchema = z
  .object({
    id,
    version: z.enum(['1.0', '1.1']),
    title: z.string().min(1),
    description: z.string().min(1),
    reducedMotion: z.literal('instant').default('instant'),
    intervalMs: z.number().int().min(2500).max(30000).default(4000),
    visuals: z.array(visualizationSchema).min(1).max(50),
    scenes: z.array(sceneSchema).min(1).max(200),
  })
  .strict();
export type Scene = z.infer<typeof sceneSchema>;
export type StorySpec = z.infer<typeof storySchema>;
export type SpecInput = z.input<typeof visualizationSchema>;
export type StoryInput = z.input<typeof storySchema>;

function unique(values: string[], what: string) {
  if (new Set(values).size !== values.length) throw new Error(`${what} must be unique`);
}
export function entityIds(spec: VisualizationSpec): string[] {
  if (spec.type === 'flow') return [...spec.nodes, ...spec.links].map((d) => d.id);
  if (spec.type === 'matrix') return spec.rows.map((d) => d.id);
  const key = spec.type === 'table' ? spec.rowId : spec.encodings.id;
  return [...new Set(spec.data.map((d) => String(d[key])))];
}
export function times(spec: VisualizationSpec): number[] {
  if (!('encodings' in spec) || !('time' in spec.encodings)) return [];
  const field = spec.encodings.time;
  return [...new Set(spec.data.map((d) => Number(d[field])))].sort((a, b) => a - b);
}
function validateHierarchy(nodes: HierarchyNode[], label: string) {
  unique(
    nodes.map((d) => d.id),
    `${label} IDs`,
  );
  const byId = new Map(nodes.map((d) => [d.id, d]));
  for (const node of nodes) {
    const visited = new Set<string>([node.id]);
    let parent = node.parentId;
    while (parent) {
      if (visited.has(parent)) throw new Error(`${label} hierarchy contains a cycle`);
      if (!byId.has(parent)) throw new Error(`${label} parent ${parent} does not exist`);
      visited.add(parent);
      parent = byId.get(parent)!.parentId;
    }
  }
}
function validateVisual(spec: VisualizationSpec): VisualizationSpec {
  if (spec.version === '1.1') validateExtension(spec);
  unique(
    spec.annotations.map((d) => d.id),
    'Annotation IDs',
  );
  for (const axis of ['xDomain', 'yDomain'] as const) {
    if (axis in spec) {
      const domain = (spec as { xDomain?: [number, number]; yDomain?: [number, number] })[axis];
      if (domain && domain[0] >= domain[1]) throw new Error(`${axis} must be increasing`);
    }
  }
  if (spec.type === 'flow') {
    unique(
      [...spec.nodes, ...spec.links].map((d) => d.id),
      'Flow IDs',
    );
    const nodes = new Set(spec.nodes.map((d) => d.id));
    const children = new Map<string, string[]>();
    for (const link of spec.links) {
      if (!nodes.has(link.source) || !nodes.has(link.target))
        throw new Error('Flow link references an unknown node');
      children.set(link.source, [...(children.get(link.source) ?? []), link.target]);
    }
    const done = new Set<string>();
    function visit(node: string, path: Set<string>) {
      if (path.has(node)) throw new Error('V1 flow requires an acyclic graph');
      if (done.has(node)) return;
      for (const child of children.get(node) ?? []) visit(child, new Set([...path, node]));
      done.add(node);
    }
    for (const node of nodes) visit(node, new Set());
    for (const node of nodes)
      if (!spec.links.some((l) => l.source === node || l.target === node))
        throw new Error('Flow nodes must be connected to a link');
  } else if (spec.type === 'matrix') {
    validateHierarchy(spec.rows, 'Row');
    validateHierarchy(spec.columns, 'Column');
    unique(
      spec.measures.map((d) => d.key),
      'Measure keys',
    );
    unique(
      spec.data.map((d) => JSON.stringify([d.rowId, d.columnId])),
      'Matrix cells',
    );
    const rowLeaves = spec.rows.filter((r) => !spec.rows.some((n) => n.parentId === r.id)).map((r) => r.id);
    const colLeaves = spec.columns
      .filter((c) => !spec.columns.some((n) => n.parentId === c.id))
      .map((c) => c.id);
    for (const cell of spec.data) {
      if (!rowLeaves.includes(cell.rowId) || !colLeaves.includes(cell.columnId))
        throw new Error('Matrix cells must reference existing leaf nodes');
      for (const measure of spec.measures)
        if (!(measure.key in cell.values)) throw new Error(`Missing matrix measure ${measure.key}`);
    }
  } else {
    const key = spec.type === 'table' ? spec.rowId : spec.encodings.id;
    const time = 'encodings' in spec && 'time' in spec.encodings ? spec.encodings.time : undefined;
    const fields =
      spec.type === 'table' ? [key, ...spec.columns.map((c) => c.key)] : Object.values(spec.encodings);
    for (const record of spec.data) {
      for (const field of fields)
        if (!(field in record) || record[field] === null) throw new Error(`Missing field ${field}`);
      if (typeof record[key] !== 'string' || !record[key])
        throw new Error('Entity IDs must be nonempty strings');
      if (String(record[key]).startsWith('$')) throw new Error('Entity IDs beginning with $ are reserved');
      if (time && typeof record[time] !== 'number')
        throw new Error('Time must be a finite numeric value (epoch or ordinal)');
      if (spec.type === 'table') {
        if (spec.groupBy && typeof record[spec.groupBy] !== 'string')
          throw new Error('Table groupBy must reference a text field');
        for (const column of spec.columns) {
          const v = record[column.key];
          if (['number', 'variance'].includes(column.type) && typeof v !== 'number')
            throw new Error(`Column ${column.key} must be numeric`);
          if (column.type === 'sparkline' && (!Array.isArray(v) || v.length < 2))
            throw new Error('Sparklines need at least two numbers');
          if (column.type === 'status' && !['positive', 'negative', 'neutral'].includes(String(v)))
            throw new Error('Status must be positive, negative or neutral');
          if (column.type === 'text' && typeof v !== 'string')
            throw new Error(`Column ${column.key} must be text`);
          if ((column.dataBar || column.total !== 'none') && !['number', 'variance'].includes(column.type))
            throw new Error('Data bars and aggregates require numeric columns');
        }
      } else {
        for (const [role, field] of Object.entries(spec.encodings)) {
          if (['id', 'label', 'category', 'group'].includes(role)) {
            if (typeof record[field] !== 'string') throw new Error(`${role} must be text`);
          } else if (role === 'forecast') {
            if (typeof record[field] !== 'boolean') throw new Error('Forecast flag must be boolean');
          } else if (typeof record[field] !== 'number') throw new Error(`${role} must be numeric`);
        }
        if ('size' in spec.encodings && spec.encodings.size && Number(record[spec.encodings.size]) < 0)
          throw new Error('Size cannot be negative');
        if (spec.type === 'ranking' && Number(record[spec.encodings.value]) < 0)
          throw new Error('V1 ranking requires nonnegative values');
        if (
          spec.type === 'forecast' &&
          !(
            Number(record[spec.encodings.lower]) <= Number(record[spec.encodings.value]) &&
            Number(record[spec.encodings.value]) <= Number(record[spec.encodings.upper])
          )
        )
          throw new Error('Forecast intervals must contain the central value');
        if (
          spec.type === 'event-map' &&
          spec.coordinates === 'geographic' &&
          (Math.abs(Number(record[spec.encodings.x])) > 180 ||
            Math.abs(Number(record[spec.encodings.y])) > 90)
        )
          throw new Error('Geographic coordinates must be longitude/latitude');
      }
    }
    unique(
      spec.data.map((d) => JSON.stringify([d[key], time ? d[time] : null])),
      'Entity/time keys',
    );
    if (spec.type === 'forecast') {
      const e = spec.encodings;
      for (const entity of entityIds(spec)) {
        let projected = false;
        for (const record of spec.data
          .filter((d) => d[e.id] === entity)
          .sort((a, b) => Number(a[e.time]) - Number(b[e.time]))) {
          if (projected && record[e.forecast] === false)
            throw new Error('Observed values cannot follow forecast values within a series');
          projected ||= record[e.forecast] === true;
        }
      }
    }
    if (spec.type === 'table') {
      unique(
        spec.columns.map((c) => c.key),
        'Column keys',
      );
      if (spec.columns[0].type !== 'text' || spec.columns[0].total !== 'none')
        throw new Error('The first table column must be a text row heading without aggregation');
      if (spec.sort && !spec.columns.some((c) => c.key === spec.sort!.key && c.type !== 'sparkline'))
        throw new Error('Sort must reference a sortable column');
    }
    if (spec.type === 'event-map')
      unique(
        spec.regions.map((d) => d.id),
        'Region IDs',
      );
  }
  const entities = entityIds(spec);
  for (const annotation of spec.annotations)
    if (annotation.entityId && !entities.includes(annotation.entityId))
      throw new Error(`Unknown annotation entity ${annotation.entityId}`);
  return spec;
}
export function parseVisualization(input: unknown): VisualizationSpec {
  return validateVisual(visualizationSchema.parse(input));
}
export function parseStory(input: unknown): StorySpec {
  const story = storySchema.parse(input);
  if (story.version === '1.0' && story.visuals.some((visual) => visual.version === '1.1'))
    throw new Error('New visual families require StorySpec version 1.1');
  unique(
    story.visuals.map((d) => d.id),
    'Visual IDs',
  );
  unique(
    story.scenes.map((d) => d.id),
    'Scene IDs',
  );
  story.visuals.forEach(validateVisual);
  for (const scene of story.scenes) {
    const visual = story.visuals.find((d) => d.id === scene.visualId);
    if (!visual) throw new Error(`Scene ${scene.id} references unknown visual ${scene.visualId}`);
    const entities = entityIds(visual);
    for (const focus of scene.focusIds)
      if (!entities.includes(focus)) throw new Error(`Unknown focus entity ${focus}`);
    for (const annotation of scene.annotationIds)
      if (!visual.annotations.some((d) => d.id === annotation))
        throw new Error(`Unknown annotation ${annotation}`);
    const timeline = times(visual);
    if (
      scene.state.time !== undefined &&
      (!timeline.length || scene.state.time < timeline[0] || scene.state.time > timeline.at(-1)!)
    )
      throw new Error('Scene time must lie within the visual timeline');
    if (scene.state.revealCount !== undefined && !['contribution', 'dumbbell'].includes(visual.type))
      throw new Error('revealCount is supported by contribution and dumbbell');
  }
  return story;
}
