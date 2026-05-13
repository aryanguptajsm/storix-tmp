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
  Upload,
  Trash2,
  Plus,
  Wand2,
  Image as ImageIcon
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { AnimatedSection } from "@/components/dashboard/DashboardEntrance";
import { getProductLimit, isPaidPlan, normalizePlanId } from "@/lib/plans";

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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [profile, setProfile] = useState<any>(null);
  const [productCount, setProductCount] = useState(0);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    async function loadStats() {
      const user = await getUser();
      if (!user) return;
      const supabase = createClient();
      
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      
      const { count } = await supabase
        .from("products")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);
      
      setProfile(profile);
      setProductCount(count || 0);
    }
    loadStats();
  }, []);

  async function handleScrape() {
    if (!url) return;
    
    const limit = getProductLimit(normalizePlanId(profile?.plan));
    if (productCount >= limit) {
      toast.error(`Product limit reached (${productCount}/${limit})`, {
        description: "Upgrade your plan to add more products.",
        duration: 5000,
      });
      return;
    }
    
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
      if (!res.ok) throw new Error(data.error || "Failed to extract product");
      
      setProductData(data);
      if (data.status === "partial") {
        toast.info("Partial details extracted. Please verify missing fields.");
      } else {
        toast.success("Product details extracted successfully!");
      }
    } catch (err: any) {
      console.error("Extraction error:", err);
      toast.error(err.message || "Failed to extract product details.");
    } finally {
      setScraping(false);
    }
  }

  async function handleEnhanceWithAI() {
    if (!productData) return;
    
    const isPro = isPaidPlan(profile?.plan);
    
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
        
        if (isPro && data.description) {
          setProductData((prev: any) => ({ ...prev, description: data.description }));
          toast.success("AI generated title variants and enhanced description!");
        } else {
          toast.success("AI generated title variants!");
          if (!isPro) {
            toast.info("Pro Perk: Upgrade to auto-enhance descriptions.", {
              icon: <Wand2 className="text-primary" />
            });
          }
        }
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
      toast.error("Please upload a valid image file.");
      return;
    }

    setUploading(true);
    const supabase = createClient();
    try {
      const user = await getUser();
      if (!user) throw new Error("Authentication required.");

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
      toast.success("Product image uploaded successfully!");
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
      toast.error("No product details to save.");
      return;
    }
    
    setSaving(true);
    const supabase = createClient();
    try {
      const user = await getUser();
      if (!user) throw new Error("Authentication required.");
      
      const insertData = {
        user_id: user.id,
        title: String(productData.title || "Untitled Product").trim(),
        description: productData.description?.trim() || null,
        price: productData.price?.trim() || null,
        original_price: productData.originalPrice?.trim() || null,
        discount_percentage: productData.discountPercentage?.trim() || null,
        rating: productData.rating?.trim() || null,
        review_count: productData.reviewCount?.toString().trim() || null,
        brand: productData.brand?.trim() || null,
        image_url: productData.image?.trim() || null,
        platform: productData.platform?.trim() || "other",
        original_url: (productData.originalUrl || url || "").trim(),
      };

      const { error } = await supabase
        .from("products")
        .insert(insertData);
      
      if (error) {
        throw new Error(error.message || "Failed to save product.");
      }
      
      toast.success("Product added successfully!");
      router.push("/dashboard/products");
    } catch (err: any) {
      console.error("Save error:", err);
      toast.error(err.message || "Failed to add product.");
    } finally {
      setSaving(false);
    }
  }

  const isPro = isPaidPlan(profile?.plan);

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-fade-in pb-24">
      {/* Header */}
      <AnimatedSection delay={0.1}>
        <div className="flex flex-col gap-6 md:flex-row md:items-end justify-between">
          <div className="space-y-4">
            <Link href="/dashboard/products" className="inline-flex">
              <Button variant="ghost" size="sm" className="gap-2 text-muted hover:text-foreground hover:bg-white/5 transition-all rounded-xl pl-0 hover:pl-3">
                <ArrowLeft className="w-4 h-4" />
                Back to Products
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">Add New Product</h1>
              <p className="text-muted mt-2">Import product details instantly via URL or configure manually.</p>
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* URL Extractor */}
      <AnimatedSection delay={0.2}>
        <Card className="glass border-white/5 bg-white/[0.02] shadow-xl overflow-hidden rounded-[2rem]">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="relative flex-1 w-full group/input">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-muted/40 group-focus-within/input:text-primary transition-colors">
                  <Search size={20} />
                </div>
                <input
                  placeholder="Paste URL from Amazon, Shopify, Flipkart, Etsy..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full pl-14 pr-6 py-5 rounded-[1.5rem] bg-white/[0.03] border border-white/5 text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all placeholder:text-muted/30 text-base"
                />
              </div>
              <Button 
                onClick={handleScrape} 
                disabled={scraping || !url}
                className="w-full md:w-auto h-[60px] px-8 rounded-[1.5rem] gap-3 bg-white text-black hover:bg-white/90 font-bold shadow-lg transition-transform active:scale-95"
              >
                {scraping ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Sparkles size={18} />
                    Extract Details
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </AnimatedSection>

      {/* Editor Section */}
      <AnimatePresence mode="wait">
        {productData && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.4 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8"
          >
            {/* Left Column - Image & Actions */}
            <div className="lg:col-span-4 space-y-6">
              <Card className="glass border-white/5 rounded-[2rem] overflow-hidden group/preview bg-white/[0.01]">
                <CardContent className="p-0">
                  <div className="relative aspect-[4/5] bg-white flex items-center justify-center p-8 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-black/5 to-black/10 pointer-events-none" />
                    
                    {productData.image ? (
                      <motion.div layoutId="productImage" className="relative w-full h-full z-10 drop-shadow-xl">
                        <Image
                          src={productData.image}
                          alt="Product Preview"
                          fill
                          className="object-contain p-4"
                          sizes="(max-width: 768px) 100vw, 400px"
                        />
                      </motion.div>
                    ) : (
                      <div className="flex flex-col items-center gap-4 text-muted/30">
                        <ImageIcon className="w-16 h-16" />
                        <span className="text-sm font-medium">No Image Uploaded</span>
                      </div>
                    )}

                    {/* Image Actions Overlay */}
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center gap-4 opacity-0 group-hover/preview:opacity-100 transition-all duration-300 z-20">
                      <Button 
                        variant="secondary" 
                        className="rounded-xl px-6 font-medium bg-white text-black hover:bg-white/90"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                      >
                        {uploading ? <Loader2 size={16} className="mr-2 animate-spin" /> : <Upload size={16} className="mr-2" />}
                        Upload Image
                      </Button>
                      {productData.image && (
                        <Button 
                          variant="danger" 
                          className="rounded-xl px-6 font-medium bg-red-500/20 text-red-500 hover:bg-red-500/30 border-0"
                          onClick={handleImageReset}
                        >
                          <Trash2 size={16} className="mr-2" />
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
                    
                    {/* Platform Badge */}
                    {productData.platform && (
                      <div className="absolute top-4 left-4 px-3 py-1.5 rounded-lg bg-black/40 backdrop-blur-md border border-white/10 text-[10px] font-bold text-white uppercase tracking-wider z-20">
                        {productData.platform}
                      </div>
                    )}
                  </div>

                  <div className="p-6 border-t border-white/5 bg-[#0A0A0A]">
                    <div className="space-y-4">
                      <div className="flex items-end justify-between">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-muted/60 tracking-wider block mb-1">Selling Price</span>
                          <span className="text-3xl font-bold text-foreground">{productData.price || "$0.00"}</span>
                        </div>
                        {productData.discountPercentage && (
                          <div className="px-2 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
                            {productData.discountPercentage}% OFF
                          </div>
                        )}
                      </div>
                      {productData.originalPrice && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted/60">Original Price</span>
                          <span className="text-muted line-through">{productData.originalPrice}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* External Link */}
              <Link href={productData.originalUrl || url} target="_blank" className="block">
                <Button variant="outline" className="w-full rounded-2xl h-14 border-white/5 bg-white/[0.02] hover:bg-white/[0.04] text-muted hover:text-foreground">
                  <ExternalLink size={16} className="mr-2" />
                  View Original Page
                </Button>
              </Link>
            </div>
  
            {/* Right Column - Editor */}
            <div className="lg:col-span-8 space-y-6">
              <Card className="glass border-white/5 rounded-[2rem] bg-white/[0.01]">
                <CardHeader className="p-8 border-b border-white/5">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl font-bold">Product Details</CardTitle>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleEnhanceWithAI}
                      disabled={generating}
                      className="rounded-xl border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 hover:border-primary/30 font-medium"
                    >
                      {generating ? (
                        <Loader2 size={14} className="mr-2 animate-spin" />
                      ) : (
                        <Wand2 size={14} className="mr-2" />
                      )}
                      {isPro ? "AI Enhance All" : "AI Enhance Title"}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-8 space-y-8">
                  {/* Title */}
                  <div className="space-y-3">
                    <label className="text-xs font-semibold text-muted uppercase tracking-wider">Product Title</label>
                    <Input
                      value={productData.title}
                      onChange={(e) => setProductData({ ...productData, title: e.target.value })}
                      className="bg-white/[0.03] border-white/5 focus:border-primary/30 transition-all font-medium text-lg px-5 py-6 rounded-2xl"
                    />
                  </div>

                  {/* AI Suggestions Panel */}
                  <AnimatePresence>
                    {aiSuggestions.length > 0 && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                        animate={{ opacity: 1, height: "auto", marginBottom: 32 }}
                        exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="p-6 rounded-[1.5rem] bg-primary/5 border border-primary/10 space-y-4">
                          <div className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-2">
                            <Sparkles size={14} /> AI Suggested Titles
                          </div>
                          <div className="grid grid-cols-1 gap-2">
                            {aiSuggestions.map((title, i) => (
                              <button
                                key={i}
                                onClick={() => {
                                  setProductData({ ...productData, title });
                                  toast.success("Title applied!");
                                }}
                                className={`text-sm text-left px-5 py-4 rounded-xl border transition-all flex items-center justify-between group ${
                                  productData.title === title 
                                    ? "bg-primary/10 border-primary/30 text-foreground" 
                                    : "bg-black/20 border-white/5 text-muted hover:bg-white/5 hover:text-foreground"
                                }`}
                              >
                                <span className="font-medium">{title}</span>
                                <Plus size={16} className={`opacity-0 group-hover:opacity-100 transition-opacity ${productData.title === title ? 'text-primary opacity-100' : 'text-muted'}`} />
                              </button>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
  
                  {/* Prices */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className="text-xs font-semibold text-muted uppercase tracking-wider">Selling Price</label>
                      <Input
                        value={productData.price}
                        onChange={(e) => setProductData({ ...productData, price: e.target.value })}
                        className="bg-white/[0.03] border-white/5 focus:border-primary/30 transition-all font-medium text-lg px-5 py-6 rounded-2xl"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-xs font-semibold text-muted uppercase tracking-wider">Original Price</label>
                      <Input
                        value={productData.originalPrice}
                        onChange={(e) => setProductData({ ...productData, originalPrice: e.target.value })}
                        className="bg-white/[0.03] border-white/5 focus:border-primary/30 transition-all font-medium text-lg px-5 py-6 rounded-2xl"
                      />
                    </div>
                  </div>
  
                  {/* Description */}
                  <div className="space-y-3">
                    <label className="text-xs font-semibold text-muted uppercase tracking-wider">Description</label>
                    <textarea
                      rows={6}
                      value={productData.description}
                      onChange={(e) => setProductData({ ...productData, description: e.target.value })}
                      className="w-full rounded-[1.5rem] bg-white/[0.03] border border-white/5 px-5 py-5 text-base font-medium text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary/40 outline-none transition-all resize-none leading-relaxed"
                    />
                  </div>
  
                </CardContent>
              </Card>
              
              {/* Save Action */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Button 
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full h-16 rounded-[2rem] text-lg font-bold bg-foreground text-background hover:bg-foreground/90 shadow-2xl active:scale-[0.98] transition-all"
                >
                  {saving ? (
                    <><Loader2 size={24} className="mr-3 animate-spin" /> Saving Product...</>
                  ) : (
                    <><Save size={20} className="mr-3" /> Save Product</>
                  )}
                </Button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
