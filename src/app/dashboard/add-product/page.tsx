"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { getUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { 
  ArrowLeft, 
  Search, 
  Sparkles, 
  Save, 
  Loader2, 
  ExternalLink,
  Package,
  Globe,
  DollarSign,
  Type,
  Zap,
  ArrowRight,
  Upload,
  Image as ImageIcon,
  Trash2,
  Link as LinkIcon
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";

export default function AddProductPage() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [scraping, setScraping] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [productData, setProductData] = useState<any>(null);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  async function handleScrape() {
    if (!url) return;
    
    setScraping(true);
    setProductData(null);
    setAiSuggestions([]);
    
    try {
      const res = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Scraping failed");
      
      setProductData(data);
      toast.success("Product intelligence gathered!");
    } catch (err: any) {
      console.error("Scrape error:", err);
      toast.error(err.message || "Failed to scrape product.");
    } finally {
      setScraping(false);
    }
  }

  async function handleGenerateTitle() {
    if (!productData) return;
    
    setGenerating(true);
    try {
      const res = await fetch("/api/generate-title", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          title: productData.title,
          description: productData.description || ""
        }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "AI generation failed");
      
      if (data.titles && data.titles.length > 0) {
        setAiSuggestions(data.titles);
        toast.success("AI variants generated!");
      }
    } catch (err: any) {
      console.error("AI error:", err);
      toast.error(err.message || "AI generation failed.");
    } finally {
      setGenerating(false);
    }
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file.");
      return;
    }

    setUploading(true);
    const supabase = createClient();
    try {
      const user = await getUser();
      if (!user) throw new Error("Authentication failed.");

      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `product-images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("product-images")
        .getPublicUrl(filePath);

      setProductData({ ...productData, image: publicUrl });
      toast.success("High-fidelity asset uploaded!");
    } catch (err: any) {
      console.error("Upload error:", err);
      toast.error(err.message || "Failed to upload image.");
    } finally {
      setUploading(false);
    }
  }

  const handleImageReset = () => {
    if (productData) {
      setProductData({ ...productData, image: "" });
    }
  };

  async function handleSave() {
    if (!productData) {
      toast.error("No product data detected.");
      return;
    }
    
    setSaving(true);
    const supabase = createClient();
    try {
      const user = await getUser();
      if (!user) throw new Error("Authentication failed. Please sign in again.");
      
      const insertData = {
        user_id: user.id,
        title: String(productData.title || "Untitled Product").trim(),
        description: String(productData.description || "").trim(),
        price: String(productData.price || "").trim(),
        original_price: String(productData.originalPrice || "").trim(),
        discount_percentage: String(productData.discountPercentage || "").trim(),
        image_url: String(productData.image || "").trim(),
        platform: String(productData.platform || "Universal").trim(),
        original_url: String(productData.originalUrl || url || "").trim(),
      };

      const { data, error } = await supabase
        .from("products")
        .insert(insertData)
        .select()
        .single();
      
      if (error) {
        console.error("Supabase Deployment Error:", error);
        throw new Error(error.message || "Failed to save product.");
      }
      
      toast.success("Product successfully deployed to your hangar!");
      router.push("/dashboard/products");
    } catch (err: any) {
      console.error("Deployment failure:", err);
      toast.error(err.message || "A critical error occurred during deployment.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in pb-24">
      <div className="flex items-center justify-between">
        <Link href="/dashboard/products" className="group">
          <Button variant="ghost" size="sm" className="gap-2 text-muted hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Inventory Control
          </Button>
        </Link>
        <div className="flex items-center gap-3">
           <Zap className="text-secondary animate-pulse-glow" size={20} />
           <h1 className="text-3xl font-black tracking-tight">Launch Product</h1>
        </div>
      </div>

      <Card className="glass relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
           <Globe size={120} />
        </div>
        <CardHeader className="p-8 pb-4">
          <CardTitle className="text-xl font-bold flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Globe className="w-6 h-6" />
            </div>
            Universal Importer
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8 pt-0 space-y-6">
          <p className="text-muted font-medium max-w-xl leading-relaxed">
            Specify a target URL from any affiliate-enabled platform. Our AI will automatically extract high-fidelity assets and metadata.
          </p>
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1 group/input">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted/30 group-focus-within/input:text-primary transition-colors">
                <Search size={18} />
              </div>
              <input
                placeholder="Paste product link (Amazon, Etsy, Flipkart...)"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white/5 border border-white/5 text-foreground font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all placeholder:text-muted/30"
              />
            </div>
            <Button 
              onClick={handleScrape} 
              disabled={scraping || !url}
              className="gap-3 px-8 h-auto py-3.5 shadow-xl shadow-primary/10 relative overflow-hidden group/btn min-w-[180px]"
            >
              {scraping ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Sparkles size={18} className="group-hover/btn:rotate-12 transition-transform" />
                  <span className="font-bold">Gather Intel</span>
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {productData && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-slide-up">
          <div className="lg:col-span-4 space-y-6">
            <Card className="glass overflow-hidden border-white/10 group/preview">
              <CardContent className="p-0">
                <div className="relative aspect-square bg-white flex items-center justify-center p-8 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/5" />
                  {productData.image ? (
                    <Image
                      src={productData.image}
                      alt="Intelligence preview"
                      fill
                      className="object-contain p-8 z-10"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-4 text-muted/20">
                      <Package className="w-20 h-20" />
                      <span className="text-xs font-bold uppercase tracking-widest">No Asset Detected</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover/preview:bg-black/40 transition-all flex items-center justify-center gap-2 opacity-0 group-hover/preview:opacity-100 z-20">
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      className="gap-2 rounded-xl"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                    >
                      {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                      Update Asset
                    </Button>
                    {productData.image && (
                      <Button 
                        variant="danger" 
                        size="sm" 
                        className="h-9 w-9 p-0 rounded-xl"
                        onClick={handleImageReset}
                      >
                        <Trash2 size={14} />
                      </Button>
                    )}
                  </div>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleFileUpload} 
                  />
                  <div className="absolute top-4 left-4 px-3 py-1 rounded-xl glass border-white/10 text-[10px] font-black text-foreground uppercase tracking-widest z-20 shadow-sm">
                    {productData.platform}
                  </div>
                </div>
                <div className="p-6 pt-0 space-y-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted/60">Unit Status</span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-success bg-success/10 px-2 py-0.5 rounded-full">Detected</span>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-widest text-muted/60">Deal Price</span>
                      <span className="text-2xl font-black text-[#FF4D67] tracking-tighter">{productData.price || "N/A"}</span>
                    </div>
                    {productData.originalPrice && (
                      <div className="flex items-center justify-between opacity-60">
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted/60">List Price</span>
                        <span className="text-sm font-bold text-slate-400 line-through">{productData.originalPrice}</span>
                      </div>
                    )}
                    {productData.discountPercentage && (
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted/60">Savings</span>
                        <span className="text-xs font-black text-green-500 bg-green-500/10 px-2 py-1 rounded-lg">-{productData.discountPercentage}% OFF</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Link href={productData.originalUrl || url} target="_blank" className="block group/link">
              <div className="flex items-center justify-center gap-2 p-4 rounded-2xl glass border-white/5 hover:border-primary/20 transition-all text-xs font-bold text-muted group-hover/link:text-foreground">
                <ExternalLink size={14} className="group-hover/link:rotate-12 transition-transform" />
                Verify Source Listing
              </div>
            </Link>
          </div>

          <div className="lg:col-span-8 space-y-6">
            <Card className="glass overflow-hidden border-white/10">
              <CardHeader className="p-6 pb-2 border-b border-white/5 bg-white/[0.01]">
                <CardTitle className="text-lg font-bold flex items-center gap-3">
                  <div className="p-1.5 rounded-lg bg-secondary/10 text-secondary">
                    <Type className="w-5 h-5" />
                  </div>
                  Asset Optimization
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted/60">Display Title</label>
                    <button
                      onClick={handleGenerateTitle}
                      disabled={generating}
                      className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-secondary hover:text-secondary-light transition-colors group/ai"
                    >
                      {generating ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : (
                        <Sparkles size={12} className="group-hover/ai:rotate-12 transition-transform" />
                      )}
                      AI Power-Up
                    </button>
                  </div>
                  <Input
                    value={productData.title}
                    onChange={(e) => setProductData({ ...productData, title: e.target.value })}
                    className="bg-white/5 border-white/5 focus:border-primary/30 font-bold"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted/60">Asset Location (URL)</label>
                    <div className="flex items-center gap-1 text-[8px] font-bold text-muted/40 uppercase">
                      <LinkIcon size={10} />
                      Direct Link
                    </div>
                  </div>
                  <Input
                    value={productData.image}
                    onChange={(e) => setProductData({ ...productData, image: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                    className="bg-white/5 border-white/5 focus:border-primary/30 font-mono text-xs"
                  />
                  <p className="text-[9px] text-muted italic">Pro Tip: High-resolution PNGs with transparent backgrounds look best in the store.</p>
                </div>

                {aiSuggestions.length > 0 && (
                  <div className="p-6 bg-secondary/5 rounded-3xl border border-secondary/10 space-y-4 animate-fade-in relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10 rotate-12 pointer-events-none">
                       <Sparkles size={40} className="text-secondary" />
                    </div>
                    <div className="text-[10px] font-black text-secondary uppercase tracking-[0.2em] flex items-center gap-2 relative z-10">
                      AI Variant Generation
                    </div>
                    <div className="grid grid-cols-1 gap-2 relative z-10">
                      {aiSuggestions.map((title, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            setProductData({ ...productData, title });
                          }}
                          className={`text-sm text-left p-4 rounded-xl border transition-all duration-300 flex items-center justify-between group/suggestion ${
                            productData.title === title 
                              ? "bg-secondary/20 border-secondary text-white shadow-lg shadow-secondary/10" 
                              : "border-white/5 bg-white/[0.02] text-muted hover:border-secondary/40 hover:text-white"
                          }`}
                        >
                          <span className="font-medium line-clamp-1">{title}</span>
                          <div className={`p-1 rounded bg-secondary/20 opacity-0 group-hover/suggestion:opacity-100 transition-opacity ${productData.title === title ? 'opacity-100' : ''}`}>
                             <Zap size={10} fill="currentColor" />
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted/60">Deal Price</label>
                    <Input
                      value={productData.price}
                      onChange={(e) => setProductData({ ...productData, price: e.target.value })}
                      className="bg-white/5 border-white/5 focus:border-primary/30 font-bold"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted/60">Original Price</label>
                    <Input
                      value={productData.originalPrice}
                      onChange={(e) => setProductData({ ...productData, originalPrice: e.target.value })}
                      className="bg-white/5 border-white/5 focus:border-primary/30 font-bold"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted/60">Landing Description</label>
                  <textarea
                    rows={4}
                    value={productData.description}
                    onChange={(e) => setProductData({ ...productData, description: e.target.value })}
                    className="w-full rounded-2xl bg-white/5 border border-white/5 p-4 text-sm font-medium text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary/40 outline-none transition-all resize-none leading-relaxed"
                  />
                </div>

                <div className="pt-4">
                  <Button 
                    className="w-full gap-3 h-14 text-lg font-black uppercase tracking-widest shadow-2xl shadow-primary/25 group/save"
                    onClick={handleSave}
                    disabled={saving}
                  >
                    {saving ? (
                      <Loader2 size={24} className="animate-spin" />
                    ) : (
                      <>
                        <Save size={20} className="group-hover/save:translate-y-[-2px] transition-transform" />
                        <span>Confirm Deployment</span>
                        <ArrowRight size={20} className="group-hover/save:translate-x-2 transition-transform" />
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
