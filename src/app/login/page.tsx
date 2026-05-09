import React, { Suspense } from "react";
import { LoginClient } from "./LoginClient";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center p-4 bg-[#020205]"><div className="animate-spin w-8 h-8 rounded-full border-b-2 border-primary" /></div>}>
      <LoginClient />
    </Suspense>
  );
}
