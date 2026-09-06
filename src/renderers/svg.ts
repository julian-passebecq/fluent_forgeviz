import { select, type Selection } from 'd3';
import type { ChartSpec, Scene } from '../core/spec.js';
import { layoutChart, type Entity } from './layout.js';
import { updateMarks } from './joins.js';
export function renderSvg(
  surface: HTMLElement,
  spec: ChartSpec,
  scene: Scene | undefined,
  width: number,
  duration: number,
  selected: ChartSpec['annotations'],
) {
  const layout = layoutChart(spec, scene, width);
  const svg = select(surface)
    .selectAll<SVGSVGElement, null>('svg.vf-chart')
    .data([null])
    .join('svg')
    .attr('class', 'vf-chart')
    .attr('viewBox', `0 0 ${layout.width} ${layout.height}`)
    .attr('role', 'img')
    .attr('aria-label', `${spec.accessibility.summary} ${layout.entities.map((d) => d.label).join('. ')}`);
  svg
    .selectAll('title')
    .data([spec.title])
    .join('title')
    .text((d) => d);
  svg
    .selectAll('desc')
    .data([
      `${spec.accessibility.summary} Source: ${spec.source}. Note: ${spec.note}. ${selected.map((a) => a.text).join(' ')}`,
    ])
    .join('desc')
    .text((d) => d);
  const backdrop = svg
    .selectAll<SVGGElement, null>('g.vf-backdrop')
    .data([null])
    .join('g')
    .attr('class', 'vf-backdrop')
    .attr('aria-hidden', 'true');
  updateMarks(
    select(backdrop.node()!) as Selection<SVGGElement, unknown, null, undefined>,
    layout.decorations,
    duration,
  );
  const groups = svg
    .selectAll<SVGGElement, Entity>('g.vf-entity')
    .data(layout.entities, (d) => JSON.stringify([spec.id, d.id]))
    .join(
      (enter) => enter.append('g').attr('class', 'vf-entity').attr('opacity', 0),
      (update) => update,
      (exit) => {
        exit.selectAll('*').interrupt('vizforge');
        return exit.interrupt('vizforge').remove();
      },
    )
    .attr('data-entity-id', (d) => d.id)
    .attr('aria-hidden', 'true');
  groups.each(function (d) {
    const group = select(this).interrupt('vizforge');
    if (duration > 0) group.transition('vizforge').duration(duration).attr('opacity', 1);
    else group.attr('opacity', 1);
    group.attr('data-focus', String(d.opacity === 1));
    group
      .selectAll('title')
      .data([d.label])
      .join('title')
      .text((v) => v);
    const focusedMarks = d.marks.map((m) => ({
      ...m,
      attrs:
        m.tag === 'text'
          ? { ...m.attrs, ...(d.opacity < 1 ? { fill: spec.theme.muted } : {}) }
          : { ...m.attrs, opacity: Number(m.attrs.opacity ?? 1) * d.opacity },
    }));
    updateMarks(select(this) as Selection<SVGGElement, unknown, null, undefined>, focusedMarks, duration);
  });
}
