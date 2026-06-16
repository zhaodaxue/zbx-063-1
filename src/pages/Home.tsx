import { Droplets } from 'lucide-react';
import Breadcrumb from '@/components/Breadcrumb';
import PieChart from '@/components/PieChart';
import Sidebar from '@/components/Sidebar';
import CompareToggle from '@/components/CompareToggle';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-bean-200/50 bg-white/40 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between py-3 gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-bean-300 flex items-center justify-center shadow-md flex-shrink-0">
                <Droplets size={20} className="text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-lg font-bold text-bean-700 truncate" style={{ fontFamily: "'Noto Serif SC', serif" }}>
                  投料占比扇区
                </h1>
                <p className="text-xs text-bean-500/70 hidden sm:block">单批投料结构一览</p>
              </div>
            </div>
            <div className="flex items-center gap-3 md:gap-4 flex-shrink-0">
              <div className="text-xs sm:text-sm text-bean-500/60 hidden md:block">
                批次 #2026-06-16-01
              </div>
              <CompareToggle />
            </div>
          </div>
          <Breadcrumb />
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 md:p-8">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-10 max-w-5xl w-full justify-center">
          <div className="flex-shrink-0 w-full md:w-auto flex justify-center">
            <PieChart />
          </div>
          <Sidebar />
        </div>
      </main>

      <footer className="py-4 text-center text-xs text-bean-500/50">
        豆坊投料可视化 · 纯浏览器实现
      </footer>
    </div>
  );
}
