import { useNavigate } from "react-router-dom";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { User, Briefcase } from "lucide-react";

const LoginSelection = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Welcome to Forkcast</h1>
          <p className="text-muted-foreground">Please select how you'd like to continue</p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* Customer Login */}
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
                onClick={() => navigate("/?force=true")} 
                className="w-full"
                size="lg"
              >
                Continue as Customer
              </Button>
            </CardContent>
          </Card>

          {/* Business Login */}
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
                onClick={() => navigate("/?force=true")} 
                className="w-full"
                size="lg"
                variant="outline"
              >
                Continue as Business
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LoginSelection;
