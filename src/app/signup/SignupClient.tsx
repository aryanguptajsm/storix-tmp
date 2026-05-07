"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { signUp, signInWithGoogle } from "@/lib/auth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent } from "@/components/ui/Card";
import { Mail, Lock, User, Layout, Sparkles, Rocket, ShieldCheck, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

export function SignupClient() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    username: "",
    storeName: "",
  });
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verificationEmail, setVerificationEmail] = useState<string | null>(null);
  const [usernameStatus, setUsernameStatus] = useState<"idle" | "checking" | "available" | "taken">("idle");
  const searchParams = useSearchParams();
  const urlError = searchParams.get("error");
  
  // Sync URL error with local state
  useEffect(() => {
    if (urlError) {
      setError(urlError);
    }
  }, [urlError]);

  // Real-time Username Check
  useEffect(() => {
    if (formData.username.length < 3) {
      setUsernameStatus("idle");
      return;
    }

    const checkUsername = async () => {
      setUsernameStatus("checking");
      const { data } = await supabase
        .from("profiles")
        .select("username")
        .ilike("username", formData.username)
        .maybeSingle();
      
      setUsernameStatus(data ? "taken" : "available");
    };

    const debounce = setTimeout(checkUsername, 500);
    return () => clearTimeout(debounce);
  }, [formData.username]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (usernameStatus === "taken") {
      toast.error("Username is already taken.");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const response = await signUp(formData.email, formData.password, {
        username: formData.username,
        storeName: formData.storeName,
      });

      setVerificationEmail(response.email || formData.email);
      toast.success("Verification email sent.");
    } catch (err: any) {
      const msg = err.message || "Signup failed. Please try again.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setError(null);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      const msg = err.message || "Google link failed";
      setError(msg);
      toast.error(msg);
      setGoogleLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      // Auto-suggest store name from username if store name is empty
      if (name === "username" && !prev.storeName) {
        newData.storeName = value.charAt(0).toUpperCase() + value.slice(1) + " Store";
      }
      return newData;
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#020205] relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[150px] animate-pulse-breathing" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-secondary/5 rounded-full blur-[150px] animate-pulse-breathing" style={{ animationDelay: '3s' }} />

      <div className="absolute inset-0 grid-bg-premium opacity-10 pointer-events-none" />
      <div className="absolute inset-0 noise-subtle opacity-30 pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className="w-full max-w-lg relative z-10"
      >
        <div className="text-center mb-10">
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="flex justify-center mb-6"
          >
             <div className="p-4 rounded-[2rem] bg-black/60 border border-white/5 backdrop-blur-2xl shadow-2xl relative group overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <Rocket className="text-primary w-10 h-10 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-500" />
             </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-2"
          >
            <h1 className="text-5xl font-black bg-gradient-to-r from-primary-light via-white to-secondary-light bg-clip-text text-transparent tracking-tighter uppercase italic">Storix</h1>
            <p className="text-white/40 text-sm font-bold tracking-[0.3em] uppercase">Create your account</p>
          </motion.div>
        </div>

        <div className="relative">
          <ScrollReveal variant="zoom-in" delay={0.4}>
            <Card size="medium" variant="glass" className="overflow-hidden border-white/5 shadow-3xl glass-premium-animated">
            <CardContent className="space-y-6 pt-10">
              {verificationEmail ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6 text-center"
                >
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-primary/20 bg-primary/10">
                    <Mail className="h-7 w-7 text-primary" />
                  </div>
                  <div className="space-y-3">
                    <h2 className="text-2xl font-black text-white">Check your inbox</h2>
                    <p className="text-sm leading-6 text-white/60">
                      We sent a verification link to <span className="text-white">{verificationEmail}</span>.
                      Open the email, confirm your account, then you&apos;ll land in your dashboard.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4 text-xs font-bold uppercase tracking-[0.2em] text-white/40">
                    If you do not see it, check spam or promotions.
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">
                    Already verified? <Link href="/login" className="text-primary hover:text-primary-light transition-colors ml-2">Sign in</Link>
                  </p>
                </motion.div>
              ) : (
              <>
              <form onSubmit={handleSignup} className="space-y-6">
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
                       <Input
                          label="Email"
                          name="email"
                          type="email"
                          placeholder="you@example.com"
                          value={formData.email}
                          onChange={handleChange}
                          icon={<Mail size={18} />}
                          className="bg-white/[0.02] border-white/5 h-14"
                          required
                       />
                    </motion.div>
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
                       <Input
                          label="Password"
                          name="password"
                          type="password"
                          placeholder="••••••••"
                          value={formData.password}
                          onChange={handleChange}
                          icon={<Lock size={18} />}
                          className="bg-white/[0.02] border-white/5 h-14"
                          required
                       />
                    </motion.div>
                 </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                    <div className="relative">
                       <Input
                          label="Username"
                          name="username"
                          placeholder="myusername"
                          value={formData.username}
                          onChange={handleChange}
                          icon={<User size={18} />}
                          className={cn(
                             "bg-white/[0.02] h-14 transition-all",
                             usernameStatus === "available" && "border-primary/40 focus:border-primary",
                             usernameStatus === "taken" && "border-danger/40 focus:border-danger"
                          )}
                          required
                       />
                       <div className="absolute right-4 top-[38px]">
                          {usernameStatus === "checking" && <div className="w-4 h-4 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />}
                          {usernameStatus === "available" && <ShieldCheck size={18} className="text-primary animate-pulse" />}
                          {usernameStatus === "taken" && <AlertCircle size={18} className="text-danger" />}
                       </div>
                    </div>
                  </motion.div>
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
                    <Input
                      label="Store Name"
                      name="storeName"
                      placeholder="My Awesome Store"
                      value={formData.storeName}
                      onChange={handleChange}
                      icon={<Layout size={18} />}
                      className="bg-white/[0.02] h-14 h-14"
                    />
                  </motion.div>
                </div>

                <AnimatePresence mode="wait">
                  {error && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="p-5 rounded-2xl bg-danger/5 border border-danger/10 text-danger text-[11px] font-black uppercase tracking-widest flex items-center gap-4"
                    >
                      <AlertCircle size={20} className="shrink-0" />
                      <p>{error}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  <Button type="submit" className="w-full h-16 shadow-2xl shadow-emerald-500/10" loading={loading}>
                    <span>Create Account</span>
                    <Sparkles size={18} className="translate-x-1" />
                  </Button>
                </motion.div>
              </form>

              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/5"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-[#020205] px-4 text-[9px] font-black uppercase tracking-[0.4em] text-white/20">Or</span>
                </div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                <Button
                  type="button"
                  variant="secondary"
                  className="w-full h-16"
                  onClick={handleGoogleLogin}
                  loading={googleLoading}
                >
                  <GoogleIcon />
                  <span className="ml-3">Continue with Google</span>
                </Button>
              </motion.div>

              <div className="text-center pt-4">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">
                  Already have an account? <Link href="/login" className="text-primary hover:text-primary-light transition-colors ml-2">Sign in</Link>
                </p>
              </div>
              </>
              )}
            </CardContent>
          </Card>
          </ScrollReveal>
        </div>
      </motion.div>
    </div>
  );
}
