import { Droplets } from 'lucide-react';
import Breadcrumb from '@/components/Breadcrumb';
import PieChart from '@/components/PieChart';
import Sidebar from '@/components/Sidebar';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-bean-200/50 bg-white/40 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-bean-300 flex items-center justify-center shadow-md">
                <Droplets size={20} className="text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-bean-700" style={{ fontFamily: "'Noto Serif SC', serif" }}>
                  投料占比扇区
                </h1>
                <p className="text-xs text-bean-500/70">单批投料结构一览</p>
              </div>
            </div>
            <div className="text-sm text-bean-500/60">
              批次 #2026-06-16-01
            </div>
          </div>
          <Breadcrumb />
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-8">
        <div className="flex items-start gap-10 max-w-5xl w-full justify-center">
          <div className="flex-shrink-0">
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
