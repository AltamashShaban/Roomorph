/**
 * "Shop this look" — the new furniture in each redesign, with estimated prices
 * and store searches for similar items. Ordering happens on the store's own site.
 *
 * PROTOTYPE: items are hand-placed on each style's sample image.
 * PRODUCTION: a vision model detects the new items in the generated image
 * (label + position), then a visual-search / shopping API returns real products
 * and live prices. The UI below stays the same — only `getShopItems` changes.
 *
 * x / y are positions on the image from 0 to 1 (0,0 = top-left).
 * Prices are rough USD estimates for the look, not quotes from a store.
 */

export type ShopItem = {
  id: string;
  name: string;
  category: string;
  x: number;
  y: number;
  priceMin: number;
  priceMax: number;
  query: string; // what we search the stores for
};

export type Store = { id: string; name: string; url: (q: string) => string };

export const STORES: Store[] = [
  { id: 'google', name: 'Google Shopping', url: (q) => `https://www.google.com/search?tbm=shop&q=${encodeURIComponent(q)}` },
  { id: 'amazon', name: 'Amazon', url: (q) => `https://www.amazon.com/s?k=${encodeURIComponent(q)}` },
  { id: 'ikea', name: 'IKEA', url: (q) => `https://www.ikea.com/us/en/search/?q=${encodeURIComponent(q)}` },
  { id: 'etsy', name: 'Etsy', url: (q) => `https://www.etsy.com/search?q=${encodeURIComponent(q)}` },
];

const i = (
  id: string,
  name: string,
  category: string,
  x: number,
  y: number,
  priceMin: number,
  priceMax: number,
  query = name,
): ShopItem => ({ id, name, category, x, y, priceMin, priceMax, query });

const ITEMS: Record<string, ShopItem[]> = {
  modern: [
    i('sofa', 'Beige linen sectional sofa', 'Sofa', 0.2, 0.52, 900, 2200),
    i('table', 'Black marble block coffee table', 'Coffee table', 0.47, 0.6, 350, 900),
    i('lamp', 'Black dome floor lamp', 'Lighting', 0.28, 0.3, 80, 250),
    i('ottoman', 'Beige upholstered cube ottoman', 'Ottoman', 0.74, 0.5, 90, 250),
    i('console', 'Floating black media console', 'TV console', 0.9, 0.6, 300, 800),
    i('rug', 'Grey textured area rug', 'Rug', 0.62, 0.8, 150, 450),
  ],
  scandinavian: [
    i('sofa', 'Cream fabric 3-seater sofa', 'Sofa', 0.25, 0.5, 700, 1800),
    i('table', 'Light oak two-tier coffee table', 'Coffee table', 0.5, 0.62, 150, 400),
    i('lamp', 'Wooden tripod floor lamp with linen shade', 'Lighting', 0.32, 0.32, 60, 180),
    i('shelf', 'Floating oak wall shelf', 'Shelving', 0.25, 0.16, 25, 90),
    i('console', 'Oak slatted TV sideboard', 'TV console', 0.93, 0.63, 300, 900),
    i('rug', 'Braided jute runner rug', 'Rug', 0.7, 0.8, 80, 250),
  ],
  industrial: [
    i('sofa', 'Cognac leather sectional sofa', 'Sofa', 0.22, 0.55, 1400, 3500),
    i('table', 'Reclaimed wood metal frame coffee table', 'Coffee table', 0.5, 0.6, 200, 600),
    i('lamp', 'Black industrial floor lamp', 'Lighting', 0.28, 0.3, 70, 200),
    i('shelf', 'Black metal open bookshelf', 'Shelving', 0.86, 0.22, 150, 450),
    i('console', 'Rustic wood and metal TV stand', 'TV console', 0.92, 0.64, 250, 700),
    i('rug', 'Distressed charcoal area rug', 'Rug', 0.66, 0.8, 120, 400),
  ],
  bohemian: [
    i('pendant', 'Rattan pendant light', 'Lighting', 0.52, 0.1, 60, 200),
    i('sofa', 'Cream sofa with patterned boho cushions', 'Sofa', 0.3, 0.5, 700, 1800),
    i('table', 'Rustic solid wood coffee table', 'Coffee table', 0.5, 0.6, 200, 550),
    i('ottoman', 'Kilim floor pouf ottoman', 'Ottoman', 0.75, 0.5, 60, 180),
    i('pouf', 'Woven jute pouf', 'Pouf', 0.56, 0.88, 50, 150),
    i('rug', 'Vintage Persian style area rug', 'Rug', 0.78, 0.76, 150, 500),
  ],
  japandi: [
    i('lantern', 'Paper lantern pendant light', 'Lighting', 0.07, 0.13, 30, 120),
    i('sofa', 'Oatmeal linen sofa', 'Sofa', 0.3, 0.5, 800, 2000),
    i('table', 'Low walnut coffee table', 'Coffee table', 0.52, 0.63, 250, 700),
    i('chair', 'Oak frame lounge armchair', 'Armchair', 0.3, 0.84, 350, 900),
    i('pouf', 'Woven jute pouf ottoman', 'Pouf', 0.75, 0.5, 60, 180),
    i('rug', 'Natural wool jute rug', 'Rug', 0.72, 0.8, 150, 450),
  ],
  retro: [
    i('sofa', 'Rust velvet sofa', 'Sofa', 0.22, 0.52, 800, 2000),
    i('lamp', 'Orange mushroom floor lamp', 'Lighting', 0.28, 0.32, 70, 220),
    i('table', 'Oval walnut coffee table', 'Coffee table', 0.52, 0.63, 250, 650),
    i('chair', 'Mid-century wood armchair olive green', 'Armchair', 0.22, 0.86, 300, 800),
    i('console', 'Walnut mid-century media console', 'TV console', 0.9, 0.62, 400, 1100),
    i('rug', 'Retro 70s circles area rug', 'Rug', 0.8, 0.8, 120, 400),
  ],
  gaming: [
    i('chair', 'Ergonomic gaming chair', 'Chair', 0.5, 0.42, 200, 500),
    i('desk', 'Gaming desk with RGB lighting', 'Desk', 0.62, 0.4, 150, 450),
    i('sofa', 'Dark grey sectional sofa', 'Sofa', 0.25, 0.53, 800, 2000),
    i('table', 'Rustic wood coffee table', 'Coffee table', 0.55, 0.63, 150, 450),
    i('leds', 'RGB LED strip lights', 'Lighting', 0.42, 0.05, 20, 60),
    i('console', 'Low media console with LED', 'TV console', 0.9, 0.6, 200, 600),
  ],
  minimalist: [
    i('sofa', 'Low modular sectional sofa', 'Sofa', 0.25, 0.53, 1000, 2600),
    i('table', 'Low block wood coffee table', 'Coffee table', 0.52, 0.64, 250, 700),
    i('lamp', 'Black dome floor lamp', 'Lighting', 0.3, 0.31, 80, 250),
    i('console', 'Floating wood TV console', 'TV console', 0.86, 0.52, 300, 800),
    i('pouf', 'Boucle round pouf ottoman', 'Pouf', 0.94, 0.8, 90, 260),
    i('rug', 'Cream textured wool rug', 'Rug', 0.65, 0.76, 200, 600),
  ],
};

/** Items for a redesign. Prototype: the style's hand-placed sample items. */
export function getShopItems(styleId: string): ShopItem[] {
  return ITEMS[styleId] ?? [];
}

export function formatPrice(n: number) {
  return n >= 1000 ? `$${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k` : `$${n}`;
}

export const priceRange = (it: ShopItem) => `${formatPrice(it.priceMin)}–${formatPrice(it.priceMax)}`;

/**
 * Map a 0–1 point on an image into a frame showing it with contentFit "cover".
 * Returns null when the point is cropped out of view.
 */
export function coverPoint(x: number, y: number, imageAspect: number, frameAspect: number) {
  let fx = x;
  let fy = y;
  if (frameAspect > imageAspect) {
    // image wider-scaled: top/bottom cropped
    const visible = imageAspect / frameAspect;
    fy = (y - (1 - visible) / 2) / visible;
  } else if (frameAspect < imageAspect) {
    const visible = frameAspect / imageAspect;
    fx = (x - (1 - visible) / 2) / visible;
  }
  if (fx < 0.03 || fx > 0.97 || fy < 0.03 || fy > 0.97) return null;
  return { x: fx, y: fy };
}
