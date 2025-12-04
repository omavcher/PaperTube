"use client";

import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ActivityCalendarProps {
  data: Array<{ date: string; count: number }>;
  className?: string;
}

const getIntensityColor = (count: number, maxCount: number) => {
  if (count === 0) return "bg-neutral-800";
  const intensity = Math.min(count / maxCount, 1);
  if (intensity < 0.25) return "bg-green-900";
  if (intensity < 0.5) return "bg-green-700";
  if (intensity < 0.75) return "bg-green-500";
  return "bg-green-400";
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export function ActivityCalendar({ data, className }: ActivityCalendarProps) {
  const maxCount = Math.max(...data.map(d => d.count), 1);
  const dataMap = new Map(data.map(d => [d.date, d.count]));

  // Get last 365 days
  const days: Array<{ date: Date; count: number }> = [];
  const today = new Date();
  for (let i = 364; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);
    const dateKey = date.toISOString().split('T')[0];
    days.push({
      date,
      count: dataMap.get(dateKey) || 0
    });
  }

  // Group by weeks
  const weeks: Array<Array<{ date: Date; count: number }>> = [];
  let currentWeek: Array<{ date: Date; count: number }> = [];
  
  days.forEach((day, index) => {
    if (index % 7 === 0 && currentWeek.length > 0) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
    currentWeek.push(day);
  });
  if (currentWeek.length > 0) {
    weeks.push(currentWeek);
  }

  // Get month labels (show first occurrence of each month)
  const monthLabels: string[] = [];
  const seenMonths = new Set<string>();
  days.forEach(day => {
    const monthKey = day.date.toLocaleDateString('en-US', { month: 'short' });
    if (!seenMonths.has(monthKey) && day.date.getDate() <= 7) {
      monthLabels.push(monthKey);
      seenMonths.add(monthKey);
    }
  });

  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-start gap-2">
        {/* Month labels */}
        <div className="flex flex-col gap-1 pt-6 text-xs text-neutral-400 min-w-[40px]">
          {monthLabels.slice(0, 12).map((month, i) => (
            <div key={i} className="h-3">{month}</div>
          ))}
        </div>
        
        {/* Calendar grid */}
        <div className="flex-1">
          <div className="flex gap-1">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-1">
                {week.map((day, dayIndex) => {
                  const dateKey = day.date.toISOString().split('T')[0];
                  return (
                    <TooltipProvider key={dateKey}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div
                            className={cn(
                              "w-3 h-3 rounded-sm cursor-pointer transition-all hover:scale-110 hover:ring-2 hover:ring-green-400",
                              getIntensityColor(day.count, maxCount)
                            )}
                          />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="font-semibold">{day.count} {day.count === 1 ? 'note' : 'notes'}</p>
                          <p className="text-xs text-neutral-400">{formatDate(dateKey)}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  );
                })}
              </div>
            ))}
          </div>
          
          {/* Legend */}
          <div className="flex items-center gap-2 mt-4 text-xs text-neutral-400">
            <span>Less</span>
            <div className="flex gap-1">
              <div className="w-3 h-3 rounded-sm bg-neutral-800" />
              <div className="w-3 h-3 rounded-sm bg-green-900" />
              <div className="w-3 h-3 rounded-sm bg-green-700" />
              <div className="w-3 h-3 rounded-sm bg-green-500" />
              <div className="w-3 h-3 rounded-sm bg-green-400" />
            </div>
            <span>More</span>
          </div>
        </div>
      </div>
    </div>
  );
}

