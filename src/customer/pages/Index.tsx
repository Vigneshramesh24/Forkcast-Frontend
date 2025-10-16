import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/shared/integrations/supabase/client";
import Navbar from "@/customer/components/Navbar";
import Hero from "@/customer/components/Hero";
import FeaturesSection from "@/customer/components/FeaturesSection";
import NearbyRestaurants from "@/customer/components/NearbyRestaurants";
import FoodPhotoUpload from "@/customer/components/FoodPhotoUpload";
import ChatbotButton from "@/customer/components/ChatbotButton";
import { Button } from "@/shared/components/ui/button";

const Index = () => {
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/customer/auth");
      }
      setIsChecking(false);
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/customer/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  if (isChecking) {
    return null; // or a loading spinner
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      
      {/* AI Food Photo Analysis */}
      <FoodPhotoUpload />
      
      {/* Restaurants Near Me & AI Suggestions */}
      <NearbyRestaurants />
      
      {/* Why Choose ForkCastAI */}
      <FeaturesSection />

      {/* CTA Section */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Discover Your Next Favorite Restaurant?
          </h2>
          <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
            Join thousands of food lovers using AI-powered insights to find the perfect meal
          </p>
          <Button className="bg-white text-primary hover:bg-white/90">
            Get Started Free
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-secondary text-secondary-foreground py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm">&copy; 2025 ForkCastAI. All rights reserved.</p>
            <Button variant="secondary" asChild>
              <a href="tel:9153416432" className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground">
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
