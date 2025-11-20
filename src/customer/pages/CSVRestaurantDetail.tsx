import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { Star, MapPin } from "lucide-react";
import { MAP_PLACEHOLDER, getCuisineImage, getDishImage } from "@/customer/lib/imageUtils";

type CSVProfile = {
  name: string;
  cuisine: string;
  lat?: number;
  lon?: number;
  location?: string;
  rating?: number;
  reviewCount?: number;
  priceRange?: string;
  description?: string;
  menu: string[];
  imageUrl?: string;
  aiReason?: string;
};

const CSV_STORAGE_PREFIX = 'csv_restaurant_profile:';

const CSVRestaurantDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const storageKey = useMemo(() => `${CSV_STORAGE_PREFIX}${slug}`, [slug]);
  const [profile, setProfile] = useState<CSVProfile | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) setProfile(JSON.parse(raw));
    } catch {}
  }, [storageKey]);

  if (!profile) {
    return (
      <div className="container mx-auto p-8">
        <div className="mb-4">
          <Button variant="ghost" onClick={() => navigate(-1)}>← Back</Button>
        </div>
        <div className="text-muted-foreground">Restaurant profile not found.</div>
      </div>
    );
  }

  const image = profile.imageUrl || getCuisineImage(profile.cuisine) || undefined;
  const rating = typeof profile.rating === 'number' ? profile.rating : 4.5;
  const reviewCount = typeof profile.reviewCount === 'number' ? profile.reviewCount : 200;
  const priceRange = profile.priceRange || '$$';

  return (
    <div className="container mx-auto p-8">
      <div className="mb-4">
        <Button variant="ghost" onClick={() => navigate(-1)}>← Back to Home</Button>
      </div>
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1">
          <div className="relative rounded-lg overflow-hidden shadow">
            {image ? (
              <img src={image} alt={profile.name} className="w-full h-64 object-cover" />
            ) : (
              <div className="w-full h-64 bg-gray-100" />
            )}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/40" />
            <div className="absolute left-6 bottom-6 text-white">
              <h1 className="text-3xl font-bold drop-shadow">{profile.name}</h1>
              <div className="text-sm opacity-90">{profile.cuisine} • {profile.location || 'Dallas, TX'}</div>
            </div>
            <div className="absolute top-4 right-4 bg-white/95 rounded px-3 py-1 flex items-center gap-2">
              <Star className="h-5 w-5 fill-primary text-primary" />
              <div className="font-semibold">{rating.toFixed(1)} • {reviewCount}</div>
            </div>
          </div>

          {profile.description && (
            <p className="mt-4 text-muted-foreground">{profile.description}</p>
          )}

          {profile.aiReason && (
            <div className="mt-4 bg-primary/10 border border-primary/20 rounded-lg p-4">
              <div className="font-semibold mb-1">AI Reasoning</div>
              <div className="text-sm opacity-90">{profile.aiReason}</div>
            </div>
          )}

          <h3 className="mt-6 font-semibold">Menu</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
            {profile.menu.slice(0, 12).map((m) => (
              <div key={m} className="bg-card rounded-lg p-3 text-center shadow-sm">
                <div className="h-24 mb-2 bg-gray-100 rounded overflow-hidden flex items-center justify-center">
                  <img
                    src={getDishImage(m, profile.cuisine) || getCuisineImage(profile.cuisine) || image || MAP_PLACEHOLDER}
                    alt={m}
                    className="object-cover h-full w-full"
                  />
                </div>
                <div className="font-medium">{m}</div>
              </div>
            ))}
          </div>

          <h3 className="mt-6 font-semibold">Reviews</h3>
          <div className="mt-3 space-y-3">
            {["Alex","Priya","John","Mina"].map((author, i) => (
              <div key={i} className="bg-white border rounded-lg p-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-primary">{author.charAt(0)}</div>
                    <div>
                      <div className="font-medium">{author}</div>
                      <div className="text-sm text-muted-foreground">Great food and friendly service.</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-primary text-primary" />
                    <span className="text-sm font-semibold">{(4 + (i % 2)).toFixed(0)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="w-full md:w-80 flex-shrink-0 space-y-4">
          <div className="bg-card rounded-lg p-4 shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="font-semibold">Info</div>
            </div>
            <div className="space-y-2 text-sm">
              <div><span className="text-muted-foreground">Price:</span> {priceRange}</div>
              <div><span className="text-muted-foreground">Phone:</span> (555) 978-1098</div>
              <div><span className="text-muted-foreground">Address:</span> {profile.location || 'Dallas, TX'}</div>
            </div>
            <div className="mt-3">
              <div className="text-sm font-medium mb-1">Hours</div>
              <ul className="text-sm text-muted-foreground space-y-1">
                {[
                  ['Mon','11:00–22:00'],['Tue','11:00–22:00'],['Wed','11:00–22:00'],['Thu','11:00–23:00'],['Fri','11:00–23:00'],['Sat','11:00–23:00'],['Sun','12:00–21:00']
                ].map(([day, hrs]) => (
                  <li key={day} className="flex justify-between"><span>{day}</span><span>{hrs}</span></li>
                ))}
              </ul>
            </div>
            <div className="mt-3 flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  if (profile.lat && profile.lon) {
                    window.open(`https://www.google.com/maps/search/?api=1&query=${profile.lat},${profile.lon}`, "_blank", "noopener");
                  } else if (profile.location) {
                    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(profile.location)}` , "_blank", "noopener");
                  }
                }}
              >
                <MapPin className="h-4 w-4 mr-2" /> Open in maps
              </Button>
            </div>
          </div>
          <div className="bg-card rounded-lg p-4 shadow">
            <div className="font-semibold mb-2">Map</div>
            <div className="h-48 rounded overflow-hidden">
              <img src={MAP_PLACEHOLDER} alt={`Map of ${profile.name}`} className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CSVRestaurantDetail;
