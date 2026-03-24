"use client";

import React, { useEffect, useState } from "react";
import { getUser } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { 
  Plus, 
  Search, 
  Trash2, 
  ExternalLink,
  Loader2,
  Package
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

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
    try {
      const user = await getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (err) {
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    
    setDeletingId(id);
    try {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
      setProducts(products.filter((p) => p.id !== id));
    } catch (err) {
      console.error("Error deleting product:", err);
      alert("Failed to delete product.");
    } finally {
      setDeletingId(null);
    }
  };

  const filteredProducts = products.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Products</h1>
          <p className="text-muted mt-1">
            Manage your affiliate product collection.
          </p>
        </div>
        <Link href="/dashboard/add-product">
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Add New Product
          </Button>
        </Link>
      </div>

      <div className="relative">
        <Input
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          icon={<Search className="w-4 h-4" />}
          className="max-w-md"
        />
      </div>

      {filteredProducts.length === 0 ? (
        <div className="text-center py-24 bg-surface rounded-2xl border border-dashed border-border">
          <div className="w-16 h-16 bg-surface-light rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-muted" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">No products found</h3>
          <p className="text-muted mt-1">
            {search ? "Try a different search term" : "Click the button above to add your first product"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="group overflow-hidden flex flex-col">
              <div className="relative h-48 bg-white flex items-center justify-center p-4">
                {product.image_url ? (
                  <Image
                    src={product.image_url}
                    alt={product.title}
                    fill
                    className="object-contain group-hover:scale-110 transition-transform duration-500 p-4"
                  />
                ) : (
                  <Package className="w-12 h-12 text-muted/20" />
                )}
                <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="danger"
                    size="sm"
                    className="h-8 w-8 p-0"
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
                <div className="absolute top-2 left-2 px-2 py-1 rounded-md bg-black/60 backdrop-blur-md text-[10px] font-bold text-white uppercase tracking-wider">
                  {product.platform}
                </div>
              </div>
              <CardContent className="p-5 flex-1 flex flex-col">
                <h3 className="font-bold text-base line-clamp-2 min-h-[3rem] mb-2 group-hover:text-primary transition-colors">
                  {product.title}
                </h3>
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-border">
                  <div className="text-lg font-bold text-secondary">
                    {product.price || "N/A"}
                  </div>
                  <Link href={product.original_url} target="_blank">
                    <Button variant="ghost" size="sm" className="gap-2">
                      <ExternalLink className="w-3.5 h-3.5" />
                      Original
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
