# ⚡ Storix — Next-Generation Affiliate Platform

Storix is an ultra-fast, headless-ready platform built to empower creators and individuals in launching their own high-converting affiliate stores in under 5 minutes. 

It leverages edge computing, intelligent web-scraping, and native AI generation to automate the manual work of affiliate marketing—leaving you to focus entirely on driving traffic and earning commissions.

---

## 🚀 Why Storix?

- **Sub-Second Speeds**: Built entirely on Next.js App Router and optimized for Edge streaming.
- **Instant AI Intelligence**: Uses advanced scraping combined with Gemini/Claude to generate optimized titles and descriptions.
- **Zero Configuration**: Ready-to-go customizable themes (Shopify-like, Minimalist, Cyber).
- **Subdomain Routing Natives**: Native support for custom storefront paths `[username].storix.in` right at the Edge middleware without needing a reverse proxy.

## 🛠 Tech Stack

- **Framework**: [Next.js 15+](https://nextjs.org) (App Router, Edge Middleware)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Database / Auth**: [Supabase](https://supabase.com) (PostgreSQL + RLS)
- **AI Engine**: Gemini Language Models / Anthropic Claude
- **Analytics**: Built-in Recharts telemetry

---

## 💿 Getting Started

### 1. Prerequisite Setup
1. Clone the repository
2. Run `npm install`
3. Copy the `.env.local` variables

Required environment parameters:
```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
GEMINI_API_KEY=your-gemini-key
```

### 2. Database Initialization
Navigate to your Supabase project's SQL Editor and physically run the commands inside `supabase/init.sql`. This sets up the following schema:
- `profiles` (Store wrappers)
- `products` (Inventory items with affiliate logic)
- RLS Policies to lock down foreign writes.

### 3. Start the Development Server
```bash
npm run dev
```

> **Note:** The `next.config.ts` includes custom `devIndicators` to keep your workspace clean (removes the default Next.js build badges). It also leverages `optimizePackageImports` for lightning-fast HMR.

---

## 🗺 System Architecture & Routing

We use **Next.js Edge Middleware** (`src/middleware.ts`) to dynamically parse hostnames and map any request entering a subdomain (e.g. `techdeals.localhost:3000`) directly into the `src/app/store/[username]` path underneath the hood. 

This enables instant provisioning of real, indexable paths for merchants the second they signup. No server reloads required!

---

*Made with ❤️ for Creators. Accelerating commerce at the speed of thought.*
