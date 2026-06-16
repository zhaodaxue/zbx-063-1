import { useMemo, useState, useEffect } from 'react';
import { ChevronUp } from 'lucide-react';
import { useDrillStore } from '@/store/useDrillStore';
import {
  calculateSlices,
  describeSlice,
  polarToCartesian,
  formatPercent,
  getTotalWeight,
  formatWeight,
  getContrastTextColor,
} from '@/utils/pieUtils';
import type { IngredientNode } from '@/data/ingredients';

const SIZE = 480;
const MOBILE_SIZE = 340;
const CENTER = SIZE / 2;
const OUTER_RADIUS = 180;
const INNER_RADIUS = 90;
const HOVER_OFFSET = 8;
const SMALL_SLICE_THRESHOLD = 5;
const LABEL_OUTER_OFFSET = 12;

export default function PieChart() {
  const { currentLevel, drillDown, drillUp, isAtRoot, canDrillDown, currentParentName } = useDrillStore();
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [displayLevel, setDisplayLevel] = useState(currentLevel);
  const [animKey, setAnimKey] = useState(0);

  useEffect(() => {
    if (currentLevel !== displayLevel) {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        setDisplayLevel(currentLevel);
        setAnimKey((k) => k + 1);
        setIsAnimating(false);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [currentLevel, displayLevel]);

  const slices = useMemo(() => calculateSlices(displayLevel), [displayLevel]);
  const totalWeight = useMemo(() => getTotalWeight(displayLevel), [displayLevel]);
  const atRoot = isAtRoot();

  const handleSliceClick = (node: IngredientNode) => {
    if (canDrillDown(node) && !isAnimating) {
      drillDown(node);
    }
  };

  const handleCenterClick = () => {
    if (!atRoot && !isAnimating) {
      drillUp();
    }
  };

  return (
    <div className="flex flex-col items-center">
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="drop-shadow-xl max-w-[480px] max-h-[480px] w-full h-auto"
        style={{ aspectRatio: '1 / 1' }}
      >
        <defs>
          {slices.map((slice) => (
            <filter key={`shadow-${slice.node.id}`} id={`shadow-${slice.node.id}`}>
              <feDropShadow dx="0" dy="2" stdDeviation="4" floodOpacity="0.15" />
            </filter>
          ))}
        </defs>

        <g
          key={animKey}
          style={{
            opacity: isAnimating ? 0.4 : 1,
            transform: isAnimating ? 'scale(0.95)' : 'scale(1)',
            transformOrigin: `${CENTER}px ${CENTER}px`,
            transition: 'opacity 300ms ease, transform 300ms cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
        >
          {slices.map((slice) => {
            const isHovered = hoveredId === slice.node.id;
            const hasChildren = canDrillDown(slice.node);
            const offset = isHovered ? HOVER_OFFSET : 0;
            const midAngle = (slice.startAngle + slice.endAngle) / 2;
            const offsetX = offset * Math.cos(midAngle);
            const offsetY = offset * Math.sin(midAngle);
            const isSmall = slice.percentage < SMALL_SLICE_THRESHOLD;
            const textColor = getContrastTextColor(slice.node.color);

            const pathData = describeSlice(
              CENTER + offsetX,
              CENTER + offsetY,
              OUTER_RADIUS,
              INNER_RADIUS,
              slice.startAngle,
              slice.endAngle,
            );

            const labelRadius = isSmall
              ? OUTER_RADIUS + LABEL_OUTER_OFFSET
              : (OUTER_RADIUS + INNER_RADIUS) / 2;
            const labelPos = polarToCartesian(
              CENTER + offsetX,
              CENTER + offsetY,
              labelRadius,
              midAngle,
            );

            const outerLabelPos = polarToCartesian(
              CENTER + offsetX,
              CENTER + offsetY,
              OUTER_RADIUS + 2,
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
                    cursor: hasChildren && !isAnimating ? 'pointer' : 'default',
                    transition: 'all 250ms cubic-bezier(0.4, 0, 0.2, 1)',
                    filter: isHovered ? `url(#shadow-${slice.node.id})` : 'none',
                  }}
                  onClick={() => handleSliceClick(slice.node)}
                  onMouseEnter={() => setHoveredId(slice.node.id)}
                  onMouseLeave={() => setHoveredId(null)}
                />

                {isSmall ? (
                  <>
                    <line
                      x1={outerLabelPos.x}
                      y1={outerLabelPos.y}
                      x2={labelPos.x}
                      y2={labelPos.y}
                      stroke={slice.node.color}
                      strokeWidth={1.5}
                      opacity={0.6}
                      className="pointer-events-none"
                    />
                    <circle
                      cx={labelPos.x}
                      cy={labelPos.y}
                      r={3}
                      fill={slice.node.color}
                      className="pointer-events-none"
                    />
                    <text
                      x={labelPos.x + (midAngle > -Math.PI / 2 && midAngle < Math.PI / 2 ? 8 : -8)}
                      y={labelPos.y}
                      textAnchor={midAngle > -Math.PI / 2 && midAngle < Math.PI / 2 ? 'start' : 'end'}
                      dominantBaseline="middle"
                      className="pointer-events-none select-none"
                      style={{
                        fontSize: '12px',
                        fontWeight: 600,
                        fill: '#3D2B1F',
                        opacity: isHovered ? 1 : 0.85,
                        transition: 'opacity 200ms ease',
                      }}
                    >
                      {slice.node.name} {formatPercent(slice.percentage)}
                    </text>
                  </>
                ) : (
                  <>
                    <text
                      x={labelPos.x}
                      y={labelPos.y}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="pointer-events-none select-none"
                      style={{
                        fontSize: '14px',
                        fontWeight: 600,
                        fill: textColor,
                        opacity: isHovered ? 1 : 0.95,
                        transition: 'opacity 200ms ease, fill 200ms ease',
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
                        fill: textColor,
                        opacity: isHovered ? 0.95 : 0.8,
                        transition: 'opacity 200ms ease, fill 200ms ease',
                      }}
                    >
                      {formatPercent(slice.percentage)}
                    </text>
                  </>
                )}
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
            cursor: atRoot || isAnimating ? 'default' : 'pointer',
            transition: 'all 250ms ease',
            filter: !atRoot ? 'drop-shadow(0 2px 8px rgba(0,0,0,0.1))' : 'none',
          }}
          onClick={handleCenterClick}
          onMouseEnter={(e) => {
            if (!atRoot && !isAnimating) {
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
            opacity: isAnimating ? 0.5 : 1,
            transition: 'opacity 300ms ease',
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
            opacity: isAnimating ? 0.5 : 1,
            transition: 'opacity 300ms ease',
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
            opacity: isAnimating ? 0.5 : 1,
            transition: 'opacity 300ms ease',
          }}
        >
          共 {displayLevel.length} 项
        </text>

        {!atRoot && (
          <g
            style={{ cursor: isAnimating ? 'default' : 'pointer' }}
            onClick={handleCenterClick}
          >
            <circle
              cx={CENTER}
              cy={CENTER + 52}
              r={14}
              fill="#D4A853"
              style={{
                transition: 'fill 200ms ease, opacity 300ms ease',
                opacity: isAnimating ? 0.5 : 1,
              }}
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

      <p className="mt-4 text-sm text-amber-700/70 text-center px-4">
        {atRoot
          ? '点击有子项的扇区可下钻查看详情'
          : '点击中心圆或上方按钮返回上一级'}
      </p>
    </div>
  );
}
