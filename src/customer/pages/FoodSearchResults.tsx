import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Sparkles, Star, MapPin } from "lucide-react";
import PLACEHOLDER_RESTAURANTS, { Restaurant } from "@/customer/lib/placeholders";
import RestaurantCard from "@/customer/components/RestaurantCard";
import { Button } from "@/shared/components/ui/button";
import { getCuisineImage } from "@/customer/lib/imageUtils";

const isVideoUrl = (s: string) => /^(https?:\/\/)/i.test(s) && /(youtube\.com|youtu\.be|tiktok\.com)/i.test(s);
const CSV_PROFILE_PREFIX = 'csv_restaurant_profile:';
const slugify = (s: string) => encodeURIComponent(String(s).toLowerCase().replace(/\s+/g, '-'));

function buildAndStoreCSVProfileFromMatches(name: string, matches: any[], aiReason?: string) {
  const items = matches.filter(m => String(m.restaurant).toLowerCase() === String(name).toLowerCase());
  if (items.length === 0) return null;
  const cuisine = items[0].cuisine || '';
  const lat = typeof items[0].latitude === 'number' ? items[0].latitude : parseFloat(items[0].latitude);
  const lon = typeof items[0].longitude === 'number' ? items[0].longitude : parseFloat(items[0].longitude);
  const rating = items.reduce((s, m) => s + (Number(m.rating) || 0), 0) / items.length;
  const priceMin = Math.min(...items.map(m => Number(m.price) || 0));
  const priceMax = Math.max(...items.map(m => Number(m.price) || 0));
  const priceRange = `$${priceMin.toFixed(2)} - $${priceMax.toFixed(2)}`;
  const menu = Array.from(new Set(items.map(m => String(m.dish_name))));
  const profile = {
    name,
    cuisine,
    lat,
    lon,
    location: 'Dallas, TX',
    rating: parseFloat(rating.toFixed(1)),
    reviewCount: items.length,
    priceRange,
    description: items[0].description || '',
    menu,
    imageUrl: getCuisineImage(cuisine) || undefined,
    aiReason: aiReason || undefined,
  };
  const slug = slugify(name);
  try { localStorage.setItem(`${CSV_PROFILE_PREFIX}${slug}`, JSON.stringify(profile)); } catch {}
  return slug;
}

const CACHE_PREFIX = 'forkcast_ai_search_cache:'; // per-input cache key prefix

const FoodSearchResults = () => {
  const { search } = useLocation();
  const navigate = useNavigate();
  const params = useMemo(() => new URLSearchParams(search), [search]);
  const input = (params.get("input") || "").trim();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detectedDish, setDetectedDish] = useState<string>("");
  const [reason, setReason] = useState<string>("");
  const [top, setTop] = useState<Restaurant | null>(null);
  const [others, setOthers] = useState<Restaurant[]>([]);
  const [topRaw, setTopRaw] = useState<any | null>(null);
  const [allMatchesRaw, setAllMatchesRaw] = useState<any[]>([]);
  const [refreshTick, setRefreshTick] = useState<number>(0);

  const cacheKey = useMemo(() => `${CACHE_PREFIX}${encodeURIComponent(input)}`, [input]);

  // Try to load from cache first to avoid re-calling backend when navigating back
  useEffect(() => {
    if (!input) return;
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const data = JSON.parse(cached);
        setDetectedDish(String(data.detectedDish || ''));
        setReason(String(data.reason || ''));
        setTopRaw(data.topRaw ?? null);
        setAllMatchesRaw(Array.isArray(data.allMatchesRaw) ? data.allMatchesRaw : []);
        const topId: string | null = data.topId || null;
        const otherIds: string[] = Array.isArray(data.otherIds) ? data.otherIds : [];
        const topMapped = topId ? (PLACEHOLDER_RESTAURANTS.find(r => r.id === topId) || null) : null;
        const otherMapped = otherIds.map((id: string) => PLACEHOLDER_RESTAURANTS.find(r => r.id === id)).filter(Boolean) as Restaurant[];
        setTop(topMapped);
        setOthers(otherMapped);
        setLoading(false);
      }
    } catch {}
  }, [cacheKey, input]);

  useEffect(() => {
    const run = async () => {
      if (!input) {
        setError("No search input provided.");
        setLoading(false);
        return;
      }
      // If cache is present and we already populated state, don't refetch (unless user requested refresh)
      try {
        if (localStorage.getItem(cacheKey) && refreshTick === 0) {
          return;
        }
      } catch {}
      setLoading(true);
      setError(null);
      try {
        let data: any;
        if (isVideoUrl(input)) {
          const body = new URLSearchParams();
          body.set('url', input);
          const res = await fetch('http://localhost:8000/analyze-url/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body
          });
          data = await res.json();
        } else {
          const body = new URLSearchParams();
          body.set('description', input);
          const res = await fetch('http://localhost:8000/text-description/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body
          });
          data = await res.json();
        }

  const success = !!data?.success;
  const allMatches = Array.isArray(data?.all_matches) ? data.all_matches : [];
        const detected = String(data?.detected_food || "");
  const topRawVal = data?.top_recommendation || null;
        setDetectedDish(detected);
        setReason(String(data?.reason || ""));
  setTopRaw(topRawVal);
  setAllMatchesRaw(allMatches);

        // Map restaurants to our placeholder dataset by name
        const names = [...new Set(allMatches.map((m: any) => m.restaurant))] as string[];
        const mapped = PLACEHOLDER_RESTAURANTS.filter(r => names.some(n => n === r.name))
          .sort((a, b) => b.rating - a.rating);

        let topMapped: Restaurant | null = null;
        if (topRawVal?.restaurant) {
          topMapped = PLACEHOLDER_RESTAURANTS.find(r => r.name === topRawVal.restaurant) || null;
          if (!topMapped) {
            topMapped = PLACEHOLDER_RESTAURANTS.find(r => r.name.toLowerCase() === String(topRawVal.restaurant).toLowerCase()) || null;
          }
        }

        // Fallbacks: if no mapping, try partial includes on names; else fuzzy by dish
        let otherMapped: Restaurant[] = mapped;
        if (otherMapped.length === 0 && names.length > 0) {
          otherMapped = PLACEHOLDER_RESTAURANTS.filter(r =>
            names.some(n => r.name.toLowerCase().includes(n.toLowerCase()))
          ).sort((a, b) => b.rating - a.rating);
        }
        if (!topMapped && topRawVal?.restaurant && otherMapped.length > 0) {
          const lower = String(topRawVal.restaurant).toLowerCase();
          topMapped = otherMapped.find(r => r.name.toLowerCase().includes(lower)) || null;
        }
        if (!topMapped && !success && detected) {
          // No success; show dish-based suggestions
          const dishTokens = detected.toLowerCase().split(/\s+/);
          otherMapped = PLACEHOLDER_RESTAURANTS.filter(r =>
            dishTokens.some(t => r.description.toLowerCase().includes(t) || r.cuisine.toLowerCase().includes(t) || r.menu.some(m => m.toLowerCase().includes(t)))
          ).sort((a, b) => b.rating - a.rating);
        }

        const finalTop = topMapped;
        const finalOthers = topMapped ? otherMapped.filter(r => r.id !== topMapped!.id).slice(0, 8) : otherMapped.slice(0, 8);
        setTop(finalTop);
        setOthers(finalOthers);

        // Persist to cache for this input
        try {
          const payload = {
            detectedDish: detected,
            reason: String(data?.reason || ''),
            topRaw: topRawVal,
            allMatchesRaw: allMatches,
            topId: finalTop?.id || null,
            otherIds: finalOthers.map(r => r.id),
          };
          localStorage.setItem(cacheKey, JSON.stringify(payload));
        } catch {}
      } catch (e: any) {
        setError(e?.message || 'Failed to contact AI service.');
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [input, cacheKey, refreshTick]);

  return (
    <section className="py-12 wood-section wood-bg-section min-h-screen">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="mb-6 flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate(-1)}>← Back</Button>
          <Button
            variant="secondary"
            onClick={() => {
              try { localStorage.removeItem(cacheKey); } catch {}
              // Reset current view state and trigger re-run
              setDetectedDish("");
              setReason("");
              setTop(null);
              setOthers([]);
              setTopRaw(null);
              setAllMatchesRaw([]);
              setRefreshTick((v) => v + 1);
            }}
          >
            Refresh results
          </Button>
        </div>

        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-white drop-shadow-sm">AI Food Search</h2>
          {input && <p className="text-white/80 mt-1">Query: <span className="font-mono">{input}</span></p>}
        </div>

        {loading && (
          <div className="text-center py-12 text-white">
            <Sparkles className="h-8 w-8 mx-auto mb-3 text-primary animate-pulse" />
            Analyzing your input...
          </div>
        )}

        {!loading && error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-200 rounded p-4 text-center">
            {error}
          </div>
        )}

        {!loading && !error && (
          <div className="space-y-8">
            {detectedDish && (
              <div className="text-center text-white">
                Detected dish: <span className="font-semibold">{detectedDish}</span>
              </div>
            )}

            {top && (
              <div className="space-y-2">
                <h4 className="text-white font-semibold">Top recommendation</h4>
                <button
                  className="w-full text-left bg-white rounded-lg shadow p-4 hover:shadow-md transition"
                  onClick={() => navigate(`/restaurants/${top!.id}`)}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-semibold">{top.name}</div>
                      <div className="text-sm text-muted-foreground">{top.cuisine}</div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />{top.rating.toFixed(1)}</span>
                        <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />Nearby</span>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground max-w-[50%] line-clamp-3">{top.description}</div>
                  </div>
                </button>
              </div>
            )}

            {/* Fallback top recommendation (raw from backend) when mapping fails */}
            {!top && topRaw && (
              <div className="space-y-2">
                <h4 className="text-white font-semibold">Top recommendation</h4>
                <div className="w-full text-left bg-white rounded-lg shadow p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-semibold">{String(topRaw.restaurant)}</div>
                      <div className="text-sm text-muted-foreground">{String(topRaw.cuisine || '')}</div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        {typeof topRaw.rating === 'number' && (
                          <span className="flex items-center gap-1"><Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />{Number(topRaw.rating).toFixed(1)}</span>
                        )}
                        {typeof topRaw.price === 'number' && (
                          <span className="flex items-center gap-1">${Number(topRaw.price).toFixed(2)}</span>
                        )}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground max-w-[50%] line-clamp-3">{String(topRaw.description || '')}</div>
                  </div>
                  <div className="mt-3">
                    <Button
                      variant="secondary"
                      onClick={() => {
                        const slug = buildAndStoreCSVProfileFromMatches(String(topRaw.restaurant), allMatchesRaw, reason);
                        if (slug) navigate(`/csv-restaurant/${slug}`);
                      }}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {reason && (
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 text-white">
                <div className="font-semibold mb-1">AI Reasoning</div>
                <div className="text-sm opacity-90">{reason}</div>
              </div>
            )}

            {others.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-white font-semibold">Other places that serve this</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {others.map((r) => (
                    <div key={r.id} className="bg-card p-2 rounded cursor-pointer hover:shadow-lg transition-all hover:scale-[1.02]" onClick={() => navigate(`/restaurants/${r.id}`)}>
                      <RestaurantCard
                        name={r.name}
                        cuisine={r.cuisine}
                        rating={r.rating}
                        reviewCount={r.reviewCount}
                        priceRange={"$$"}
                        location={r.location ?? "Nearby"}
                        imageUrl={r.imageUrl}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Fallback list from raw matches if no mapped others */}
            {others.length === 0 && allMatchesRaw.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-white font-semibold">Other places that serve this</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {allMatchesRaw.slice(0, 10).map((m: any, idx: number) => (
                    <div
                      key={idx}
                      className="bg-white rounded p-3 cursor-pointer hover:shadow"
                      onClick={() => {
                        const slug = buildAndStoreCSVProfileFromMatches(String(m.restaurant), allMatchesRaw, reason);
                        if (slug) navigate(`/csv-restaurant/${slug}`);
                      }}
                    >
                      <div className="font-medium">{String(m.restaurant)}</div>
                      <div className="text-sm text-muted-foreground">{String(m.cuisine || '')}</div>
                      <div className="text-xs text-muted-foreground">{String(m.dish_name || '')}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!top && others.length === 0 && (
              <div className="text-center text-white/80">No restaurants found. Try another dish or link.</div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default FoodSearchResults;
