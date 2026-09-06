import { z } from 'zod';

export const id = z.string().trim().min(1).max(160);
export const finite = z.number().finite();
export const formatSchema = z
  .object({
    style: z.enum(['number', 'currency', 'percent']).default('number'),
    digits: z.number().int().min(0).max(6).default(0),
    currency: z
      .string()
      .regex(/^[A-Z]{3}$/)
      .default('USD'),
    unit: z.string().max(30).optional(),
  })
  .strict();
export const themeSchema = z
  .object({
    ink: z
      .string()
      .regex(/^#[\da-fA-F]{6}$/)
      .default('#203d3b'),
    muted: z
      .string()
      .regex(/^#[\da-fA-F]{6}$/)
      .default('#596762'),
    grid: z
      .string()
      .regex(/^#[\da-fA-F]{6}$/)
      .default('#e1e6de'),
    background: z
      .string()
      .regex(/^#[\da-fA-F]{6}$/)
      .default('#ffffff'),
    palette: z
      .array(z.string().regex(/^#[\da-fA-F]{6}$/))
      .min(2)
      .default(['#207466', '#a8542a', '#536c91', '#9b657c', '#766e32', '#456a78']),
  })
  .strict();
const annotationSchema = z
  .object({ id, text: z.string().min(1), shortText: z.string().min(1).optional(), entityId: id.optional() })
  .strict();
export const base = {
  id,
  version: z.literal('1.0'),
  title: z.string().min(1),
  subtitle: z.string().optional(),
  takeaway: z.string().min(1),
  source: z.string().min(1),
  note: z.string().min(1),
  accessibility: z.object({ summary: z.string().min(1) }).strict(),
  theme: themeSchema.default({}),
  formatting: formatSchema.default({}),
  annotations: z.array(annotationSchema).default([]),
  animation: z
    .object({ durationMs: z.number().int().min(0).max(2000).default(650) })
    .strict()
    .default({}),
};
const value = z.union([z.string(), finite, z.boolean(), z.null(), z.array(finite)]);
export const row = z.record(value);
export const data = z.array(row).min(1).max(10000);
export const entity = { id, label: id };
export const temporal = { ...entity, time: id };
export const domains = {
  xDomain: z.tuple([finite, finite]).optional(),
  yDomain: z.tuple([finite, finite]).optional(),
};
