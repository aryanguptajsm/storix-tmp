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
    <div className="min-h-screen bg-[#13131A] text-white selection:bg-[#6C5CE7]/30">
      <nav className="h-20 border-b border-[#3D3D5C]/50 px-6 flex items-center justify-between glass sticky top-0 z-50">
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
            <div className="inline-block px-3 py-1 rounded-full bg-[#6C5CE7]/10 border border-[#6C5CE7]/20 text-[#A29BFE] text-xs font-bold uppercase tracking-widest">
              The Product
            </div>
            <h1 className="text-5xl font-black leading-tight">
              One platform. <br />
              Millions of <span className="text-[#6C5CE7]">Possibilities.</span>
            </h1>
            <p className="text-lg text-muted leading-relaxed">
              Storix isn't just a store builder; it's your personal AI assistant for affiliate success. We've combined deep web scraping with advanced LLMs to make storefront creation instantaneous.
            </p>
            <div className="flex items-center gap-4 pt-4">
              <Link href="/signup">
                <Button className="h-12 px-8">Build My Store</Button>
              </Link>
              <div className="flex -space-x-2">
                {[1,2,3,4].map(i => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-[#13131A] bg-[#3D3D5C]" />
                ))}
              </div>
              <span className="text-xs text-muted font-medium ml-2">500+ creators joined</span>
            </div>
          </div>
          <div className="flex-1 aspect-square rounded-[3rem] gradient-primary p-1 shadow-2xl shadow-[#6C5CE7]/20">
             <div className="w-full h-full rounded-[2.8rem] bg-[#13131A] flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[#6C5CE7]/20 to-transparent" />
                <Sparkles className="w-24 h-24 text-[#6C5CE7] animate-pulse" />
             </div>
          </div>
        </div>

        <section className="space-y-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="p-8 rounded-3xl bg-[#1E1E2E] border border-[#3D3D5C] group hover:border-[#6C5CE7]/30 transition-colors">
              <Zap className="w-10 h-10 text-[#6C5CE7] mb-6" />
              <h3 className="text-2xl font-bold mb-4">Blazing Fast Scraping</h3>
              <p className="text-muted leading-relaxed">
                Our custom-built scraping engine fetches product data in seconds. No more manual copying and pasting. Support for major e-commerce platforms coming daily.
              </p>
            </div>
            <div className="p-8 rounded-3xl bg-[#1E1E2E] border border-[#3D3D5C] group hover:border-[#6C5CE7]/30 transition-colors">
              <TrendingUp className="w-10 h-10 text-[#00CEC9] mb-6" />
              <h3 className="text-2xl font-bold mb-4">Click Intelligence</h3>
              <p className="text-muted leading-relaxed">
                Understand user intent. Our dashboard shows you not just how many clicks you got, but which products are converting at the highest rates.
              </p>
            </div>
          </div>

          <div className="rounded-[3rem] bg-[#1E1E2E] border border-[#3D3D5C] p-12 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-64 h-64 bg-[#6C5CE7]/10 blur-[80px]" />
            <div className="relative z-10 flex flex-col items-center text-center max-w-2xl mx-auto">
              <Shield className="w-12 h-12 text-[#00B894] mb-8" />
              <h2 className="text-4xl font-bold mb-6">Designed for Trust</h2>
              <p className="text-lg text-muted mb-10">
                A clean, premium storefront increases user trust and conversion rates. We've spent months perfecting the layout so you don't have to.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 w-full">
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-white">SSL</div>
                  <div className="text-xs text-muted uppercase">Secured</div>
                </div>
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-white">24/7</div>
                  <div className="text-xs text-muted uppercase">Monitoring</div>
                </div>
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-white">100%</div>
                  <div className="text-xs text-muted uppercase">Responsive</div>
                </div>
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-white">AI</div>
                  <div className="text-xs text-muted uppercase">Powered</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 text-center">
          <div className="flex flex-col items-center gap-8">
            <Layout className="w-16 h-16 text-[#6C5CE7]/40" />
            <h2 className="text-4xl font-bold">Start your journey today.</h2>
            <p className="text-muted max-w-lg">
              Join the growing community of smart affiliate marketers using Storix to automate their business.
            </p>
            <Link href="/signup">
              <Button size="lg" className="h-14 px-12 text-lg">
                Create My First Store
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="py-12 border-t border-[#3D3D5C]/30 text-center text-muted text-sm">
        <p>© 2026 Storix Platform. All rights reserved.</p>
      </footer>
    </div>
  );
}
