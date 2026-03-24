"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { 
  Sparkles, 
  ShoppingBag, 
  Zap, 
  ArrowRight, 
  ArrowUpRight,
  Layout,
  MousePointerClick,
  TrendingUp,
  Globe
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#13131A] selection:bg-[#6C5CE7]/30 selection:text-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 glass border-b border-[#3D3D5C]/50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-lg shadow-[#6C5CE7]/20">
              <ShoppingBag className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-black bg-gradient-to-r from-[#6C5CE7] to-[#FD79A8] bg-clip-text text-transparent tracking-tighter">
              Storix
            </span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-foreground transition-colors">How it Works</a>
            <Link href="/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/signup">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative pt-40 pb-24 px-6 overflow-hidden">
          {/* Animated Background Blobs */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full -z-10">
            <div className="absolute top-20 left-10 w-72 h-72 bg-[#6C5CE7]/20 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-20 right-10 w-72 h-72 bg-[#FD79A8]/20 rounded-full blur-[120px] animate-pulse-glow" />
          </div>

          <div className="max-w-7xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#1E1E2E] border border-[#3D3D5C] mb-8 animate-fade-in shadow-xl">
              <Sparkles className="w-4 h-4 text-[#6C5CE7]" />
              <span className="text-sm font-medium text-muted">AI-Powered Affiliate Magic</span>
            </div>
            
            <h1 className="text-5xl md:text-8xl font-black tracking-tight mb-8 leading-[1.1] animate-slide-in text-white">
              Build Your Affiliate <br />
              <span className="bg-gradient-to-r from-[#6C5CE7] via-[#A29BFE] to-[#FD79A8] bg-clip-text text-transparent">
                Storefront in Minutes
              </span>
            </h1>
            
            <p className="max-w-2xl mx-auto text-xl text-muted mb-12 animate-fade-in leading-relaxed">
              Paste product links, let AI generate high-converting titles, and launch your stunning affiliate store. Optimize your workflow and start earning from every click.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in">
              <Link href="/signup">
                <Button size="lg" className="h-14 px-8 text-lg rounded-2xl min-w-[220px]">
                  Start Building for Free
                  <ArrowRight className="w-5 h-5 ml-1" />
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="secondary" size="lg" className="h-14 px-8 text-lg rounded-2xl min-w-[200px]">
                  Explore Demo
                  <ArrowUpRight className="w-5 h-5 ml-1 opacity-50" />
                </Button>
              </Link>
            </div>

            {/* Mockup Preview */}
            <div className="mt-20 relative max-w-5xl mx-auto animate-fade-in">
              <div className="absolute inset-0 bg-gradient-to-t from-[#13131A] via-transparent to-transparent z-10" />
              <div className="rounded-3xl border border-[#3D3D5C] bg-[#1E1E2E]/50 p-4 backdrop-blur-sm shadow-2xl overflow-hidden shadow-[#6C5CE7]/10">
                <div className="aspect-[16/9] rounded-2xl bg-[#13131A] overflow-hidden relative border border-[#3D3D5C]/50">
                  <div className="absolute top-4 left-4 flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-[#FF6B6B]/20 border border-[#FF6B6B]/40" />
                    <div className="w-3 h-3 rounded-full bg-[#FDCB6E]/20 border border-[#FDCB6E]/40" />
                    <div className="w-3 h-3 rounded-full bg-[#00B894]/20 border border-[#00B894]/40" />
                  </div>
                  <div className="flex items-center justify-center h-full flex-col gap-4 opacity-40">
                    <div className="w-16 h-16 rounded-2xl bg-[#1E1E2E] border border-[#3D3D5C] flex items-center justify-center">
                      <Layout className="w-8 h-8" />
                    </div>
                    <div className="h-4 w-48 bg-[#1E1E2E] rounded-full" />
                    <div className="grid grid-cols-3 gap-4 w-full px-20">
                      {[1, 2, 3].map(i => <div key={i} className="h-32 bg-[#1E1E2E] rounded-xl border border-[#3D3D5C]/50" />)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 px-6 relative">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">Scale your earnings with AI</h2>
              <p className="text-muted text-lg max-w-2xl mx-auto">Everything you need to build, track, and optimize your affiliate stores in one beautiful dashboard.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: Zap,
                  title: "Instant Web Scraping",
                  desc: "Connect your Amazon or Flipkart links. We automatically pull high-quality images and real-time pricing.",
                  color: "text-[#6C5CE7]",
                  bg: "bg-[#6C5CE7]/10"
                },
                {
                  icon: Sparkles,
                  title: "Gemini AI Titles",
                  desc: "Built-in AI optimizes your product titles for higher click-through rates and better SEO ranking automatically.",
                  color: "text-[#FD79A8]",
                  bg: "bg-[#FD79A8]/10"
                },
                {
                  icon: TrendingUp,
                  title: "Click Analytics",
                  desc: "Track every conversion. Know exactly which products are performing and optimize your store for revenue.",
                  color: "text-[#00CEC9]",
                  bg: "bg-[#00CEC9]/10"
                }
              ].map((feature, i) => (
                <Card key={i} className="group hover:-translate-y-2 transition-all duration-500 border-[#3D3D5C] bg-[#1E1E2E]/40">
                  <div className={`w-14 h-14 rounded-2xl ${feature.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform ${feature.color}`}>
                    <feature.icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-white">{feature.title}</h3>
                  <p className="text-muted leading-relaxed">{feature.desc}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Dynamic Showcase */}
        <section className="py-24 px-6 bg-[#1E1E2E]/10 border-y border-[#3D3D5C]/30">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-16">
            <div className="flex-1">
              <div className="w-12 h-12 rounded-xl bg-[#6C5CE7]/20 border border-[#6C5CE7]/40 flex items-center justify-center mb-6 text-[#6C5CE7]">
                <Globe className="w-6 h-6" />
              </div>
              <h2 className="text-4xl font-bold mb-6 text-white leading-tight">Your Store, Your Brand, <br />Everywhere.</h2>
              <p className="text-lg text-muted mb-8 leading-relaxed">
                Storix provides you with a custom subdomain and a blazing fast storefront that looks premium on mobile, tablet, and desktop. No design skills required.
              </p>
              <ul className="space-y-4">
                {[
                  "Mobile-first responsive design",
                  "Built-in click tracking & logs",
                  "AI-optimized meta tags",
                  "Blazing fast page loads"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-muted">
                    <div className="w-5 h-5 rounded-full bg-[#00B894]/10 border border-[#00B894]/30 flex items-center justify-center text-[#00B894]">
                      <ArrowRight className="w-3 h-3" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex-1 relative">
              <div className="absolute inset-0 bg-[#6C5CE7]/20 blur-[100px] -z-10" />
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4 mt-12">
                  <div className="h-48 rounded-2xl bg-[#1E1E2E] border border-[#3D3D5C] p-4 flex flex-col justify-end gap-2 shadow-2xl">
                    <div className="h-3 w-2/3 bg-[#3D3D5C] rounded-full" />
                    <div className="h-3 w-full bg-[#3D3D5C]/50 rounded-full" />
                  </div>
                  <div className="h-48 rounded-2xl bg-[#1E1E2E] border border-[#3D3D5C] p-4 animate-pulse">
                    <div className="w-full h-full bg-[#3D3D5C]/30 rounded-xl" />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="h-48 rounded-2xl bg-[#1E1E2E] border border-[#3D3D5C] p-4">
                    <div className="w-full h-full bg-[#6C5CE7]/10 rounded-xl border border-[#6C5CE7]/20" />
                  </div>
                  <div className="h-48 rounded-2xl bg-[#1E1E2E] border border-[#3D3D5C] p-4 flex flex-col justify-end gap-2 shadow-2xl">
                    <div className="h-3 w-1/2 bg-[#3D3D5C] rounded-full" />
                    <div className="h-3 w-3/4 bg-[#3D3D5C]/50 rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-32 px-6 text-center">
          <div className="max-w-4xl mx-auto rounded-[3rem] p-12 md:p-24 relative overflow-hidden bg-[#1E1E2E] border border-[#3D3D5C]/50 shadow-2xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#6C5CE7]/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-[100px]" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#FD79A8]/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-[100px]" />
            
            <h2 className="text-4xl md:text-6xl font-black mb-8 relative z-10 text-white leading-tight">Ready to build your <br /> passive income?</h2>
            <p className="text-muted text-xl mb-12 relative z-10 max-w-xl mx-auto">Join the new era of affiliate marketing. Fast, automated, and AI-powered.</p>
            <Link href="/signup" className="relative z-10">
              <Button size="lg" className="h-16 px-12 text-xl rounded-2xl shadow-2xl shadow-[#6C5CE7]/20">
                Get Started for Free
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="py-16 px-6 border-t border-[#3D3D5C]/30 bg-[#13131A]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-black text-white">Storix</span>
            </div>
            <p className="text-muted text-sm max-w-xs">
              The AI-powered platform for affiliate creators to build stunning storefronts in minutes.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6 text-sm font-medium text-muted">
            <a href="#" className="hover:text-white transition-colors">Features</a>
            <a href="#" className="hover:text-white transition-colors">Pricing</a>
            <a href="#" className="hover:text-white transition-colors">Support</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-[#3D3D5C]/20 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted/50 font-medium">
          <p>© 2026 Storix Inc. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span>Powered by Gemini AI</span>
            <div className="w-1 h-1 rounded-full bg-muted/20" />
            <span>Built with Next.js</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
