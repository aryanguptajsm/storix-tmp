"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { getUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { 
  ArrowLeft, 
  Layers, 
  Zap, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  Play,
  Pause,
  RotateCcw,
  Plus
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { AnimatedSection } from "@/components/dashboard/DashboardEntrance";

interface ImportTask {
  url: string;
  status: "pending" | "processing" | "success" | "error";
  error?: string;
  result?: any;
}

export default function BulkImportPage() {
  const router = useRouter();
  const [urlInput, setUrlInput] = useState("");
  const [tasks, setTasks] = useState<ImportTask[]>([]);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleAddTasks = () => {
    const urls = urlInput
      .split("\n")
      .map(u => u.trim())
      .filter(u => u.startsWith("http"));
    
    if (urls.length === 0) {
      toast.error("No valid URLs detected.");
      return;
    }

    const newTasks = urls.map(url => ({ url, status: "pending" as const }));
    setTasks([...tasks, ...newTasks]);
    setUrlInput("");
    toast.success(`${urls.length} target vectors initialized.`);
  };

  const processNextTask = async (index: number) => {
    if (index >= tasks.length) {
      setProcessing(false);
      toast.success("Bulk deployment sequence complete!");
      return;
    }

    setTasks(prev => prev.map((t, i) => i === index ? { ...t, status: "processing" } : t));
    
    try {
      const res = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: tasks[index].url }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Scraping failed");

      // Auto-save the product
      const supabase = createClient();
      const user = await getUser();
      if (!user) throw new Error("Unauth");

      const { error: saveError } = await supabase.from("products").insert({
        user_id: user.id,
        title: data.title,
        description: data.description,
        price: data.price,
        original_price: data.originalPrice || null,
        discount_percentage: data.discountPercentage || null,
        rating: data.rating || null,
        review_count: data.reviewCount || null,
        brand: data.brand || null,
        image_url: data.image,
        platform: data.platform,
        original_url: data.originalUrl,
      });

      if (saveError) throw saveError;

      setTasks(prev => prev.map((t, i) => i === index ? { ...t, status: "success", result: data } : t));
    } catch (err: any) {
      setTasks(prev => prev.map((t, i) => i === index ? { ...t, status: "error", error: err.message } : t));
    }

    setProgress(((index + 1) / tasks.length) * 100);
    processNextTask(index + 1);
  };

  const startDeployment = () => {
    if (tasks.length === 0) return;
    setProcessing(true);
    setProgress(0);
    processNextTask(0);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in pb-24">
      <AnimatedSection delay={0.1}>
        <div className="flex items-center justify-between">
          <Link href="/dashboard/products" className="group">
            <Button variant="ghost" size="sm" className="gap-2 text-muted hover:text-white transition-all font-black uppercase tracking-widest">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Inventory Control
            </Button>
          </Link>
          <div className="flex items-center gap-3">
             <div className="p-2 rounded-xl bg-secondary/10 text-secondary border border-secondary/20">
                <Layers size={20} />
             </div>
             <h1 className="text-3xl font-black tracking-tight italic">Bulk Deployment</h1>
          </div>
        </div>
      </AnimatedSection>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-12">
          <Card className="glass overflow-hidden glass-premium-animated">
            <CardHeader className="p-10 pb-4">
              <CardTitle className="text-xl font-black italic uppercase tracking-tight flex items-center gap-3">
                <Plus className="text-secondary" />
                Initialize Vector Queue
              </CardTitle>
            </CardHeader>
            <CardContent className="p-10 pt-0 space-y-6">
              <textarea
                placeholder="Paste product URLs (one per line)..."
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                className="w-full h-48 rounded-2xl bg-white/5 border border-white/5 p-6 text-foreground font-medium focus:ring-2 focus:ring-secondary/20 focus:border-secondary/40 outline-none transition-all resize-none shadow-inner"
              />
              <div className="flex justify-end gap-4">
                <Button 
                  variant="secondary" 
                  onClick={() => setTasks([])}
                  disabled={processing}
                  className="gap-2 rounded-xl h-12 px-6"
                >
                  <RotateCcw size={16} /> Clear Queue
                </Button>
                <Button 
                  onClick={handleAddTasks}
                  disabled={processing || !urlInput.trim()}
                  className="gap-3 rounded-xl h-12 px-8 bg-secondary hover:bg-secondary-light text-white shadow-lg shadow-secondary/20 font-black uppercase tracking-widest"
                >
                  <Plus size={20} /> Buffer Targets
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {tasks.length > 0 && (
          <div className="lg:col-span-12">
            <Card className="glass overflow-hidden">
               <CardHeader className="p-8 border-b border-white/5 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-black uppercase tracking-tighter italic">Operational Queue</CardTitle>
                    <p className="text-xs text-muted font-bold mt-1 uppercase tracking-widest">{tasks.length} Vectors Locked</p>
                  </div>
                  {!processing && tasks.some(t => t.status === "pending") && (
                    <Button 
                      onClick={startDeployment}
                      className="gap-3 rounded-xl bg-success hover:bg-success-light text-white shadow-lg shadow-success/20 animate-pulse-glow"
                    >
                      <Play size={18} fill="currentColor" /> Initiate Deployment
                    </Button>
                  )}
               </CardHeader>
               <CardContent className="p-0">
                  {processing && (
                    <div className="h-1 bg-white/5 relative overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        className="absolute h-full bg-secondary shadow-[0_0_10px_rgba(255,107,0,0.5)]"
                      />
                    </div>
                  )}
                  <div className="max-h-[400px] overflow-y-auto">
                    {tasks.map((task, i) => (
                      <div key={i} className="flex items-center justify-between p-6 border-b border-white/5 hover:bg-white/[0.02] transition-all group">
                        <div className="flex items-center gap-4 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0 text-[10px] font-black text-muted group-hover:text-foreground transition-all">
                            {i + 1}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-sm font-bold text-foreground truncate max-w-sm">{task.url}</span>
                            {task.error && <span className="text-[10px] font-black text-danger uppercase tracking-widest mt-1">{task.error}</span>}
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                           {task.status === "pending" && <div className="text-[10px] font-black text-muted uppercase tracking-widest">Awaiting Buffer</div>}
                           {task.status === "processing" && <Loader2 size={16} className="text-secondary animate-spin" />}
                           {task.status === "success" && <CheckCircle2 size={18} className="text-success" />}
                           {task.status === "error" && <AlertCircle size={18} className="text-danger" />}
                        </div>
                      </div>
                    ))}
                  </div>
               </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
