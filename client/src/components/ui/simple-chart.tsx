"use client";

import { cn } from "@/lib/utils";

interface ChartDataPoint {
  label: string;
  value: number;
}

interface SimpleChartProps {
  data: ChartDataPoint[];
  className?: string;
  color?: string;
  height?: number;
}

export function SimpleChart({ data, className, color = "#22c55e", height = 200 }: SimpleChartProps) {
  const maxValue = Math.max(...data.map(d => d.value), 1);
  const minValue = Math.min(...data.map(d => d.value), 0);
  const range = maxValue - minValue || 1;

  const points = data.map((point, index) => {
    const x = (index / (data.length - 1 || 1)) * 100;
    const y = 100 - ((point.value - minValue) / range) * 100;
    return `${x},${y}`;
  }).join(' ');

  const areaPoints = `0,100 ${points} 100,100`;

  return (
    <div className={cn("w-full", className)}>
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="w-full"
        style={{ height: `${height}px` }}
      >
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0.05" />
          </linearGradient>
        </defs>
        {/* Area */}
        <polygon
          points={areaPoints}
          fill="url(#gradient)"
        />
        {/* Line */}
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="0.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Points */}
        {data.map((point, index) => {
          const x = (index / (data.length - 1 || 1)) * 100;
          const y = 100 - ((point.value - minValue) / range) * 100;
          return (
            <circle
              key={index}
              cx={x}
              cy={y}
              r="1"
              fill={color}
              className="hover:r-2 transition-all"
            />
          );
        })}
      </svg>
      {/* Labels */}
      <div className="flex justify-between mt-2 text-xs text-neutral-400">
        {data.map((point, index) => (
          <span key={index} className="truncate max-w-[60px]">
            {point.label}
          </span>
        ))}
      </div>
    </div>
  );
}

interface BarChartProps {
  data: ChartDataPoint[];
  className?: string;
  color?: string;
  height?: number;
}

export function BarChart({ data, className, color = "#22c55e", height = 200 }: BarChartProps) {
  const maxValue = Math.max(...data.map(d => d.value), 1);

  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-end justify-between gap-1" style={{ height: `${height}px` }}>
        {data.map((point, index) => {
          const barHeight = (point.value / maxValue) * 100;
          return (
            <div key={index} className="flex-1 flex flex-col items-center gap-1 group">
              <div className="relative w-full flex items-end justify-center">
                <div
                  className="w-full rounded-t-sm transition-all hover:opacity-80 cursor-pointer"
                  style={{
                    height: `${barHeight}%`,
                    backgroundColor: color,
                    minHeight: point.value > 0 ? '4px' : '0'
                  }}
                />
                <div className="absolute -top-6 opacity-0 group-hover:opacity-100 transition-opacity bg-neutral-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                  {point.value}
                </div>
              </div>
              <span className="text-xs text-neutral-400 truncate w-full text-center">
                {point.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

