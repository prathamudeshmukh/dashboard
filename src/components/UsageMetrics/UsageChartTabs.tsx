// components/UsageChartTabs.tsx
'use client';

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type UsageChartTabsProps = {
  selectedPeriod: 'daily' | 'weekly' | 'monthly';
  setSelectedPeriod: (period: 'daily' | 'weekly' | 'monthly') => void;
  chartData: any[];
  chartDataKey: string;
};

export function UsageChartTabs({
  selectedPeriod,
  setSelectedPeriod,
  chartData,
  chartDataKey,
}: UsageChartTabsProps) {
  return (
    <Tabs defaultValue="overview" className="space-y-4">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-4">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>API Requests Over Time</CardTitle>
              <div className="flex space-x-2">
                {['daily', 'weekly', 'monthly'].map(period => (
                  <Button
                    key={period}
                    variant={selectedPeriod === period ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedPeriod(period as 'daily' | 'weekly' | 'monthly')}
                  >
                    {period.charAt(0).toUpperCase() + period.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey={chartDataKey} />
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="requests"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.1}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
