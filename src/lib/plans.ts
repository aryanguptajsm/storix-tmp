// Storix Plan Definitions & Gating Logic

export type PlanId = 'free' | 'pro' | 'business';
export type PlanFeature = keyof PlanLimits;

export interface PlanLimits {
  maxProducts: number;
  maxStores: number;
  customDomain: boolean;
  premiumThemes: boolean;
  aiWriter: boolean;
  bulkImport: boolean;
  whatsappSync: boolean;
  removeBranding: boolean;
  prioritySupport: boolean;
  emailCapture: boolean;
}

export interface Plan {
  id: PlanId;
  name: string;
  price: number; // in paise (INR)
  priceDisplay: string;
  currency: string;
  symbol: string;
  interval: 'month' | 'year';
  description: string;
  badge?: string;
  limits: PlanLimits;
  features: string[];
  razorpayPlanId?: string;
  dodoProductId?: string;
}

export interface PlanPresentation {
  tier: string;
  badge?: string;
  cta: string;
}

export const PLANS: Record<PlanId, Plan> = {
  free: {
    id: 'free',
    name: 'Free',
    price: 0,
    priceDisplay: '₹0',
    currency: 'INR',
    symbol: '₹',
    interval: 'month',
    description: 'Perfect for getting started with affiliate marketing.',
    limits: {
      maxProducts: 10,
      maxStores: 1,
      customDomain: false,
      premiumThemes: false,
      aiWriter: false,
      bulkImport: false,
      whatsappSync: false,
      removeBranding: false,
      prioritySupport: false,
      emailCapture: false,
    },
    features: [
      'Up to 10 products',
      '1 storefront',
      'Basic themes',
      'Click analytics',
      'AI title generation',
      'Storix branding',
    ],
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    price: 499, // $4.99
    priceDisplay: '$4.99',
    currency: 'USD',
    symbol: '$',
    interval: 'month',
    description: 'For serious affiliate marketers who want to scale.',
    badge: 'Most Popular',
    limits: {
      maxProducts: 100,
      maxStores: 3,
      customDomain: true,
      premiumThemes: true,
      aiWriter: true,
      bulkImport: false,
      whatsappSync: true,
      removeBranding: true,
      prioritySupport: false,
      emailCapture: true,
    },
    features: [
      'Up to 100 products',
      'Premium storefront themes',
      'Advanced click analytics',
      'AI description writer',
      'No Storix branding',
      'WhatsApp sharing',
      'Email capture widget',
    ],
    razorpayPlanId: process.env.RAZORPAY_PRO_PLAN_ID,
    dodoProductId: process.env.NEXT_PUBLIC_DODO_PRODUCT_ID_PRO || 'pdt_0NbypC6YbYRrM6MgrSrwk',
  },
  business: {
    id: 'business',
    name: 'Business',
    price: 2500, // $25
    priceDisplay: '$25',
    currency: 'USD',
    symbol: '$',
    interval: 'month',
    description: 'For agencies and power users who need everything.',
    badge: 'Maximum Power',
    limits: {
      maxProducts: Infinity,
      maxStores: 10,
      customDomain: true,
      premiumThemes: true,
      aiWriter: true,
      bulkImport: true,
      whatsappSync: true,
      removeBranding: true,
      prioritySupport: true,
      emailCapture: true,
    },
    features: [
      'Unlimited products',
      'Premium storefront themes',
      'Priority analytics views',
      'AI description writer',
      'No Storix branding',
      'Bulk workspace access',
      'WhatsApp sharing',
      'Email capture widget',
    ],
    razorpayPlanId: process.env.RAZORPAY_BUSINESS_PLAN_ID,
    dodoProductId: process.env.NEXT_PUBLIC_DODO_PRODUCT_ID_BUSINESS || 'pdt_0NdG5Q5kJJp0JImaI5wm3',
  },
};

export const PLAN_ORDER: PlanId[] = ['free', 'pro', 'business'];

export const PLAN_PRESENTATION: Record<PlanId, PlanPresentation> = {
  free: {
    tier: 'Starter',
    cta: 'Start Free',
  },
  pro: {
    tier: 'Scale',
    badge: 'Most Popular',
    cta: 'Command Pro',
  },
  business: {
    tier: 'Enterprise',
    badge: 'Maximum Power',
    cta: 'Command Business',
  },
};

export const PREMIUM_THEMES = ['midnight', 'neon', 'gradient', 'tokyo', 'ocean', 'sunset', 'monochrome', 'amazon', 'flipkart'];

export function getPlan(planId: string | null | undefined): Plan {
  if (planId && planId in PLANS) {
    return PLANS[planId as PlanId];
  }
  return PLANS.free;
}

export function normalizePlanId(planId: string | null | undefined): PlanId {
  return getPlan(planId).id;
}

export function isPaidPlan(planId: string | null | undefined): boolean {
  return normalizePlanId(planId) !== 'free';
}

export function hasPlanFeature(
  planId: string | null | undefined,
  feature: PlanFeature
): boolean {
  const value = getPlan(planId).limits[feature];
  return typeof value === 'boolean' ? value : true;
}

export function canUserPerformAction(
  userPlan: PlanId,
  action: keyof PlanLimits
): boolean {
  return hasPlanFeature(userPlan, action);
}

export function getProductLimit(planId: PlanId): number {
  return getPlan(planId).limits.maxProducts;
}

export function getStoreLimit(planId: PlanId): number {
  return getPlan(planId).limits.maxStores;
}

export function isWithinProductLimit(
  planId: PlanId,
  currentCount: number
): boolean {
  const limit = getProductLimit(planId);
  return currentCount < limit;
}

export function getProductUsagePercent(
  planId: PlanId,
  currentCount: number
): number {
  const limit = getProductLimit(planId);
  if (limit === Infinity) return 0;
  return Math.min(Math.round((currentCount / limit) * 100), 100);
}

export function isPremiumTheme(themeId: string): boolean {
  return PREMIUM_THEMES.includes(themeId);
}
