"use client";

import React from "react";
import { MessageCircle } from "lucide-react";

interface WhatsAppButtonProps {
  storeName: string;
  storeUrl: string;
}

export function WhatsAppButton({ storeName, storeUrl }: WhatsAppButtonProps) {
  const message = encodeURIComponent(
    `🛒 Check out ${storeName} — amazing deals curated just for you!\n\n${storeUrl}\n\nPowered by Storix`
  );

  return (
    <a
      href={`https://wa.me/?text=${message}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-4 left-4 z-50 group"
    >
      <div className="relative">
        <div className="absolute inset-0 bg-[#25D366] rounded-full blur-lg opacity-30 group-hover:opacity-50 transition-opacity" />
        <div className="relative w-14 h-14 rounded-full bg-[#25D366] flex items-center justify-center shadow-2xl shadow-[#25D366]/30 group-hover:scale-110 transition-transform cursor-pointer">
          <MessageCircle size={24} className="text-white fill-white" />
        </div>
      </div>
      <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-xl bg-black/80 backdrop-blur-sm border border-white/10 text-[9px] font-bold text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all pointer-events-none">
        Share on WhatsApp
      </div>
    </a>
  );
}
