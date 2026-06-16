import { useMemo } from 'react';
import { Scale, Percent, ChevronRight } from 'lucide-react';
import { useDrillStore } from '@/store/useDrillStore';
import { calculateSlices, getTotalWeight, formatWeight, formatPercent } from '@/utils/pieUtils';

export default function Sidebar() {
  const { currentLevel, currentParentName, drillDown, canDrillDown } = useDrillStore();

  const slices = useMemo(() => calculateSlices(currentLevel), [currentLevel]);
  const totalWeight = useMemo(() => getTotalWeight(currentLevel), [currentLevel]);

  return (
    <aside className="w-full md:w-80 max-w-md md:max-w-none bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg border border-amber-100 p-5 h-fit">
      <div className="mb-4 pb-4 border-b border-amber-100">
        <h2 className="text-lg font-bold text-amber-900 mb-1" style={{ fontFamily: "'Noto Serif SC', serif" }}>
          {currentParentName} · 明细
        </h2>
        <p className="text-sm text-amber-600/70">
          共 {currentLevel.length} 项 · 合计 {formatWeight(totalWeight)}
        </p>
      </div>

      <ul className="space-y-2">
        {slices.map((slice) => {
          const hasChildren = canDrillDown(slice.node);

          return (
            <li key={slice.node.id}>
              <button
                onClick={() => hasChildren && drillDown(slice.node)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${
                  hasChildren
                    ? 'hover:bg-amber-50 cursor-pointer hover:shadow-sm'
                    : 'cursor-default'
                }`}
              >
                <span
                  className="w-4 h-4 rounded-full flex-shrink-0 shadow-sm"
                  style={{ backgroundColor: slice.node.color }}
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-amber-900 truncate">
                      {slice.node.name}
                    </span>
                    {hasChildren && (
                      <ChevronRight size={16} className="text-amber-400 flex-shrink-0 ml-2" />
                    )}
                  </div>

                  <div className="flex items-center gap-3 mt-1 text-xs">
                    <span className="flex items-center gap-1 text-amber-700">
                      <Scale size={12} />
                      {formatWeight(slice.node.weight)}
                    </span>
                    <span className="flex items-center gap-1 text-amber-600/80">
                      <Percent size={11} />
                      {formatPercent(slice.percentage)}
                    </span>
                  </div>

                  <div className="mt-2 h-1.5 bg-amber-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500 ease-out"
                      style={{
                        width: `${slice.percentage}%`,
                        backgroundColor: slice.node.color,
                      }}
                    />
                  </div>
                </div>
              </button>
            </li>
          );
        })}
      </ul>

      <div className="mt-4 pt-4 border-t border-amber-100">
        <div className="flex items-center justify-between text-sm">
          <span className="text-amber-700/70">总重量</span>
          <span className="font-bold text-amber-900">{formatWeight(totalWeight)}</span>
        </div>
        <div className="flex items-center justify-between text-sm mt-1">
          <span className="text-amber-700/70">分项数</span>
          <span className="font-bold text-amber-900">{currentLevel.length} 项</span>
        </div>
      </div>
    </aside>
  );
}
