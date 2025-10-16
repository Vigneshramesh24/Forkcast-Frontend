import { MapPin, TrendingUp, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import RestaurantCard from "./RestaurantCard";
import LocationDetector from "./LocationDetector";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const NearbyRestaurants = () => {
  const { toast } = useToast();
  const [restaurants] = useState<any[]>([
    {
      name: "Bella Italia",
      types: ["italian", "restaurant"],
      rating: 4.5,
      user_ratings_total: 234,
      price_level: 2,
      vicinity: "123 Main St, Downtown",
      place_id: "1"
    },
    {
      name: "Sushi Paradise",
      types: ["japanese", "sushi"],
      rating: 4.8,
      user_ratings_total: 456,
      price_level: 3,
      vicinity: "456 Oak Ave, Midtown",
      place_id: "2"
    },
    {
      name: "Taco Fiesta",
      types: ["mexican", "restaurant"],
      rating: 4.3,
      user_ratings_total: 189,
      price_level: 1,
      vicinity: "789 Pine Rd, East Side",
      place_id: "3"
    },
    {
      name: "The Burger Joint",
      types: ["american", "burgers"],
      rating: 4.6,
      user_ratings_total: 312,
      price_level: 2,
      vicinity: "321 Elm St, West End",
      place_id: "4"
    },
    {
      name: "Dragon Wok",
      types: ["chinese", "asian"],
      rating: 4.4,
      user_ratings_total: 267,
      price_level: 2,
      vicinity: "654 Maple Dr, North Side",
      place_id: "5"
    },
    {
      name: "Pizza Palace",
      types: ["pizza", "italian"],
      rating: 4.7,
      user_ratings_total: 398,
      price_level: 2,
      vicinity: "987 Cedar Ln, South End",
      place_id: "6"
    },
    {
      name: "Thai Orchid",
      types: ["thai", "asian"],
      rating: 4.5,
      user_ratings_total: 223,
      price_level: 2,
      vicinity: "159 Birch St, Central",
      place_id: "7"
    },
    {
      name: "Steakhouse Prime",
      types: ["steakhouse", "american"],
      rating: 4.9,
      user_ratings_total: 512,
      price_level: 4,
      vicinity: "753 Walnut Ave, Uptown",
      place_id: "8"
    }
  ]);
  const [loading] = useState(false);

  const suggestions = [
    {
      name: "Green Garden Cafe",
      cuisine: "Healthy",
      rating: 4.9,
      reviewCount: 156,
      priceRange: "$$",
      location: "Uptown, 1.2 mi",
      imageUrl: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&h=600&fit=crop",
      distance: "1.2 mi",
    },
    {
      name: "Spice Kingdom",
      cuisine: "Indian",
      rating: 4.7,
      reviewCount: 423,
      priceRange: "$$",
      location: "East Side, 2.8 mi",
      imageUrl: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&h=600&fit=crop",
      distance: "2.8 mi",
    },
  ];

  return (
    <section className="py-12 bg-background">
      <div className="container mx-auto px-4 space-y-12">
        {/* Restaurants Near Me */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2 flex items-center gap-2">
                <MapPin className="h-6 w-6 text-primary" />
                Restaurants Near You
              </h2>
              <LocationDetector />
            </div>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">Finding restaurants near you...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {restaurants.length > 0 ? (
                restaurants.map((restaurant, index) => (
                  <RestaurantCard
                    key={restaurant.place_id || index}
                    name={restaurant.name}
                    cuisine={restaurant.types?.[0]?.replace(/_/g, ' ') || "Restaurant"}
                    rating={restaurant.rating || 0}
                    reviewCount={restaurant.user_ratings_total || 0}
                    priceRange={restaurant.price_level ? "$".repeat(restaurant.price_level) : "$$"}
                    location={restaurant.vicinity || "Nearby"}
                    imageUrl={
                      restaurant.photos?.[0]
                        ? `https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=600&fit=crop`
                        : "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=600&fit=crop"
                    }
                    distance="Nearby"
                  />
                ))
              ) : (
                <div className="col-span-full text-center py-12 text-muted-foreground">
                  No restaurants found nearby. Try adjusting your location.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Food Suggestions */}
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6 flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-primary" />
            AI-Powered Suggestions
          </h2>
          <p className="text-muted-foreground mb-6">
            Based on your preferences and popular choices
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {suggestions.map((restaurant, index) => (
              <RestaurantCard key={index} {...restaurant} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default NearbyRestaurants;
