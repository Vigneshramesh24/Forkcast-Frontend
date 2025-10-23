import { Utensils, ChevronDown, User } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { supabase } from "@/shared/integrations/supabase/client";
import { useToast } from "@/shared/hooks/use-toast";
import { useCallback } from "react";

const Navbar = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      return;
    }
    toast({
      title: "Signed out",
      description: "You've been successfully signed out.",
    });
    navigate('/auth');
  }, [navigate, toast]);
  return (
    <nav className="fixed top-0 left-0 right-0 h-[56px] bg-navbar text-navbar-foreground z-50">
      <div className="flex items-center justify-between h-full px-8">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 cursor-pointer">
          <Utensils className="h-6 w-6 text-primary rotate-90" strokeWidth={2.5} />
        </Link>

        {/* Account Button */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              className="h-9 px-3 rounded-full bg-logo-bg hover:bg-logo-bg/90 text-foreground gap-2 transition-smooth shadow-sm"
            >
              <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                <User className="h-3 w-3 text-primary-foreground" />
              </div>
              <ChevronDown className="h-3 w-3 opacity-70" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 z-[100] bg-popover">
            <DropdownMenuItem asChild>
              <a href="/saved-information">Saved Information</a>
            </DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuItem className="text-destructive" onClick={handleSignOut}>Sign Out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
};

export default Navbar;
