import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Search } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PLACEHOLDER_RESTAURANTS, { Restaurant } from "@/customer/lib/placeholders";
import { tokenize, matchesRestaurant } from "@/customer/lib/searchUtils";

const Hero = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Restaurant[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const debounceRef = useRef<number | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const [cuisine, setCuisine] = useState<string>("");

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (results.length === 0) return;
      setHighlightedIndex((i) => (i + 1) % results.length);
      // move focus into listbox if not already
      if (document.activeElement !== listRef.current) {
        listRef.current?.focus();
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (results.length === 0) return;
      setHighlightedIndex((i) => (i <= 0 ? results.length - 1 : i - 1));
      if (document.activeElement !== listRef.current) {
        listRef.current?.focus();
      }
    } else if (e.key === "Escape") {
      setResults([]);
      setHighlightedIndex(-1);
      // return focus to input
      (inputRef.current as HTMLElement | null)?.focus?.();
    } else if (e.key === "Enter") {
      if (highlightedIndex >= 0 && results[highlightedIndex]) {
        const r = results[highlightedIndex];
        try {
          const raw = localStorage.getItem('recent_restaurants');
          const arr = raw ? JSON.parse(raw) : [];
          const filtered = arr.filter((id: string) => id !== r.id);
          filtered.unshift(r.id);
          localStorage.setItem('recent_restaurants', JSON.stringify(filtered.slice(0, 10)));
        } catch (e) {}
        navigate(`/restaurants/${r.id}`);
        setResults([]);
        setHighlightedIndex(-1);
      } else {
        doSearch();
      }
    }
  };

  const doSearch = () => {
    const q = query.trim().toLowerCase();
    if (!q) {
      setResults([]);
      return;
    }
    // tokenized + fuzzy matching: use searchUtils.matchesRestaurant
    const tokens = tokenize(q);
    const matched = PLACEHOLDER_RESTAURANTS.filter((r) => {
      const matchesCuisine = cuisine ? r.cuisine.toLowerCase() === cuisine.toLowerCase() : true;
      const matchedText = matchesRestaurant(tokens, r);
      return matchesCuisine && matchedText;
    });
    setResults(matched);
    // navigate to Restaurants page with query so results persist across pages
    const params = new URLSearchParams();
    params.set("query", q);
    if (cuisine) params.set("cuisine", cuisine);
    navigate(`/restaurants?${params.toString()}`);
  };

  // cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, []);

  return (
    <section
      className="relative h-[500px] md:h-[600px] overflow-hidden wood-bg-section"
    >
      {/* Readability overlay; background is provided by page-level .wood-bg */}
  <div className="absolute inset-0 bg-black/10" aria-hidden="true" />

  {/* Content */}
      <div className="relative container mx-auto px-4 h-full flex flex-col justify-center items-center text-center">
  <h1 className="text-4xl md:text-6xl font-bold text-white drop-shadow-md tracking-tight leading-[1.05] mb-4">
          Discover Amazing Food
        </h1>
  <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl drop-shadow-sm">
          AI-powered reviews and insights to help you find the perfect meal
        </p>

    {/* Search Bar (location temporarily removed). Suggestions appear while typing. */}
  <div className="w-full max-w-3xl bg-white/95 backdrop-saturate-150 rounded-xl shadow-2xl p-2 flex flex-col md:flex-row gap-2 relative transition-shadow focus-within:shadow-[0_12px_40px_rgba(2,6,23,0.35)] focus-within:ring-4 focus-within:ring-primary/20 focus-within:ring-offset-2 focus-within:ring-offset-transparent">
          <div className="flex-1 flex items-center px-3 pb-2 md:pb-0 relative">
            <Search className="h-5 w-5 text-muted-foreground mr-2" />
            <Input
              type="text"
              placeholder="Pizza, Sushi, Burgers..."
              value={query}
              onChange={(e) => {
                const val = e.target.value;
                setQuery(val);
                // debounce the suggestions
                if (debounceRef.current) window.clearTimeout(debounceRef.current);
                debounceRef.current = window.setTimeout(() => {
                  const q = val.trim().toLowerCase();
                  if (!q) {
                    setResults([]);
                    setHighlightedIndex(-1);
                    return;
                  }
                    const tokens = tokenize(q);
                    const matched = PLACEHOLDER_RESTAURANTS.filter((r) => {
                      const matchesCuisine = cuisine ? r.cuisine.toLowerCase() === cuisine.toLowerCase() : true;
                      return matchesCuisine && matchesRestaurant(tokens, r);
                    });
                    setResults(matched.slice(0, 6));
                  setHighlightedIndex(-1);
                }, 200);
              }}
              onKeyDown={handleKeyDown}
              ref={(el: any) => (inputRef.current = el)}
              className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            />

            {/* Suggestions dropdown */}
            {query.trim() !== "" && (
              <div
                role="listbox"
                aria-label="Search suggestions"
                tabIndex={-1}
                ref={(el) => (listRef.current = el)}
                onKeyDown={handleKeyDown}
                className="absolute left-3 right-3 top-full mt-2 bg-white border rounded-lg shadow-lg z-50 max-h-56 overflow-auto"
              >
                {results.length > 0 ? (
                  results.map((r, idx) => (
                    <button
                      key={r.id}
                      role="option"
                      aria-selected={highlightedIndex === idx}
                      onMouseEnter={() => setHighlightedIndex(idx)}
                      onMouseLeave={() => setHighlightedIndex(-1)}
                      onClick={() => {
                        try {
                          const raw = localStorage.getItem('recent_restaurants');
                          const arr = raw ? JSON.parse(raw) : [];
                          const filtered = arr.filter((id: string) => id !== r.id);
                          filtered.unshift(r.id);
                          localStorage.setItem('recent_restaurants', JSON.stringify(filtered.slice(0, 10)));
                        } catch (e) {}
                        // SPA navigation using react-router
                        navigate(`/restaurants/${r.id}`);
                        setResults([]);
                        setHighlightedIndex(-1);
                      }}
                      tabIndex={0}
                      className={`w-full text-left px-3 py-2 focus:outline-none ${highlightedIndex === idx ? 'bg-slate-100' : 'hover:bg-slate-50'}`}
                    >
                      <div className="font-medium">{r.name}</div>
                      <div className="text-xs text-muted-foreground">{r.cuisine} • {r.menu.join(", ")}</div>
                    </button>
                  ))
                ) : (
                  <div className="px-3 py-2 text-sm text-muted-foreground">No suggestions</div>
                )}
              </div>
            )}
          </div>

          <Button size="lg" className="bg-primary hover:bg-primary/90 md:w-auto w-full" onClick={doSearch}>
            <Search className="h-5 w-5 md:mr-2" />
            <span className="hidden md:inline">Search</span>
          </Button>
        </div>

        {/* Cuisine selector (replaces quick links) */}
        <div className="mt-6 w-full max-w-3xl">
          <div className="flex items-center justify-center">
            <label className="text-sm text-white/90 mr-3">Cuisine</label>
            <select
              value={cuisine}
              onChange={(e) => {
                setCuisine(e.target.value);
                // when cuisine changes, update suggestions immediately based on current query
                const q = query.trim().toLowerCase();
                if (!q) {
                  // if no query, show top restaurants for selected cuisine
                  if (!e.target.value) setResults([]);
                  else {
                    const matched = PLACEHOLDER_RESTAURANTS.filter((r) => r.cuisine.toLowerCase() === e.target.value.toLowerCase());
                    setResults(matched.slice(0, 6));
                  }
                  return;
                }
                const matched = PLACEHOLDER_RESTAURANTS.filter((r) => {
                  const matchesMenu = r.menu.some((m) => m.includes(q) || q.includes(m));
                  const matchesCuisine = e.target.value ? r.cuisine.toLowerCase() === e.target.value.toLowerCase() : true;
                  return matchesMenu && matchesCuisine;
                });
                setResults(matched.slice(0, 6));
              }}
              className="rounded-md px-3 py-2 bg-white text-sm"
            >
              <option value="">All</option>
              <option value="Italian">Italian</option>
              <option value="Japanese">Japanese</option>
              <option value="Mexican">Mexican</option>
              <option value="American">American</option>
            </select>
          </div>
        </div>
      </div>

        {/* Search results (placeholder) */}
      <div className="relative container mx-auto px-4 mt-6 max-w-3xl">
        {results.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {results.map((r) => (
              <div key={r.id} className="bg-white rounded-lg shadow p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-semibold">{r.name}</div>
                    <div className="text-sm text-muted-foreground">{r.cuisine} • {r.description}</div>
                  </div>
                  <div className="text-xs text-muted-foreground">{r.menu.join(", ")}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          query && <div className="text-sm text-muted-foreground">No restaurants found for "{query}"</div>
        )}
      </div>
    </section>
  );
};

export default Hero;
