"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { getUser, getProfile, updateProfile, UserProfile } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { toast } from "sonner";
import { 
  Settings, 
  User, 
  Shield, 
  Bell,
  Loader2,
  CreditCard,
  Mail,
  Lock,
  Camera,
  DollarSign,
  ShoppingBag,
  Sparkles,
  Save
} from "lucide-react";
import { SettingsSkeleton } from "@/components/ui/SettingsSkeleton";

export default function SettingsPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("Account");
  
  const [formData, setFormData] = useState({
    store_name: "",
    username: "",
    store_description: "",
    email: "",
    paypal_email: "",
    amazon_id: "",
    theme: "default",
  });

  useEffect(() => {
    async function loadSettings() {
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
            email: user.email || "",
            paypal_email: "", // Placeholder
            amazon_id: "", // Placeholder
            theme: profile.theme || "default",
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
        theme: formData.theme,
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
    return <SettingsSkeleton />;
  }

  const tabs = [
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
        <div className="lg:col-span-3">
          <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible pb-4 lg:pb-0 scrollbar-hide no-scrollbar">
            {tabs.map((item) => (
              <button
                key={item.label}
                onClick={() => setActiveTab(item.label)}
                className={`flex-shrink-0 lg:w-full flex items-center justify-center lg:justify-start gap-3 px-6 lg:px-4 py-3 rounded-xl text-sm font-bold transition-all duration-300 group whitespace-nowrap ${
                  activeTab === item.label 
                    ? "bg-primary/10 text-primary-light border border-primary/20 shadow-sm" 
                    : "text-muted hover:text-foreground hover:bg-white/5 border border-transparent"
                }`}
              >
                <item.icon size={18} className={activeTab === item.label ? "text-primary" : "text-muted group-hover:text-primary-light"} />
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-9 space-y-8">
          {activeTab === "Account" && (
            <Card className="glass overflow-hidden shadow-2xl shadow-black/20">
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
                      <Button variant="secondary" className="w-full h-11 gap-2 bg-white/5 border-white/5 hover:bg-white/10">
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
