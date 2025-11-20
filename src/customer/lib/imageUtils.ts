// Centralized image helpers for cuisine/food photos (royalty-free Unsplash CDN links)
// Each URL uses cropping and quality parameters suitable for cards and hero.

export function getCuisineImage(cuisine: string): string {
  const key = (cuisine || '').toLowerCase();
  // curated set (safe food subjects)
  const map: Record<string, string> = {
    italian: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=1200&auto=format&fit=crop',
    pizza: 'https://images.unsplash.com/photo-1541698444083-023c97d3f4b6?q=80&w=1200&auto=format&fit=crop',
    japanese: 'https://images.unsplash.com/photo-1553621042-f6e147245754?q=80&w=1200&auto=format&fit=crop',
    sushi: 'https://images.unsplash.com/photo-1541542684-3f9f2f0b7b3a?q=80&w=1200&auto=format&fit=crop',
    mexican: 'https://images.unsplash.com/photo-1525755662778-989d0524087e?q=80&w=1200&auto=format&fit=crop',
    tacos: 'https://images.unsplash.com/photo-1601924577973-3c37a5c6a8b3?q=80&w=1200&auto=format&fit=crop',
    american: 'https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=1200&auto=format&fit=crop',
    burgers: 'https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=1200&auto=format&fit=crop',
    chinese: 'https://images.unsplash.com/photo-1553621042-f6e147245754?q=80&w=1200&auto=format&fit=crop',
    thai: 'https://images.unsplash.com/photo-1543352634-8732d7c31f5a?q=80&w=1200&auto=format&fit=crop',
    indian: 'https://images.unsplash.com/photo-1604908176997-431c2068a9c3?q=80&w=1200&auto=format&fit=crop',
    healthy: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=1200&auto=format&fit=crop',
    salad: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=1200&auto=format&fit=crop'
  };
  // direct match
  if (map[key]) return map[key];
  // fuzzy contains match
  const found = Object.keys(map).find(k => key.includes(k));
  return found ? map[found] : 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1200&auto=format&fit=crop';
}

export const HERO_BACKGROUND = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1920&auto=format&fit=crop';
// Map placeholder asset (local) used when we want a unified maps preview image
export const MAP_PLACEHOLDER = '/assets/map-placeholder.svg';

// Return a representative image for a specific dish name, optionally using cuisine as a hint.
// Falls back to cuisine image, then a general high-quality food image.
export function getDishImage(dish: string, cuisine?: string): string {
  const norm = (dish || '').trim().toLowerCase();
  // Basic singularization for plural endings
  const singular = norm.endsWith('s') && norm.length > 3 ? norm.slice(0, -1) : norm;
  const keyCandidates = [norm, singular];

  const byDish: Record<string, string> = {
    pizza: 'https://images.unsplash.com/photo-1541698444083-023c97d3f4b6?q=80&w=1200&auto=format&fit=crop',
    pasta: 'https://images.unsplash.com/photo-1523986371872-9d3ba2e2f642?q=80&w=1200&auto=format&fit=crop',
    salad: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=1200&auto=format&fit=crop',
    sushi: 'https://images.unsplash.com/photo-1553621042-f6e147245754?q=80&w=1200&auto=format&fit=crop',
    sashimi: 'https://images.unsplash.com/photo-1553621042-f6e147245754?q=80&w=1200&auto=format&fit=crop',
    ramen: 'https://images.unsplash.com/photo-1541542684-3f9f2f0b7b3a?q=80&w=1200&auto=format&fit=crop',
    tempura: 'https://images.unsplash.com/photo-1606112219348-204d7d8b94ee?q=80&w=1200&auto=format&fit=crop',
    burger: 'https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=1200&auto=format&fit=crop',
    fry: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1200&auto=format&fit=crop',
    shake: 'https://images.unsplash.com/photo-1497538882315-4f045e4e45d5?q=80&w=1200&auto=format&fit=crop',
    taco: 'https://images.unsplash.com/photo-1601924577973-3c37a5c6a8b3?q=80&w=1200&auto=format&fit=crop',
    burrito: 'https://images.unsplash.com/photo-1610440042657-612c134b6df7?q=80&w=1200&auto=format&fit=crop',
    quesadilla: 'https://images.unsplash.com/photo-1605478201426-425fe32f0a6c?q=80&w=1200&auto=format&fit=crop',
    noodle: 'https://images.unsplash.com/photo-1604908176997-431c2068a9c3?q=80&w=1200&auto=format&fit=crop',
    dumpling: 'https://images.unsplash.com/photo-1553621042-f6e147245754?q=80&w=1200&auto=format&fit=crop',
    'stir fry': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=1200&auto=format&fit=crop',
    'pad thai': 'https://images.unsplash.com/photo-1543352634-8732d7c31f5a?q=80&w=1200&auto=format&fit=crop',
    curry: 'https://images.unsplash.com/photo-1604908176997-431c2068a9c3?q=80&w=1200&auto=format&fit=crop',
    satay: 'https://images.unsplash.com/photo-1543353071-10c8ba85a904?q=80&w=1200&auto=format&fit=crop',
    steak: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?q=80&w=1200&auto=format&fit=crop',
    side: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1200&auto=format&fit=crop',
    wine: 'https://images.unsplash.com/photo-1514361892635-6b07e31d21e5?q=80&w=1200&auto=format&fit=crop',
    antipasti: 'https://images.unsplash.com/photo-1478144592103-25e218a04891?q=80&w=1200&auto=format&fit=crop',
    calzone: 'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1200&auto=format&fit=crop'
  };

  for (const k of keyCandidates) {
    if (byDish[k]) return byDish[k];
  }
  // fuzzy partial match
  const found = Object.keys(byDish).find(k => keyCandidates.some(c => c.includes(k) || k.includes(c)));
  if (found) return byDish[found];
  if (cuisine) return getCuisineImage(cuisine);
  return 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1200&auto=format&fit=crop';
}

// Build a static map image URL using OpenStreetMap's public static map service.
export function getStaticMapImage(lat: number, lon: number, zoom = 15, size = { w: 600, h: 400 }): string {
  const w = Math.max(100, Math.min(1280, size.w|0));
  const h = Math.max(100, Math.min(1280, size.h|0));
  const base = 'https://staticmap.openstreetmap.de/staticmap.php';
  const query = `center=${lat},${lon}&zoom=${zoom}&size=${w}x${h}&markers=${lat},${lon},red-pushpin`;
  return `${base}?${query}`;
}
