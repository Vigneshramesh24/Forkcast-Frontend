import { Card } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
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
    <Card className="overflow-hidden hover:shadow-2xl transition-shadow transform hover:-translate-y-1 cursor-pointer group">
      {/* Image with overlay */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={imageUrl}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        <div className="absolute left-4 bottom-4 text-white">
          <h3 className="font-bold text-lg leading-tight drop-shadow">{name}</h3>
          <div className="text-sm opacity-90">{cuisine}</div>
        </div>
        <div className="absolute top-3 right-3 bg-white/90 rounded-full px-2 py-1 flex items-center gap-2 text-sm">
          <Star className="h-4 w-4 fill-primary text-primary" />
          <span className="font-semibold">{rating}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 bg-card">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">{cuisine}</Badge>
            <span className="text-sm text-muted-foreground">{priceRange}</span>
          </div>
          <div className="text-sm text-muted-foreground">{reviewCount} reviews</div>
        </div>

        <div className="flex items-center text-sm text-muted-foreground">
          <MapPin className="h-4 w-4 mr-1" />
          <span className="line-clamp-1">{location}</span>
        </div>
      </div>
    </Card>
  );
};

export default RestaurantCard;
