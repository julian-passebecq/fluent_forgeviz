import type { ChartSpec } from '../core/spec.js';
import { el } from './html.js';
export function renderUnderlyingData(dataView: HTMLElement, spec: ChartSpec) {
  dataView.replaceChildren();
  const table = el('table');
  table.className = 'vf-table';
  table.append(el('caption', 'Canonical source data'));
  const rows = spec.type === 'flow' ? spec.links : spec.data;
  const keys = [...new Set(rows.flatMap((d) => Object.keys(d)))];
  const head = table.createTHead().insertRow();
  for (const key of keys) {
    const th = el('th', key);
    th.scope = 'col';
    head.append(th);
  }
  const body = table.createTBody();
  for (const row of rows) {
    const tr = body.insertRow();
    for (const key of keys) tr.append(el('td', String((row as Record<string, unknown>)[key] ?? '—')));
  }
  dataView.append(table);
}
