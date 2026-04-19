'use client';

import { Card } from '@/components/ui/card';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Calendar } from 'lucide-react';

const analyticsData = {
  daily: [
    { date: 'Mar 1', streams: 4200, revenue: 45 },
    { date: 'Mar 3', streams: 3000, revenue: 32 },
    { date: 'Mar 5', streams: 2000, revenue: 22 },
    { date: 'Mar 7', streams: 2780, revenue: 30 },
    { date: 'Mar 9', streams: 1890, revenue: 20 },
    { date: 'Mar 11', streams: 2390, revenue: 26 },
    { date: 'Mar 13', streams: 3490, revenue: 38 },
  ],
  platformBreakdown: [
    { name: 'Spotify', value: 48, streams: 69600 },
    { name: 'Apple Music', value: 22, streams: 31900 },
    { name: 'YouTube Music', value: 18, streams: 26100 },
    { name: 'Amazon Music', value: 12, streams: 17400 },
  ],
  topTracks: [
    { title: 'Midnight Dreams - Track 1', streams: 45200, revenue: 385.50 },
    { title: 'Midnight Dreams - Track 2', streams: 52000, revenue: 442.80 },
    { title: 'Midnight Dreams - Track 3', streams: 48200, revenue: 411.05 },
  ]
};

const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e'];

export function AnalyticsView() {
  return (
    <div className="space-y-6">
      {/* Date Range Selector */}
      <Card className="bg-card border-border p-4 flex items-center gap-2">
        <Calendar className="w-5 h-5 text-muted-foreground" />
        <select className="bg-background border border-border rounded text-sm px-3 py-1 focus:outline-none focus:ring-2 focus:ring-accent">
          <option>Last 7 days</option>
          <option>Last 30 days</option>
          <option>Last 3 months</option>
          <option>Last year</option>
          <option>All time</option>
        </select>
      </Card>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card border-border p-4">
          <p className="text-sm text-muted-foreground mb-1">Total Streams</p>
          <p className="text-2xl font-bold">145.2K</p>
          <p className="text-xs text-green-500 flex items-center gap-1 mt-2">
            <TrendingUp className="w-3 h-3" />
            +24% vs last month
          </p>
        </Card>
        <Card className="bg-card border-border p-4">
          <p className="text-sm text-muted-foreground mb-1">Total Revenue</p>
          <p className="text-2xl font-bold text-accent">$1,245.50</p>
          <p className="text-xs text-green-500 flex items-center gap-1 mt-2">
            <TrendingUp className="w-3 h-3" />
            +18% vs last month
          </p>
        </Card>
        <Card className="bg-card border-border p-4">
          <p className="text-sm text-muted-foreground mb-1">Avg per Stream</p>
          <p className="text-2xl font-bold">$0.0086</p>
          <p className="text-xs text-muted-foreground mt-2">Industry average</p>
        </Card>
        <Card className="bg-card border-border p-4">
          <p className="text-sm text-muted-foreground mb-1">Listener Growth</p>
          <p className="text-2xl font-bold">+342</p>
          <p className="text-xs text-green-500 flex items-center gap-1 mt-2">
            <TrendingUp className="w-3 h-3" />
            New listeners this month
          </p>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Line Chart */}
        <Card className="lg:col-span-2 bg-card border-border p-6">
          <h3 className="text-lg font-bold mb-4">Streams Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analyticsData.daily}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="date" stroke="var(--color-muted-foreground)" />
              <YAxis stroke="var(--color-muted-foreground)" />
              <Tooltip contentStyle={{ backgroundColor: 'var(--color-card)', border: '1px solid var(--color-border)' }} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="streams" 
                stroke="var(--color-accent)" 
                strokeWidth={2}
                name="Streams"
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Pie Chart */}
        <Card className="bg-card border-border p-6">
          <h3 className="text-lg font-bold mb-4">Platform Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analyticsData.platformBreakdown}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name} ${value}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {analyticsData.platformBreakdown.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Revenue Chart */}
      <Card className="bg-card border-border p-6">
        <h3 className="text-lg font-bold mb-4">Revenue Trend</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={analyticsData.daily}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis dataKey="date" stroke="var(--color-muted-foreground)" />
            <YAxis stroke="var(--color-muted-foreground)" />
            <Tooltip contentStyle={{ backgroundColor: 'var(--color-card)', border: '1px solid var(--color-border)' }} />
            <Legend />
            <Bar 
              dataKey="revenue" 
              fill="var(--color-accent)" 
              name="Revenue ($)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Top Tracks */}
      <Card className="bg-card border-border p-6">
        <h3 className="text-lg font-bold mb-4">Top Tracks</h3>
        <div className="space-y-3">
          {analyticsData.topTracks.map((track, idx) => (
            <div key={idx} className="flex items-center justify-between p-4 bg-background rounded-lg hover:bg-accent/5 transition-colors">
              <div className="flex-1">
                <p className="font-bold">{track.title}</p>
                <p className="text-sm text-muted-foreground">{(track.streams / 1000).toFixed(1)}K streams</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-accent">${track.revenue.toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
