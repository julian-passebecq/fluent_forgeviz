import type { NumberFormat } from './spec.js';

export function formatValue(value: number, format: NumberFormat): string {
  const options: Intl.NumberFormatOptions = {
    style: format.style === 'number' ? 'decimal' : format.style,
    minimumFractionDigits: format.digits,
    maximumFractionDigits: format.digits,
  };
  if (format.style === 'currency') options.currency = format.currency;
  return new Intl.NumberFormat('en-US', options).format(value) + (format.unit ? ` ${format.unit}` : '');
}
export function compact(value: number): string {
  return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(value);
}
