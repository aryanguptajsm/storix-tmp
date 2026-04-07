"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { 
  Database, 
  Terminal, 
  Copy, 
  ExternalLink,
  ArrowLeft,
  Sparkles,
  Zap
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { AnimatedSection } from "@/components/dashboard/DashboardEntrance";
import { motion } from "framer-motion";

export default function SetupPage() {
  const sqlScript = `-- ENABLE EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE,
  store_name TEXT DEFAULT 'My Affiliate Store',
  store_description TEXT,
  theme TEXT DEFAULT 'default',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  price TEXT,
  original_price TEXT,
  discount_percentage TEXT,
  image_url TEXT,
  platform TEXT,
  original_url TEXT NOT NULL,
  affiliate_url TEXT,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. CLICKS TABLE
CREATE TABLE IF NOT EXISTS public.clicks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  product_id UUID REFERENCES public.products ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users ON DELETE SET NULL,
  ip_address TEXT,
  user_agent TEXT,
  referrer TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. ENABLE SECURITY (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clicks ENABLE ROW LEVEL SECURITY;

-- 5. ACCESS POLICIES
CREATE POLICY "Public profiles are viewable" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can manage own profile" ON public.profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "Products are viewable" ON public.products FOR SELECT USING (true);
CREATE POLICY "Users can manage own products" ON public.products FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Anyone can log clicks" ON public.clicks FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can view own clicks" ON public.clicks FOR SELECT USING (auth.uid() = user_id);

-- 6. AUTO-PROFILE TRIGGER
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username, store_name, theme)
  VALUES (new.id, lower(split_part(new.email, '@', 1)) || (floor(random() * 9000) + 1000)::text, split_part(new.email, '@', 1) || '''s Store', 'default');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(sqlScript);
    toast.success("SQL Script copied to clipboard!");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-24 relative">
       <div className="fixed inset-0 pointer-events-none -z-10 grid-bg-premium opacity-20" />
       
      <AnimatedSection delay={0.1}>
        <div className="flex items-center justify-between mb-8">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="gap-2 text-muted hover:text-primary transition-all rounded-xl h-10">
              <ArrowLeft size={16} />
              <span className="font-bold tracking-tight">Return to Command Grid</span>
            </Button>
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-xl shadow-primary/10 border border-primary/20">
               <Database size={20} />
            </div>
            <h1 className="text-3xl font-black tracking-tight italic uppercase">Initialization</h1>
          </div>
        </div>
      </AnimatedSection>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { icon: Terminal, title: "1. Copy Script", desc: "Extract the secure SQL initialization directive.", color: "text-primary" },
          { icon: ExternalLink, title: "2. Open Console", desc: "Navigate to your remote SQL deployment unit.", color: "text-secondary" },
          { icon: Zap, title: "3. Run Protocol", desc: "Execute script to finalize your link nodes.", color: "text-accent" },
        ].map((step, i) => (
          <AnimatedSection key={i} delay={0.2 + (i * 0.1)}>
            <Card size="small" variant="glass" className="h-full group hover:border-primary/30 transition-all border-white/5 bg-white/[0.01]">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity">
                <step.icon size={48} />
              </div>
              <CardHeader className="pb-2">
                <CardTitle className={`text-xs font-black uppercase tracking-[0.2em] ${step.color} flex items-center gap-2`}>
                  <step.icon size={14} />
                  {step.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-white/40 font-medium leading-relaxed">{step.desc}</p>
              </CardContent>
            </Card>
          </AnimatedSection>
        ))}
      </div>

      <AnimatedSection delay={0.5}>
        <Card size="medium" variant="premium" className="relative group">
          <CardHeader className="border-b border-white/5 flex flex-row items-center justify-between p-8">
            <div className="space-y-2">
              <CardTitle className="text-2xl font-black italic tracking-tight">SQL Strategic Directive</CardTitle>
              <p className="text-sm text-white/40 font-medium tracking-tight">Execute this script to broadcast your database infrastructure across the grid.</p>
            </div>
            <Button 
              onClick={copyToClipboard}
              className="gap-2 bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-black rounded-xl h-12 px-6 shadow-xl hover:scale-105 active:scale-95 transition-all"
            >
              <Copy size={14} />
              Copy Directive
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="relative group/code">
               <div className="absolute top-4 right-4 flex items-center gap-2 opacity-0 group-hover/code:opacity-100 transition-opacity">
                  <span className="text-[10px] font-black text-primary/50 uppercase tracking-widest">PostgreSQL Protocol</span>
               </div>
               <pre className="p-8 text-[12px] font-mono text-primary-light/70 bg-black/40 h-[450px] overflow-auto leading-relaxed custom-scrollbar selection:bg-primary/20">
                 {sqlScript}
               </pre>
               <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
            </div>
          </CardContent>
        </Card>
      </AnimatedSection>

      <AnimatedSection delay={0.6}>
        <div className="flex flex-col md:flex-row items-center justify-between gap-10 p-10 md:p-14 rounded-[3rem] bg-primary/[0.03] border border-primary/20 backdrop-blur-2xl relative overflow-hidden group hover:border-primary/40 transition-all duration-700 shadow-2xl shadow-primary/5">
          <div className="absolute top-1/2 right-0 -translate-y-1/2 p-12 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity duration-1000 rotate-12">
            <Sparkles size={160} className="text-primary" />
          </div>
          <div className="space-y-4 relative z-10 max-w-xl">
            <div className="flex items-center gap-3">
               <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_10px_#10B981] animate-pulse" />
               <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Deployment Ready</span>
            </div>
            <h3 className="text-3xl font-black text-white italic tracking-tighter">Ready for Signal Broadcast?</h3>
            <p className="text-lg text-white/40 font-medium leading-relaxed">Once the SQL protocol is executed, your storefront nodes will synchronize with our AI inventory pipeline instantly.</p>
          </div>
          <Link href="https://supabase.com/dashboard/project/lnckyrvxehzcjvyultkd/sql/new" target="_blank" className="w-full md:w-auto relative z-10">
            <Button className="w-full md:w-auto gap-4 px-10 h-20 text-xs font-black uppercase tracking-[0.4em] shadow-[0_20px_50px_rgba(16,185,129,0.3)] group bg-primary hover:bg-primary-light transition-all rounded-[2rem] hover:scale-105 active:scale-95">
              <span>Execute Externally</span>
              <ExternalLink size={20} className="group-hover:rotate-12 transition-transform duration-500" />
            </Button>
          </Link>
        </div>
      </AnimatedSection>
    </div>
  );
}

