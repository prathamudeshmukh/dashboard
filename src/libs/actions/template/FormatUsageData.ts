import { format } from 'date-fns';

export function FormatUsageData(
  dailyMap: Map<string, number>,
  weeklyMap: Map<string, number>,
  monthlyMap: Map<string, number>,
) {
  const dailyUsageData = Array.from(dailyMap.entries())
    .map(([key, count]) => {
      const d = new Date(key);
      return {
        date: format(d, 'MMM d'),
        requests: count,
        day: format(d, 'EEE'),
      };
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const weeklyUsageData = Array.from(weeklyMap.entries()).map(([_, count], i) => ({
    week: `Week ${i + 1}`,
    requests: count,
  }));

  const monthlyUsageData = Array.from(monthlyMap.entries()).map(([key, count]) => ({
    month: format(new Date(key), 'MMM'),
    requests: count,
  }));

  return {
    dailyUsageData,
    weeklyUsageData,
    monthlyUsageData,
  };
}
