import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, DollarSign } from "lucide-react";

interface RestaurantCardProps {
  name: string;
  cuisine: string;
  rating: number;
  reviewCount: number;
  priceRange: string;
  location: string;
  imageUrl: string;
  distance?: string;
}

const RestaurantCard = ({
  name,
  cuisine,
  rating,
  reviewCount,
  priceRange,
  location,
  imageUrl,
  distance,
}: RestaurantCardProps) => {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group">
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={imageUrl}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {distance && (
          <Badge className="absolute top-3 right-3 bg-secondary text-secondary-foreground">
            {distance}
          </Badge>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-bold text-lg text-card-foreground line-clamp-1">{name}</h3>
          <div className="flex items-center space-x-1 text-sm">
            <Star className="h-4 w-4 fill-primary text-primary" />
            <span className="font-semibold text-card-foreground">{rating}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Badge variant="secondary" className="text-xs">
            {cuisine}
          </Badge>
          <span className="flex items-center">
            {priceRange}
          </span>
        </div>

        <div className="flex items-center text-sm text-muted-foreground">
          <MapPin className="h-4 w-4 mr-1" />
          <span className="line-clamp-1">{location}</span>
        </div>

        <p className="text-xs text-muted-foreground mt-2">
          {reviewCount} reviews
        </p>
      </div>
    </Card>
  );
};

export default RestaurantCard;
