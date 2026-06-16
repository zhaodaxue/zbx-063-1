import type { IngredientNode } from '@/data/ingredients';

export interface PieSlice {
  node: IngredientNode;
  startAngle: number;
  endAngle: number;
  percentage: number;
}

export function getContrastTextColor(hexColor: string): string {
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? '#3D2B1F' : '#FFF9F0';
}

export function calculateSlices(items: IngredientNode[]): PieSlice[] {
  const total = items.reduce((sum, item) => sum + item.weight, 0);
  if (total === 0) return [];

  const slices: PieSlice[] = [];
  let currentAngle = -Math.PI / 2;

  for (const item of items) {
    const percentage = item.weight / total;
    const angleSpan = percentage * Math.PI * 2;
    slices.push({
      node: item,
      startAngle: currentAngle,
      endAngle: currentAngle + angleSpan,
      percentage: percentage * 100,
    });
    currentAngle += angleSpan;
  }

  return slices;
}

export function polarToCartesian(
  cx: number,
  cy: number,
  radius: number,
  angle: number,
): { x: number; y: number } {
  return {
    x: cx + radius * Math.cos(angle),
    y: cy + radius * Math.sin(angle),
  };
}

export function describeSlice(
  cx: number,
  cy: number,
  outerRadius: number,
  innerRadius: number,
  startAngle: number,
  endAngle: number,
): string {
  const startOuter = polarToCartesian(cx, cy, outerRadius, endAngle);
  const endOuter = polarToCartesian(cx, cy, outerRadius, startAngle);
  const startInner = polarToCartesian(cx, cy, innerRadius, endAngle);
  const endInner = polarToCartesian(cx, cy, innerRadius, startAngle);

  const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;

  return [
    `M ${startOuter.x} ${startOuter.y}`,
    `A ${outerRadius} ${outerRadius} 0 ${largeArc} 0 ${endOuter.x} ${endOuter.y}`,
    `L ${endInner.x} ${endInner.y}`,
    `A ${innerRadius} ${innerRadius} 0 ${largeArc} 1 ${startInner.x} ${startInner.y}`,
    'Z',
  ].join(' ');
}

export function getTotalWeight(items: IngredientNode[]): number {
  return items.reduce((sum, item) => sum + item.weight, 0);
}

export function formatPercent(value: number): string {
  return value.toFixed(1) + '%';
}

export function formatWeight(value: number): string {
  return value.toFixed(1) + ' kg';
}
