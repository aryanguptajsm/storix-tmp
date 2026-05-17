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
      image_url: "/images/demo/demo_product_mouse.png",
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
      image_url: "/images/demo/demo_product_keyboard.png",
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
      image_url: "/images/demo/demo_product_headphones.png",
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
      image_url: "/images/demo/demo_product_monitor.png",
      platform: "Flipkart",
      price: "$499.00",
      original_price: "$699.00",
      discount_percentage: 28,
      original_url: "https://flipkart.com",
      created_at: new Date(Date.now() - 86400000 * 3).toISOString()
    },
    {
      id: "550e8400-e29b-41d4-a716-446655440005",
      user_id: "demo-id-123",
      title: "Apple 2024 MacBook Air M3 Chip",
      image_url: "/images/demo/demo_product_macbook.png",
      platform: "Amazon",
      price: "$1099.00",
      original_price: "$1299.00",
      discount_percentage: 15,
      original_url: "https://amazon.com",
      created_at: new Date(Date.now() - 86400000 * 4).toISOString()
    },
    {
      id: "550e8400-e29b-41d4-a716-446655440006",
      user_id: "demo-id-123",
      title: "Samsung Galaxy S24 Ultra 512GB",
      image_url: "/images/demo/demo_product_phone.png",
      platform: "Flipkart",
      price: "$1299.99",
      original_price: null,
      discount_percentage: null,
      original_url: "https://flipkart.com",
      created_at: new Date(Date.now() - 86400000 * 5).toISOString()
    },
    {
      id: "550e8400-e29b-41d4-a716-446655440007",
      user_id: "demo-id-123",
      title: "Anker 737 Power Bank (PowerCore 24K)",
      image_url: "/images/demo/demo_product_powerbank.png",
      platform: "Amazon",
      price: "$149.99",
      original_price: "$159.99",
      discount_percentage: 6,
      original_url: "https://amazon.com",
      created_at: new Date(Date.now() - 86400000 * 6).toISOString()
    },
    {
      id: "550e8400-e29b-41d4-a716-446655440008",
      user_id: "demo-id-123",
      title: "Sony Alpha a7 IV Full-Frame Mirrorless",
      image_url: "/images/demo/demo_product_camera.png",
      platform: "Amazon",
      price: "$2498.00",
      original_price: null,
      discount_percentage: null,
      original_url: "https://amazon.com",
      created_at: new Date(Date.now() - 86400000 * 7).toISOString()
    }
  ];

  return <StoreView profile={demoProfile} products={demoProducts as any} />;
}
