"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { getUser } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
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
  Type
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
      toast.success("Product details scraped successfully!");
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
        toast.success("AI titles generated!");
      }
    } catch (err: any) {
      console.error("AI error:", err);
      toast.error(err.message || "AI generation failed.");
    } finally {
      setGenerating(false);
    }
  }

  async function handleSave() {
    if (!productData) return;
    
    setSaving(true);
    try {
      const user = await getUser();
      if (!user) throw new Error("Not authenticated");
      
      const { error } = await supabase.from("products").insert({
        user_id: user.id,
        title: productData.title,
        description: productData.description,
        price: productData.price,
        image_url: productData.image,
        platform: productData.platform,
        original_url: productData.originalUrl || url,
      });
      
      if (error) throw error;
      
      toast.success("Product added to your store!");
      router.push("/dashboard/products");
    } catch (err: any) {
      console.error("Save error:", err);
      toast.error(err.message || "Failed to save product.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-20">
      <div className="flex items-center justify-between">
        <Link href="/dashboard/products">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Products
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Add Product</h1>
      </div>

      <Card className="border-primary/20 bg-surface-light">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Globe className="w-5 h-5 text-primary" />
            Import from URL
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted">
            Paste a product link from Amazon, Flipkart, or any online store. 
            We'll automatically extract the details for you.
          </p>
          <div className="flex gap-2">
            <Input
              placeholder="https://www.amazon.com/dp/B08N5WRWJ5"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="flex-1"
            />
            <Button 
              onClick={handleScrape} 
              disabled={scraping || !url}
              className="gap-2 min-w-[140px]"
            >
              {scraping ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              {scraping ? "Scraping..." : "Scrape Details"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {productData && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-slide-up">
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardContent className="p-4">
                <div className="relative aspect-square bg-white rounded-lg flex items-center justify-center p-4 overflow-hidden border border-border">
                  {productData.image ? (
                    <Image
                      src={productData.image}
                      alt="Scraped product"
                      fill
                      className="object-contain"
                    />
                  ) : (
                    <Package className="w-16 h-16 text-muted/20" />
                  )}
                </div>
                <div className="mt-4 p-3 bg-surface rounded-lg border border-border text-xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-muted">Platform:</span>
                    <span className="font-bold uppercase text-secondary">{productData.platform}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted">Price:</span>
                    <span className="font-bold text-lg text-primary">{productData.price || "N/A"}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Type className="w-5 h-5 text-secondary" />
                  Product Content
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted">Title</label>
                  <div className="flex gap-2">
                    <Input
                      value={productData.title}
                      onChange={(e) => setProductData({ ...productData, title: e.target.value })}
                      className="flex-1"
                    />
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleGenerateTitle}
                      disabled={generating}
                      className="gap-2"
                    >
                      {generating ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Sparkles className="w-4 h-4" />
                      )}
                      AI Magic
                    </Button>
                  </div>
                </div>

                {aiSuggestions.length > 0 && (
                  <div className="p-4 bg-secondary/5 rounded-xl border border-secondary/20 space-y-3 animate-fade-in">
                    <div className="text-xs font-bold text-secondary uppercase tracking-wider flex items-center gap-2">
                      <Sparkles className="w-3 h-3" />
                      AI Suggestions
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                      {aiSuggestions.map((title, i) => (
                        <button
                          key={i}
                          onClick={() => setProductData({ ...productData, title })}
                          className="text-sm text-left p-2.5 rounded-lg border border-border bg-surface-light hover:border-secondary hover:bg-secondary/5 transition-all"
                        >
                          {title}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted">Description</label>
                  <textarea
                    rows={4}
                    value={productData.description}
                    onChange={(e) => setProductData({ ...productData, description: e.target.value })}
                    className="w-full rounded-xl bg-surface border border-border p-4 text-sm focus:ring-2 focus:ring-primary outline-none transition-all resize-none"
                  />
                </div>

                <div className="flex gap-4">
                  <Button 
                    className="flex-1 gap-2 h-12 text-lg shadow-lg shadow-primary/20"
                    onClick={handleSave}
                    disabled={saving}
                  >
                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    {saving ? "Saving Product..." : "Save Product to Store"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="flex items-center justify-center p-4 rounded-xl border border-dashed border-border bg-surface/30">
              <Link href={productData.originalUrl} target="_blank" className="text-xs text-muted flex items-center gap-1 hover:text-primary transition-colors">
                <ExternalLink className="w-3 h-3" />
                View original listing on {productData.platform}
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
