'use client';

import { useUser } from '@clerk/nextjs';
import { differenceInDays, format } from 'date-fns';
import { Activity, Calendar, Clock } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { getUsageData } from '@/libs/actions/templates';

import { SummaryCard } from './SummaryCard';
import { UsageChartTabs } from './UsageChartTabs';

type UsageData = {
  dailyUsageData: { date: string; requests: number; day: string }[];
  weeklyUsageData: { week: string; requests: number }[];
  monthlyUsageData: { month: string; requests: number }[];
  remainingBalance: number;
  lastCredited: number;
  lastCreditedAt: string | Date | null;
};

export default function ApiUsagePage() {
  const { user } = useUser();
  const [usageData, setUsageData] = useState<UsageData | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        return;
      }
      const data = await getUsageData(user.emailAddresses[0]?.emailAddress as string);
      setUsageData(data);
    };

    fetchData();
  }, [user]);

  const {
    dailyUsageData = [],
    weeklyUsageData = [],
    monthlyUsageData = [],
    remainingBalance = 0,
    lastCredited = 0,
    lastCreditedAt,
  } = usageData || {};

  const lastCreditedDate = lastCreditedAt ? new Date(lastCreditedAt) : null;
  const daysAgo = lastCreditedDate ? differenceInDays(new Date(), lastCreditedDate) : null;
  const totalRequests = useMemo(() => {
    const currentData
    = selectedPeriod === 'weekly'
      ? weeklyUsageData
      : selectedPeriod === 'monthly'
        ? monthlyUsageData
        : dailyUsageData;

    return currentData.reduce((sum, entry) => sum + entry.requests, 0);
  }, [selectedPeriod, dailyUsageData, weeklyUsageData, monthlyUsageData]);

  const chartData = useMemo(() => {
    switch (selectedPeriod) {
      case 'weekly':
        return weeklyUsageData;
      case 'monthly':
        return monthlyUsageData;
      default:
        return dailyUsageData;
    }
  }, [selectedPeriod, dailyUsageData, weeklyUsageData, monthlyUsageData]);

  const getDescriptionForPeriod = (period: string) => {
    switch (period) {
      case 'weekly':
        return 'Last 8 weeks';
      case 'monthly':
        return 'Last 6 months';
      default:
        return 'Last 14 days';
    }
  };

  const chartDataKey = selectedPeriod === 'weekly' ? 'week' : selectedPeriod === 'monthly' ? 'month' : 'date';

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">API Usage Statistics</h2>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          title="Total Requests"
          icon={<Activity />}
          value={totalRequests.toLocaleString()}
          description={getDescriptionForPeriod(selectedPeriod)}
        />
        <SummaryCard
          title="Credits Left"
          icon={<Calendar />}
          value={remainingBalance}
          valueColor="text-green-600"
        />
        <SummaryCard
          title="Last Credited"
          icon={<Clock />}
          value={lastCredited}
          description={
            lastCreditedDate ? format(lastCreditedDate, 'dd/MM/yyyy') : '—'
          }
          valueColor="text-purple-600"
        />
        <SummaryCard
          title="Last Credited At"
          icon={<Clock />}
          value={
            lastCreditedDate ? format(lastCreditedDate, 'MMM d') : '—'
          }
          description={
            daysAgo !== null ? `${daysAgo} days ago` : '—'
          }
          valueColor="text-blue-600"
        />
      </div>

      <UsageChartTabs
        chartData={chartData}
        chartDataKey={chartDataKey}
        selectedPeriod={selectedPeriod}
        setSelectedPeriod={setSelectedPeriod}
      />
    </div>
  );
}
