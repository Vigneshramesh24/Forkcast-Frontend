import { MapPin, TrendingUp } from "lucide-react";
import RestaurantCard from "./RestaurantCard";
import LocationDetector from "./LocationDetector";

const NearbyRestaurants = () => {
  // Placeholder data - will be replaced with Google Maps AI API
  const nearbyRestaurants = [
    {
      name: "Sakura Sushi House",
      cuisine: "Japanese",
      rating: 4.8,
      reviewCount: 342,
      priceRange: "$$$",
      location: "Downtown, 2.3 mi",
      imageUrl: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800&h=600&fit=crop",
      distance: "2.3 mi",
    },
    {
      name: "La Bella Pizza",
      cuisine: "Italian",
      rating: 4.6,
      reviewCount: 521,
      priceRange: "$$",
      location: "North Side, 1.8 mi",
      imageUrl: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&h=600&fit=crop",
      distance: "1.8 mi",
    },
    {
      name: "The Burger Joint",
      cuisine: "American",
      rating: 4.7,
      reviewCount: 687,
      priceRange: "$$",
      location: "City Center, 0.5 mi",
      imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&h=600&fit=crop",
      distance: "0.5 mi",
    },
    {
      name: "Taco Fiesta",
      cuisine: "Mexican",
      rating: 4.5,
      reviewCount: 289,
      priceRange: "$",
      location: "West End, 3.1 mi",
      imageUrl: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800&h=600&fit=crop",
      distance: "3.1 mi",
    },
  ];

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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {nearbyRestaurants.map((restaurant, index) => (
              <RestaurantCard key={index} {...restaurant} />
            ))}
          </div>
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
