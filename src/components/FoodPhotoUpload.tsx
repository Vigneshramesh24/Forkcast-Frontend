import { useState } from "react";
import { Camera, Upload, Sparkles, DollarSign, MapPin, Star } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const FoodPhotoUpload = () => {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [dishData, setDishData] = useState<any>(null);
  const [reviewText, setReviewText] = useState("");
  const [dishRating, setDishRating] = useState(0);
  const [restaurantRating, setRestaurantRating] = useState(0);
  const { toast } = useToast();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
        analyzeImage();
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeImage = () => {
    setAnalyzing(true);
    // Placeholder for AI analysis
    setTimeout(() => {
      setDishData({
        name: "Margherita Pizza",
        priceRange: "$12 - $18",
        locations: ["La Bella Pizza", "Tony's Italian", "Pizza Paradise"],
        reviews: 342,
        avgRating: 4.5,
      });
      setAnalyzing(false);
    }, 2000);
  };

  const handleSubmitReview = () => {
    if (!reviewText || dishRating === 0 || restaurantRating === 0) {
      toast({
        title: "Missing Information",
        description: "Please provide ratings and review text",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Review Submitted!",
      description: "Thank you for sharing your experience",
    });
    
    // Reset form
    setUploadedImage(null);
    setDishData(null);
    setReviewText("");
    setDishRating(0);
    setRestaurantRating(0);
  };

  const StarRating = ({ rating, onRate, label }: { rating: number; onRate: (r: number) => void; label: string }) => (
    <div className="space-y-1">
      <p className="text-sm font-medium text-foreground">{label}</p>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => onRate(star)}
            className="transition-transform hover:scale-110"
          >
            <Star
              className={`h-6 w-6 ${
                star <= rating
                  ? "fill-primary text-primary"
                  : "text-muted-foreground"
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Identify Any Dish with AI
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Take or upload a photo and let AI tell you what it is, where to find it, and what others think
          </p>
        </div>

        <Card className="max-w-4xl mx-auto p-8">
          {!uploadedImage ? (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-border rounded-lg p-12 text-center">
                <Camera className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2 text-foreground">Upload Food Photo</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Take a picture or upload from your device
                </p>
                <div className="flex gap-4 justify-center">
                  <Button variant="default" className="relative">
                    <Camera className="mr-2 h-4 w-4" />
                    Take Photo
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleImageUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </Button>
                  <Button variant="outline" className="relative">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="relative">
                <img
                  src={uploadedImage}
                  alt="Uploaded food"
                  className="w-full h-64 object-cover rounded-lg"
                />
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setUploadedImage(null);
                    setDishData(null);
                  }}
                  className="absolute top-2 right-2"
                >
                  Change Photo
                </Button>
              </div>

              {analyzing ? (
                <div className="text-center py-8">
                  <Sparkles className="h-12 w-12 mx-auto mb-4 text-primary animate-pulse" />
                  <p className="text-lg font-medium text-foreground">Analyzing your dish...</p>
                </div>
              ) : dishData ? (
                <div className="space-y-6">
                  <div className="bg-secondary/50 rounded-lg p-6 space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-2xl font-bold text-foreground mb-2">
                          {dishData.name}
                        </h3>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <DollarSign className="h-4 w-4 text-primary" />
                            {dishData.priceRange}
                          </span>
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <Star className="h-4 w-4 fill-primary text-primary" />
                            {dishData.avgRating} ({dishData.reviews} reviews)
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-primary" />
                        Available at:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {dishData.locations.map((location: string, idx: number) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-background rounded-full text-sm text-foreground"
                          >
                            {location}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-lg font-bold text-foreground">Rate & Review</h4>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <StarRating
                        rating={dishRating}
                        onRate={setDishRating}
                        label="Rate the Dish"
                      />
                      <StarRating
                        rating={restaurantRating}
                        onRate={setRestaurantRating}
                        label="Rate the Restaurant"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Your Review
                      </label>
                      <Textarea
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        placeholder="Share your experience..."
                        className="min-h-[100px]"
                      />
                    </div>

                    <Button onClick={handleSubmitReview} className="w-full">
                      Submit Review
                    </Button>
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </Card>
      </div>
    </section>
  );
};

export default FoodPhotoUpload;
