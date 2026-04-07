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

import { AnalyticsSkeleton } from "@/components/ui/AnalyticsSkeleton";
import { ScrollReveal, StaggerReveal } from "@/components/ui/ScrollReveal";
import { motion } from "framer-motion";

export default function EarningsPage() {
  const [timeRange, setTimeRange] = useState("Last 7 Days");
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    // Simulate data loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <AnalyticsSkeleton />;
  }

  return (
    <div className="space-y-10 pb-12">
      <ScrollReveal>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-black text-foreground tracking-tight italic">Revenue Analytics</h1>
              <div className="p-2 rounded-xl bg-accent/10 text-accent animate-pulse-glow border border-accent/20">
                <Sparkles size={18} />
              </div>
            </div>
            <p className="text-muted font-medium">
              Monitor your earnings and click-through performance across all sectors.
            </p>
          </div>
          
          <div className="flex bg-surface-light/50 p-1.5 rounded-2xl border border-white/5 whitespace-nowrap overflow-x-auto shadow-inner">
            {["7 Days", "30 Days", "All Time"].map((range) => (
              <motion.button
                key={range}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setTimeRange(range)}
                className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
                  timeRange.includes(range) 
                    ? "bg-primary text-white shadow-lg shadow-primary/25" 
                    : "text-muted hover:text-foreground hover:bg-white/5"
                }`}
              >
                {range}
              </motion.button>
            ))}
          </div>
        </div>
      </ScrollReveal>

      <StaggerReveal stagger={0.1} delay={0.2} className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
            <div className="text-4xl font-black text-foreground tracking-tighter italic">$548.00</div>
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
            <div className="text-4xl font-black text-foreground tracking-tighter italic">3.8%</div>
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
            <div className="text-4xl font-black text-foreground tracking-tighter italic">1,492</div>
            <div className="flex items-center gap-2 mt-3">
              <span className="flex items-center gap-0.5 text-xs font-bold text-success bg-success/10 px-2 py-0.5 rounded-full">
                <ArrowUpRight size={12} />
                +22%
              </span>
              <span className="text-[10px] text-muted font-bold uppercase tracking-tighter">Traffic Spike</span>
            </div>
          </CardContent>
        </Card>
      </StaggerReveal>

      <ScrollReveal delay={0.4}>
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
                      <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff10" />
                  <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#0A0A0A", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", color: "#F1F1F6" }}
                    itemStyle={{ color: "var(--color-primary)" }}
                  />
                  <Area type="monotone" dataKey="earnings" stroke="var(--color-primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorEarnings)" />
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
                     contentStyle={{ backgroundColor: "#0A0A0A", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", color: "#F1F1F6" }}
                     itemStyle={{ color: "var(--color-secondary)" }}
                  />
                  <Bar dataKey="clicks" fill="var(--color-secondary)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </ScrollReveal>

      <ScrollReveal delay={0.6}>
        <Card className="glass overflow-hidden shadow-2xl shadow-black/20">
          <CardHeader className="p-6 border-b border-white/5">
            <CardTitle className="text-lg font-bold flex items-center gap-2 italic">
              <Calendar size={18} className="text-muted/50" />
              Recent Settlements
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/[0.02]">
                    <th className="p-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted/60 border-b border-white/5">Platform</th>
                    <th className="p-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted/60 border-b border-white/5">Date</th>
                    <th className="p-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted/60 border-b border-white/5">Status</th>
                    <th className="p-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted/60 border-b border-white/5 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {[
                    { id: 1, platform: "Amazon Associates", date: "Mar 24, 2026", status: "Pending", amount: "$124.50" },
                    { id: 2, platform: "ShareASale", date: "Mar 22, 2026", status: "Completed", amount: "$89.20" },
                    { id: 3, platform: "Impact", date: "Mar 20, 2026", status: "Completed", amount: "$210.30" },
                    { id: 4, platform: "CJ Affiliate", date: "Mar 18, 2026", status: "Failed", amount: "$15.00" },
                  ].map((row) => (
                    <tr key={row.id} className="hover:bg-white/[0.04] transition-all group cursor-pointer">
                      <td className="p-5 text-sm font-bold text-foreground flex items-center gap-3">
                         <div className="w-8 h-8 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/10 group-hover:scale-110 transition-transform">
                           <ShoppingBag size={14} className="text-primary-light" />
                         </div>
                         {row.platform}
                      </td>
                      <td className="p-5 text-xs text-muted/80 font-medium">{row.date}</td>
                      <td className="p-5">
                        <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl border ${
                          row.status === "Completed" ? "bg-success/10 text-success border-success/20 shadow-lg shadow-success/10" :
                          row.status === "Pending" ? "bg-warning/10 text-warning border-warning/20" :
                          "bg-danger/10 text-danger border-danger/20"
                        }`}>
                          {row.status}
                        </span>
                      </td>
                      <td className="p-5 text-lg font-black text-foreground text-right group-hover:text-primary transition-all italic tracking-tighter">{row.amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </ScrollReveal>
    </div>
  );
}
