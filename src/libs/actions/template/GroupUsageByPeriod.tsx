import {
  format,
  isAfter,
  startOfDay,
  startOfWeek,
  subDays,
  subMonths,
  subWeeks,
} from 'date-fns';

type RecordWithDate = { date: Date | string };

export function groupUsageByPeriod(records: RecordWithDate[]) {
  const dailyMap = new Map<string, number>();
  const weeklyMap = new Map<string, number>();
  const monthlyMap = new Map<string, number>();
  const today = startOfDay(new Date());

  const dailyThreshold = subDays(today, 13);
  const weeklyThreshold = subWeeks(today, 7);
  const monthlyThreshold = subMonths(today, 5);

  for (const { date } of records) {
    const d = new Date(date);

    if (isAfter(d, dailyThreshold)) {
      const key = format(d, 'yyyy-MM-dd');
      dailyMap.set(key, (dailyMap.get(key) || 0) + 1);
    }

    if (isAfter(d, weeklyThreshold)) {
      const key = format(startOfWeek(d, { weekStartsOn: 1 }), 'yyyy-MM-dd');
      weeklyMap.set(key, (weeklyMap.get(key) || 0) + 1);
    }

    if (isAfter(d, monthlyThreshold)) {
      const key = format(d, 'yyyy-MM');
      monthlyMap.set(key, (monthlyMap.get(key) || 0) + 1);
    }
  }

  return { dailyMap, weeklyMap, monthlyMap };
}
