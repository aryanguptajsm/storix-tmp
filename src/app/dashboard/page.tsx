"use client";

import React, { useEffect, useState } from "react";
import { getUser, getProfile, UserProfile } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { 
  Plus, 
  MousePointerClick, 
  Package, 
  TrendingUp,
  ExternalLink,
  Sparkles
} from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalClicks: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const user = await getUser();
        if (!user) {
          window.location.href = "/login";
          return;
        }
        setUser(user);

        const profile = await getProfile(user.id);
        setProfile(profile);

        // Fetch stats
        const [productsRes, clicksRes] = await Promise.all([
          supabase
            .from("products")
            .select("*", { count: "exact", head: true })
            .eq("user_id", user.id),
          supabase
            .from("clicks")
            .select("*", { count: "exact", head: true })
            .eq("user_id", user.id),
        ]);

        setStats({
          totalProducts: productsRes.count || 0,
          totalClicks: clicksRes.count || 0,
        });
      } catch (err) {
        console.error("Error loading dashboard:", err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Welcome back, {profile?.store_name || "Store Owner"}!
          </h1>
          <p className="text-muted mt-1">
            Here's what's happening with your store today.
          </p>
        </div>
        <div className="flex gap-3">
          <Link href={`/store/${profile?.username}`} target="_blank">
            <Button variant="secondary" className="gap-2">
              <ExternalLink className="w-4 h-4" />
              View Live Store
            </Button>
          </Link>
          <Link href="/dashboard/add-product">
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Add Product
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card glow>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted">
              Total Products
            </CardTitle>
            <Package className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalProducts}</div>
            <p className="text-xs text-muted mt-1">+12% from last month</p>
          </CardContent>
        </Card>

        <Card glow>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted">
              Total Clicks
            </CardTitle>
            <MousePointerClick className="w-4 h-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalClicks}</div>
            <p className="text-xs text-muted mt-1">+5.2% session average</p>
          </CardContent>
        </Card>

        <Card glow>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted">
              Est. Earnings
            </CardTitle>
            <TrendingUp className="w-4 h-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">$0.00</div>
            <p className="text-xs text-muted mt-1">Pending verification</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted text-center py-12">
              No recent activity to show yet.
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Tips</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-xl bg-surface-light border border-border flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary">
                <Plus className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-semibold text-sm">Add more products</h4>
                <p className="text-xs text-muted mt-0.5">
                  Stores with 10+ products see 3x more clicks on average.
                </p>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-surface-light border border-border flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center flex-shrink-0 text-secondary">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-semibold text-sm">Update your SEO</h4>
                <p className="text-xs text-muted mt-0.5">
                  Review your AI-generated titles to match trending search terms.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
