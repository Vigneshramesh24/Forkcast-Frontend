import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/shared/integrations/supabase/client";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { User, Briefcase } from "lucide-react";
import { useToast } from "@/shared/hooks/use-toast";

const RoleSelection = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleRoleSelection = async (roleType: "customer" | "business") => {
    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("User not authenticated");
      }

      // Assign role using secure server-side function
      const role = roleType === "business" ? "business_owner" : "customer";
      const { error: roleError } = await supabase.rpc("assign_user_role", {
        p_user_id: user.id,
        p_requested_role: role,
      });

      if (roleError) throw roleError;

      toast({
        title: "Success!",
        description: `Your account has been set up as ${roleType}.`,
      });

      // Redirect based on role
      if (roleType === "business") {
        navigate("/business/");
      } else {
        navigate("/customer/");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Welcome to ForkCastAI</h1>
          <p className="text-muted-foreground">Please select how you'd like to use the platform</p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* Customer Option */}
          <Card className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-primary">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">Customer</CardTitle>
              <CardDescription>
                Discover restaurants, upload food photos, and get AI-powered recommendations
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button 
                onClick={() => handleRoleSelection("customer")} 
                className="w-full"
                size="lg"
                disabled={isLoading}
              >
                {isLoading ? "Setting up..." : "Continue as Customer"}
              </Button>
            </CardContent>
          </Card>

          {/* Business Option */}
          <Card className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-primary">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Briefcase className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">Business</CardTitle>
              <CardDescription>
                Manage your restaurant, view analytics, and engage with customers
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button 
                onClick={() => handleRoleSelection("business")} 
                className="w-full"
                size="lg"
                variant="outline"
                disabled={isLoading}
              >
                {isLoading ? "Setting up..." : "Continue as Business"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;
