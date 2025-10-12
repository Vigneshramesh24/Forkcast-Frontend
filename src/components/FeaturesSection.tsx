import { Sparkles, Camera, TrendingUp, Users } from "lucide-react";

const features = [
  {
    icon: Sparkles,
    title: "AI-Powered Insights",
    description: "Get intelligent summaries and sentiment analysis from thousands of reviews",
  },
  {
    icon: Camera,
    title: "Smart Dish Recognition",
    description: "Upload photos and let AI identify and tag dishes automatically",
  },
  {
    icon: TrendingUp,
    title: "Business Analytics",
    description: "Restaurant owners get detailed performance metrics and trending dishes",
  },
  {
    icon: Users,
    title: "Social Features",
    description: "Follow friends and top reviewers to discover new favorites",
  },
];

const FeaturesSection = () => {
  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Why Choose ForkCastAI?
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            The most intelligent way to discover, review, and manage restaurant experiences
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-card p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-bold text-lg mb-2 text-card-foreground">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
