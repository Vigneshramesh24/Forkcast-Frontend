import { useParams, useNavigate } from "react-router-dom";
import PLACEHOLDER_RESTAURANTS, { Restaurant } from "@/customer/lib/placeholders";
import { useState, useEffect, useRef } from "react";
import { Textarea } from "@/shared/components/ui/textarea";
import { Star } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { getDishImage, getStaticMapImage, getCuisineImage, MAP_PLACEHOLDER } from "@/customer/lib/imageUtils";

const RestaurantDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const restaurant: Restaurant | undefined = PLACEHOLDER_RESTAURANTS.find((r) => r.id === id);
  const [reviews, setReviews] = useState(restaurant?.reviews ?? []);
  const [avgRating, setAvgRating] = useState<number>(restaurant ? restaurant.rating : 0);
  const [reviewCount, setReviewCount] = useState<number>(restaurant ? restaurant.reviewCount : 0);
  const [userRating, setUserRating] = useState<number>(0);
  const [userComment, setUserComment] = useState<string>("");

  if (!restaurant) {
    return (
      <div className="container mx-auto p-8">
        <h2 className="text-xl font-semibold">Restaurant not found</h2>
        <p className="text-muted-foreground">We couldn't find that restaurant.</p>
        <Button onClick={() => navigate(-1)} className="mt-4">Go back</Button>
      </div>
    );
  }

  const submitReview = () => {
    if (userRating === 0 || userComment.trim() === "") return;
    const newReview = {
      id: `rv-${Date.now()}`,
      author: "You",
      rating: userRating,
      text: userComment.trim(),
    };
    setReviews((r) => [newReview, ...r]);
    // update aggregated rating
    const newCount = reviewCount + 1;
    const newAvg = parseFloat(((avgRating * reviewCount + userRating) / newCount).toFixed(1));
    setReviewCount(newCount);
    setAvgRating(newAvg);
    // reset inputs
    setUserRating(0);
    setUserComment("");
  };

  // Smooth-scroll to top, focus the H1 for accessibility, and fade-in the top content
  const titleRef = useRef<HTMLHeadingElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // reset visibility, then animate in
    setVisible(false);
    try {
      window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    } catch (e) {
      try { window.scrollTo(0, 0); } catch (e) {}
    }

    // small timeout so the browser has scrolled before we focus and show animation
    const t = setTimeout(() => {
      setVisible(true);
      try {
        if (titleRef.current) {
          // make it programmatically focusable and move focus for screen readers
          titleRef.current.tabIndex = -1;
          titleRef.current.focus({ preventScroll: true } as any);
        }
      } catch (e) {
        // ignore focus errors
      }
    }, 150);

    return () => clearTimeout(t);
  }, [id]);

  return (
    <div className="container mx-auto p-8">
      {/* Back button to customer homepage */}
      <div className="mb-4">
        <Button variant="ghost" onClick={() => navigate('/customer')}>← Back to Home</Button>
      </div>
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1">
          <div className="relative rounded-lg overflow-hidden shadow">
            <img src={restaurant.imageUrl} alt={restaurant.name} className="w-full h-64 object-cover" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/40" />
            <div className="absolute left-6 bottom-6 text-white">
              <h1
                ref={titleRef}
                className={`text-3xl font-bold drop-shadow transition-opacity transition-transform ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}
              >
                {restaurant.name}
              </h1>
              <div className={`text-sm ${visible ? 'opacity-90' : 'opacity-0'}`}>{restaurant.cuisine} $$ • {restaurant.location}</div>
            </div>
            <div className="absolute top-4 right-4 bg-white/95 rounded px-3 py-1 flex items-center gap-2">
              <Star className="h-5 w-5 fill-primary text-primary" />
              <div className="font-semibold">{avgRating} • {reviewCount}</div>
            </div>
          </div>

          <p className="mt-4 text-muted-foreground">{restaurant.description}</p>

          {/* Menu with accurate images */}
          <h3 className="mt-6 font-semibold">Menu</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
            {restaurant.menu.map((m, idx) => (
              <div key={m} className="bg-card rounded-lg p-3 text-center shadow-sm">
                <div className="h-24 mb-2 bg-gray-100 rounded overflow-hidden flex items-center justify-center">
                  <img
                    src={
                      (restaurant.menuImages && restaurant.menuImages[m])
                        || getDishImage(m, restaurant.cuisine)
                        || getCuisineImage(restaurant.cuisine)
                    }
                    alt={m}
                    className="object-cover h-full w-full"
                  />
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

        {/* Right column: business info + map */}
        <div className="w-full md:w-80 flex-shrink-0 space-y-4">
          <div className="bg-card rounded-lg p-4 shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="font-semibold">Info</div>
            </div>
            <div className="space-y-2 text-sm">
              {restaurant.priceRange && (
                <div><span className="text-muted-foreground">Price:</span> {restaurant.priceRange}</div>
              )}
              {restaurant.phone && (
                <div><span className="text-muted-foreground">Phone:</span> {restaurant.phone}</div>
              )}
              {restaurant.location && (
                <div><span className="text-muted-foreground">Address:</span> {restaurant.location}</div>
              )}
            </div>
            {restaurant.hours && (
              <div className="mt-3">
                <div className="text-sm font-medium mb-1">Hours</div>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {Object.entries(restaurant.hours).map(([day, hrs]) => (
                    <li key={day} className="flex justify-between"><span>{day}</span><span>{hrs}</span></li>
                  ))}
                </ul>
              </div>
            )}
            <div className="mt-3 flex gap-2">
              {restaurant.phone && (
                <Button asChild variant="outline">
                  <a href={`tel:${restaurant.phone.replace(/[^\d+]/g, '')}`}>Call</a>
                </Button>
              )}
              {restaurant.website && (
                <Button asChild>
                  <a href={restaurant.website} target="_blank" rel="noreferrer">Website</a>
                </Button>
              )}
            </div>
            {/* Popular dishes preview */}
            {restaurant.menu?.length ? (
              <div className="mt-4">
                <div className="text-sm font-medium mb-2">Popular dishes</div>
                <div className="grid grid-cols-2 gap-2">
                  {restaurant.menu.slice(0, 2).map((m, i) => (
                    <div key={m} className="rounded overflow-hidden h-20">
                      <img
                        src={(restaurant.menuImages && restaurant.menuImages[m]) || getDishImage(m, restaurant.cuisine)}
                        alt={m}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <div className="bg-card rounded-lg p-4 shadow">
            <div className="flex items-center justify-between mb-2">
              <div className="font-semibold">Map</div>
            </div>
            {/* Map image (uses restaurant.mapUrl if available) */}
            <div className="h-48 rounded overflow-hidden">
              <img
                src={MAP_PLACEHOLDER}
                alt={`Map of ${restaurant.name}`}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="mt-3 flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  if (restaurant.lat && restaurant.lon) {
                    const url = `https://www.google.com/maps/search/?api=1&query=${restaurant.lat},${restaurant.lon}`;
                    window.open(url, "_blank", "noopener");
                  } else if (restaurant.location) {
                    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(restaurant.location)}`;
                    window.open(url, "_blank", "noopener");
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

export default RestaurantDetail;
