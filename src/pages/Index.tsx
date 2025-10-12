import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import FeaturesSection from "@/components/FeaturesSection";
import RestaurantCard from "@/components/RestaurantCard";

const Index = () => {
  // Sample restaurant data
  const sampleRestaurants = [
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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <FeaturesSection />

      {/* Featured Restaurants */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-foreground">
            Popular Near You
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {sampleRestaurants.map((restaurant, index) => (
              <RestaurantCard key={index} {...restaurant} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Discover Your Next Favorite Restaurant?
          </h2>
          <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
            Join thousands of food lovers using AI-powered insights to find the perfect meal
          </p>
          <button className="bg-white text-primary px-8 py-3 rounded-lg font-semibold hover:bg-white/90 transition-colors">
            Get Started Free
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-secondary text-secondary-foreground py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm">&copy; 2025 ForkCastAI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
