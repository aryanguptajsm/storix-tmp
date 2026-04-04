"use client";
import React, { useEffect, useState } from "react";
import { getUser, getProfile, updateProfile, UserProfile } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { toast } from "sonner";
import { 
  Store, 
  Globe, 
  Save, 
  Sparkles,
  Zap,
  Loader2,
  ShoppingBag,
  LayoutGrid,
  ExternalLink,
  Info
} from "lucide-react";
import { SettingsSkeleton } from "@/components/ui/SettingsSkeleton";
import Link from "next/link";

export default function StoreManagementPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    store_name: "",
    username: "",
    store_description: "",
    store_logo: "",
    theme: "default",
  });

  useEffect(() => {
    async function loadStoreSettings() {
      try {
        const user = await getUser();
        if (!user) {
          setLoading(false);
          return;
        }
        const profile = await getProfile(user.id);
        if (profile) {
          setProfile(profile);
          setFormData({
            store_name: profile.store_name || "",
            username: profile.username || "",
            store_description: profile.store_description || "",
            store_logo: profile.store_logo || "",
            theme: profile.theme || "default",
          });
        }
      } catch (err) {
        toast.error("Failed to load store settings.");
      } finally {
        setLoading(false);
      }
    }
    loadStoreSettings();
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setSaving(true);
    try {
      await updateProfile(profile.id, {
        store_name: formData.store_name,
        username: formData.username.toLowerCase().replace(/\s+/g, "-"),
        store_description: formData.store_description,
        store_logo: formData.store_logo,
        theme: formData.theme,
      });
      toast.success("Store configuration updated!");
    } catch (err: any) {
      toast.error(err.message || "Failed to update store.");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (loading) {
    return <SettingsSkeleton />;
  }

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-black text-foreground tracking-tight">Store Ops</h1>
            <div className="p-1 rounded-md bg-primary/10 text-primary">
              <Store size={18} />
            </div>
          </div>
          <p className="text-muted font-medium">Control your public brand, SEO, and visual deployment.</p>
        </div>
        
        {formData.username && (
          <Link href={`/store/${formData.username}`} target="_blank">
            <Button size="sm" variant="secondary" className="gap-2 border-white/5 hover:bg-white/10">
              <ExternalLink size={14} />
              Visit Live Store
            </Button>
          </Link>
        )}
      </div>

      <form onSubmit={handleUpdate} className="space-y-8">
        {/* Brand & URL */}
        <Card className="glass overflow-hidden">
          <CardHeader className="p-6 border-b border-white/5 bg-white/[0.01]">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                 <Globe size={20} />
               </div>
               <div>
                 <CardTitle className="text-lg font-bold">Brand Identity</CardTitle>
                 <p className="text-xs text-muted font-medium mt-0.5">Define your public presence and SEO slug.</p>
               </div>
            </div>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Store Name"
                name="store_name"
                placeholder="My Affiliate Store"
                value={formData.store_name}
                onChange={handleChange}
                icon={<Sparkles size={16} />}
                className="bg-white/5 border-white/5"
              />
              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-muted uppercase tracking-widest text-[10px]">Store Slug / URL</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted/30 group-focus-within:text-primary transition-colors">
                    <Globe size={16} />
                  </div>
                  <input
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/5 text-foreground font-bold focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all font-mono text-sm"
                    placeholder="my-store-slug"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-muted/20 tracking-tighter uppercase whitespace-nowrap">
                    .storix.ai
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <Input
                label="Store Logo URL"
                name="store_logo"
                placeholder="https://example.com/logo.png"
                value={formData.store_logo}
                onChange={handleChange}
                icon={<ShoppingBag size={16} />}
                className="bg-white/5 border-white/5"
              />
              <div className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/5">
                <div className="w-12 h-12 rounded-lg bg-surface-light border border-white/5 flex items-center justify-center overflow-hidden">
                  {formData.store_logo ? (
                    <img src={formData.store_logo} alt="Logo Preview" className="max-w-full max-h-full object-contain" />
                  ) : (
                    <ShoppingBag className="w-5 h-5 text-muted/20" />
                  )}
                </div>
                <div>
                   <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Logo Preview</p>
                   <p className="text-[10px] text-muted italic">Used in header & checkout.</p>
                </div>
              </div>
            </div>

            <Textarea
              label="Store Description (SEO Meta)"
              name="store_description"
              placeholder="Describe your store for search engines..."
              value={formData.store_description}
              onChange={handleChange}
              className="bg-white/5 border-white/5 min-h-[100px]"
            />
          </CardContent>
        </Card>

        {/* Templates */}
        <Card className="glass overflow-hidden">
          <CardHeader className="p-6 border-b border-white/5 bg-white/[0.01]">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                 <LayoutGrid size={20} />
               </div>
               <div>
                 <CardTitle className="text-lg font-bold">Visual Templates</CardTitle>
                 <p className="text-xs text-muted font-medium mt-0.5">Select a signature style for your storefront deployment.</p>
               </div>
            </div>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { id: "default", name: "Default (Shopify-like)", color: "bg-[#FF4D67]", desc: "Clean and high-energy." },
                { id: "midnight", name: "Midnight (Premium)", color: "bg-[#6C5CE7]", desc: "Sleek and professional." },
                { id: "minimalist", name: "Minimalist", color: "bg-[#111111]", desc: "Pure white label feel." },
                { id: "neon", name: "Cyber Neon", color: "bg-[#00FFD1]", desc: "Futuristic and bold." },
                { id: "amazon", name: "Amazon Style", color: "bg-[#FF9900]", desc: "Trusted e-commerce feel." },
                { id: "flipkart", name: "Flipkart Style", color: "bg-[#2874F0]", desc: "Vibrant marketplace look." }
              ].map((themeItem) => (
                <button
                  key={themeItem.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, theme: themeItem.id })}
                  className={`group p-4 rounded-2xl border transition-all duration-300 text-left flex flex-col gap-4 ${
                    formData.theme === themeItem.id 
                      ? "bg-primary/10 border-primary shadow-lg shadow-primary/5" 
                      : "bg-white/5 border-white/5 hover:bg-white/[0.08]"
                  }`}
                >
                  <div className={`w-full h-24 rounded-xl ${themeItem.color} flex-shrink-0 flex items-center justify-center shadow-lg group-hover:scale-[1.02] transition-transform relative overflow-hidden`}>
                     <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                     <div className="w-8 h-8 bg-white/20 rounded-full blur-[2px]" />
                  </div>
                  <div>
                    <h6 className="text-sm font-bold text-foreground">{themeItem.name}</h6>
                    <p className="text-[10px] text-muted mt-0.5">{themeItem.desc}</p>
                    {formData.theme === themeItem.id && (
                      <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-primary/20 text-primary-light text-[8px] font-black uppercase tracking-widest animate-fade-in">
                        Active Configuration
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Footer Actions */}
        <div className="flex items-center justify-between p-6 glass rounded-2xl border border-white/5">
          <div className="flex items-center gap-3">
             <Info size={16} className="text-muted" />
             <p className="text-xs text-muted font-medium">Verify all identity changes before committing to live deployment.</p>
          </div>
          <Button type="submit" className="gap-2 px-8 py-3 shadow-lg shadow-primary/20 group h-12" loading={saving}>
            {saving ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <>
                <Save size={18} className="group-hover:translate-y-[-1px] transition-transform" />
                <span>Deploy Configuration</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
