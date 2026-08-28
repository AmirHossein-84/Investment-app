import React, { useState } from 'react';
import { formatToman, formatPercent, toPersianDigits } from '../../utils/formatters';

export interface DonutChartItem {
  id: string;
  label: string;
  value: number; // Value in Tomans
  color: string;
  sublabel?: string;
  targetPercent?: number;
}

interface PortfolioDonutChartProps {
  items: DonutChartItem[];
  centerTitle?: string;
  centerSubtitle?: string;
  formattedTotalValue?: string;
  emptyLabel?: string;
  size?: number;
  strokeWidth?: number;
  showLegend?: boolean;
}

export const PortfolioDonutChart: React.FC<PortfolioDonutChartProps> = ({
  items,
  centerTitle = 'مجموع ارزش',
  centerSubtitle,
  formattedTotalValue,
  emptyLabel = 'داده‌ای برای نمایش وجود ندارد',
  size = 220,
  strokeWidth = 24,
  showLegend = true,
}) => {
  const [activeItemId, setActiveItemId] = useState<string | null>(null);

  // Filter valid positive items
  const validItems = items.filter((item) => item.value > 0);
  const totalValue = validItems.reduce((acc, item) => acc + item.value, 0);

  if (totalValue <= 0 || validItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center rounded-3xl bg-slate-950/60 border border-slate-800/80">
        <div
          style={{ width: size, height: size }}
          className="relative flex items-center justify-center rounded-full border-4 border-dashed border-slate-800"
        >
          <span className="text-xs text-slate-500 font-medium px-4">{emptyLabel}</span>
        </div>
      </div>
    );
  }

  // Calculate SVG arc paths
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  let accumulatedPercent = 0;
  const slices = validItems.map((item) => {
    const percent = (item.value / totalValue) * 100;
    const strokeDasharray = `${(percent / 100) * circumference} ${circumference}`;
    // Start at -90deg (top center) + accumulated rotation
    const rotation = (accumulatedPercent / 100) * 360;
    accumulatedPercent += percent;

    return {
      ...item,
      percent,
      strokeDasharray,
      rotation,
    };
  });

  const activeItem = slices.find((s) => s.id === activeItemId);

  return (
    <div className="flex flex-col items-center gap-4">
      {/* SVG Donut */}
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background circle track */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="transparent"
            stroke="rgba(30, 41, 59, 0.5)"
            strokeWidth={strokeWidth}
          />

          {/* Slices */}
          {slices.map((slice) => {
            const isSelected = activeItemId === slice.id;

            return (
              <circle
                key={slice.id}
                cx={center}
                cy={center}
                r={radius}
                fill="transparent"
                stroke={slice.color}
                strokeWidth={isSelected ? strokeWidth + 4 : strokeWidth}
                strokeDasharray={slice.strokeDasharray}
                strokeDashoffset="0"
                style={{
                  transformOrigin: 'center',
                  transform: `rotate(${slice.rotation}deg)`,
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  filter: isSelected ? 'drop-shadow(0 0 8px rgba(255, 215, 0, 0.4))' : 'none',
                  cursor: 'pointer',
                }}
                onClick={() => {
                  setActiveItemId(isSelected ? null : slice.id);
                }}
              />
            );
          })}
        </svg>

        {/* Center Content Badge */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-4"
          style={{ width: size, height: size }}
        >
          {activeItem ? (
            <div className="space-y-0.5 animate-fadeIn">
              <span className="text-[10px] font-bold text-slate-400 block truncate max-w-[120px] mx-auto">
                {activeItem.label}
              </span>
              <span className="text-xs sm:text-sm font-black text-slate-100 block dir-ltr text-center">
                {formatToman(activeItem.value)} <span className="text-[9px] text-slate-400 font-normal">ت</span>
              </span>
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mt-0.5"
                style={{ backgroundColor: `${activeItem.color}25`, color: activeItem.color }}
              >
                {formatPercent(activeItem.percent)}
              </span>
            </div>
          ) : (
            <div className="space-y-0.5">
              <span className="text-[10px] font-medium text-slate-400 block">
                {centerTitle}
              </span>
              <span className="text-xs sm:text-sm font-black text-gold-400 block dir-ltr text-center">
                {formattedTotalValue || `${formatToman(totalValue)} ت`}
              </span>
              {centerSubtitle && (
                <span className="text-[9px] text-slate-500 block dir-ltr text-center font-medium">
                  {centerSubtitle}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Interactive Legend List */}
      {showLegend && (
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
          {slices.map((slice) => {
            const isSelected = activeItemId === slice.id;

            return (
              <div
                key={slice.id}
                onClick={() => setActiveItemId(isSelected ? null : slice.id)}
                className={`p-2.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                  isSelected
                    ? 'bg-slate-800/90 border-slate-600 shadow-md'
                    : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-900/60'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: slice.color }}
                  />
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-slate-200 block truncate">
                      {slice.label}
                    </span>
                    {slice.sublabel && (
                      <span className="text-[10px] text-slate-400 block truncate">
                        {slice.sublabel}
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-left shrink-0 space-y-0.5">
                  <span className="text-xs font-black text-slate-100 block">
                    {formatToman(slice.value)} <span className="text-[9px] text-slate-400 font-normal">ت</span>
                  </span>
                  <div className="flex items-center justify-end gap-1">
                    <span className="text-[10px] font-bold text-slate-400">
                      {formatPercent(slice.percent)}
                    </span>
                    {slice.targetPercent !== undefined && (
                      <span className="text-[9px] text-slate-500">
                        (هدف: {toPersianDigits(slice.targetPercent)}%)
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
