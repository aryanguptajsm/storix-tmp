"use client";

import React, { useEffect, useState } from "react";
import { getUser, getProfile, updateProfile, UserProfile } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { toast } from "sonner";
import { 
  Settings, 
  User, 
  Store, 
  Globe, 
  Save, 
  Shield, 
  Bell,
  Sparkles,
  Zap,
  ArrowRight,
  Loader2,
  CreditCard,
  Mail,
  Lock,
  Camera
} from "lucide-react";

export default function SettingsPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("General");
  
  const [formData, setFormData] = useState({
    store_name: "",
    username: "",
    store_description: "",
    email: "",
    paypal_email: "",
    amazon_id: "",
  });

  useEffect(() => {
    async function loadSettings() {
      try {
        const user = await getUser();
        if (!user) return;
        const profile = await getProfile(user.id);
        if (profile) {
          setProfile(profile);
          setFormData({
            store_name: profile.store_name || "",
            username: profile.username || "",
            store_description: profile.store_description || "",
            email: user.email || "",
            paypal_email: "", // Placeholder
            amazon_id: "", // Placeholder
          });
        }
      } catch (err) {
        toast.error("Failed to load settings.");
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
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
      });
      toast.success("Settings updated successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to update settings.");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse-glow" />
          <div className="relative animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full shadow-lg shadow-primary/20" />
        </div>
      </div>
    );
  }

  const tabs = [
    { label: "General", icon: Store },
    { label: "Account", icon: User },
    { label: "Payouts", icon: CreditCard },
    { label: "Security", icon: Shield },
  ];

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-black text-foreground tracking-tight">Command Center</h1>
            <div className="p-1 rounded-md bg-primary/10 text-primary">
              <Settings size={18} />
            </div>
          </div>
          <p className="text-muted font-medium">
            Configure your store deployment and personal preferences.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Navigation Tabs */}
        <div className="lg:col-span-3 space-y-2">
          {tabs.map((item) => (
            <button
              key={item.label}
              onClick={() => setActiveTab(item.label)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-300 group ${
                activeTab === item.label 
                  ? "bg-primary/10 text-primary-light border border-primary/20" 
                  : "text-muted hover:text-foreground hover:bg-white/5 border border-transparent"
              }`}
            >
              <item.icon size={18} className={activeTab === item.label ? "text-primary" : "text-muted group-hover:text-primary-light"} />
              {item.label}
            </button>
          ))}
        </div>

        <div className="lg:col-span-9 space-y-8">
          {activeTab === "General" && (
            <form onSubmit={handleUpdate} className="space-y-8">
              <Card className="glass overflow-hidden">
                <CardHeader className="p-6 border-b border-white/5 bg-white/[0.01]">
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                       <Store size={20} />
                     </div>
                     <div>
                       <CardTitle className="text-lg font-bold">Store Configuration</CardTitle>
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
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/5 text-foreground font-bold focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
                          placeholder="my-store-slug"
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-muted/20 tracking-tighter uppercase whitespace-nowrap">
                          .storix.ai
                        </div>
                      </div>
                    </div>
                  </div>

                  <Textarea
                    label="Store Description (SEO)"
                    name="store_description"
                    placeholder="Describe your store for search engines..."
                    value={formData.store_description}
                    onChange={handleChange}
                    className="bg-white/5 border-white/5 min-h-[120px]"
                  />

                  <div className="p-4 rounded-2xl bg-secondary/5 border border-secondary/10 flex items-start gap-4">
                    <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary-light flex-shrink-0">
                      <Zap size={16} />
                    </div>
                    <div className="flex-1">
                      <h5 className="text-xs font-bold text-foreground">Live Deployment</h5>
                      <p className="text-[11px] text-muted leading-relaxed mt-1">
                        Your store is active at <span className="text-secondary-light font-bold">storix.ai/store/{formData.username || "username"}</span>. Changes to your slug will instantly update your public URL.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted font-medium">Verify all changes before authorizing deployment.</p>
                </div>
                <Button type="submit" className="gap-2 px-8 py-3 shadow-lg shadow-primary/20 group" loading={saving}>
                  {saving ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <>
                      <Save size={18} className="group-hover:translate-y-[-1px] transition-transform" />
                      <span>Authorize Updates</span>
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}

          {activeTab === "Account" && (
            <Card className="glass overflow-hidden">
              <CardHeader className="p-6 border-b border-white/5 bg-white/[0.01]">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                     <User size={20} />
                   </div>
                   <div>
                     <CardTitle className="text-lg font-bold">Personal Profile</CardTitle>
                     <p className="text-xs text-muted font-medium mt-0.5">Manage your identity and contact details.</p>
                   </div>
                </div>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                <div className="flex items-center gap-6">
                  <div className="relative group">
                    <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-3xl font-black text-white border-2 border-white/5 overflow-hidden">
                      {profile?.store_name?.[0]?.toUpperCase() || "S"}
                    </div>
                    <button className="absolute -bottom-2 -right-2 p-2 rounded-xl bg-surface border border-white/10 text-muted hover:text-primary transition-all shadow-xl">
                      <Camera size={16} />
                    </button>
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-foreground">{profile?.store_name || "Merchant"}</h4>
                    <p className="text-sm text-muted">{formData.email}</p>
                    <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-success/10 text-success text-[10px] font-black uppercase tracking-widest">
                       <Shield size={10} />
                       Verified account
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/5">
                  <Input
                    label="Account Email"
                    value={formData.email}
                    disabled
                    icon={<Mail size={16} />}
                    className="bg-white/5 border-white/5 opacity-60 cursor-not-allowed"
                  />
                  <div className="space-y-1.5">
                    <label className="block text-sm font-bold text-muted uppercase tracking-widest text-[10px]">Access Key</label>
                    <Link href="/auth/reset-password">
                      <Button variant="secondary" className="w-full gap-2 bg-white/5 border-white/5">
                        <Lock size={16} />
                        Update Security Key
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "Payouts" && (
            <Card className="glass overflow-hidden">
              <CardHeader className="p-6 border-b border-white/5 bg-white/[0.01]">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                     <CreditCard size={20} />
                   </div>
                   <div>
                     <CardTitle className="text-lg font-bold">Payout Vectors</CardTitle>
                     <p className="text-xs text-muted font-medium mt-0.5">Configure target destinations for your earnings.</p>
                   </div>
                </div>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="grid grid-cols-1 gap-6">
                  <Input
                    label="PayPal Receiver Email"
                    name="paypal_email"
                    placeholder="payments@yourdomain.com"
                    value={formData.paypal_email}
                    onChange={handleChange}
                    icon={<DollarSign size={16} />}
                    className="bg-white/5 border-white/5"
                  />
                  <Input
                    label="Amazon Associate Tag"
                    name="amazon_id"
                    placeholder="yourtag-20"
                    value={formData.amazon_id}
                    onChange={handleChange}
                    icon={<ShoppingBag size={16} />}
                    className="bg-white/5 border-white/5"
                  />
                </div>
                <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 flex items-start gap-4 mt-4">
                   <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                     <Sparkles size={16} />
                   </div>
                   <div>
                     <h5 className="text-xs font-bold text-foreground">Automated Tracking</h5>
                     <p className="text-[11px] text-muted leading-relaxed mt-1">
                       Your affiliate handles are automatically injected into all product links across your fleet.
                     </p>
                   </div>
                </div>
                <div className="flex justify-end pt-4">
                  <Button className="gap-2 px-8">
                    <Save size={18} />
                    Commit Payout Config
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "Security" && (
             <Card className="glass border-danger/10 overflow-hidden">
             <CardHeader className="p-6 border-b border-danger/5 bg-danger/[0.01]">
               <div className="flex items-center gap-3 text-danger">
                  <Shield size={20} />
                  <CardTitle className="text-lg font-bold">Danger Sector</CardTitle>
               </div>
             </CardHeader>
             <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-6">
               <div className="max-w-md">
                 <h5 className="font-bold text-foreground">Decommission Station</h5>
                 <p className="text-sm text-muted mt-1">This will permanently delete your store, inventory, and analytics. This operation cannot be reversed.</p>
               </div>
               <Button variant="danger" className="whitespace-nowrap px-8">
                 Request Deletion
               </Button>
             </CardContent>
           </Card>
          )}
        </div>
      </div>
    </div>
  );
}
