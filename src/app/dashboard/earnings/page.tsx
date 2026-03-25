"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { 
  DollarSign, 
  TrendingUp, 
  MousePointerClick, 
  Calendar,
  Wallet,
  ArrowUpRight,
  Sparkles,
  Zap,
  BarChart3,
  ShoppingBag
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";

const mockData = [
  { name: "Mon", clicks: 120, earnings: 45 },
  { name: "Tue", clicks: 150, earnings: 52 },
  { name: "Wed", clicks: 180, earnings: 61 },
  { name: "Thu", clicks: 220, earnings: 85 },
  { name: "Fri", clicks: 250, earnings: 92 },
  { name: "Sat", clicks: 310, earnings: 115 },
  { name: "Sun", clicks: 280, earnings: 98 },
];

export default function EarningsPage() {
  const [timeRange, setTimeRange] = useState("Last 7 Days");

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-black text-foreground tracking-tight">Revenue Analytics</h1>
            <div className="p-1 rounded-md bg-accent/10 text-accent animate-pulse-glow">
              <Sparkles size={18} />
            </div>
          </div>
          <p className="text-muted font-medium">
            Monitor your earnings and click-through performance across all sectors.
          </p>
        </div>
        
        <div className="flex bg-surface-light/50 p-1 rounded-2xl border border-white/5 whitespace-nowrap overflow-x-auto">
          {["7 Days", "30 Days", "All Time"].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 ${
                timeRange.includes(range) 
                  ? "bg-primary text-white shadow-lg shadow-primary/20" 
                  : "text-muted hover:text-foreground"
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass group hover:border-primary/30 transition-all duration-500 overflow-hidden relative">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/10 blur-[40px] rounded-full group-hover:bg-primary/20 transition-all" />
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-white/5 mb-4">
            <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted/60">
              Total Revenue
            </CardTitle>
            <div className="p-2 rounded-xl bg-primary/10 text-primary group-hover:scale-110 transition-transform">
              <Wallet size={16} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-foreground tracking-tighter">$548.00</div>
            <div className="flex items-center gap-2 mt-3">
              <span className="flex items-center gap-0.5 text-xs font-bold text-success bg-success/10 px-2 py-0.5 rounded-full">
                <ArrowUpRight size={12} />
                +14.2%
              </span>
              <span className="text-[10px] text-muted font-bold uppercase tracking-tighter">Growth</span>
            </div>
          </CardContent>
        </Card>

        <Card className="glass group hover:border-secondary/30 transition-all duration-500 overflow-hidden relative">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-secondary/10 blur-[40px] rounded-full group-hover:bg-secondary/20 transition-all" />
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-white/5 mb-4">
            <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted/60">
              Conversion Rate
            </CardTitle>
            <div className="p-2 rounded-xl bg-secondary/10 text-secondary group-hover:scale-110 transition-transform">
              <TrendingUp size={16} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-foreground tracking-tighter">3.8%</div>
            <div className="flex items-center gap-2 mt-3">
              <span className="flex items-center gap-0.5 text-xs font-bold text-success bg-success/10 px-2 py-0.5 rounded-full">
                <ArrowUpRight size={12} />
                +0.5%
              </span>
              <span className="text-[10px] text-muted font-bold uppercase tracking-tighter">Optimization</span>
            </div>
          </CardContent>
        </Card>

        <Card className="glass group hover:border-accent/30 transition-all duration-500 overflow-hidden relative">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-accent/10 blur-[40px] rounded-full group-hover:bg-accent/20 transition-all" />
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-white/5 mb-4">
            <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted/60">
              Active Sessions
            </CardTitle>
            <div className="p-2 rounded-xl bg-accent/10 text-accent group-hover:scale-110 transition-transform">
              <MousePointerClick size={16} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-foreground tracking-tighter">1,492</div>
            <div className="flex items-center gap-2 mt-3">
              <span className="flex items-center gap-0.5 text-xs font-bold text-success bg-success/10 px-2 py-0.5 rounded-full">
                <ArrowUpRight size={12} />
                +22%
              </span>
              <span className="text-[10px] text-muted font-bold uppercase tracking-tighter">Traffic Spike</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="glass p-1">
          <CardHeader className="flex flex-row items-center justify-between p-5 pb-2">
            <div>
              <CardTitle className="text-lg font-bold">Earnings Velocity</CardTitle>
              <p className="text-xs text-muted font-medium mt-1 uppercase tracking-widest text-[10px]">Revenue stream over target period</p>
            </div>
            <BarChart3 size={20} className="text-muted/30" />
          </CardHeader>
          <CardContent className="h-[300px] w-full pt-6">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockData}>
                <defs>
                  <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6C5CE7" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6C5CE7" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff10" />
                <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#1E1E2E", border: "1px solid #3D3D5C", borderRadius: "12px", color: "#F1F1F6" }}
                  itemStyle={{ color: "#6C5CE7" }}
                />
                <Area type="monotone" dataKey="earnings" stroke="#6C5CE7" strokeWidth={3} fillOpacity={1} fill="url(#colorEarnings)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="glass p-1">
          <CardHeader className="flex flex-row items-center justify-between p-5 pb-2">
            <div>
              <CardTitle className="text-lg font-bold">Traffic Volume</CardTitle>
              <p className="text-xs text-muted font-medium mt-1 uppercase tracking-widest text-[10px]">Click distribution by day</p>
            </div>
            <Zap size={20} className="text-muted/30" />
          </CardHeader>
          <CardContent className="h-[300px] w-full pt-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff10" />
                <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                   contentStyle={{ backgroundColor: "#1E1E2E", border: "1px solid #3D3D5C", borderRadius: "12px", color: "#F1F1F6" }}
                   itemStyle={{ color: "#00CEC9" }}
                />
                <Bar dataKey="clicks" fill="#00CEC9" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="glass overflow-hidden">
        <CardHeader className="p-6 border-b border-white/5">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <Calendar size={18} className="text-muted/50" />
            Recent Settlements
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/[0.02]">
                  <th className="p-4 text-xs font-black uppercase tracking-[0.2em] text-muted/60 border-b border-white/5">Platform</th>
                  <th className="p-4 text-xs font-black uppercase tracking-[0.2em] text-muted/60 border-b border-white/5">Date</th>
                  <th className="p-4 text-xs font-black uppercase tracking-[0.2em] text-muted/60 border-b border-white/5">Status</th>
                  <th className="p-4 text-xs font-black uppercase tracking-[0.2em] text-muted/60 border-b border-white/5 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {[
                  { id: 1, platform: "Amazon Associates", date: "Mar 24, 2026", status: "Pending", amount: "$124.50" },
                  { id: 2, platform: "ShareASale", date: "Mar 22, 2026", status: "Completed", amount: "$89.20" },
                  { id: 3, platform: "Impact", date: "Mar 20, 2026", status: "Completed", amount: "$210.30" },
                  { id: 4, platform: "CJ Affiliate", date: "Mar 18, 2026", status: "Failed", amount: "$15.00" },
                ].map((row) => (
                  <tr key={row.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="p-4 text-sm font-bold text-foreground flex items-center gap-2">
                       <div className="w-6 h-6 rounded bg-primary/20 flex items-center justify-center">
                         <ShoppingBag size={12} className="text-primary-light" />
                       </div>
                       {row.platform}
                    </td>
                    <td className="p-4 text-sm text-muted/80">{row.date}</td>
                    <td className="p-4">
                      <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${
                        row.status === "Completed" ? "bg-success/10 text-success" :
                        row.status === "Pending" ? "bg-warning/10 text-warning" :
                        "bg-danger/10 text-danger"
                      }`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="p-4 text-sm font-black text-foreground text-right group-hover:text-primary transition-colors">{row.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
