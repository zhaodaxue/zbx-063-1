import { useMemo, useState } from 'react';
import { ChevronUp } from 'lucide-react';
import { useDrillStore } from '@/store/useDrillStore';
import {
  calculateSlices,
  describeSlice,
  polarToCartesian,
  formatPercent,
  getTotalWeight,
  formatWeight,
} from '@/utils/pieUtils';
import type { IngredientNode } from '@/data/ingredients';

const SIZE = 480;
const CENTER = SIZE / 2;
const OUTER_RADIUS = 180;
const INNER_RADIUS = 90;
const HOVER_OFFSET = 8;

export default function PieChart() {
  const { currentLevel, drillDown, drillUp, isAtRoot, canDrillDown, currentParentName } = useDrillStore();
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const slices = useMemo(() => calculateSlices(currentLevel), [currentLevel]);
  const totalWeight = useMemo(() => getTotalWeight(currentLevel), [currentLevel]);
  const atRoot = isAtRoot();

  const handleSliceClick = (node: IngredientNode) => {
    if (canDrillDown(node)) {
      drillDown(node);
    }
  };

  const handleCenterClick = () => {
    if (!atRoot) {
      drillUp();
    }
  };

  return (
    <div className="flex flex-col items-center">
      <svg
        width={SIZE}
        height={SIZE}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="drop-shadow-xl"
      >
        <defs>
          {slices.map((slice) => (
            <filter key={`shadow-${slice.node.id}`} id={`shadow-${slice.node.id}`}>
              <feDropShadow dx="0" dy="2" stdDeviation="4" floodOpacity="0.15" />
            </filter>
          ))}
        </defs>

        <g>
          {slices.map((slice) => {
            const isHovered = hoveredId === slice.node.id;
            const hasChildren = canDrillDown(slice.node);
            const offset = isHovered ? HOVER_OFFSET : 0;
            const midAngle = (slice.startAngle + slice.endAngle) / 2;
            const offsetX = offset * Math.cos(midAngle);
            const offsetY = offset * Math.sin(midAngle);

            const pathData = describeSlice(
              CENTER + offsetX,
              CENTER + offsetY,
              OUTER_RADIUS,
              INNER_RADIUS,
              slice.startAngle,
              slice.endAngle,
            );

            const labelRadius = (OUTER_RADIUS + INNER_RADIUS) / 2;
            const labelPos = polarToCartesian(
              CENTER + offsetX,
              CENTER + offsetY,
              labelRadius,
              midAngle,
            );

            return (
              <g key={slice.node.id} className="slice-group">
                <path
                  d={pathData}
                  fill={slice.node.color}
                  stroke="#fff"
                  strokeWidth={2}
                  style={{
                    cursor: hasChildren ? 'pointer' : 'default',
                    transition: 'all 250ms cubic-bezier(0.4, 0, 0.2, 1)',
                    filter: isHovered ? `url(#shadow-${slice.node.id})` : 'none',
                  }}
                  onClick={() => handleSliceClick(slice.node)}
                  onMouseEnter={() => setHoveredId(slice.node.id)}
                  onMouseLeave={() => setHoveredId(null)}
                />
                <text
                  x={labelPos.x}
                  y={labelPos.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="pointer-events-none select-none"
                  style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    fill: '#3D2B1F',
                    opacity: isHovered ? 1 : 0.9,
                    transition: 'opacity 200ms ease',
                  }}
                >
                  {slice.node.name}
                </text>
                <text
                  x={labelPos.x}
                  y={labelPos.y + 18}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="pointer-events-none select-none"
                  style={{
                    fontSize: '12px',
                    fill: '#5C4033',
                    opacity: isHovered ? 0.9 : 0.7,
                    transition: 'opacity 200ms ease',
                  }}
                >
                  {formatPercent(slice.percentage)}
                </text>
              </g>
            );
          })}
        </g>

        <circle
          cx={CENTER}
          cy={CENTER}
          r={INNER_RADIUS - 4}
          fill="#FFF9F0"
          stroke="#E8D9A0"
          strokeWidth={2}
          style={{
            cursor: atRoot ? 'default' : 'pointer',
            transition: 'all 250ms ease',
            filter: !atRoot ? 'drop-shadow(0 2px 8px rgba(0,0,0,0.1))' : 'none',
          }}
          onClick={handleCenterClick}
          onMouseEnter={(e) => {
            if (!atRoot) {
              e.currentTarget.setAttribute('fill', '#F5EDE0');
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.setAttribute('fill', '#FFF9F0');
          }}
        />

        <text
          x={CENTER}
          y={CENTER - 12}
          textAnchor="middle"
          dominantBaseline="middle"
          className="pointer-events-none select-none"
          style={{
            fontSize: '13px',
            fontWeight: 500,
            fill: '#8B7355',
            fontFamily: "'Noto Serif SC', serif",
          }}
        >
          {currentParentName}
        </text>
        <text
          x={CENTER}
          y={CENTER + 10}
          textAnchor="middle"
          dominantBaseline="middle"
          className="pointer-events-none select-none"
          style={{
            fontSize: '22px',
            fontWeight: 700,
            fill: '#3D2B1F',
            fontFamily: "'Noto Serif SC', serif",
          }}
        >
          {formatWeight(totalWeight)}
        </text>
        <text
          x={CENTER}
          y={CENTER + 32}
          textAnchor="middle"
          dominantBaseline="middle"
          className="pointer-events-none select-none"
          style={{
            fontSize: '11px',
            fill: '#A08060',
          }}
        >
          共 {currentLevel.length} 项
        </text>

        {!atRoot && (
          <g
            style={{ cursor: 'pointer' }}
            onClick={handleCenterClick}
          >
            <circle
              cx={CENTER}
              cy={CENTER + 52}
              r={14}
              fill="#D4A853"
              style={{ transition: 'fill 200ms ease' }}
            />
            <ChevronUp
              x={CENTER - 8}
              y={CENTER + 52 - 8}
              width={16}
              height={16}
              stroke="#fff"
              strokeWidth={2.5}
              className="pointer-events-none"
            />
          </g>
        )}
      </svg>

      <p className="mt-4 text-sm text-amber-700/70">
        {atRoot
          ? '点击有子项的扇区可下钻查看详情'
          : '点击中心圆或上方按钮返回上一级'}
      </p>
    </div>
  );
}
