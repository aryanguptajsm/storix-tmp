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
  AlertCircle,
  Upload,
  Trash2
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
    store_banners: [] as string[],
  });
  
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const bannerInputRef = React.useRef<HTMLInputElement>(null);

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file.");
      return;
    }

    setUploadingLogo(true);
    try {
      const user = await getUser();
      if (!user) throw new Error("Authentication failed.");

      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `logos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("product-images")
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, store_logo: publicUrl }));
      toast.success("Station logo uploaded successfully!");
    } catch (err: any) {
      console.error("Upload error:", err);
      toast.error(err.message || "Failed to upload image.");
    } finally {
      setUploadingLogo(false);
    }
  }

  async function handleBannerUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (formData.store_banners.length + files.length > 10) {
      toast.error("You can only upload up to 10 banner items.");
      return;
    }

    setUploadingBanner(true);
    try {
      const user = await getUser();
      if (!user) throw new Error("Authentication failed.");

      const newBanners = [...formData.store_banners];
      
      // Upload sequentially for simplicity, could do Promise.all
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
           toast.error(`File ${file.name} is not an image or video.`);
           continue;
        }
        if (file.type.startsWith("video/") && file.size > 20 * 1024 * 1024) {
           toast.error(`Video ${file.name} exceeds 20MB limit.`);
           continue;
        }

        const fileExt = file.name.split(".").pop();
        const fileName = `${user.id}/banners/${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `banners/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("product-images")
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from("product-images")
          .getPublicUrl(filePath);

        newBanners.push(publicUrl);
      }

      setFormData(prev => ({ ...prev, store_banners: newBanners }));
      toast.success("Banner media uploaded successfully!");
    } catch (err: any) {
      console.error("Upload error:", err);
      toast.error(err.message || "Failed to upload banner.");
    } finally {
      setUploadingBanner(false);
      if (bannerInputRef.current) bannerInputRef.current.value = "";
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      const fakeEvent = { target: { files: [file] } } as unknown as React.ChangeEvent<HTMLInputElement>;
      handleFileUpload(fakeEvent);
    }
  };

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
            store_banners: profile.store_banners || [],
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
        store_banners: formData.store_banners,
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

                <div className="space-y-4 border-t border-white/5 pt-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white">Transmission Logo</h4>
                      <p className="text-[10px] text-white/40 font-medium mt-0.5">Optimized for high-fidelity displays. Max 5MB.</p>
                    </div>
                    {formData.store_logo && (
                      <Button 
                        type="button"
                        variant="danger" 
                        size="sm" 
                        className="h-8 px-4 gap-2 text-[10px] rounded-lg"
                        onClick={() => setFormData({ ...formData, store_logo: "" })}
                      >
                        <Trash2 size={12} /> Remove
                      </Button>
                    )}
                  </div>

                  <div 
                    className={`relative w-full h-40 rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center cursor-pointer group overflow-hidden ${
                      uploadingLogo 
                        ? "border-primary/50 bg-primary/5" 
                        : "border-white/10 bg-white/[0.02] hover:border-primary/40 hover:bg-white/[0.04]"
                    }`}
                    onClick={() => !uploadingLogo && fileInputRef.current?.click()}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                  >
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      accept="image/*" 
                      onChange={handleFileUpload} 
                    />
                    
                    {uploadingLogo ? (
                      <div className="flex flex-col items-center gap-3 text-primary">
                        <Loader2 className="w-8 h-8 animate-spin" />
                        <span className="text-xs font-black uppercase tracking-widest">Uploading Asset...</span>
                      </div>
                    ) : formData.store_logo ? (
                      <div className="relative w-full h-full p-4 flex items-center justify-center">
                        <img src={formData.store_logo} alt="Logo" className="max-w-full max-h-full object-contain" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                          <span className="text-xs font-black text-white flex items-center gap-2">
                            <Upload size={14} /> Update Logo
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-3 text-white/40 group-hover:text-primary transition-colors">
                        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
                          <Upload className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-black uppercase tracking-widest">Drag & Drop or Click</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Banner Media Section */}
                <div className="space-y-4 border-t border-white/5 pt-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white">Banner Media</h4>
                      <p className="text-[10px] text-white/40 font-medium mt-0.5">Upload up to 10 images or videos for your storefront carousel. (Max 20MB for video)</p>
                    </div>
                    <span className="text-xs font-bold text-white/30">{formData.store_banners.length} / 10</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {formData.store_banners.map((url, idx) => {
                      const isVideo = url.match(/\.(mp4|webm|ogg)(\?|$)/i);
                      return (
                        <div key={idx} className="relative aspect-[16/9] md:aspect-[4/3] rounded-xl overflow-hidden border border-white/10 group bg-white/5">
                          {isVideo ? (
                            <video src={url} className="w-full h-full object-cover" muted playsInline />
                          ) : (
                            <img src={url} alt={`Banner ${idx}`} className="w-full h-full object-cover" />
                          )}
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button
                              type="button"
                              onClick={() => setFormData(prev => ({ ...prev, store_banners: prev.store_banners.filter((_, i) => i !== idx) }))}
                              className="p-2 bg-danger/20 text-danger rounded-lg hover:bg-danger hover:text-white transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      );
                    })}

                    {formData.store_banners.length < 10 && (
                      <div
                        onClick={() => !uploadingBanner && bannerInputRef.current?.click()}
                        className={`relative aspect-[16/9] md:aspect-[4/3] rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-colors ${
                          uploadingBanner ? "border-primary/50 bg-primary/5 text-primary" : "border-white/10 bg-white/[0.02] hover:border-primary/40 hover:bg-white/[0.04] text-white/40 hover:text-primary"
                        }`}
                      >
                        <input
                          type="file"
                          ref={bannerInputRef}
                          className="hidden"
                          accept="image/*,video/mp4,video/webm"
                          multiple
                          onChange={handleBannerUpload}
                        />
                        {uploadingBanner ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <>
                            <Upload className="w-5 h-5 mb-2" />
                            <span className="text-[10px] font-black uppercase">Add Media</span>
                          </>
                        )}
                      </div>
                    )}
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
              type="submit"
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
                  { id: "flipkart", name: "Flipkart Theme", color: "bg-[#2874F0]", desc: "Vibrant trade signal." }
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
