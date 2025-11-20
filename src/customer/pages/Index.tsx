import { useEffect, useState, Suspense, lazy } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/shared/integrations/supabase/client";
import Navbar from "@/customer/components/Navbar";
import Hero from "@/customer/components/Hero";
const FeaturesSection = lazy(() => import("@/customer/components/FeaturesSection"));
const NearbyRestaurants = lazy(() => import("@/customer/components/NearbyRestaurants"));
const FoodPhotoUpload = lazy(() => import("@/customer/components/FoodPhotoUpload"));
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
        navigate("/");
      }
      setIsChecking(false);
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  if (isChecking) {
    return null; // or a loading spinner
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <Hero />
      {/* Continuous wood background through all sections */}
      {/* AI Food Photo Analysis */}
      <Suspense fallback={<div className="container mx-auto px-4 py-12 text-white/80">Loading…</div>}>
        <FoodPhotoUpload />
      </Suspense>

      {/* Restaurants Near Me & AI Suggestions */}
      <Suspense fallback={<div className="container mx-auto px-4 py-12 text-white/80">Loading nearby restaurants…</div>}>
        <NearbyRestaurants />
      </Suspense>

      {/* Why Choose ForkCastAI */}
      <Suspense fallback={<div className="container mx-auto px-4 py-12 text-white/80">Loading features…</div>}>
        <FeaturesSection />
      </Suspense>

      {/* CTA Section (overlay card style on wood) */}
  <section className="py-16 wood-section wood-bg-section">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto bg-card/90 backdrop-blur-sm rounded-xl px-8 py-10 shadow-lg border border-white/10">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-card-foreground">
            Ready to Discover Your Next Favorite Restaurant?
            </h2>
            <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto text-muted-foreground">
            Join thousands of food lovers using AI-powered insights to find the perfect meal
            </p>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              Get Started Free
            </Button>
          </div>
        </div>
      </section>

      {/* Footer on wood with subtle top gradient */}
  <footer className="py-8 wood-section wood-bg-section">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-white/80">&copy; 2025 ForkCastAI. All rights reserved.</p>
            <Button variant="secondary" asChild className="bg-primary hover:bg-primary/90 text-primary-foreground">
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
