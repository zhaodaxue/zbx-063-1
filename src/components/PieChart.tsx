import { useState } from 'react';
import { ChevronUp, AlertTriangle } from 'lucide-react';
import { useCurrentView } from '@/hooks/useCurrentView';
import { useViewStore } from '@/store/useViewStore';
import { describeSlice, polarToCartesian } from '@/utils/pieUtils';
import type { PieSlice } from '@/utils/pieUtils';

const SIZE = 480;
const CENTER = SIZE / 2;
const OUTER_RADIUS = 180;
const INNER_RADIUS = 90;
const STANDARD_RING_OUTER = 196;
const STANDARD_RING_INNER = 186;
const HOVER_OFFSET = 8;
const SMALL_SLICE_THRESHOLD = 5;
const LABEL_OUTER_OFFSET = 28;
const WARNING_STROKE_WIDTH = 3;
const ANIM_DURATION = 300;
const IS_RIGHT = (a: number) => a > -Math.PI / 2 && a < Math.PI / 2;

function StandardRing({ slices }: { slices: PieSlice[] }) {
  return (
    <g>
      {slices.map((s) => (
        <path
          key={`std-${s.node.id}`}
          d={describeSlice(CENTER, CENTER, STANDARD_RING_OUTER, STANDARD_RING_INNER, s.startAngle, s.endAngle)}
          fill={s.node.color}
          fillOpacity={0.25}
          stroke={s.node.color}
          strokeWidth={1}
          strokeOpacity={0.5}
          className="pointer-events-none"
        />
      ))}
    </g>
  );
}

function WarningRing({ slice, offsetX, offsetY, midAngle }: {
  slice: PieSlice;
  offsetX: number;
  offsetY: number;
  midAngle: number;
}) {
  const outerLabelPos = polarToCartesian(CENTER + offsetX, CENTER + offsetY, OUTER_RADIUS + 2, midAngle);
  const sign = IS_RIGHT(midAngle) ? -1 : 1;
  return (
    <g className="pointer-events-none">
      <path
        d={describeSlice(
          CENTER + offsetX,
          CENTER + offsetY,
          OUTER_RADIUS + WARNING_STROKE_WIDTH + 2,
          OUTER_RADIUS + 2,
          slice.startAngle,
          slice.endAngle,
        )}
        fill="#DC2626"
        fillOpacity={0.7}
        style={{ animation: 'pulse 2s ease-in-out infinite' }}
      />
      <circle cx={outerLabelPos.x + sign * 8} cy={outerLabelPos.y - 2} r={10} fill="#DC2626" fillOpacity={0.9} />
      <AlertTriangle
        x={outerLabelPos.x + sign * 15 - (sign < 0 ? 14 : 0)}
        y={outerLabelPos.y - 9}
        width={14}
        height={14}
        stroke="#fff"
        strokeWidth={2}
      />
    </g>
  );
}

function SliceLabels({ slice, offsetX, offsetY, compareMode, isHovered }: {
  slice: PieSlice;
  offsetX: number;
  offsetY: number;
  compareMode: boolean;
  isHovered: boolean;
}) {
  const midAngle = (slice.startAngle + slice.endAngle) / 2;
  const isSmall = slice.percentage < SMALL_SLICE_THRESHOLD;
  const row = useCurrentView().items.find((r) => r.id === slice.node.id)!;

  if (isSmall) {
    const labelPos = polarToCartesian(CENTER + offsetX, CENTER + offsetY, OUTER_RADIUS + LABEL_OUTER_OFFSET, midAngle);
    const outerLabelPos = polarToCartesian(CENTER + offsetX, CENTER + offsetY, OUTER_RADIUS + 2, midAngle);
    const side = IS_RIGHT(midAngle);
    return (
      <g className="pointer-events-none select-none">
        <line
          x1={outerLabelPos.x} y1={outerLabelPos.y}
          x2={labelPos.x} y2={labelPos.y}
          stroke={slice.node.color} strokeWidth={1.5} opacity={0.6}
        />
        <circle cx={labelPos.x} cy={labelPos.y} r={3} fill={slice.node.color} />
        <text
          x={labelPos.x + (side ? 8 : -8)}
          y={labelPos.y - 6}
          textAnchor={side ? 'start' : 'end'}
          dominantBaseline="middle"
          style={{
            fontSize: 12, fontWeight: 600, fill: '#3D2B1F',
            opacity: isHovered ? 1 : 0.85, transition: 'opacity 200ms ease',
          }}
        >
          {slice.node.name} {row.percentageText}
        </text>
        {compareMode && (
          <text
            x={labelPos.x + (side ? 8 : -8)}
            y={labelPos.y + 10}
            textAnchor={side ? 'start' : 'end'}
            dominantBaseline="middle"
            style={{
              fontSize: 11, fontWeight: 600, fill: row.deviationColor,
              opacity: isHovered ? 1 : 0.8, transition: 'opacity 200ms ease',
            }}
          >
            {row.deviationText}
          </text>
        )}
      </g>
    );
  }

  const labelPos = polarToCartesian(CENTER + offsetX, CENTER + offsetY, (OUTER_RADIUS + INNER_RADIUS) / 2, midAngle);
  return (
    <g className="pointer-events-none select-none">
      <text
        x={labelPos.x} y={labelPos.y - (compareMode ? 6 : 0)}
        textAnchor="middle" dominantBaseline="middle"
        style={{
          fontSize: 14, fontWeight: 600, fill: row.contrastTextColor,
          opacity: isHovered ? 1 : 0.95, transition: 'opacity 200ms ease, fill 200ms ease',
        }}
      >
        {slice.node.name}
      </text>
      <text
        x={labelPos.x} y={labelPos.y + 14}
        textAnchor="middle" dominantBaseline="middle"
        style={{
          fontSize: 12, fill: row.contrastTextColor,
          opacity: isHovered ? 0.95 : 0.8, transition: 'opacity 200ms ease, fill 200ms ease',
        }}
      >
        {row.percentageText}
      </text>
      {compareMode && (
        <text
          x={labelPos.x} y={labelPos.y + 32}
          textAnchor="middle" dominantBaseline="middle"
          style={{
            fontSize: 11, fontWeight: 600, fill: row.deviationColor,
            opacity: isHovered ? 1 : 0.85, transition: 'opacity 200ms ease',
          }}
        >
          {row.deviationText}
        </text>
      )}
    </g>
  );
}

function groupTransform(phase: string): React.CSSProperties {
  if (phase === 'exiting') {
    return {
      opacity: 0.4,
      transform: 'scale(0.95)',
      transformOrigin: `${CENTER}px ${CENTER}px`,
      transition: `opacity ${ANIM_DURATION / 2}ms ease, transform ${ANIM_DURATION / 2}ms ease`,
    };
  }
  if (phase === 'entering') {
    return {
      opacity: 1,
      transform: 'scale(1)',
      transformOrigin: `${CENTER}px ${CENTER}px`,
      transition: `opacity ${ANIM_DURATION}ms ease, transform ${ANIM_DURATION}ms cubic-bezier(0.34, 1.56, 0.64, 1)`,
    };
  }
  return {};
}

export default function PieChart() {
  const view = useCurrentView();
  const drillDown = useViewStore((s) => s.drillDown);
  const drillUp = useViewStore((s) => s.drillUp);
  const isAtRoot = useViewStore((s) => s.isAtRoot);
  const phase = useViewStore((s) => s.phase);
  const isLocked = useViewStore((s) => s.isLocked);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const atRoot = isAtRoot();
  const handleCenterClick = () => { if (!atRoot && !isLocked()) drillUp(); };

  return (
    <div className="flex flex-col items-center">
      <svg
        width="100%" height="100%"
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="drop-shadow-xl max-w-[480px] max-h-[480px] w-full h-auto"
        style={{ aspectRatio: '1 / 1' }}
      >
        <defs>
          {view.slices.map((s) => (
            <filter key={`shadow-${s.node.id}`} id={`shadow-${s.node.id}`}>
              <feDropShadow dx="0" dy="2" stdDeviation="4" floodOpacity="0.15" />
            </filter>
          ))}
        </defs>

        {view.compareMode && (
          <g style={groupTransform(phase)}>
            <StandardRing slices={view.slicesStandard} />
          </g>
        )}

        <g style={groupTransform(phase)}>
          {view.slices.map((slice) => {
            const isHovered = hoveredId === slice.node.id;
            const row = view.items.find((r) => r.id === slice.node.id)!;
            const midAngle = (slice.startAngle + slice.endAngle) / 2;
            const offset = isHovered ? HOVER_OFFSET : 0;
            const offsetX = offset * Math.cos(midAngle);
            const offsetY = offset * Math.sin(midAngle);
            const showWarning = view.compareMode && row.hasWarning;
            const pathData = describeSlice(
              CENTER + offsetX, CENTER + offsetY,
              OUTER_RADIUS, INNER_RADIUS,
              slice.startAngle, slice.endAngle,
            );
            return (
              <g key={slice.node.id}>
                {showWarning && <WarningRing slice={slice} offsetX={offsetX} offsetY={offsetY} midAngle={midAngle} />}
                <path
                  d={pathData}
                  fill={slice.node.color}
                  stroke={showWarning ? '#DC2626' : '#fff'}
                  strokeWidth={showWarning ? WARNING_STROKE_WIDTH : 2}
                  style={{
                    cursor: row.canDrill && !isLocked() ? 'pointer' : 'default',
                    transition: 'all 250ms cubic-bezier(0.4, 0, 0.2, 1)',
                    filter: isHovered ? `url(#shadow-${slice.node.id})` : 'none',
                  }}
                  onClick={() => { if (row.canDrill && !isLocked()) drillDown(slice.node); }}
                  onMouseEnter={() => setHoveredId(slice.node.id)}
                  onMouseLeave={() => setHoveredId(null)}
                />
                <SliceLabels slice={slice} offsetX={offsetX} offsetY={offsetY} compareMode={view.compareMode} isHovered={isHovered} />
              </g>
            );
          })}
        </g>

        <circle
          cx={CENTER} cy={CENTER} r={INNER_RADIUS - 4}
          fill="#FFF9F0" stroke="#E8D9A0" strokeWidth={2}
          style={{
            cursor: atRoot || isLocked() ? 'default' : 'pointer',
            transition: 'all 250ms ease',
            filter: !atRoot ? 'drop-shadow(0 2px 8px rgba(0,0,0,0.1))' : 'none',
          }}
          onClick={handleCenterClick}
          onMouseEnter={(e) => { if (!atRoot && !isLocked()) e.currentTarget.setAttribute('fill', '#F5EDE0'); }}
          onMouseLeave={(e) => e.currentTarget.setAttribute('fill', '#FFF9F0')}
        />

        <text
          x={CENTER} y={CENTER - 12}
          textAnchor="middle" dominantBaseline="middle"
          className="pointer-events-none select-none"
          style={{
            fontSize: 13, fontWeight: 500, fill: '#8B7355',
            fontFamily: "'Noto Serif SC', serif",
            opacity: view.isAnimating ? 0.5 : 1,
            transition: 'opacity 300ms ease',
          }}
        >
          {view.parentName}
        </text>
        <text
          x={CENTER} y={CENTER + 10}
          textAnchor="middle" dominantBaseline="middle"
          className="pointer-events-none select-none"
          style={{
            fontSize: 22, fontWeight: 700, fill: '#3D2B1F',
            fontFamily: "'Noto Serif SC', serif",
            opacity: view.isAnimating ? 0.5 : 1,
            transition: 'opacity 300ms ease',
          }}
        >
          {view.totalWeightText}
        </text>
        <text
          x={CENTER} y={CENTER + 32}
          textAnchor="middle" dominantBaseline="middle"
          className="pointer-events-none select-none"
          style={{
            fontSize: 11, fill: '#A08060',
            opacity: view.isAnimating ? 0.5 : 1,
            transition: 'opacity 300ms ease',
          }}
        >
          共 {view.itemCount} 项{view.compareMode && ' · 对照'}
        </text>

        {!atRoot && (
          <g style={{ cursor: isLocked() ? 'default' : 'pointer' }} onClick={handleCenterClick}>
            <circle
              cx={CENTER} cy={CENTER + 52} r={14} fill="#D4A853"
              style={{
                transition: 'fill 200ms ease, opacity 300ms ease',
                opacity: view.isAnimating ? 0.5 : 1,
              }}
            />
            <ChevronUp
              x={CENTER - 8} y={CENTER + 52 - 8}
              width={16} height={16}
              stroke="#fff" strokeWidth={2.5}
              className="pointer-events-none"
            />
          </g>
        )}
      </svg>

      {view.compareMode && (
        <div className="mt-3 flex items-center gap-4 text-xs text-amber-700/70">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-amber-200/50 border border-amber-300/50"></span>
            <span>标准占比</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-red-500/70"></span>
            <span>偏差 ≥3%</span>
          </div>
        </div>
      )}

      <p className="mt-2 text-sm text-amber-700/70 text-center px-4">
        {atRoot ? '点击有子项的扇区可下钻查看详情' : '点击中心圆或上方按钮返回上一级'}
      </p>
    </div>
  );
}
