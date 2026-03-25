"use client";

import React, { useEffect, useState } from "react";
import { getUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { toast } from "sonner";
import { 
  Plus, 
  Search, 
  Trash2, 
  ExternalLink,
  Loader2,
  Package,
  ArrowRight,
  Sparkles,
  ShoppingBag,
  Zap
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/utils";

interface Product {
  id: string;
  title: string;
  image_url: string;
  platform: string;
  price: string;
  original_url: string;
  created_at: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    const supabase = createClient();
    try {
      const user = await getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Supabase Error:", error);
        throw error;
      }
      
      setProducts(data || []);
    } catch (err: any) {
      console.error("Error fetching products:", err);
      toast.error(err.message || "Failed to fetch products.");
    } finally {
      setLoading(false);
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    
    setDeletingId(id);
    const supabase = createClient();
    try {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
      setProducts(products.filter((p) => p.id !== id));
      toast.success("Product removed from inventory.");
    } catch (err: any) {
      console.error("Error deleting product:", err);
      toast.error(err.message || "Failed to delete product.");
    } finally {
      setDeletingId(null);
    }
  };

  const filteredProducts = products.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-8 animate-fade-in pb-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>
          <Skeleton className="h-11 w-36 rounded-xl" />
        </div>
        <Skeleton className="h-11 w-full max-w-md rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="glass border-white/5">
              <Skeleton className="h-56 w-full rounded-none" />
              <CardContent className="p-6 space-y-4">
                <Skeleton className="h-6 w-full" />
                <div className="flex justify-between items-center pt-4 border-t border-white/5">
                  <div className="space-y-1">
                    <Skeleton className="h-2 w-12" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                  <Skeleton className="h-8 w-24" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-black text-foreground tracking-tight">Your Inventory</h1>
            <div className="p-1 rounded-md bg-secondary/10 text-secondary">
              <ShoppingBag size={18} />
            </div>
          </div>
          <p className="text-muted font-medium">
            Manage your high-performance affiliate collection.
          </p>
        </div>
        <Link href="/dashboard/add-product">
          <Button className="gap-2 shadow-lg shadow-primary/25 group whitespace-nowrap">
            <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
            Add New Product
          </Button>
        </Link>
      </div>

      <div className="relative max-w-md">
        <Input
          placeholder="Filter your products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          icon={<Search className="w-4 h-4 text-muted/50" />}
          className="bg-white/5 border-white/5 focus:border-primary/50 transition-all duration-300 pr-10"
        />
        {search && (
          <button 
            onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted/30 hover:text-muted transition-colors"
          >
            <Zap size={14} fill="currentColor" />
          </button>
        )}
      </div>

      {filteredProducts.length === 0 ? (
        <div className="text-center py-24 glass rounded-3xl border border-dashed border-white/10 animate-fade-in">
          <div className="w-20 h-20 bg-surface-light rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner border border-white/5">
            <Package className="w-10 h-10 text-muted/40" />
          </div>
          <h3 className="text-xl font-bold text-foreground">Hangar Empty</h3>
          <p className="text-muted mt-2 max-w-xs mx-auto text-sm leading-relaxed">
            {search 
              ? "No matches for your search. Try a different sector of keywords." 
              : "Launch your store capacity by adding your first affiliate product links."}
          </p>
          {!search && (
            <Link href="/dashboard/add-product" className="inline-block mt-6">
              <Button variant="secondary" className="gap-2">
                Deploy First Product
                <ArrowRight size={16} />
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="group glass overflow-hidden flex flex-col hover:border-primary/30 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/5">
              <div className="relative h-56 bg-white overflow-hidden flex items-center justify-center p-6">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/5 opacity-0 group-hover:opacity-100 transition-opacity z-10" />
                
                {product.image_url ? (
                  <Image
                    src={product.image_url}
                    alt={product.title}
                    fill
                    className="object-contain group-hover:scale-110 transition-transform duration-700 p-6 z-0"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-surface-light flex items-center justify-center">
                    <Package className="w-8 h-8 text-muted/20" />
                  </div>
                )}

                <div className="absolute top-3 right-3 flex gap-2 z-20 translate-y-[-10px] opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                  <Button
                    variant="danger"
                    size="sm"
                    className="h-9 w-9 p-0 rounded-xl glass border-danger/20 text-danger hover:bg-danger hover:text-white"
                    onClick={() => handleDelete(product.id)}
                    disabled={deletingId === product.id}
                  >
                    {deletingId === product.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </Button>
                </div>

                <div className="absolute top-3 left-3 px-3 py-1.5 rounded-xl glass border-white/10 text-[10px] font-black text-foreground uppercase tracking-wider z-20 shadow-sm">
                  {product.platform}
                </div>
              </div>

              <CardContent className="p-6 flex-1 flex flex-col relative">
                <div className="absolute top-0 right-6 w-12 h-1 bg-gradient-to-r from-primary to-secondary rounded-full opacity-20" />
                
                <h3 className="font-bold text-base line-clamp-2 min-h-[3rem] mb-4 group-hover:text-primary transition-colors leading-tight">
                  {product.title}
                </h3>

                <div className="flex items-center justify-between mt-auto pt-5 border-t border-white/5">
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-bold text-muted/50 tracking-widest mb-0.5 whitespace-nowrap">Price Point</span>
                    <div className="text-xl font-black text-secondary-light">
                      {product.price || "N/A"}
                    </div>
                  </div>
                  
                  <Link href={product.original_url} target="_blank" className="z-10">
                    <Button variant="ghost" size="sm" className="gap-2 px-0 hover:bg-transparent hover:text-primary transition-all group/btn">
                      <span className="text-xs font-bold uppercase tracking-tighter">View Source</span>
                      <ExternalLink className="w-4 h-4 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
