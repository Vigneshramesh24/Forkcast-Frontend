import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import FeaturesSection from "@/components/FeaturesSection";
import NearbyRestaurants from "@/components/NearbyRestaurants";
import FoodPhotoUpload from "@/components/FoodPhotoUpload";
import ChatbotButton from "@/components/ChatbotButton";
import { Button } from "@/components/ui/button";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      
      {/* Restaurants Near Me & AI Suggestions */}
      <NearbyRestaurants />
      
      {/* Why Choose ForkCastAI */}
      <FeaturesSection />
      
      {/* AI Food Photo Analysis */}
      <FoodPhotoUpload />

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
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm">&copy; 2025 ForkCastAI. All rights reserved.</p>
            <Button variant="outline" asChild>
              <a href="tel:9153416432" className="flex items-center gap-2">
                Contact Us: (915) 341-6432
              </a>
            </Button>
          </div>
        </div>
      </footer>

      {/* Floating Chatbot */}
      <ChatbotButton />
    </div>
  );
};

export default Index;
