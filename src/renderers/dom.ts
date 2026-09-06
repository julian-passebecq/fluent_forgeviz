import { select } from 'd3';
import { formatValue } from '../core/format.js';
import { parseVisualization, type Scene, type VisualizationSpec } from '../core/spec.js';
import { styles } from './styles.js';
import { el } from './html.js';
import { renderSvg } from './svg.js';
import { renderUnderlyingData } from './data-accessibility.js';
import { renderMatrix, renderTable, sparkline } from './tables.js';

export interface RenderOptions {
  width?: number;
  reducedMotion?: boolean;
  animate?: boolean;
}
export interface Renderer {
  update(spec: unknown, scene?: Scene, options?: RenderOptions): void;
  settle(): void;
  destroy(): void;
  element: HTMLElement;
}

/** DOM + D3 only. A single instance owns its host subtree, listeners and transitions. */
export function createRenderer(host: HTMLElement): Renderer {
  const figure = el('figure');
  figure.className = 'vf-figure';
  const style = el('style', styles),
    caption = el('figcaption'),
    title = el('h2'),
    subtitle = el('p');
  subtitle.className = 'vf-subtitle';
  caption.append(title, subtitle);
  const kpi = el('div');
  kpi.className = 'vf-kpi';
  const surface = el('div');
  surface.className = 'vf-surface';
  const annotations = el('div');
  annotations.className = 'vf-annotations';
  const source = el('p');
  source.className = 'vf-source';
  const details = el('details');
  details.className = 'vf-details';
  const summary = el('summary', 'Explore the underlying data');
  const dataView = el('div');
  dataView.className = 'vf-scroll';
  dataView.tabIndex = 0;
  dataView.setAttribute('role', 'region');
  dataView.setAttribute('aria-label', 'Underlying chart data');
  details.append(summary, dataView);
  figure.append(style, caption, kpi, surface, annotations, source, details);
  host.append(figure);
  const media = typeof matchMedia === 'function' ? matchMedia('(prefers-reduced-motion: reduce)') : undefined;
  let last: { spec: VisualizationSpec; scene?: Scene; options: RenderOptions } | undefined;
  let paintedWidth: number | undefined;
  let dead = false;
  function paint(spec: VisualizationSpec, scene?: Scene, options: RenderOptions = {}) {
    if (dead) return;
    const hadLast = !!last,
      same = last?.spec.id === spec.id;
    last = { spec, scene, options };
    const width = options.width ?? (host.getBoundingClientRect().width || 800);
    paintedWidth = width;
    const reduced = options.reducedMotion === true || media?.matches === true;
    const duration =
      reduced || options.animate === false || !hadLast || (!same && scene?.transition.intent !== 'scene')
        ? 0
        : (scene?.transition.durationMs ?? spec.animation.durationMs);
    figure.dataset.visualType = spec.type;
    figure.dataset.sceneId = scene?.id ?? 'static';
    figure.dataset.reducedMotion = String(reduced);
    figure.dataset.transitionMs = String(duration);
    figure.style.setProperty('--vf-ink', spec.theme.ink);
    figure.style.setProperty('--vf-muted', spec.theme.muted);
    title.textContent = spec.title;
    subtitle.textContent = spec.subtitle ?? spec.takeaway;
    if (spec.type === 'forecast')
      subtitle.textContent += ` · Solid: observed. Dashed: forecast. Shading: ${spec.intervalLabel}.`;
    if (
      spec.type === 'scatter' &&
      spec.encodings.size &&
      !subtitle.textContent.toLowerCase().includes('bubble area')
    )
      subtitle.textContent += ` · Bubble area: ${spec.encodings.size}.`;
    source.textContent = `Source: ${spec.source} · Note: ${spec.note}`;
    annotations.replaceChildren();
    const selected = scene
      ? scene.annotationIds.flatMap((id) => spec.annotations.filter((annotation) => annotation.id === id))
      : spec.annotations;
    // Phone annotations are concise and progressively disclosed; every annotation stays available.
    const visible = width < 540 ? selected.slice(0, 1) : selected;
    for (const annotation of visible) {
      const p = el('p', width < 540 ? (annotation.shortText ?? annotation.text) : annotation.text);
      p.dataset.annotationId = annotation.id;
      annotations.append(p);
    }
    if (selected.length > visible.length) {
      const more = el('details');
      more.append(el('summary', `${selected.length - visible.length} more annotation(s)`));
      for (const annotation of selected.slice(visible.length)) more.append(el('p', annotation.text));
      annotations.append(more);
    }
    if (width < 540 && visible.some((annotation) => annotation.shortText)) {
      const full = el('details');
      full.append(el('summary', 'Full annotation'));
      for (const annotation of visible.filter((annotation) => annotation.shortText))
        full.append(el('p', annotation.text));
      annotations.append(full);
    }
    annotations.hidden = !selected.length;
    kpi.replaceChildren();
    kpi.hidden = spec.type !== 'contribution';
    if (spec.type === 'contribution') {
      const current =
        spec.baseline +
        spec.data
          .slice(0, scene?.state.revealCount ?? spec.data.length)
          .reduce((sum, d) => sum + Number(d[spec.encodings.value]), 0);
      const fmt = (n: number) => formatValue(n, spec.formatting);
      const primary = el('div');
      primary.append(el('small', spec.kpi.label), el('strong', fmt(current)));
      kpi.append(primary);
      const comparison = el('div');
      comparison.append(
        el('small', `Comparison ${fmt(spec.kpi.comparison)}`),
        el(
          'span',
          `Variance ${current - spec.kpi.comparison >= 0 ? '+' : ''}${fmt(current - spec.kpi.comparison)}`,
        ),
      );
      kpi.append(comparison);
      const onTrack = spec.kpi.direction === 'up' ? current >= spec.kpi.target : current <= spec.kpi.target;
      const target = el('div');
      target.append(
        el('small', `Target ${fmt(spec.kpi.target)}`),
        el('span', onTrack ? '↗ On track' : '→ Outside target'),
      );
      kpi.append(target);
      if (spec.kpi.sparkline) kpi.append(sparkline(spec.kpi.sparkline, spec.theme.palette[0]));
    }
    if (spec.type === 'table' || spec.type === 'matrix') {
      surface.querySelector('svg')?.remove();
      surface.classList.add('vf-scroll');
      surface.tabIndex = 0;
      surface.setAttribute('role', 'region');
      surface.setAttribute('aria-label', spec.accessibility.summary);
      if (spec.type === 'table') renderTable(surface, spec, scene);
      else renderMatrix(surface, spec, scene);
      details.hidden = true;
    } else {
      if (surface.querySelector('table')) surface.replaceChildren();
      surface.classList.remove('vf-scroll');
      surface.removeAttribute('tabindex');
      surface.removeAttribute('role');
      surface.removeAttribute('aria-label');
      renderSvg(surface, spec, scene, width, duration, selected);
      details.hidden = false;
      renderUnderlyingData(dataView, spec);
    }
  }
  const settle = () => {
    if (last) paint(last.spec, last.scene, { ...last.options, animate: false });
  };
  const resize =
    typeof ResizeObserver === 'function'
      ? new ResizeObserver(() => {
          if (!last || last.options.width || paintedWidth === undefined) return;
          const nextWidth = host.getBoundingClientRect().width;
          // Layout is width-driven. Narrative/annotation height reflow must not interrupt an active D3 transition.
          if (Number.isFinite(nextWidth) && nextWidth > 0 && Math.abs(nextWidth - paintedWidth) > 0.5) settle();
        })
      : undefined;
  resize?.observe(host);
  media?.addEventListener('change', settle);
  return {
    element: figure,
    update(input, scene, options) {
      paint(parseVisualization(input), scene, options);
    },
    settle,
    destroy() {
      dead = true;
      resize?.disconnect();
      media?.removeEventListener('change', settle);
      select(figure).selectAll('*').interrupt('vizforge');
      figure.remove();
      last = undefined;
    },
  };
}
