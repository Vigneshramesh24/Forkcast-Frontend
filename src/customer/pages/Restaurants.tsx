import { Link, useNavigate, useLocation } from "react-router-dom";
import { PLACEHOLDER_RESTAURANTS as RESTS } from "@/customer/lib/placeholders";
import RestaurantCard from "@/customer/components/RestaurantCard";
import { supabase } from "@/shared/integrations/supabase/client";
import { Button } from "@/shared/components/ui/button";
import { tokenize, matchesRestaurant } from "@/customer/lib/searchUtils";

const Restaurants = () => {
  const navigate = useNavigate();

  const { search } = useLocation();
  const q = new URLSearchParams(search).get("query")?.toLowerCase() ?? "";
  const cuisineParam = new URLSearchParams(search).get("cuisine") ?? "";
  const bestParam = new URLSearchParams(search).get("best") ?? "";
  const recommendedParam = new URLSearchParams(search).get("recommended") ?? "";
  const best = bestParam.toLowerCase() === "true";
  const recommendedList = recommendedParam ? decodeURIComponent(recommendedParam).split(",").map((s) => s.trim()) : [];
  // Build the restaurants list from:
  // - current search query matches (if a query is present)
  // - recently visited restaurants (localStorage 'recent_restaurants')
  // The page should only show restaurants you've searched for or visited.
  const recentRaw = typeof window !== 'undefined' ? localStorage.getItem('recent_restaurants') : null;
  const recentIds: string[] = recentRaw ? JSON.parse(recentRaw) : [];
  const recentRestaurants = recentIds
    .map((id) => RESTS.find((r) => r.id === id))
    .filter(Boolean) as typeof RESTS;
  // apply cuisine filter to recent restaurants when a cuisine is selected
  const filteredRecentRestaurants = cuisineParam
    ? recentRestaurants.filter((r) => r && r.cuisine && r.cuisine.toLowerCase() === cuisineParam.toLowerCase())
    : recentRestaurants;

  // If there's a query, match by tokenized menu/name and also apply cuisine filter (if present)
  const tokens = q ? tokenize(q) : [];
  const queryMatches = q
    ? RESTS.filter((r) => {
        const matchesCuisine = cuisineParam ? r.cuisine.toLowerCase() === cuisineParam.toLowerCase() : true;
        return matchesCuisine && matchesRestaurant(tokens, r);
      })
    : (
        // if no query but a cuisine is selected, show restaurants of that cuisine
        cuisineParam ? RESTS.filter((r) => r.cuisine.toLowerCase() === cuisineParam.toLowerCase()) : []
      );

  // prioritize recent restaurants first (preserve their order), then add other query matches sorted by rating
  const recentSet = new Set(filteredRecentRestaurants.map((r) => r.id));
  const recentOrdered = filteredRecentRestaurants;
  const others = queryMatches.filter((r) => !recentSet.has(r.id)).sort((a, b) => (b.rating || 0) - (a.rating || 0));
  const prioritized = [...recentOrdered, ...others];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Restaurants{q ? ` — results for "${q}"` : ""}{!q && cuisineParam ? ` — ${cuisineParam}` : ""}</h1>
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/customer')}>
            ← Back
          </Button>
        </div>
      </div>

      {prioritized.length === 0 ? (
        <div className="text-sm text-muted-foreground">No restaurants found for "{q}"</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {prioritized.map((r) => (
            <div
              key={r.id}
              role="button"
              tabIndex={0}
              onClick={async () => {
                try {
                  const raw = localStorage.getItem('recent_restaurants');
                  const arr = raw ? JSON.parse(raw) : [];
                  const filtered = arr.filter((id: string) => id !== r.id);
                  filtered.unshift(r.id);
                  localStorage.setItem('recent_restaurants', JSON.stringify(filtered.slice(0, 10)));
                } catch (e) {}
                const { data: { session } } = await supabase.auth.getSession();
                const target = `/restaurants/${r.id}`;
                if (session) {
                  navigate(target);
                } else {
                  navigate(`/?force=true&redirect=${encodeURIComponent(target)}`);
                }
              }}
              onKeyDown={async (e) => { if (e.key === 'Enter') {
                try {
                  const raw = localStorage.getItem('recent_restaurants');
                  const arr = raw ? JSON.parse(raw) : [];
                  const filtered = arr.filter((id: string) => id !== r.id);
                  filtered.unshift(r.id);
                  localStorage.setItem('recent_restaurants', JSON.stringify(filtered.slice(0, 10)));
                } catch (e) {}
                const { data: { session } } = await supabase.auth.getSession();
                const target = `/restaurants/${r.id}`;
                if (session) {
                  navigate(target);
                } else {
                  navigate(`/?force=true&redirect=${encodeURIComponent(target)}`);
                }
              } }}
              className="cursor-pointer"
            >
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
      )}
    </div>
  );
};

export default Restaurants;
