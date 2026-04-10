"use client";

import dynamic from "next/dynamic";

export const ClientChatWidget = dynamic(() => import("@/components/ui/ChatWidget").then(m => ({ default: m.ChatWidget })), {
  ssr: false,
});
