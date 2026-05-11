// ============================================================
// STORIX PRODUCTION SCRAPER — PLATFORM SELECTOR ADAPTERS
// ============================================================

import type { PlatformSelectorMap, ScrapePlatform } from "./types";

// ── Amazon ────────────────────────────────────────────────────────────────────

const AMAZON: PlatformSelectorMap = {
  waitFor: ["#productTitle", "#landingImage", "#acrPopover"],
  title: [
    "#productTitle",
    "h1#title span",
    "span#productTitle",
    "[data-feature-name='title'] span",
  ],
  price: [
    ".priceToPay .a-offscreen",
    ".apexPriceToPay .a-offscreen",
    "#corePrice_feature_div .a-offscreen",
    "#priceblock_dealprice",
    "#priceblock_ourprice",
    ".a-price > .a-offscreen",
    "#price_inside_buybox",
    "span#tp_price_block_total_price_ww .a-offscreen",
  ],
  originalPrice: [
    ".basisPrice .a-offscreen",
    ".a-price.a-text-price .a-offscreen",
    "#listPrice",
    ".priceBlockStrikePriceString",
    "#priceBlockStrikePriceID",
    "[data-feature-name='price'] .a-text-strike .a-offscreen",
  ],
  discount: [".savingsPercentage", "#savingsPercentage"],
  image: [
    "#landingImage",
    "#imgTagWrapperId img",
    "#main-image-container img",
    ".a-dynamic-image",
    "#imageBlockContainer img",
  ],
  rating: [
    "#acrPopover",
    "span.a-icon-alt",
    "#averageCustomerReviews .a-icon-alt",
    "[data-hook='rating-out-of-text']",
  ],
  reviewCount: [
    "#acrCustomerReviewText",
    "[data-hook='total-review-count']",
    "#acrCustomerReviewLink",
  ],
  brand: [
    "#bylineInfo",
    "#brand",
    "[data-feature-name='bylineInfo'] .po-brand .po-break-word",
    "a#bylineInfo",
    ".a-size-base.po-break-word",
  ],
  description: [
    "#productDescription p",
    "[data-feature-name='productDescription'] p",
    "#aplus p",
    "#feature-bullets",
  ],
  features: [
    "#feature-bullets li span.a-list-item",
    "#featurebullets_feature_div li span",
  ],
};

// ── Flipkart ──────────────────────────────────────────────────────────────────

const FLIPKART: PlatformSelectorMap = {
  waitFor: ["h1", "div.Nx9bqj,div._30jeq3", "img.DByuf4,img._396cs4"],
  title: [
    "h1 span.VU-ZEz",
    "h1.yhB1nd span",
    "h1._35KyD6",
    "h1",
    "[class*='title']",
  ],
  price: [
    "div.Nx9bqj.CxhGGd",
    "div.Nx9bqj",
    "div._30jeq3._16Jk6d",
    "div._30jeq3",
    "div.CEmiEU div",
    "[class*='selling-price']",
  ],
  originalPrice: [
    "div.yRaY8j.A6\\+E6v",
    "div.yRaY8j",
    "div._3I9_wc._2p6lqe",
    "[class*='price-label']",
  ],
  discount: ["div.UkUFwK span", "div._3Ay6Sb span", "[class*='discount']"],
  image: [
    "img.DByuf4",
    "img._396cs4",
    "img.q6DClP",
    "div.CXW8mj img",
    "div._3kidJX img",
    "div.Jd7cWd img",
  ],
  rating: ["div.XQDdHH", "div._3LWZlK", "[class*='rating']"],
  reviewCount: ["span.Wphh3N span", "span._2_R_DZ span", "span._13vcmD"],
  brand: ["span.mEh187", "span._2J4LW2", "[class*='brand']"],
  description: ["div._1mXcCf.RmoJUa p", "div.yN+eNr", "[class*='description'] p"],
  features: ["li._21Ahn- div", "table._14cfVK tr", "li.rgWa7D"],
};

// ── Meesho ────────────────────────────────────────────────────────────────────

const MEESHO: PlatformSelectorMap = {
  waitFor: ["h1", "[data-testid='pdp-product-name']"],
  title: [
    "[data-testid='pdp-product-name']",
    "[class*='ProductName']",
    "h1",
    "h2",
  ],
  price: [
    "[data-testid='pdp-product-price']",
    "[class*='PriceLabel']",
    "h4",
    "h3",
    "h2",
  ],
  originalPrice: ["[class*='originalPrice']", "[class*='strikethrough']"],
  discount: ["[class*='Discount']"],
  image: [
    "[data-testid='pdp-product-image']",
    "[class*='ProductImage'] img",
    "img[loading='eager']",
    "main img",
  ],
  rating: ["[class*='Rating']", "[data-testid='rating']"],
  reviewCount: ["[class*='ReviewCount']", "[data-testid='review-count']"],
  brand: ["[class*='BrandName']", "[class*='SupplierName']"],
  description: ["[class*='Description']", "[data-testid='description']"],
  features: ["[class*='SpecRow']", "[data-testid='spec-item']"],
};

// ── Myntra ────────────────────────────────────────────────────────────────────

const MYNTRA: PlatformSelectorMap = {
  waitFor: [".pdp-title", ".pdp-price"],
  title: [".pdp-title", "h1.pdp-name", ".product-title h1", "h1"],
  price: [
    ".pdp-price strong",
    ".pdp-price-box strong",
    "[class*='pdp-price']",
    "[class*='price-container'] strong",
  ],
  originalPrice: [".pdp-mrp", ".mrp", "[class*='mrp']"],
  discount: [".pdp-discount", "[class*='discount-container']"],
  image: [
    ".image-grid-image img",
    ".image-grid-col img",
    "[class*='image-grid'] img",
    "img[class*='pdp']",
  ],
  rating: [".index-overallRating", ".product-ratingsContainer", "[class*='ratings']"],
  reviewCount: [".index-ratingsCount", "[class*='ratingsCount']"],
  brand: [".pdp-title a", ".title-container h1 a", "[class*='brand']"],
  description: [".pdp-product-description-content", "[class*='description-text']"],
  features: [".pdp-sizeFitDesc li", "[class*='size-fit'] li"],
};

// ── Ajio ──────────────────────────────────────────────────────────────────────

const AJIO: PlatformSelectorMap = {
  waitFor: [".prod-name", ".price-con"],
  title: [".prod-name", ".product-title", "h1"],
  price: [".prod-sp", ".price-con .price", "[class*='prod-sp']"],
  originalPrice: [".prod-cp", "[class*='prod-cp']"],
  discount: [".discount-percent", "[class*='discount']"],
  image: [
    ".image-sec img",
    ".thumbnail-slider img",
    "[class*='zoom'] img",
    "img[class*='pdp']",
  ],
  rating: [".prod-rating-count", "[class*='review-star']"],
  reviewCount: [".prod-review-count", "[class*='review-count']"],
  brand: [".prod-brand-name", ".product-brand a"],
  description: [".prod-desc", "[class*='product-desc']"],
  features: [".product-detail li", ".attr-highlight li"],
};

// ── Shopify Generic ───────────────────────────────────────────────────────────

const SHOPIFY: PlatformSelectorMap = {
  waitFor: ["[data-product-title]", ".product__title", "h1"],
  title: [
    "[data-product-title]",
    ".product__title h1",
    ".product-title h1",
    ".product_title h1",
    "h1.product__title",
    "h1",
  ],
  price: [
    "[data-product-price]",
    ".product__price",
    ".price__sale",
    ".product-single__price",
    "span.money",
    "[class*='price--sale']",
  ],
  originalPrice: [
    "[data-compare-price]",
    ".price__compare",
    ".product__price--compare",
    "s.money",
  ],
  discount: ["[data-discount]", ".badge--sale"],
  image: [
    ".product__media img",
    ".product-single__photo img",
    "#product-featured-media img",
    "[data-product-single-media-group] img",
    ".photoswipe__zoom img",
  ],
  rating: [".spr-summary-starrating", "[class*='rating']", ".stamped-badge-starrating"],
  reviewCount: [".spr-summary-actions-togglereviews", "[class*='review-count']"],
  brand: ["[data-product-vendor]", ".product-vendor", ".product__vendor", ".product__meta vendor"],
  description: [".product__description", ".product-description", "[data-product-description]"],
  features: [".product__description li", ".product-description li"],
};

// ── Generic Fallback ──────────────────────────────────────────────────────────

const GENERIC: PlatformSelectorMap = {
  waitFor: ["h1", "main"],
  title: [
    "[data-testid='product-title']",
    "[itemprop='name']",
    ".product-name h1",
    ".product-title h1",
    "h1",
    "h2",
  ],
  price: [
    "[data-testid='price']",
    "[itemprop='price']",
    ".price",
    ".sale-price",
    ".current-price",
    "span.money",
  ],
  originalPrice: [
    "[itemprop='price'][class*='original']",
    ".original-price",
    ".compare-at-price",
    ".strike-price",
    "del .money",
  ],
  discount: ["[class*='discount']", "[class*='savings']", "[class*='sale']"],
  image: [
    "img[fetchpriority='high']",
    "img[loading='eager']",
    "main img",
    "[data-testid='product-image'] img",
    ".product-image img",
  ],
  rating: ["[data-testid='rating']", "[itemprop='ratingValue']", "[class*='rating']"],
  reviewCount: ["[data-testid='review-count']", "[itemprop='reviewCount']", "[class*='reviews']"],
  brand: ["[itemprop='brand']", "[data-testid='brand']", ".brand", ".product-brand"],
  description: [
    "[itemprop='description']",
    "[data-testid='product-description']",
    ".product-description",
    ".description",
  ],
  features: ["[class*='feature'] li", "[class*='specification'] li", ".product-details li"],
};

// ── Adapter Registry ──────────────────────────────────────────────────────────

const ADAPTERS: Record<ScrapePlatform, PlatformSelectorMap> = {
  amazon: AMAZON,
  flipkart: FLIPKART,
  meesho: MEESHO,
  myntra: MYNTRA,
  ajio: AJIO,
  shopify: SHOPIFY,
  ebay: GENERIC,
  generic: GENERIC,
};

export function getAdapter(platform: ScrapePlatform): PlatformSelectorMap {
  return ADAPTERS[platform] ?? ADAPTERS.generic;
}

export { AMAZON, FLIPKART, MEESHO, MYNTRA, AJIO, SHOPIFY, GENERIC };
