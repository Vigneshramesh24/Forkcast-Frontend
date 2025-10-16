import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Search, MapPin } from "lucide-react";
import heroImage from "@/customer/assets/hero-food.jpg";

const Hero = () => {
  return (
    <section className="relative h-[500px] md:h-[600px] overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-secondary/80 via-secondary/60 to-secondary/90" />
      </div>

      {/* Content */}
      <div className="relative container mx-auto px-4 h-full flex flex-col justify-center items-center text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
          Discover Amazing Food
        </h1>
        <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl">
          AI-powered reviews and insights to help you find the perfect meal
        </p>

        {/* Search Bar */}
        <div className="w-full max-w-3xl bg-white rounded-xl shadow-2xl p-2 flex flex-col md:flex-row gap-2">
          <div className="flex-1 flex items-center px-3 border-b md:border-b-0 md:border-r border-border pb-2 md:pb-0">
            <Search className="h-5 w-5 text-muted-foreground mr-2" />
            <Input
              type="text"
              placeholder="Pizza, Sushi, Burgers..."
              className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>
          <div className="flex-1 flex items-center px-3">
            <MapPin className="h-5 w-5 text-muted-foreground mr-2" />
            <Input
              type="text"
              placeholder="Location"
              className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>
          <Button size="lg" className="bg-primary hover:bg-primary/90 md:w-auto w-full">
            <Search className="h-5 w-5 md:mr-2" />
            <span className="hidden md:inline">Search</span>
          </Button>
        </div>

        {/* Quick Links */}
        <div className="mt-6 flex flex-wrap gap-3 justify-center">
          <Button variant="outline" size="sm" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
            Italian
          </Button>
          <Button variant="outline" size="sm" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
            Japanese
          </Button>
          <Button variant="outline" size="sm" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
            Mexican
          </Button>
          <Button variant="outline" size="sm" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
            American
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
