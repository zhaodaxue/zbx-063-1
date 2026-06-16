import { Scale, BarChart3 } from 'lucide-react';
import { useViewStore } from '@/store/useViewStore';

export default function CompareToggle() {
  const compareMode = useViewStore((s) => s.compareMode);
  const setCompareMode = useViewStore((s) => s.setCompareMode);

  return (
    <button
      onClick={() => setCompareMode(!compareMode)}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
        compareMode
          ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30'
          : 'bg-white/60 text-amber-800 hover:bg-white/80 border border-amber-200'
      }`}
    >
      {compareMode ? (
        <>
          <BarChart3 size={16} />
          <span>对照模式 · 开启</span>
        </>
      ) : (
        <>
          <Scale size={16} />
          <span>对照模式</span>
        </>
      )}
    </button>
  );
}
