import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Search, MapPin, User, Menu, LogOut } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Signed out",
        description: "You've been successfully signed out.",
      });
      navigate("/auth");
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-secondary shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="text-2xl font-bold text-primary-foreground">
              ForkCast<span className="text-primary">AI</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/restaurants" className="text-secondary-foreground hover:text-primary transition-colors">
              Restaurants
            </Link>
            <Link to="/reviews" className="text-secondary-foreground hover:text-primary transition-colors">
              Reviews
            </Link>
            <Link to="/business" className="text-secondary-foreground hover:text-primary transition-colors">
              For Business
            </Link>
          </div>

          {/* Profile & Sign Out */}
          <div className="hidden md:flex items-center gap-2">
            <Button variant="ghost" size="sm" className="text-secondary-foreground hover:text-primary">
              <User className="h-5 w-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleSignOut}
              className="text-secondary-foreground hover:text-destructive"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-secondary-foreground"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-sidebar-border">
            <div className="flex flex-col space-y-3">
              <Link to="/restaurants" className="text-secondary-foreground hover:text-primary py-2">
                Restaurants
              </Link>
              <Link to="/reviews" className="text-secondary-foreground hover:text-primary py-2">
                Reviews
              </Link>
              <Link to="/business" className="text-secondary-foreground hover:text-primary py-2">
                For Business
              </Link>
              <div className="pt-4 border-t border-sidebar-border flex flex-col gap-2">
                <Button variant="ghost" size="sm" className="justify-start text-secondary-foreground">
                  <User className="h-5 w-5 mr-2" />
                  Profile
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleSignOut}
                  className="justify-start text-secondary-foreground hover:text-destructive"
                >
                  <LogOut className="h-5 w-5 mr-2" />
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
