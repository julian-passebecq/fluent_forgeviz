import {} from 'd3';
import { sankey, sankeyLinkHorizontal } from 'd3-sankey';
import { compact } from '../../core/format.js';
import type { ChartSpec } from '../../core/spec.js';
import { mark, text, short, type Layout, type LayoutContext } from '../layout-shared.js';
export function flowLayout(spec: Extract<ChartSpec, { type: 'flow' }>, context: LayoutContext): Layout {
  const { width, phone, height, entities, ink, muted, color, fmt, add, scene } = context;

  type FlowNode = { id: string; label: string };
  type FlowLink = { id: string };
  const graph = sankey<FlowNode, FlowLink>()
    .nodeId((d) => d.id)
    .nodeWidth(phone ? 10 : 15)
    .nodePadding(25)
    .extent([
      [phone ? 45 : 100, 30],
      [width - (phone ? 45 : 100), height - 25],
    ])({ nodes: spec.nodes.map((d) => ({ ...d })), links: spec.links.map((d) => ({ ...d })) });
  const linkPath = sankeyLinkHorizontal<FlowNode, FlowLink>();
  for (const link of graph.links) {
    const source = link.source as (typeof graph.nodes)[number],
      target = link.target as (typeof graph.nodes)[number];
    add(link.id, `${source.label} to ${target.label}: ${fmt(link.value)}`, [
      mark('link', 'path', {
        d: linkPath(link) ?? '',
        fill: 'none',
        stroke: color(source.id),
        'stroke-width': Math.max(1, link.width ?? 1),
        'stroke-opacity': 0.35,
      }),
    ]);
    if (scene?.focusIds.includes(source.id) || scene?.focusIds.includes(target.id))
      entities.at(-1)!.opacity = 1;
  }
  for (const node of graph.nodes) {
    const start = node.x0! < width / 2;
    add(node.id, `${node.label}: ${fmt(node.value ?? 0)}`, [
      mark('node', 'rect', {
        x: node.x0!,
        y: node.y0!,
        width: node.x1! - node.x0!,
        height: Math.max(1, node.y1! - node.y0!),
        fill: color(node.id),
        rx: 1,
      }),
      text(
        'label',
        start ? node.x0! - 6 : node.x1! + 6,
        (node.y0! + node.y1!) / 2 - 2,
        short(node.label, phone ? 6 : 15),
        { fill: ink, 'text-anchor': start ? 'end' : 'start', 'font-size': phone ? 9 : 11 },
      ),
      text(
        'value',
        start ? node.x0! - 6 : node.x1! + 6,
        (node.y0! + node.y1!) / 2 + 12,
        compact(node.value ?? 0),
        { fill: muted, 'text-anchor': start ? 'end' : 'start', 'font-size': 10 },
      ),
    ]);
  }

  return {
    width: context.width,
    height: context.height,
    entities: context.entities,
    decorations: context.decorations,
  };
}
