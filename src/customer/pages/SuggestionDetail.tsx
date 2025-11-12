import { useLocation, useNavigate } from "react-router-dom";
import PLACEHOLDER_RESTAURANTS, { Restaurant, Review } from "@/customer/lib/placeholders";
import { useEffect, useMemo, useState, useRef } from "react";
import { Star } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Textarea } from "@/shared/components/ui/textarea";

const parseQuery = (search: string) => {
  const p = new URLSearchParams(search);
  return {
    name: p.get("name") || "",
    cuisine: p.get("cuisine") || "",
    rating: parseFloat(p.get("rating") || "0") || 0,
    reviewCount: parseInt(p.get("reviewCount") || "0") || 0,
    priceRange: p.get("priceRange") || "",
    location: p.get("location") || "",
    imageUrl: p.get("imageUrl") || "",
  };
};

const SuggestionDetail = () => {
  const { search } = useLocation();
  const navigate = useNavigate();
  const suggested = useMemo(() => parseQuery(search), [search]);

  // if a placeholder restaurant exists with this name, use it (so suggestions map to real restaurants)
  const placeholder: Restaurant | undefined = PLACEHOLDER_RESTAURANTS.find((r) =>
    r.name.toLowerCase() === suggested.name.toLowerCase()
  );

  // cuisine-based fallback images (unsplash curated links)
  const CUISINE_IMAGE_MAP: Record<string, string[]> = {
    indian: [
      'https://images.unsplash.com/photo-1604908177522-6a3f9abf8d3b?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1603133872879-7f9b1d1f0e7d?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1523986371872-9d3ba2e2f642?q=80&w=1200&auto=format&fit=crop',
    ],
    italian: [
      'https://images.unsplash.com/photo-1548365328-6d1b34b4d6b7?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=1200&auto=format&fit=crop',
    ],
    japanese: [
      'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1200&auto=format&fit=crop',
    ],
    mexican: [
      'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1200&auto=format&fit=crop',
    ],
    default: [
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1517244683847-5f9a0c4f6d0a?q=80&w=1200&auto=format&fit=crop',
    ],
  };

  const MAP_IMAGES = [
    'https://images.unsplash.com/photo-1509395176047-4a66953fd231?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1528909514045-2fa4ac7a08ba?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=1200&auto=format&fit=crop',
  ];

  // choose gallery images: prefer provided imageUrl, otherwise pick from cuisine map
  const cuisineKey = (suggested.cuisine || '').toLowerCase();
  const fallbackImages = CUISINE_IMAGE_MAP[cuisineKey] ?? CUISINE_IMAGE_MAP['default'];
  const chosenGallery = suggested.imageUrl && suggested.imageUrl.length > 0 ? [suggested.imageUrl] : fallbackImages.slice(0, 3);

  const chosenMap = MAP_IMAGES[Math.abs((suggested.name || '').split('').reduce((s, c) => s + c.charCodeAt(0), 0)) % MAP_IMAGES.length];

  // helper: generate more realistic synthetic reviews when suggestion is not a placeholder
  const generateSyntheticReviews = (name: string, cuisine: string, count = 4) => {
    // Use fixed, cuisine-aware snippets so synthetic reviews resemble real restaurant reviews.
    const authors = ["Alex","Sam","Priya","Liam","Mina","Diego","Olivia","Noah","Asha","Ethan","Lena","Marco","Nok","Hua","Ava"];
    const perCuisine: Record<string, string[]> = {
      indian: [
        `The biryani here is outstanding — layers of flavor and perfect rice.`,
        `Amazing curries, spices are balanced and fragrant.`,
        `Loved the naan and the service was warm.`,
        `Great spot for group dinners — portions are generous.`,
      ],
      italian: [
        `Pasta was al dente and the sauce tasted homemade.`,
        `Cozy vibe and excellent wine list.`,
        `Pizza crust had a great chew and char.`,
        `Fantastic tiramisu to finish the meal.`,
      ],
      japanese: [
        `Sushi was impeccably fresh and beautifully presented.`,
        `The ramen has deep, savory broth — highly recommend.`,
        `Nice selection of sake and attentive service.`,
        `Great omakase experience.`,
      ],
      mexican: [
        `Street-style tacos hit the spot — full of flavor.`,
        `Salsas were vibrant and the margaritas were well-made.`,
        `Casual spot with great late-night options.`,
        `Good value and bold flavors.`,
      ],
      default: [
        `Delicious food and friendly staff.`,
        `Really enjoyed the atmosphere and the dishes.`,
        `Solid choice for a casual meal with friends.`,
        `Would definitely recommend and return.`,
      ],
    };

    const pool = perCuisine[(cuisine || '').toLowerCase()] ?? perCuisine['default'];
    const out: Review[] = [];
    // deterministic selection: base on char codes of name to pick starting index
    const seed = Math.abs((name || '').split('').reduce((s, c) => s + c.charCodeAt(0), 0));
    for (let i = 0; i < count; i++) {
      const author = authors[(seed + i) % authors.length];
      const rating = Math.max(3, Math.min(5, Math.round((suggested.rating || 4) + ((i % 3) - 1))));
      const text = pool[(seed + i) % pool.length];
      out.push({ id: `sgen-${(seed + i)}-${Date.now()}`, author, rating, text });
    }
    return out;
  };

  const initialReviews: Review[] = placeholder
    ? placeholder.reviews
    : generateSyntheticReviews(suggested.name || 'Suggested Restaurant', suggested.cuisine || 'Various', 4);

  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [userRating, setUserRating] = useState(0);
  const [userComment, setUserComment] = useState("");
  const titleRef = useRef<HTMLHeadingElement | null>(null);
  const [visible, setVisible] = useState(false);

  // derive avg rating and count from either placeholder or suggestion data
  const initialAvg = placeholder ? placeholder.rating : (reviews.length ? parseFloat((reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length).toFixed(1)) : (suggested.rating || 0));
  const initialCount = placeholder ? placeholder.reviewCount : (reviews.length || suggested.reviewCount || 0);
  const [avgRating, setAvgRating] = useState<number>(initialAvg);
  const [reviewCount, setReviewCount] = useState<number>(initialCount);

  useEffect(() => {
    // scroll to top and animate in
    try {
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    } catch (e) {
      try { window.scrollTo(0,0); } catch (e) {}
    }
    setVisible(false);
    const t = setTimeout(() => {
      setVisible(true);
      try {
        if (titleRef.current) {
          titleRef.current.tabIndex = -1;
          titleRef.current.focus({ preventScroll: true } as any);
        }
      } catch (e) {}
    }, 120);
    return () => clearTimeout(t);
  }, [search]);

  const submitReview = () => {
    if (userRating === 0 || userComment.trim() === "") return;
    const r: Review = { id: `s-${Date.now()}`, author: 'You', rating: userRating, text: userComment.trim() };
    setReviews((s) => [r, ...s]);
    // update aggregated rating
    const newCount = reviewCount + 1;
    const newAvg = parseFloat(((avgRating * reviewCount + userRating) / newCount).toFixed(1));
    setReviewCount(newCount);
    setAvgRating(newAvg);
    setUserRating(0);
    setUserComment("");
  };

  // If placeholder exists, render RestaurantDetail-like view using that data.
  const dataSource: Restaurant = placeholder || {
    id: `suggestion-${encodeURIComponent(suggested.name)}`,
    name: suggested.name || 'Suggestion',
    cuisine: suggested.cuisine || 'Various',
    description: suggested.name ? `Suggested restaurant: ${suggested.name}` : 'AI suggestion',
    menu: [],
    imageUrl: placeholder ? placeholder.imageUrl : (chosenGallery[0] || ''),
    gallery: placeholder ? placeholder.gallery : chosenGallery,
    mapUrl: placeholder ? placeholder.mapUrl : (
      // If a Google Maps Static API key is provided in env, build a static maps URL; otherwise use a curated map image
      (import.meta.env.VITE_GOOGLE_MAPS_KEY && suggested.name)
        ? `https://maps.googleapis.com/maps/api/staticmap?center=${encodeURIComponent(suggested.name + ' ' + (suggested.location || ''))}&zoom=15&size=1200x600&markers=color:red%7C${encodeURIComponent(suggested.name + ' ' + (suggested.location || ''))}&key=${import.meta.env.VITE_GOOGLE_MAPS_KEY}`
        : chosenMap
    ),
    location: suggested.location || '',
    rating: avgRating,
    reviewCount: reviewCount,
    reviews,
  } as Restaurant;

  return (
    <div className="container mx-auto p-8">
      <div className="mb-4">
        <Button variant="ghost" onClick={() => navigate(-1)}>← Back</Button>
      </div>
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1">
          <div className="relative rounded-lg overflow-hidden shadow">
            {dataSource.imageUrl ? (
              <img src={dataSource.imageUrl} alt={dataSource.name} className="w-full h-64 object-cover" />
            ) : (
              <div className="w-full h-64 bg-gray-100" />
            )}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/40" />
            <div className="absolute left-6 bottom-6 text-white">
              <h1 ref={titleRef} className={`text-3xl font-bold drop-shadow transition-opacity transition-transform ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>{dataSource.name}</h1>
              <div className={`text-sm ${visible ? 'opacity-90' : 'opacity-0'}`}>{dataSource.cuisine} • {dataSource.location}</div>
            </div>
            <div className="absolute top-4 right-4 bg-white/95 rounded px-3 py-1 flex items-center gap-2">
              <Star className="h-5 w-5 fill-primary text-primary" />
              <div className="font-semibold">{avgRating} • {reviewCount}</div>
            </div>
          </div>

          <p className="mt-4 text-muted-foreground">{dataSource.description}</p>

          {/* Menu with images (placeholder) */}
          <h3 className="mt-6 font-semibold">Menu</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
            {dataSource.menu.map((m, idx) => (
              <div key={m} className="bg-card rounded-lg p-3 text-center shadow-sm">
                <div className="h-24 mb-2 bg-gray-100 rounded overflow-hidden flex items-center justify-center">
                  <img src={dataSource.gallery?.[idx % dataSource.gallery.length] ?? dataSource.imageUrl} alt={m} className="object-cover h-full w-full" />
                </div>
                <div className="font-medium">{m}</div>
              </div>
            ))}
          </div>

          {/* Reviews */}
          <h3 className="mt-6 font-semibold">Reviews</h3>
          <div className="mt-3 space-y-3">
            {reviews.map((rv) => (
              <div key={rv.id} className="bg-white border rounded-lg p-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-primary">{rv.author.charAt(0)}</div>
                    <div>
                      <div className="font-medium">{rv.author}</div>
                      <div className="text-sm text-muted-foreground">{rv.text}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-primary text-primary" />
                    <span className="text-sm font-semibold">{rv.rating}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Submit a review */}
          <div className="mt-6 bg-card rounded-lg p-4">
            <h4 className="font-semibold mb-2">Rate this restaurant</h4>
            <div className="flex items-center gap-3 mb-3">
              {[1, 2, 3, 4, 5].map((s) => (
                <button key={s} onClick={() => setUserRating(s)} className="transition-transform hover:scale-110 focus:outline-none">
                  <Star className={`h-7 w-7 ${s <= userRating ? 'fill-primary text-primary' : 'text-muted-foreground'}`} />
                </button>
              ))}
            </div>
            <Textarea value={userComment} onChange={(e) => setUserComment(e.target.value)} placeholder="Write a short review..." className="mb-3" />
            <div className="flex gap-2">
              <Button onClick={submitReview} disabled={userRating === 0 || userComment.trim() === ""}>Submit Review</Button>
              <Button variant="ghost" onClick={() => { setUserComment(""); setUserRating(0); }}>Cancel</Button>
            </div>
          </div>
        </div>

        {/* Right column: gallery + map placeholder */}
        <div className="w-full md:w-80 flex-shrink-0 space-y-4">
          <div className="bg-card rounded-lg p-2 shadow">
            <div className="grid grid-cols-1 gap-2">
              {dataSource.gallery.map((g, i) => (
                <img key={i} src={g} alt={`${dataSource.name}-${i}`} className="w-full h-28 object-cover rounded" />
              ))}
            </div>
          </div>

          <div className="bg-card rounded-lg p-4 shadow">
            <div className="flex items-center justify-between mb-2">
              <div className="font-semibold">Map</div>
            </div>
            {/* Map image (uses restaurant.mapUrl if available) */}
            <div className="h-48 rounded overflow-hidden">
              <img src={dataSource.mapUrl ?? dataSource.gallery[0]} alt={`Map of ${dataSource.name}`} className="w-full h-full object-cover" />
            </div>
            <div className="mt-3 flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  if (dataSource.mapUrl) {
                    window.open(dataSource.mapUrl, "_blank", "noopener");
                  }
                }}
              >
                Open in maps
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuggestionDetail;
