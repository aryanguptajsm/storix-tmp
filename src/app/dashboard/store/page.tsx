"use client";
import React, { useEffect, useState, useCallback } from "react";
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
  Info,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { SettingsSkeleton } from "@/components/ui/SettingsSkeleton";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";

export default function StoreManagementPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<'available' | 'taken' | 'invalid' | 'current' | null>(null);
  
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
            theme: (profile.theme as any) || "default",
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

  const checkUsername = useCallback(async (username: string) => {
    if (!username || username.length < 3) {
      setUsernameStatus('invalid');
      return;
    }
    
    if (profile && username.toLowerCase() === profile.username?.toLowerCase()) {
      setUsernameStatus('current');
      return;
    }

    setCheckingUsername(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('username')
        .ilike('username', username)
        .maybeSingle();
      
      if (error) throw error;
      setUsernameStatus(data ? 'taken' : 'available');
    } catch (err) {
      console.error("Error checking username:", err);
    } finally {
      setCheckingUsername(false);
    }
  }, [profile]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.username && formData.username !== profile?.username) {
        checkUsername(formData.username);
      } else if (formData.username === profile?.username) {
        setUsernameStatus('current');
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [formData.username, profile, checkUsername]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    if (usernameStatus === 'taken' || usernameStatus === 'invalid') {
      toast.error("Please choose a valid/available username.");
      return;
    }

    setSaving(true);
    try {
      const cleanUsername = formData.username.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
      
      await updateProfile(profile.id, {
        store_name: formData.store_name.trim(),
        username: cleanUsername,
        store_description: formData.store_description.trim(),
        store_logo: formData.store_logo.trim(),
        theme: formData.theme,
      });
      
      // Update local state to reflect new username
      setProfile({ ...profile, username: cleanUsername });
      setUsernameStatus('current');
      
      toast.success("Store configuration deployed successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to update store.");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'username') {
      // Immediate visual feedback for invalid chars
      const filtered = value.toLowerCase().replace(/[^a-z0-9-]/g, "");
      setFormData(prev => ({ ...prev, [name]: filtered }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  if (loading) {
    return <SettingsSkeleton />;
  }

  return (
    <div className="space-y-10 pb-20 relative min-h-screen">
      <div className="absolute inset-0 grid-bg-subtle opacity-10 pointer-events-none -z-10" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-8"
      >
        <div className="space-y-2">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-primary/10 text-primary border border-primary/20 shadow-lg shadow-primary/5">
              <Store size={24} />
            </div>
            <h1 className="text-4xl font-black text-white tracking-tight">Store Ops</h1>
          </div>
          <p className="text-white/40 font-medium text-lg">Manage your flagship storefront's identity and global deployment parameters.</p>
        </div>
        
        {formData.username && (
          <Link href={`/store/${formData.username}`} target="_blank">
            <Button size="lg" variant="secondary" className="gap-3 bg-white/5 border-white/10 hover:bg-white/10 h-14 px-8 rounded-2xl shadow-xl transition-all hover:scale-105 active:scale-95 group">
              <ExternalLink size={18} className="group-hover:rotate-12 transition-transform" />
              Visit Live Station
            </Button>
          </Link>
        )}
      </motion.div>

      <form onSubmit={handleUpdate} className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-8">
          {/* Brand & URL */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="glass overflow-hidden border-white/5 bg-white/[0.01]">
              <CardHeader className="p-8 border-b border-white/5 bg-white/[0.01]">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-inner">
                    <Globe size={24} />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-black italic">Station Identity</CardTitle>
                    <p className="text-xs text-white/30 font-bold uppercase tracking-widest mt-1">Core Access & Public Branding</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-10 space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <Input
                    label="Store Display Name"
                    name="store_name"
                    placeholder="e.g. Nexus Prime"
                    value={formData.store_name}
                    onChange={handleChange}
                    icon={<Sparkles size={18} />}
                    className="bg-white/[0.03] border-white/10 h-14 rounded-2xl focus:bg-white/[0.05] transition-all"
                  />
                  <div className="space-y-2">
                    <label className="block text-[11px] font-black text-white/40 uppercase tracking-[0.2em] ml-1">Store Slug / URL</label>
                    <div className="relative group">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-primary transition-colors">
                        <Globe size={18} />
                      </div>
                      <input
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        className={`w-full pl-12 pr-12 py-4 rounded-2xl bg-white/[0.03] border transition-all font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 placeholder:text-white/10 text-lg ${
                          usernameStatus === 'taken' ? 'border-danger/50 text-danger' : 
                          usernameStatus === 'available' ? 'border-success/50 text-success' : 
                          'border-white/10 text-white'
                        }`}
                        placeholder="my-cool-store"
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                        {checkingUsername ? (
                          <Loader2 size={18} className="animate-spin text-primary/50" />
                        ) : usernameStatus === 'available' ? (
                          <CheckCircle2 size={18} className="text-success shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                        ) : usernameStatus === 'taken' ? (
                          <AlertCircle size={18} className="text-danger" />
                        ) : null}
                      </div>
                    </div>
                    <div className="flex items-center justify-between px-1">
                       <p className="text-[10px] text-white/20 font-bold tracking-widest uppercase">
                         {usernameStatus === 'taken' ? "Coordinate already claimed" : "Lowercase, numbers, & dashes"}
                       </p>
                       <p className="text-[10px] text-primary/40 font-black uppercase tracking-widest">.storix.ai</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <Input
                    label="Station Logo (Direct URL)"
                    name="store_logo"
                    placeholder="https://imgur.com/logo.png"
                    value={formData.store_logo}
                    onChange={handleChange}
                    icon={<ShoppingBag size={18} />}
                    className="bg-white/[0.03] border-white/10 h-14 rounded-2xl focus:bg-white/[0.05] transition-all"
                  />
                  <div className="flex items-center gap-5 p-5 rounded-2xl bg-white/[0.01] border border-white/5 backdrop-blur-sm group hover:bg-white/[0.03] transition-all">
                    <div className="w-16 h-16 rounded-2xl bg-white/[0.02] border-2 border-dashed border-white/10 flex items-center justify-center overflow-hidden transition-all group-hover:border-primary/30">
                      {formData.store_logo ? (
                        <img src={formData.store_logo} alt="Logo" className="max-w-full max-h-full object-contain p-2" />
                      ) : (
                        <ShoppingBag className="w-6 h-6 text-white/10" />
                      )}
                    </div>
                    <div>
                       <p className="text-[11px] font-black text-white/60 uppercase tracking-[0.2em]">Transmission Logo</p>
                       <p className="text-[10px] text-white/20 font-medium italic mt-0.5">Optimized for high-fidelity displays.</p>
                    </div>
                  </div>
                </div>

                <Textarea
                  label="Mission Statement (SEO Description)"
                  name="store_description"
                  placeholder="Describe your station's purpose for the universal grid..."
                  value={formData.store_description}
                  onChange={handleChange}
                  className="bg-white/[0.03] border-white/10 min-h-[120px] rounded-2xl focus:bg-white/[0.05] transition-all p-5"
                />
              </CardContent>
            </Card>
          </motion.div>

          {/* Footer Actions */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col md:flex-row items-center justify-between p-8 glass rounded-3xl border border-primary/20 bg-primary/[0.02] gap-6"
          >
            <div className="flex items-center gap-4">
               <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shadow-inner border border-primary/10">
                 <Info size={20} />
               </div>
               <p className="text-sm text-white/40 font-medium max-w-sm">Synchronize all changes with the production grid to finalize deployment.</p>
            </div>
            <Button 
              type="Submit"
              onClick={handleUpdate}
              className="w-full md:w-auto h-16 px-12 rounded-2xl shadow-2xl shadow-primary/20 group text-sm font-black uppercase tracking-[0.3em] transition-all hover:scale-[1.02] active:scale-95" 
              loading={saving}
              disabled={usernameStatus === 'taken' || usernameStatus === 'invalid'}
            >
              {saving ? (
                <div className="flex items-center gap-3">
                  <Loader2 size={18} className="animate-spin" />
                  <span>Syncing...</span>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Save size={18} className="group-hover:translate-y-[-2px] transition-transform" />
                  <span>Deploy Station</span>
                </div>
              )}
            </Button>
          </motion.div>
        </div>

        <div className="space-y-8">
           {/* Visual Templates Sidebar */}
           <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
           >
            <Card className="glass overflow-hidden border-white/5 bg-white/[0.01]">
              <CardHeader className="p-6 border-b border-white/5">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary border border-secondary/20">
                     <LayoutGrid size={20} />
                   </div>
                   <CardTitle className="text-lg font-black italic">Station Themes</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {[
                  { id: "default", name: "Emerald Fleet", color: "bg-[#10B981]", desc: "High-energy standard." },
                  { id: "midnight", name: "Midnight Ops", color: "bg-[#0A0A0A]", desc: "Pure stealth obsidian." },
                  { id: "neon", name: "Cyber Sync", color: "bg-[#00FFD1]", desc: "Futuristic glow." },
                  { id: "amazon", name: "Amazon Core", color: "bg-[#FF9900]", desc: "Deep marketplace links." },
                  { id: "flipkart", name: "Flipkart Node", color: "bg-[#2874F0]", desc: "Vibrant trade signal." }
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, theme: t.id })}
                    className={`w-full group p-4 rounded-2xl border transition-all flex items-center gap-4 ${
                      formData.theme === t.id 
                        ? "bg-primary/10 border-primary/50 shadow-lg shadow-primary/5" 
                        : "bg-white/[0.02] border-white/5 hover:bg-white/[0.05]"
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-xl ${t.color} flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform relative overflow-hidden`} />
                    <div className="text-left">
                      <h6 className="text-[13px] font-black text-white">{t.name}</h6>
                      <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest mt-0.5">{t.desc}</p>
                    </div>
                  </button>
                ))}
              </CardContent>
            </Card>
           </motion.div>

           {/* Preview Mockup */}
           <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="p-8 rounded-[2.5rem] bg-gradient-to-br from-white/[0.03] to-transparent border border-white/5 relative overflow-hidden group shadow-2xl"
           >
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
              <div className="flex flex-col items-center gap-6 text-center">
                 <div className="w-20 h-20 rounded-3xl bg-white/[0.03] border border-white/10 flex items-center justify-center p-4">
                    {formData.store_logo ? (
                       <img src={formData.store_logo} alt="" className="w-full h-full object-contain" />
                    ) : (
                       <ShoppingBag className="w-8 h-8 text-white/10" />
                    )}
                 </div>
                 <div className="space-y-1">
                    <h5 className="text-xl font-black text-white">{formData.store_name || "New Station"}</h5>
                    <p className="text-xs text-white/20 font-black tracking-widest uppercase italic">Launching soon...</p>
                 </div>
              </div>
           </motion.div>
        </div>
      </form>
    </div>
  );
}
