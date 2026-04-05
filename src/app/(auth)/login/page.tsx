"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, signInWithGoogle } from "@/lib/auth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Mail, Lock, Globe, ArrowRight, ShieldCheck } from "lucide-react";
import { TiltCard } from "@/components/ui/TiltCard";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { toast } from "sonner";

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await signIn(email, password);
      toast.success("Welcome back!");
      router.push("/dashboard");
    } catch (err: any) {
      const msg = err.message || "Invalid email or password";
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
      const msg = err.message || "Google login failed";
      setError(msg);
      toast.error(msg);
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] animate-pulse-glow" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/10 rounded-full blur-[120px] animate-pulse-glow" style={{ animationDelay: '1.5s' }} />

      <div className="w-full max-w-md relative z-10 animate-fade-in">
        <div className="text-center mb-8">
          <ScrollReveal animation="reveal-scale">
            <div className="inline-block p-3 rounded-2xl bg-surface-light border border-border mb-4 animate-bounce-subtle">
              <h1 className="text-4xl font-black bg-gradient-to-r from-primary via-primary-light to-secondary bg-clip-text text-transparent tracking-tighter font-display">
                Storix
              </h1>
            </div>
          </ScrollReveal>
          <ScrollReveal delay={100}>
            <p className="text-white text-2xl font-black tracking-tight font-display">Welcome back, Captain!</p>
          </ScrollReveal>
          <ScrollReveal delay={200}>
            <p className="text-muted/60 text-sm mt-2 font-medium">Ready to scale your affiliate ecosystem?</p>
          </ScrollReveal>
        </div>

        <ScrollReveal delay={300} animation="reveal-scale">
          <TiltCard intensity={10} perspective={1200}>
            <Card className="glass border-white/5 shadow-2xl overflow-hidden hover:border-primary/20 transition-colors duration-500">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary via-primary-light to-secondary opacity-80" />
              
              <CardHeader className="pb-2">
                <CardTitle className="text-2xl font-black font-display flex items-center gap-2">
                  <ShieldCheck className="text-primary w-6 h-6" />
                  Sign In
                </CardTitle>
              </CardHeader>
              
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-5">
                  <Input
                    label="Email Address"
                    type="email"
                    placeholder="commander@storix.ai"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    icon={<Mail size={18} />}
                    className="w-full bg-white/5"
                    required
                  />
                  <Input
                    label="Password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    icon={<Lock size={18} />}
                    className="w-full bg-white/5"
                    required
                  />

                  <div className="flex justify-end">
                    <Link href="/auth/forgot-password" title="Recover your password" className="text-[10px] font-black text-primary hover:text-primary-light transition-all uppercase tracking-widest">
                      Forgot password?
                    </Link>
                  </div>

                  {error && (
                    <div className="p-3 rounded-xl bg-danger/10 border border-danger/20 text-danger text-xs font-bold animate-shake">
                      {error}
                    </div>
                  )}

                  <Button type="submit" className="w-full py-7 group text-base font-black shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all" loading={loading}>
                    <span>Enter Dashboard</span>
                    <ArrowRight size={20} className="group-hover:translate-x-1.5 transition-transform" />
                  </Button>
                </form>

                <div className="relative my-10">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/5"></div>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-black px-4 text-muted/30 font-black uppercase tracking-widest text-[9px]">Direct Auth Access</span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="secondary"
                  className="w-full py-7 bg-white/5 border-white/5 hover:bg-white/10 transition-all duration-300 font-bold"
                  onClick={handleGoogleLogin}
                  loading={googleLoading}
                >
                  <div className="mr-3">
                    <GoogleIcon />
                  </div>
                  <span>Continue with Google</span>
                </Button>

                <div className="mt-10 text-center text-sm">
                  <span className="text-muted/40 font-medium">New to the fleet? </span>
                  <Link
                    href="/signup"
                    className="text-primary hover:text-primary-light font-black transition-all hover:underline decoration-2 underline-offset-4"
                  >
                    Join Storix
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TiltCard>
        </ScrollReveal>
      </div>

      <style jsx global>{`
        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        .animate-bounce-subtle {
          animation: bounce-subtle 4s ease-in-out infinite;
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
}
