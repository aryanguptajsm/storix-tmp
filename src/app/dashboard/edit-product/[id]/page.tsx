"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { getUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { 
  ArrowLeft, 
  Save, 
  Loader2, 
  Package, 
  Globe, 
  Sparkles,
  Zap,
  ArrowRight,
  Trash2,
  Upload,
  Link as LinkIcon
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";

export default function EditProductPage() {
  const router = useRouter();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [productData, setProductData] = useState<any>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function fetchProduct() {
      const supabase = createClient();
      try {
        const user = await getUser();
        if (!user) {
          router.push("/login");
          return;
        }

        const { data, error } = await supabase
          .from("products")
          .select("*")
          .eq("id", id)
          .eq("user_id", user.id)
          .single();

        if (error) throw error;
        setProductData({
          title: data.title,
          description: data.description,
          price: data.price,
          originalPrice: data.original_price,
          discountPercentage: data.discount_percentage,
          image: data.image_url,
          platform: data.platform,
          originalUrl: data.original_url,
        });
      } catch (err: any) {
        toast.error("Failed to fetch product details.");
        router.push("/dashboard/products");
      } finally {
        setLoading(false);
      }
    }

    if (id) fetchProduct();
  }, [id, router]);

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const supabase = createClient();
    try {
      const user = await getUser();
      if (!user) throw new Error("Not authenticated");

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
      toast.success("Image updated!");
    } catch (err: any) {
      toast.error("Failed to upload image.");
    } finally {
      setUploading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    const supabase = createClient();
    try {
      const user = await getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("products")
        .update({
          title: productData.title,
          description: productData.description,
          price: productData.price,
          original_price: productData.originalPrice,
          discount_percentage: productData.discountPercentage,
          image_url: productData.image,
          platform: productData.platform,
          original_url: productData.originalUrl,
        })
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;
      toast.success("Product updated successfully!");
      router.push("/dashboard/products");
    } catch (err: any) {
      toast.error(err.message || "Failed to save changes.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in pb-24">
      <div className="flex items-center justify-between">
        <Link href="/dashboard/products">
          <Button variant="ghost" size="sm" className="gap-2 text-muted hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Inventory Control
          </Button>
        </Link>
        <div className="flex items-center gap-3">
           <Zap className="text-secondary animate-pulse-glow" size={20} />
           <h1 className="text-3xl font-black tracking-tight">Edit Product</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-slide-up">
        {/* Left Column: Asset Preview */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="glass overflow-hidden border-white/10 group/preview">
            <CardContent className="p-0">
              <div className="relative aspect-square bg-white flex items-center justify-center p-8 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/5" />
                {productData.image ? (
                  <Image
                    src={productData.image}
                    alt="Product preview"
                    fill
                    className="object-contain p-8 z-10"
                  />
                ) : (
                  <Package className="w-20 h-20 text-muted/20" />
                )}
                <div className="absolute inset-0 bg-black/40 transition-all flex items-center justify-center gap-2 opacity-0 group-hover/preview:opacity-100 z-20">
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
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted/60">Deal Price</span>
                  <span className="text-2xl font-black text-[#FF4D67] tracking-tighter">{productData.price || "N/A"}</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Link href={productData.originalUrl} target="_blank" className="block">
            <div className="flex items-center justify-center gap-2 p-4 rounded-2xl glass border-white/5 hover:border-primary/20 transition-all text-xs font-bold text-muted hover:text-foreground">
              <Globe size={14} />
              Verify Source Listing
            </div>
          </Link>
        </div>

        {/* Right Column: Edit Form */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="glass overflow-hidden border-white/10">
            <CardHeader className="p-6 border-b border-white/5 bg-white/[0.01]">
              <CardTitle className="text-lg font-bold flex items-center gap-3">
                <Package className="w-5 h-5 text-secondary" />
                Product Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted/60">Product Title</label>
                <Input
                  value={productData.title}
                  onChange={(e) => setProductData({ ...productData, title: e.target.value })}
                  className="bg-white/5 border-white/5 font-bold"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted/60">Current Price</label>
                  <Input
                    value={productData.price}
                    onChange={(e) => setProductData({ ...productData, price: e.target.value })}
                    className="bg-white/5 border-white/5"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted/60">Original Price</label>
                  <Input
                    value={productData.originalPrice}
                    onChange={(e) => setProductData({ ...productData, originalPrice: e.target.value })}
                    className="bg-white/5 border-white/5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted/60">Discount %</label>
                  <Input
                    value={productData.discountPercentage}
                    onChange={(e) => setProductData({ ...productData, discountPercentage: e.target.value })}
                    className="bg-white/5 border-white/5"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted/60">Platform Flag</label>
                  <Input
                    value={productData.platform}
                    onChange={(e) => setProductData({ ...productData, platform: e.target.value })}
                    className="bg-white/5 border-white/5"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted/60">Product Description</label>
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
                      <Save size={20} />
                      <span>Commit Changes</span>
                      <ArrowRight size={20} className="group-hover/save:translate-x-2 transition-transform" />
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
