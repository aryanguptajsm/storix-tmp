"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signUp, updateProfile, signInWithGoogle } from "@/lib/auth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Mail, Lock, User, Layout, ArrowRight, Sparkles, Rocket, ShieldCheck, AlertCircle } from "lucide-react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

export default function SignupPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    username: "",
    storeName: "",
  });
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlError = searchParams.get("error");
  
  // Sync URL error with local state
  React.useEffect(() => {
    if (urlError) {
      setError(urlError);
    }
  }, [urlError]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { user } = await signUp(formData.email, formData.password);
      if (user) {
        // Update profile with username and store name
        await updateProfile(user.id, {
          username: formData.username.toLowerCase().replace(/\s+/g, ""),
          store_name: formData.storeName,
        });
        toast.success("Account created successfully!");
        router.push("/dashboard");
      }
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
      const msg = err.message || "Google signup failed";
      setError(msg);
      toast.error(msg);
      setGoogleLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] animate-pulse-glow" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-secondary/10 rounded-full blur-[120px] animate-pulse-glow" style={{ animationDelay: '2s' }} />

      {/* Mesh Background */}
      <div className="absolute inset-0 mesh-primary opacity-20 pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-block p-3 rounded-2xl bg-surface-light border border-border mb-4 animate-bounce-subtle"
          >
            <h1 className="text-4xl font-black bg-gradient-to-r from-primary via-primary-light to-secondary bg-clip-text text-transparent tracking-tighter font-display">
              Storix
            </h1>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <p className="text-white text-2xl font-black tracking-tight font-display">Create your empire</p>
            <p className="text-muted/60 text-sm mt-2 font-medium">Start building your AI-powered affiliate store.</p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <Card className="glass-premium border-white/5 shadow-2xl overflow-hidden hover:border-primary/20 transition-all duration-500 glass-premium-animated">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-secondary via-primary-light to-primary opacity-80" />
            
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl font-black font-display flex items-center gap-2">
                <Rocket className="text-primary-light w-6 h-6" />
                Join the Fleet
              </CardTitle>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSignup} className="space-y-5">
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <Input
                    label="Email Address"
                    name="email"
                    type="email"
                    placeholder="commander@storix.ai"
                    value={formData.email}
                    onChange={handleChange}
                    icon={<Mail size={18} />}
                    className="bg-white/5 border-white/5 focus:glow-primary transition-all"
                    required
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <Input
                    label="Password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    icon={<Lock size={18} />}
                    className="bg-white/5 border-white/5 focus:glow-primary transition-all"
                    required
                  />
                </motion.div>
                
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-5"
                >
                  <Input
                    label="Username"
                    name="username"
                    placeholder="johndoe"
                    value={formData.username}
                    onChange={handleChange}
                    icon={<User size={18} />}
                    className="w-full bg-white/5 border-white/5"
                    required
                  />
                  <Input
                    label="Store Name"
                    name="storeName"
                    placeholder="My AI Store"
                    value={formData.storeName}
                    onChange={handleChange}
                    icon={<Layout size={18} />}
                    className="w-full bg-white/5 border-white/5"
                    required
                  />
                </motion.div>

                <AnimatePresence mode="wait">
                  {error && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-4 rounded-2xl bg-danger/10 border border-danger/20 text-danger text-xs font-bold flex items-start gap-3"
                    >
                      <AlertCircle size={16} className="shrink-0 mt-0.5" />
                      <div className="space-y-1">
                         <p className="uppercase tracking-wider text-[10px] opacity-70">Signup Fault</p>
                         <p className="leading-relaxed">{error}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                >
                  <Button type="submit" className="w-full py-7 group text-base font-black shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all hover-lift mt-4" loading={loading}>
                    <span>Initialize Store</span>
                    <ArrowRight size={20} className="group-hover:translate-x-1.5 transition-transform" />
                  </Button>
                </motion.div>
              </form>

              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
                className="relative my-10"
              >
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/5"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-4 text-muted/30 font-black uppercase tracking-widest text-[9px]">Direct Auth Access</span>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0 }}
              >
                <Button
                  type="button"
                  variant="secondary"
                  className="w-full py-7 bg-white/5 border-white/5 hover:bg-white/10 transition-all duration-300 font-bold hover:glow-primary"
                  onClick={handleGoogleLogin}
                  loading={googleLoading}
                >
                  <div className="mr-3">
                    <GoogleIcon />
                  </div>
                  <span>Continue with Google</span>
                </Button>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.1 }}
                className="mt-10 text-center text-sm"
              >
                <span className="text-muted/40 font-medium">Already have a station? </span>
                <Link
                  href="/login"
                  className="text-primary hover:text-primary-light font-black transition-all hover:underline decoration-2 underline-offset-4"
                >
                  Log in
                </Link>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>

      </motion.div>

      <style jsx global>{`
        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        .animate-bounce-subtle {
          animation: bounce-subtle 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );

}
