"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { 
  ShoppingBag, 
  ChevronLeft,
  Sparkles,
  Zap,
  TrendingUp,
  Shield,
  Clock,
  Layout
} from "lucide-react";

export default function StorixProductPage() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-primary/30">
      <nav className="h-20 border-b border-white/5 px-6 flex items-center justify-between glass sticky top-0 z-50">
        <Link href="/" className="flex items-center gap-2 group">
          <ChevronLeft className="w-5 h-5 text-muted group-hover:text-white transition-colors" />
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-black">Storix</span>
          </div>
        </Link>
        <Link href="/signup">
          <Button size="sm">Get Started</Button>
        </Link>
      </nav>

      <main className="max-w-5xl mx-auto py-20 px-6">
        <div className="flex flex-col md:flex-row gap-16 items-center mb-32">
          <div className="flex-1 space-y-6">
            <div className="inline-block px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary-light text-xs font-bold uppercase tracking-widest">
              The Product
            </div>
            <h1 className="text-5xl font-black leading-tight">
              One platform. <br />
              Millions of <span className="text-primary">Possibilities.</span>
            </h1>
            <p className="text-lg text-muted leading-relaxed">
              Storix isn&apos;t just a store builder; it&apos;s your personal AI assistant for affiliate success. We&apos;ve combined deep web scraping with advanced LLMs to make storefront creation instantaneous.
            </p>
            <div className="flex items-center gap-4 pt-4">
              <Link href="/signup">
                <Button className="h-12 px-8">Build My Store</Button>
              </Link>
              <div className="flex -space-x-2">
                {[1,2,3,4].map(i => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-black bg-surface-light" />
                ))}
              </div>
              <span className="text-xs text-muted font-medium ml-2">500+ creators joined</span>
            </div>
          </div>
          <div className="flex-1 aspect-square rounded-[3rem] gradient-primary p-1 shadow-2xl shadow-primary/20">
             <div className="w-full h-full rounded-[2.8rem] bg-black flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent" />
                <Sparkles className="w-24 h-24 text-primary animate-pulse" />
             </div>
          </div>
        </div>

        <section className="space-y-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="p-8 rounded-3xl bg-[#0A0A0A] border border-white/5 group hover:border-primary/30 transition-colors">
              <Zap className="w-10 h-10 text-primary mb-6" />
              <h3 className="text-2xl font-bold mb-4">Blazing Fast Scraping</h3>
              <p className="text-muted leading-relaxed">
                Our custom-built scraping engine fetches product data in seconds. No more manual copying and pasting. Support for major e-commerce platforms coming daily.
              </p>
            </div>
            <div className="p-8 rounded-3xl bg-[#0A0A0A] border border-white/5 group hover:border-primary/30 transition-colors">
              <TrendingUp className="w-10 h-10 text-secondary mb-6" />
              <h3 className="text-2xl font-bold mb-4">Click Intelligence</h3>
              <p className="text-muted leading-relaxed">
                Understand user intent. Our dashboard shows you not just how many clicks you got, but which products are converting at the highest rates.
              </p>
            </div>
          </div>

          <div className="rounded-[3rem] bg-[#0A0A0A] border border-white/5 p-12 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-64 h-64 bg-primary/10 blur-[80px]" />
            <div className="relative z-10 flex flex-col items-center text-center max-w-2xl mx-auto">
              <Shield className="w-12 h-12 text-success mb-8" />
              <h2 className="text-4xl font-bold mb-6">Your store&apos;s ready!</h2>
              <p className="text-lg text-muted mb-10">
                Your store&apos;s ready! Scrape products, generate AI titles, and build your empire.
              </p>
              <div className="flex gap-4">
                <Link href="/dashboard">
                  <Button className="px-8 py-4 text-lg font-bold">Admin Console</Button>
                </Link>
                <Link href="/dashboard/add-product">
                  <Button variant="secondary" className="px-8 py-4 text-lg font-bold">Launch a Product</Button>
                </Link>
              </div>
            </div>
            <div className="relative group">
              <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full group-hover:bg-primary/30 transition-all duration-700" />
              <div className="relative border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl bg-[#0F0F13]">
                <div className="h-8 bg-surface-light border-b border-white/5 flex items-center px-4 gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-danger/40" />
                  <div className="w-2.5 h-2.5 rounded-full bg-warning/40" />
                  <div className="w-2.5 h-2.5 rounded-full bg-success/40" />
                  <div className="ml-4 h-4 w-40 bg-white/5 rounded-full" />
                </div>
                <div className="p-8 space-y-4">
                  <div className="h-4 w-3/4 bg-white/5 rounded-full animate-pulse" />
                  <div className="h-4 w-1/2 bg-white/5 rounded-full animate-pulse decoration-primary" />
                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <div className="aspect-square bg-white/5 rounded-2xl animate-pulse" />
                    <div className="aspect-square bg-white/5 rounded-2xl animate-pulse" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-6 py-32 border-t border-white/5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { title: "AI Scraper", desc: "Just paste a URL and we&apos;ll extract everything - titles, prices, images.", color: "primary" },
              { title: "Smart SEO", desc: "Our AI generates high-converting titles that rank higher on Google.", color: "secondary" },
              { title: "Auto-Click Track", desc: "Detailed analytics on every click in your affiliate empire.", color: "accent" }
            ].map((feature, i) => (
              <div key={i} className="space-y-4 group cursor-default">
                <div className={`w-12 h-12 rounded-2xl bg-${feature.color}/10 flex items-center justify-center text-${feature.color} group-hover:scale-110 transition-transform`}>
                  <Sparkles size={24} />
                </div>
                <h3 className="text-xl font-bold">{feature.title}</h3>
                <p className="text-muted leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="py-12 border-t border-white/10 text-center text-muted text-sm bg-black">
        <p>© 2026 Storix Platform. All rights reserved.</p>
      </footer>
    </div>
  );
}
