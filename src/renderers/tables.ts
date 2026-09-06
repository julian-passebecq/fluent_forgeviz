import { group, line, scaleLinear } from 'd3';
import { formatValue } from '../core/format.js';
import type { DataRow, HierarchyNode, MatrixSpec, NumberFormat, Scene, TableSpec } from '../core/spec.js';

function element<K extends keyof HTMLElementTagNameMap>(tag: K, text?: string): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  if (text !== undefined) el.textContent = text;
  return el;
}
export function sparkline(values: number[], ink: string): SVGSVGElement {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 84 28');
  svg.setAttribute('width', '84');
  svg.setAttribute('height', '28');
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', `Trend: ${values.join(', ')}`);
  const x = scaleLinear()
    .domain([0, Math.max(1, values.length - 1)])
    .range([2, 82]);
  let min = Math.min(...values),
    max = Math.max(...values);
  if (min === max) {
    min -= 1;
    max += 1;
  }
  const y = scaleLinear().domain([min, max]).range([25, 3]);
  const path = document.createElementNS(svg.namespaceURI, 'path');
  path.setAttribute(
    'd',
    line<number>()
      .x((_, i) => x(i))
      .y((d) => y(d))(values) ?? '',
  );
  path.setAttribute('fill', 'none');
  path.setAttribute('stroke', ink);
  path.setAttribute('stroke-width', '2');
  svg.append(path);
  return svg;
}
function numeric(
  cell: HTMLTableCellElement,
  value: number,
  format: NumberFormat,
  barMax?: number,
  variance = false,
) {
  cell.className = 'vf-number';
  const label = (variance && value > 0 ? '+' : '') + formatValue(value, format);
  const span = element('span', label);
  span.className = 'vf-cell-value';
  cell.append(span);
  if (variance) cell.dataset.sign = value > 0 ? 'positive' : value < 0 ? 'negative' : 'neutral';
  if (barMax && value !== 0) {
    const bar = element('span');
    bar.className = 'vf-data-bar';
    bar.setAttribute('aria-hidden', 'true');
    bar.style.width = `${Math.min(100, (Math.abs(value) / barMax) * 100)}%`;
    if (value < 0) bar.style.background = '#f1ded1';
    cell.prepend(bar);
  }
}
export function aggregate(values: number[], method: 'sum' | 'mean'): number | null {
  if (!values.length) return null;
  const sum = values.reduce((a, b) => a + b, 0);
  return method === 'mean' ? sum / values.length : sum;
}
export function sortedRows(spec: TableSpec): DataRow[] {
  const rows = spec.data.slice();
  if (!spec.sort) return rows;
  const { key, direction } = spec.sort;
  return rows.sort((a, b) => {
    const cmp =
      typeof a[key] === 'number' && typeof b[key] === 'number'
        ? Number(a[key]) - Number(b[key])
        : String(a[key]).localeCompare(String(b[key]));
    return (direction === 'asc' ? cmp : -cmp) || String(a[spec.rowId]).localeCompare(String(b[spec.rowId]));
  });
}
function shell(title: string) {
  const table = element('table');
  table.className = 'vf-table';
  const caption = element('caption', title);
  caption.className = 'vf-sr-only';
  table.append(caption);
  return table;
}
/** Reconcile rows by their semantic ID even when the presentation sort changes. */
function reconcileRows(
  body: HTMLTableSectionElement,
  ids: string[],
  render: (tr: HTMLTableRowElement, index: number) => void,
) {
  const existing = new Map(Array.from(body.rows).map((tr) => [tr.dataset.entityId!, tr]));
  ids.forEach((id, index) => {
    const tr = existing.get(id) ?? element('tr');
    existing.delete(id);
    tr.dataset.entityId = id;
    tr.replaceChildren();
    render(tr, index);
    body.append(tr);
  });
  existing.forEach((tr) => tr.remove());
}
export function renderTable(host: HTMLElement, spec: TableSpec, scene?: Scene) {
  let table = host.querySelector<HTMLTableElement>('table.vf-table');
  if (!table || table.dataset.visualId !== spec.id) {
    table = shell(spec.title);
    table.dataset.visualId = spec.id;
    host.replaceChildren(table);
  }
  const head = table.tHead ?? table.createTHead();
  head.replaceChildren();
  const header = head.insertRow();
  for (const column of spec.columns) {
    const th = element('th', column.label);
    th.scope = 'col';
    if (spec.sort?.key === column.key)
      th.setAttribute('aria-sort', spec.sort.direction === 'asc' ? 'ascending' : 'descending');
    if (column.type !== 'text') th.className = 'vf-number';
    header.append(th);
  }
  const rows = sortedRows(spec),
    body = table.tBodies[0] ?? table.createTBody();
  type DisplayRow = { id: string; row?: DataRow; label?: string; members?: DataRow[] };
  const displayed: DisplayRow[] = spec.groupBy
    ? [...group(rows, (d) => String(d[spec.groupBy!]))].flatMap(([label, members]) => [
        ...members.map((row) => ({ id: String(row[spec.rowId]), row })),
        { id: `$subtotal:${label}`, label, members },
      ])
    : rows.map((row) => ({ id: String(row[spec.rowId]), row }));
  reconcileRows(
    body,
    displayed.map((d) => d.id),
    (tr, index) => {
      const item = displayed[index],
        row = item.row;
      tr.className = row ? '' : 'vf-subtotal';
      if (!row) {
        tr.dataset.focus = 'true';
        spec.columns.forEach((column, i) => {
          const cell = element(i === 0 ? 'th' : 'td');
          if (i === 0) {
            cell.scope = 'row';
            cell.textContent = `${item.label} subtotal`;
          } else if (column.total !== 'none')
            numeric(
              cell,
              aggregate(
                item.members!.map((d) => Number(d[column.key])),
                column.total,
              )!,
              column.format,
            );
          else cell.textContent = '—';
          tr.append(cell);
        });
        return;
      }
      tr.dataset.focus = String(!scene?.focusIds.length || scene.focusIds.includes(String(row[spec.rowId])));
      spec.columns.forEach((column, i) => {
        const cell = element(i === 0 ? 'th' : 'td');
        if (cell instanceof HTMLTableCellElement && i === 0) cell.scope = 'row';
        const value = row[column.key];
        if (column.type === 'number' || column.type === 'variance')
          numeric(
            cell,
            Number(value),
            column.format,
            column.dataBar ? Math.max(...spec.data.map((d) => Math.abs(Number(d[column.key])))) : undefined,
            column.type === 'variance',
          );
        else if (column.type === 'sparkline')
          cell.append(sparkline(value as number[], spec.theme.palette[0]));
        else if (column.type === 'status') {
          cell.dataset.sign = String(value);
          cell.textContent =
            value === 'positive' ? '↗ On track' : value === 'negative' ? '↘ At risk' : '→ Steady';
        } else cell.textContent = String(value);
        tr.append(cell);
      });
    },
  );
  const foot = table.tFoot ?? table.createTFoot();
  foot.replaceChildren();
  if (spec.columns.some((c) => c.total !== 'none')) {
    const tr = foot.insertRow();
    spec.columns.forEach((column, i) => {
      const cell = element(i === 0 ? 'th' : 'td');
      if (i === 0) {
        cell.scope = 'row';
        cell.textContent = spec.totalLabel;
      } else if (column.total !== 'none')
        numeric(
          cell,
          aggregate(
            spec.data.map((d) => Number(d[column.key])),
            column.total,
          )!,
          column.format,
        );
      else cell.textContent = '—';
      tr.append(cell);
    });
  }
}
export function descendants(nodes: HierarchyNode[], id?: string): string[] {
  if (!id) return nodes.filter((n) => !nodes.some((c) => c.parentId === n.id)).map((n) => n.id);
  const children = nodes.filter((n) => n.parentId === id);
  return children.length ? children.flatMap((n) => descendants(nodes, n.id)) : [id];
}
export function matrixValue(
  spec: MatrixSpec,
  rowId: string | undefined,
  columnId: string | undefined,
  measureKey: string,
): number | null {
  const rows = descendants(spec.rows, rowId),
    cols = descendants(spec.columns, columnId);
  const measure = spec.measures.find((m) => m.key === measureKey)!;
  return aggregate(
    spec.data
      .filter((d) => rows.includes(d.rowId) && cols.includes(d.columnId))
      .map((d) => d.values[measureKey]),
    measure.aggregate,
  );
}
function orderedHierarchy(
  nodes: HierarchyNode[],
  parentId?: string,
  depth = 0,
): (HierarchyNode & { depth: number; subtotal: boolean })[] {
  return nodes
    .filter((n) => n.parentId === parentId)
    .flatMap((node) => {
      const children = orderedHierarchy(nodes, node.id, depth + 1);
      return [...children, { ...node, depth, subtotal: children.length > 0 }];
    });
}
function hierarchyLabel(nodes: HierarchyNode[], node: HierarchyNode): string {
  return node.parentId
    ? `${hierarchyLabel(nodes, nodes.find((n) => n.id === node.parentId)!)} / ${node.label}`
    : node.label;
}
export function renderMatrix(host: HTMLElement, spec: MatrixSpec, scene?: Scene) {
  let table = host.querySelector<HTMLTableElement>('table.vf-table');
  if (!table || table.dataset.visualId !== spec.id) {
    table = shell(spec.title);
    table.dataset.visualId = spec.id;
    host.replaceChildren(table);
  }
  const columns = orderedHierarchy(spec.columns),
    rows = orderedHierarchy(spec.rows);
  const displayedColumns = [
    ...columns.map((c) => ({
      id: c.id as string | undefined,
      label: hierarchyLabel(spec.columns, c) + (c.subtotal ? ' subtotal' : ''),
      subtotal: c.subtotal,
    })),
    ...(spec.grandTotals ? [{ id: undefined, label: 'Grand total', subtotal: true }] : []),
  ];
  const head = table.tHead ?? table.createTHead();
  head.replaceChildren();
  const header = head.insertRow();
  const first = element('th', spec.rowLabel);
  first.scope = 'col';
  header.append(first);
  for (const col of displayedColumns)
    for (const measure of spec.measures) {
      const th = element('th', `${col.label} · ${measure.label}`);
      th.scope = 'col';
      th.className = 'vf-number';
      header.append(th);
    }
  const body = table.tBodies[0] ?? table.createTBody();
  reconcileRows(
    body,
    rows.map((r) => r.id),
    (tr, index) => {
      const row = rows[index];
      tr.className = row.subtotal ? 'vf-subtotal' : '';
      tr.dataset.focus = String(
        !scene?.focusIds.length ||
          scene.focusIds.includes(row.id) ||
          scene.focusIds.some((id) => descendants(spec.rows, id).includes(row.id)),
      );
      const th = element('th', row.label + (row.subtotal ? ' subtotal' : ''));
      th.scope = 'row';
      th.style.paddingLeft = `${14 + row.depth * 16}px`;
      tr.append(th);
      for (const col of displayedColumns)
        for (const measure of spec.measures) {
          const td = element('td'),
            value = matrixValue(spec, row.id, col.id, measure.key);
          const max = Math.max(1, ...spec.data.map((d) => Math.abs(d.values[measure.key])));
          if (value === null) td.textContent = '—';
          else
            numeric(
              td,
              value,
              measure.format,
              measure.dataBar && !col.subtotal && !row.subtotal ? max : undefined,
            );
          if (col.subtotal) td.classList.add('vf-subtotal');
          tr.append(td);
        }
    },
  );
  const foot = table.tFoot ?? table.createTFoot();
  foot.replaceChildren();
  if (spec.grandTotals) {
    const tr = foot.insertRow();
    const th = element('th', 'Grand total');
    th.scope = 'row';
    tr.append(th);
    for (const col of displayedColumns)
      for (const measure of spec.measures) {
        const td = element('td'),
          value = matrixValue(spec, undefined, col.id, measure.key);
        if (value === null) td.textContent = '—';
        else numeric(td, value, measure.format);
        tr.append(td);
      }
  }
}
