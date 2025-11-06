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
    <nav className="fixed top-0 left-0 right-0 h-[56px] z-50" style={{ backgroundColor: '#344257' }}>
      <div className="flex items-center justify-between h-full px-8">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 cursor-pointer">
          <div className="text-lg font-bold text-white">ForkCast<span className="text-primary">AI</span></div>
        </Link>

        {/* Account Button */}
        <DropdownMenu>
          {/* We'll keep the Trigger as child but control open via hover in the parent wrapper */}
          <div className="relative">
            <DropdownMenuTrigger asChild>
              <button className="h-10 w-10 rounded-full bg-transparent flex items-center justify-center cursor-pointer mr-5" aria-label="Account">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center hover:bg-[#f97116] transition-colors duration-500">
                  <User className="h-4 w-4 text-white" />
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 z-[100] bg-popover">
              <DropdownMenuItem asChild>
                <a href="/saved-information">Saved Information</a>
              </DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive" onClick={handleSignOut}>Sign Out</DropdownMenuItem>
            </DropdownMenuContent>
          </div>
        </DropdownMenu>
      </div>
    </nav>
  );
};

export default Navbar;
