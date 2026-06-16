import { Scale, Percent, ChevronRight, AlertTriangle } from 'lucide-react';
import { useCurrentView } from '@/hooks/useCurrentView';
import { useViewStore } from '@/store/useViewStore';
import type { RowData } from '@/hooks/useCurrentView';

function SidebarRow({ row, onClick, locked, compareMode }: {
  row: RowData;
  onClick: () => void;
  locked: boolean;
  compareMode: boolean;
}) {
  return (
    <li>
      <button
        onClick={() => row.canDrill && !locked && onClick()}
        className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${
          row.canDrill ? 'hover:bg-amber-50 cursor-pointer hover:shadow-sm' : 'cursor-default'
        } ${row.hasWarning && compareMode ? 'ring-2 ring-red-400/40 bg-red-50/40' : ''}`}
      >
        <span
          className="w-4 h-4 rounded-full flex-shrink-0 shadow-sm"
          style={{ backgroundColor: row.color }}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-amber-900 truncate flex items-center gap-1.5">
              {row.name}
              {row.hasWarning && compareMode && (
                <AlertTriangle size={14} className="text-red-500 flex-shrink-0" />
              )}
            </span>
            {row.canDrill && (
              <ChevronRight size={16} className="text-amber-400 flex-shrink-0 ml-2" />
            )}
          </div>
          <div className={`flex items-center gap-2 sm:gap-3 mt-1 text-xs flex-wrap ${compareMode ? 'justify-between' : ''}`}>
            <span className="flex items-center gap-1 text-amber-700">
              <Scale size={12} />
              {row.weightText}
            </span>
            <span className="flex items-center gap-1 text-amber-600/80">
              <Percent size={11} />
              {row.percentageText}
            </span>
            {compareMode && (
              <span className="flex items-center gap-1 font-semibold" style={{ color: row.deviationColor }}>
                {row.deviationText}
              </span>
            )}
          </div>
          <div className="mt-2 h-1.5 bg-amber-100 rounded-full overflow-hidden relative">
            <div
              className="h-full rounded-full transition-all duration-500 ease-out"
              style={{ width: `${row.percentage}%`, backgroundColor: row.color }}
            />
            {compareMode && (
              <div
                className="absolute top-0 h-full bg-amber-900/30 rounded-r-full"
                style={{ width: `${row.standardPercentage}%`, left: 0 }}
              />
            )}
          </div>
        </div>
      </button>
    </li>
  );
}

export default function Sidebar() {
  const view = useCurrentView();
  const drillDown = useViewStore((s) => s.drillDown);
  const isLocked = useViewStore((s) => s.isLocked);
  const phase = useViewStore((s) => s.phase);

  const animStyle: React.CSSProperties = phase === 'exiting'
    ? { opacity: 0.4, transform: 'translateY(4px)', transition: 'opacity 150ms ease, transform 150ms ease' }
    : phase === 'entering'
      ? { opacity: 1, transform: 'translateY(0)', transition: 'opacity 300ms ease, transform 300ms ease' }
      : {};

  return (
    <aside
      style={animStyle}
      className="w-full md:w-80 max-w-md md:max-w-none bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg border border-amber-100 p-5 h-fit"
    >
      <div className="mb-4 pb-4 border-b border-amber-100">
        <h2 className="text-lg font-bold text-amber-900 mb-1" style={{ fontFamily: "'Noto Serif SC', serif" }}>
          {view.parentName} · 明细
        </h2>
        <p className="text-sm text-amber-600/70">
          共 {view.itemCount} 项 · 合计 {view.totalWeightText}
          {view.compareMode && ' · 对照模式'}
        </p>
      </div>

      <ul className="space-y-2">
        {view.items.map((row) => (
          <SidebarRow
            key={row.id}
            row={row}
            locked={isLocked()}
            compareMode={view.compareMode}
            onClick={() => drillDown(view.slices.find((s) => s.node.id === row.id)!.node)}
          />
        ))}
      </ul>

      <div className="mt-4 pt-4 border-t border-amber-100">
        <div className="flex items-center justify-between text-sm">
          <span className="text-amber-700/70">总重量</span>
          <span className="font-bold text-amber-900">{view.totalWeightText}</span>
        </div>
        <div className="flex items-center justify-between text-sm mt-1">
          <span className="text-amber-700/70">分项数</span>
          <span className="font-bold text-amber-900">{view.itemCount} 项</span>
        </div>
        {view.compareMode && (
          <div className="flex items-center justify-between text-sm mt-1">
            <span className="text-amber-700/70">偏差警示</span>
            <span className="font-bold text-amber-900">{view.warningCount} 项</span>
          </div>
        )}
      </div>

      {view.compareMode && (
        <div className="mt-4 pt-3 border-t border-amber-100 text-xs text-amber-700/60">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-4 h-1.5 bg-amber-900/30 rounded"></div>
            <span>标准占比参考线</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full ring-2 ring-red-400/40 bg-red-50/40"></div>
            <span>偏差绝对值 ≥ 3%</span>
          </div>
        </div>
      )}
    </aside>
  );
}
