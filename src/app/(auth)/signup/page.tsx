"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signUp, updateProfile } from "@/lib/auth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";

export default function SignupPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    username: "",
    storeName: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

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
        router.push("/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
            Storix
          </h1>
          <p className="text-muted mt-2">Start building your AI-powered affiliate store today.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Create Account</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignup} className="space-y-4">
              <Input
                label="Email Address"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
              <Input
                label="Password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Username"
                  name="username"
                  placeholder="johndoe"
                  value={formData.username}
                  onChange={handleChange}
                  required
                />
                <Input
                  label="Store Name"
                  name="storeName"
                  placeholder="John's Store"
                  value={formData.storeName}
                  onChange={handleChange}
                  required
                />
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-danger/10 border border-danger/20 text-danger text-sm">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full" loading={loading}>
                Sign Up
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-muted">Already have an account? </span>
              <Link
                href="/login"
                className="text-primary hover:text-primary-light font-semibold transition-colors"
              >
                Log in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
