"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Percent, AlertCircle, RefreshCw, BarChart2 } from 'lucide-react';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

interface Metrics {
  totalReturn: string;
  annualizedVolatility: string;
  maxDrawdown: string;
}

interface Allocation {
  name: string;
  value: number;
}

interface ChartDataPoint {
  date: string;
  Portfolio: number;
  [key: string]: string | number;
}

const OHLCTooltip = ({ active, payload, label, activeAsset }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const isPortfolio = activeAsset === 'Portfolio';

    return (
      <div className="bg-slate-900 border border-slate-700 p-4 rounded-xl shadow-2xl">
        <p className="text-slate-300 text-sm font-bold mb-2 border-b border-slate-700 pb-2">{label}</p>
        
        <div className="flex justify-between gap-4 mb-1">
          <span className="text-slate-400 text-sm">Cumulative Return:</span>
          <span className="text-blue-400 font-mono font-bold">{data[activeAsset]}%</span>
        </div>

        {!isPortfolio && data[`${activeAsset}_Close`] && (
          <div className="mt-3 pt-3 border-t border-slate-800 grid grid-cols-2 gap-x-6 gap-y-2">
            <div className="flex justify-between">
              <span className="text-slate-500 text-xs">Open:</span>
              <span className="text-slate-200 text-xs font-mono">${data[`${activeAsset}_Open`]}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 text-xs">High:</span>
              <span className="text-emerald-400 text-xs font-mono">${data[`${activeAsset}_High`]}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 text-xs">Low:</span>
              <span className="text-red-400 text-xs font-mono">${data[`${activeAsset}_Low`]}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 text-xs">Close:</span>
              <span className="text-slate-200 text-xs font-mono">${data[`${activeAsset}_Close`]}</span>
            </div>
          </div>
        )}
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const [data, setData] = useState<{ 
    metrics: Metrics; 
    allocation: Allocation[]; 
    chartData: ChartDataPoint[];
    insights: string[]; 
  } | null>(null);
  
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeAsset, setActiveAsset] = useState<string>('Portfolio');

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('https://markets-insights-dashboard.onrender.com/');
      if (!response.ok) throw new Error('Failed to fetch data from portfolio system.');
      const result = await response.json();
      setData(result);
    } catch (err: any) {
      setError(err.message || 'An unexpected connection error occurred.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 p-8 flex flex-col justify-center items-center space-y-4">
        <RefreshCw className="h-12 w-12 text-blue-500 animate-spin" />
        <p className="text-slate-400 font-medium">Assembling global market data & metrics...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 p-8 flex flex-col justify-center items-center space-y-4">
        <AlertCircle className="h-16 w-16 text-red-500" />
        <h2 className="text-xl font-bold">Pipeline Error</h2>
        <p className="text-slate-400 max-w-md text-center">{error}</p>
        <button onClick={fetchData} className="px-5 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors font-semibold">
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 lg:p-10">
      
      <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Market Insights Dashboard</h1>
          <p className="text-slate-400 text-sm">5-Year Equal-Weighted Portfolio Analytics Engine</p>
        </div>
        <button onClick={fetchData} className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded-lg transition-all text-sm font-medium">
          <RefreshCw className="h-4 w-4" /> Refresh Engine
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[
          { title: 'Total Cumulative Return', value: data.metrics.totalReturn, icon: TrendingUp, color: 'text-emerald-500' },
          { title: 'Annualized Volatility', value: data.metrics.annualizedVolatility, icon: Percent, color: 'text-blue-500' },
          { title: 'Maximum Drawdown', value: data.metrics.maxDrawdown, icon: AlertCircle, color: 'text-red-500' },
        ].map((metric, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: idx * 0.1 }}
            className="bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-lg"
          >
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-medium text-slate-400">{metric.title}</span>
              <metric.icon className={`h-5 w-5 ${metric.color}`} />
            </div>
            <div className="text-2xl font-bold tracking-tight">{metric.value}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="lg:col-span-2 bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-lg flex flex-col"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div className="flex items-center gap-2">
              <BarChart2 className="h-5 w-5 text-blue-500" />
              <h3 className="text-lg font-bold">Performance Breakdown (%)</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {['Portfolio', ...data.allocation.map(a => a.name)].map((asset) => (
                <button
                  key={asset}
                  onClick={() => setActiveAsset(asset)}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                    activeAsset === asset ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  {asset}
                </button>
              ))}
            </div>
          </div>

          <div className="h-[450px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorAsset" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tickLine={false} stroke="#64748b" style={{ fontSize: '11px' }} />
                <YAxis tickLine={false} axisLine={false} stroke="#64748b" style={{ fontSize: '11px' }} />
                <Tooltip content={<OHLCTooltip activeAsset={activeAsset} />} />
                <Legend />
                <Area type="monotone" dataKey={activeAsset} stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorAsset)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <div className="flex flex-col gap-6">
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-lg flex flex-col"
          >
            <div>
              <h3 className="text-lg font-bold mb-2">Current Allocation Drift</h3>
              <p className="text-xs text-slate-400 mb-4">Visualizing how equal weights split over 5 years.</p>
            </div>
            <div className="h-48 w-full relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={data.allocation} cx="50%" cy="50%" innerRadius={55} outerRadius={75} paddingAngle={4} dataKey="value">
                    {data.allocation.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value}%`} contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-4">
              {data.allocation.map((asset, index) => (
                <div key={asset.name} className="flex items-center space-x-2 border border-slate-800 p-2 rounded-lg bg-slate-950/40">
                  <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold truncate">{asset.name}</span>
                    <span className="text-xs text-slate-400">{asset.value}%</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-gradient-to-br from-blue-900/20 to-slate-900 border border-blue-800/30 p-6 rounded-xl shadow-lg flex flex-col flex-grow"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
              <h3 className="text-lg font-bold text-blue-100">Automated Insights</h3>
            </div>
            <ul className="space-y-4">
              {data.insights?.map((insight, idx) => (
                <li key={idx} className="text-sm text-slate-300 leading-relaxed flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">▹</span>
                  {insight}
                </li>
              ))}
            </ul>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
