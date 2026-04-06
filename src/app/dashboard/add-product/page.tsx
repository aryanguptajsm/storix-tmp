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
import { motion, AnimatePresence } from "framer-motion";
import { AnimatedSection } from "@/components/dashboard/DashboardEntrance";

export default function AddProductPage() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [scraping, setScraping] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
      <AnimatedSection delay={0.1}>
        <div className="flex items-center justify-between">
          <Link href="/dashboard/products" className="group">
            <Button variant="ghost" size="sm" className="gap-2 text-muted hover:text-white transition-all font-black uppercase tracking-widest">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Inventory Control
            </Button>
          </Link>
          <div className="flex items-center gap-3">
             <div className="p-2 rounded-xl bg-secondary/10 text-secondary animate-pulse-glow border border-secondary/20">
                <Zap size={20} />
             </div>
             <h1 className="text-3xl font-black tracking-tight italic">Launch Unit</h1>
          </div>
        </div>
      </AnimatedSection>

      <AnimatedSection delay={0.2}>
        <Card className="glass relative overflow-hidden group hover:border-primary/20 transition-all duration-500 glass-premium-animated">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
             <Globe size={160} />
          </div>
          <CardHeader className="p-10 pb-4">
            <CardTitle className="text-2xl font-black flex items-center gap-4 italic uppercase tracking-tight">
              <div className="p-3 rounded-2xl bg-primary/10 text-primary border border-primary/20 shadow-lg shadow-primary/10">
                <Globe className="w-8 h-8" />
              </div>
              Universal Importer
            </CardTitle>
          </CardHeader>
          <CardContent className="p-10 pt-0 space-y-8">
            <p className="text-lg text-muted/80 font-medium max-w-2xl leading-relaxed">
              Define target coordinates (URL) from any affiliate platform. Our AI will intercept high-fidelity metadata.
            </p>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1 group/input">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-muted/30 group-focus-within/input:text-primary transition-all duration-300">
                  <Search size={20} />
                </div>
                <input
                  placeholder="Paste link (Amazon, Etsy, Flipkart...)"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full pl-14 pr-6 py-4 rounded-2xl bg-white/5 border border-white/5 text-foreground font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all placeholder:text-muted/20 text-lg shadow-inner"
                />
              </div>
              <Button 
                onClick={handleScrape} 
                disabled={scraping || !url}
                className="gap-3 px-10 h-auto py-4 shadow-2xl shadow-primary/20 relative overflow-hidden group/btn min-w-[200px] rounded-2xl hover-lift"
              >
                {scraping ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <>
                    <Sparkles size={20} className="group-hover/btn:rotate-12 transition-transform" />
                    <span className="font-black uppercase tracking-widest text-base font-display">Gather Intel</span>
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </AnimatedSection>

      <AnimatePresence mode="wait">
        {productData && (
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.6, cubicBezier: [0.22, 1, 0.36, 1] }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-10"
          >
            <div className="lg:col-span-4 space-y-6">
              <Card className="glass overflow-hidden border-white/10 group/preview hover:border-primary/30 transition-all glass-morphism-premium">
                <CardContent className="p-0">
                  <div className="relative aspect-square bg-white flex items-center justify-center p-12 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/5" />
                    {productData.image ? (
                      <motion.div
                        layoutId="productImage"
                        className="w-full h-full relative z-10"
                      >
                        <Image
                          src={productData.image}
                          alt="Intelligence preview"
                          fill
                          className="object-contain p-4"
                        />
                      </motion.div>
                    ) : (
                      <div className="flex flex-col items-center gap-6 text-muted/20">
                        <Package className="w-24 h-24" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em]">No Asset Detected</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover/preview:bg-black/60 transition-all duration-300 flex flex-col items-center justify-center gap-3 opacity-0 group-hover/preview:opacity-100 z-20">
                      <Button 
                        variant="secondary" 
                        size="sm" 
                        className="gap-2 rounded-xl h-11 px-6 font-bold"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                      >
                        {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                        Update Source Asset
                      </Button>
                      {productData.image && (
                        <Button 
                          variant="danger" 
                          size="sm" 
                          className="h-11 px-6 gap-2 rounded-xl font-bold"
                          onClick={handleImageReset}
                        >
                          <Trash2 size={16} />
                          Remove
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
                    <div className="absolute top-6 left-6 px-4 py-1.5 rounded-xl glass border-white/10 text-[10px] font-black text-foreground uppercase tracking-widest z-20 shadow-2xl">
                      {productData.platform}
                    </div>
                  </div>
                  <div className="p-8 space-y-8">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted/60">Unit Status</span>
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-success bg-success/10 px-3 py-1 rounded-full border border-success/20 animate-pulse">Detected & Ready</span>
                    </div>
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted/60">Intercept Price</span>
                        <span className="text-3xl font-black text-[#FF4D67] tracking-tighter text-shadow-glow">{productData.price || "N/A"}</span>
                      </div>
                      {productData.originalPrice && (
                        <div className="flex items-center justify-between opacity-50">
                          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted/60">Baseline Price</span>
                          <span className="text-base font-bold text-slate-400 line-through">{productData.originalPrice}</span>
                        </div>
                      )}
                      {productData.discountPercentage && (
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted/60">Tactical Savings</span>
                          <span className="text-xs font-black text-green-400 bg-green-500/10 px-3 py-1.5 rounded-xl border border-green-500/20">-{productData.discountPercentage}% OFF</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Link href={productData.originalUrl || url} target="_blank" className="block group/link">
                <div className="flex items-center justify-center gap-3 p-5 rounded-3xl glass border-white/5 hover:border-primary/40 transition-all text-xs font-black uppercase tracking-widest text-muted group-hover/link:text-foreground hover:glow-primary">
                  <ExternalLink size={16} className="group-hover/link:rotate-12 transition-transform" />
                  Verify Encryption Source
                </div>
              </Link>
            </div>
  
            <div className="lg:col-span-8 space-y-8">
              <Card className="glass overflow-hidden border-white/10 glass-premium-animated">
                <CardHeader className="p-8 pb-2 border-b border-white/5 bg-white/[0.02]">
                  <CardTitle className="text-xl font-black flex items-center gap-4 italic uppercase tracking-tight">
                    <div className="p-2 rounded-xl bg-secondary/10 text-secondary border border-secondary/20 shadow-lg shadow-secondary/10">
                      <Zap className="w-6 h-6" />
                    </div>
                    Neural Expansion
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-10 space-y-10">
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted/60">Display Signal (Title)</label>
                      <button
                        onClick={handleGenerateTitle}
                        disabled={generating}
                        className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-secondary hover:text-secondary-light transition-all group/ai py-1 px-3 rounded-lg bg-secondary/10 hover:bg-secondary/20 border border-secondary/20"
                      >
                        {generating ? (
                          <Loader2 size={12} className="animate-spin" />
                        ) : (
                          <Sparkles size={12} className="group-hover/ai:rotate-12 transition-transform" />
                        )}
                        AI Signal Sync
                      </button>
                    </div>
                    <Input
                      value={productData.title}
                      onChange={(e) => setProductData({ ...productData, title: e.target.value })}
                      className="bg-white/5 border-white/5 focus:glow-primary transition-all font-black text-lg p-6 rounded-2xl"
                    />
                  </motion.div>
  
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted/60">Asset Origin (URL)</label>
                      <div className="flex items-center gap-2 text-[10px] font-black text-muted/40 uppercase tracking-widest">
                        <LinkIcon size={12} />
                        Direct Link
                      </div>
                    </div>
                    <Input
                      value={productData.image}
                      onChange={(e) => setProductData({ ...productData, image: e.target.value })}
                      placeholder="https://example.com/image.jpg"
                      className="bg-white/5 border-white/5 focus:glow-primary transition-all font-mono text-sm p-6 rounded-2xl"
                    />
                    <p className="text-[10px] text-muted/60 italic font-medium">Tactical Advice: PNG assets with transparency provide the highest conversion rates.</p>
                  </motion.div>
  
                  <AnimatePresence>
                    {aiSuggestions.length > 0 && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="p-8 bg-secondary/5 rounded-[2.5rem] border border-secondary/20 space-y-6 relative overflow-hidden shadow-inner"
                      >
                        <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12 pointer-events-none">
                           <Sparkles size={60} className="text-secondary" />
                        </div>
                        <div className="text-[10px] font-black text-secondary uppercase tracking-[0.3em] flex items-center gap-3 relative z-10">
                          <Zap size={14} fill="currentColor" /> Neural Resonance Variants
                        </div>
                        <div className="grid grid-cols-1 gap-3 relative z-10">
                          {aiSuggestions.map((title, i) => (
                            <motion.button
                              key={i}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.1 }}
                              onClick={() => {
                                setProductData({ ...productData, title });
                                toast.success("Signal updated.");
                              }}
                              className={`text-sm text-left p-5 rounded-2xl border transition-all duration-300 flex items-center justify-between group/suggestion ${
                                productData.title === title 
                                  ? "bg-secondary/20 border-secondary text-white shadow-xl shadow-secondary/20" 
                                  : "border-white/5 bg-black/40 text-muted/60 hover:border-secondary/50 hover:text-white"
                              }`}
                            >
                              <span className="font-black italic line-clamp-1">{title}</span>
                              <div className={`p-1.5 rounded-lg bg-secondary/20 opacity-0 group-hover/suggestion:opacity-100 transition-all ${productData.title === title ? 'opacity-100' : ''}`}>
                                 <Plus size={14} className="text-secondary" />
                              </div>
                            </motion.button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="space-y-4"
                    >
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted/60">Final Intercept Price</label>
                      <Input
                        value={productData.price}
                        onChange={(e) => setProductData({ ...productData, price: e.target.value })}
                        className="bg-white/5 border-white/5 focus:glow-primary transition-all font-black text-2xl p-6 rounded-2xl text-secondary-light"
                      />
                    </motion.div>
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="space-y-4"
                    >
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted/60">Baseline Market Price</label>
                      <Input
                        value={productData.originalPrice}
                        onChange={(e) => setProductData({ ...productData, originalPrice: e.target.value })}
                        className="bg-white/5 border-white/5 focus:glow-primary transition-all font-black text-2xl p-6 rounded-2xl text-muted/40"
                      />
                    </motion.div>
                  </div>
  
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="space-y-4"
                  >
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted/60">Operational Description</label>
                    <textarea
                      rows={5}
                      value={productData.description}
                      onChange={(e) => setProductData({ ...productData, description: e.target.value })}
                      className="w-full rounded-[2rem] bg-white/5 border border-white/5 p-8 text-base font-medium text-foreground focus:ring-4 focus:ring-primary/10 focus:border-primary/40 outline-none transition-all resize-none leading-relaxed shadow-inner"
                    />
                  </motion.div>
  
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="pt-6"
                  >
                    <Button 
                      className="w-full gap-4 h-20 text-xl font-black uppercase tracking-[0.3em] shadow-2xl shadow-primary/30 group/save relative overflow-hidden rounded-[2.5rem] hover-lift"
                      onClick={handleSave}
                      disabled={saving}
                    >
                       <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary-light to-primary-dark opacity-0 group-hover/save:opacity-20 transition-opacity" />
                       
                      {saving ? (
                        <Loader2 size={32} className="animate-spin" />
                      ) : (
                        <>
                          <Save size={24} className="group-hover/save:scale-110 transition-transform" />
                          <span>Initiate Deployment</span>
                          <ArrowRight size={24} className="group-hover/save:translate-x-3 transition-transform" />
                        </>
                      )}
                    </Button>
                  </motion.div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
