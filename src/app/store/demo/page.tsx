import React from "react";
import { StoreView } from "@/components/store/StoreView";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tech Haven Demo | Storix",
  description: "A showcase of a premium affiliate storefront powered by Storix.",
};

export default function DemoStorePage() {
  const demoProfile = {
    id: "demo-id-123",
    store_name: "Tech Haven",
    store_description: "Curated tech gear and minimalist workstation essentials. Discover our top picks for productivity and aesthetics.",
    username: "demo",
    theme: "cyberpunk", // or 'default', or 'minimal', 'cyberpunk' usually pops!
    store_logo: "https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?q=80&w=200&auto=format&fit=crop", 
    plan: "pro" // Unlock premium theme features visually
  };

  const demoProducts = [
    {
      id: "550e8400-e29b-41d4-a716-446655440001",
      user_id: "demo-id-123",
      title: "Logitech MX Master 3S - Advanced Wireless Mouse",
      image_url: "https://images.unsplash.com/photo-1615663245857-ac93bb7c229?q=80&w=400&auto=format&fit=crop", // placeholder
      platform: "Amazon",
      price: "$99.99",
      original_price: null,
      discount_percentage: null,
      original_url: "https://amazon.com",
      created_at: new Date().toISOString()
    },
    {
      id: "550e8400-e29b-41d4-a716-446655440002",
      user_id: "demo-id-123",
      title: "Keychron Q1 Pro Custom Mechanical Keyboard",
      image_url: "https://images.unsplash.com/photo-1595225476474-87563907a212?q=80&w=400&auto=format&fit=crop",
      platform: "Amazon",
      price: "$199.00",
      original_price: "$219.00",
      discount_percentage: 9,
      original_url: "https://amazon.com",
      created_at: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: "550e8400-e29b-41d4-a716-446655440003",
      user_id: "demo-id-123",
      title: "Sony WH-1000XM5 Noise Canceling Headphones",
      image_url: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?q=80&w=400&auto=format&fit=crop",
      platform: "Amazon",
      price: "$348.00",
      original_price: null,
      discount_percentage: null,
      original_url: "https://amazon.com",
      created_at: new Date(Date.now() - 86400000 * 2).toISOString()
    },
    {
      id: "550e8400-e29b-41d4-a716-446655440004",
      user_id: "demo-id-123",
      title: "LG 34\" Curved UltraWide QHD Monitor",
      image_url: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?q=80&w=400&auto=format&fit=crop",
      platform: "Flipkart",
      price: "$499.00",
      original_price: "$699.00",
      discount_percentage: 28,
      original_url: "https://flipkart.com",
      created_at: new Date(Date.now() - 86400000 * 3).toISOString()
    }
  ];

  return <StoreView profile={demoProfile} products={demoProducts as any} />;
}
