"use client";

import dynamic from "next/dynamic";

export const DashboardEntrance = dynamic(
  () => import("@/components/dashboard/DashboardEntrance").then((mod) => mod.DashboardEntrance),
  { ssr: false }
);

export const ScrollReveal = dynamic(
  () => import("@/components/ui/ScrollReveal").then((mod) => mod.ScrollReveal),
  { ssr: false }
);

export const StaggerReveal = dynamic(
  () => import("@/components/ui/ScrollReveal").then((mod) => mod.StaggerReveal),
  { ssr: false }
);
