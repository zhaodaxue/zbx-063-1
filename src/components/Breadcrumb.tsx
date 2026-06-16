import { ChevronRight, Home } from 'lucide-react';
import { useDrillStore } from '@/store/useDrillStore';

export default function Breadcrumb() {
  const { path, goToLevel, isAtRoot } = useDrillStore();
  const atRoot = isAtRoot();

  return (
    <nav className="flex items-center gap-1 px-2 py-3" aria-label="面包屑导航">
      <button
        onClick={() => goToLevel(0)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
          atRoot
            ? 'text-amber-800 bg-amber-100/80'
            : 'text-amber-700/70 hover:text-amber-800 hover:bg-amber-50'
        }`}
      >
        <Home size={16} />
        <span>{path[0]?.name || '总投料'}</span>
      </button>

      {path.slice(1).map((item, index) => {
        const levelIndex = index + 1;
        const isLast = levelIndex === path.length - 1;

        return (
          <div key={item.id} className="flex items-center gap-1">
            <ChevronRight size={16} className="text-amber-400" />
            <button
              onClick={() => goToLevel(levelIndex)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                isLast
                  ? 'text-amber-900 bg-amber-200/70 shadow-sm'
                  : 'text-amber-700/70 hover:text-amber-800 hover:bg-amber-50'
              }`}
              aria-current={isLast ? 'page' : undefined}
            >
              {item.name}
            </button>
          </div>
        );
      })}
    </nav>
  );
}
