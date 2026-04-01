// Storix Plan Definitions & Gating Logic

export type PlanId = 'free' | 'pro' | 'business';

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
  interval: 'month' | 'year';
  description: string;
  badge?: string;
  limits: PlanLimits;
  features: string[];
  razorpayPlanId?: string;
  dodoProductId?: string;
}

export const PLANS: Record<PlanId, Plan> = {
  free: {
    id: 'free',
    name: 'Free',
    price: 0,
    priceDisplay: '₹0',
    currency: 'INR',
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
    price: 69900, // ₹699
    priceDisplay: '₹699',
    currency: 'INR',
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
      '3 storefronts',
      'All premium themes',
      'Advanced analytics',
      'AI description writer',
      'Custom domain',
      'No Storix branding',
      'WhatsApp integration',
      'Email capture widget',
    ],
    razorpayPlanId: process.env.RAZORPAY_PRO_PLAN_ID,
    dodoProductId: 'pdt_0NbhRaCdMO2up7ejl9wfZ',
  },
  business: {
    id: 'business',
    name: 'Business',
    price: 199900, // ₹1,999
    priceDisplay: '₹1,999',
    currency: 'INR',
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
      '10 storefronts',
      'All premium themes',
      'Priority analytics',
      'AI description writer',
      'Custom domain',
      'White-label support',
      'Bulk CSV import',
      'WhatsApp catalog sync',
      'Email capture widget',
      'Priority support',
    ],
    razorpayPlanId: process.env.RAZORPAY_BUSINESS_PLAN_ID,
  },
};

export const PREMIUM_THEMES = ['midnight', 'neon', 'gradient', 'tokyo', 'ocean', 'sunset', 'monochrome'];

export function getPlan(planId: string | null | undefined): Plan {
  if (planId && planId in PLANS) {
    return PLANS[planId as PlanId];
  }
  return PLANS.free;
}

export function canUserPerformAction(
  userPlan: PlanId,
  action: keyof PlanLimits
): boolean {
  const plan = getPlan(userPlan);
  const value = plan.limits[action];
  return typeof value === 'boolean' ? value : true;
}

export function getProductLimit(planId: PlanId): number {
  return getPlan(planId).limits.maxProducts;
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
