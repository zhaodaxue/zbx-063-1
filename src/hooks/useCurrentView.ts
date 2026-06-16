import { useMemo } from 'react';
import { useViewStore } from '@/store/useViewStore';
import {
  calculateSlices,
  getTotalWeight,
  hasWarning,
  formatPercent,
  formatWeight,
  formatDeviation,
  getDeviationColor,
  getContrastTextColor,
} from '@/utils/pieUtils';
import type { PieSlice } from '@/utils/pieUtils';

export interface RowData {
  id: string;
  name: string;
  color: string;
  weight: number;
  weightText: string;
  percentage: number;
  percentageText: string;
  standardPercentage: number;
  deviation: number;
  deviationText: string;
  deviationColor: string;
  hasWarning: boolean;
  contrastTextColor: string;
  canDrill: boolean;
}

export interface CurrentViewData {
  path: { id: string; name: string }[];
  parentName: string;
  items: RowData[];
  slices: PieSlice[];
  slicesStandard: PieSlice[];
  totalWeight: number;
  totalWeightText: string;
  itemCount: number;
  warningCount: number;
  compareMode: boolean;
  isAnimating: boolean;
}

function buildSlicesForStandard(slices: PieSlice[]): PieSlice[] {
  let cursor = -Math.PI / 2;
  return slices.map((s) => {
    const span = (s.standardPercentage / 100) * Math.PI * 2;
    const result: PieSlice = {
      ...s,
      startAngle: cursor,
      endAngle: cursor + span,
    };
    cursor += span;
    return result;
  });
}

export function useCurrentView(): CurrentViewData {
  const displayLevel = useViewStore((s) => s.displayLevel);
  const displayParentName = useViewStore((s) => s.displayParentName);
  const path = useViewStore((s) => s.path);
  const compareMode = useViewStore((s) => s.compareMode);
  const phase = useViewStore((s) => s.phase);
  const canDrillDown = useViewStore((s) => s.canDrillDown);

  return useMemo<CurrentViewData>(() => {
    const slices = calculateSlices(displayLevel);
    const slicesStandard = buildSlicesForStandard(slices);
    const totalWeight = getTotalWeight(displayLevel);
    let warningCount = 0;

    const items: RowData[] = slices.map((s) => {
      const warn = hasWarning(s.deviation);
      if (warn) warningCount++;
      return {
        id: s.node.id,
        name: s.node.name,
        color: s.node.color,
        weight: s.node.weight,
        weightText: formatWeight(s.node.weight),
        percentage: s.percentage,
        percentageText: formatPercent(s.percentage),
        standardPercentage: s.standardPercentage,
        deviation: s.deviation,
        deviationText: formatDeviation(s.deviation),
        deviationColor: getDeviationColor(s.deviation),
        hasWarning: warn,
        contrastTextColor: getContrastTextColor(s.node.color),
        canDrill: canDrillDown(s.node),
      };
    });

    return {
      path: path.map((p) => ({ id: p.id, name: p.name })),
      parentName: displayParentName,
      items,
      slices,
      slicesStandard,
      totalWeight,
      totalWeightText: formatWeight(totalWeight),
      itemCount: displayLevel.length,
      warningCount,
      compareMode,
      isAnimating: phase !== 'idle',
    };
  }, [displayLevel, displayParentName, path, compareMode, phase, canDrillDown]);
}
