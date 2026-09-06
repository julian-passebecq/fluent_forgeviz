import { select, easeCubicInOut, type Selection } from 'd3';
import type { Mark } from './layout-shared.js';
export function updateMarks(
  parent: Selection<SVGGElement, unknown, null, undefined>,
  marks: Mark[],
  duration: number,
) {
  const joined = parent
    .selectAll<SVGElement, Mark>('.vf-mark')
    .data(marks, (d) => `${d.key}:${d.tag}`)
    .join(
      (enter) =>
        enter
          .append(function (d) {
            return this.ownerDocument.createElementNS('http://www.w3.org/2000/svg', d.tag);
          })
          .attr('class', 'vf-mark'),
      (update) => update,
      (exit) => exit.interrupt('vizforge').remove(),
    );
  joined.each(function (d) {
    const target = select(this).interrupt('vizforge');
    if (d.text !== undefined) target.text(d.text);
    // New elements appear at their true position; updates interpolate the same keyed DOM object.
    const initialized = this.hasAttribute('data-initialized');
    const animated =
      duration > 0 && initialized
        ? target.transition('vizforge').duration(duration).ease(easeCubicInOut)
        : undefined;
    for (const [key, value] of Object.entries(d.attrs)) {
      if (animated) animated.attr(key, value);
      else target.attr(key, value);
    }
    target.attr('data-initialized', 'true').attr('data-mark', d.key);
  });
}
