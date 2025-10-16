import { useState, useEffect } from "react";
import { MapPin, Loader2 } from "lucide-react";
import { Button } from "@/shared/components/ui/button";

const LocationDetector = () => {
  const [location, setLocation] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const detectLocation = () => {
    setLoading(true);
    // Placeholder for Google Maps AI API integration
    setTimeout(() => {
      setLocation("San Francisco, CA");
      setLoading(false);
    }, 1500);
  };

  useEffect(() => {
    detectLocation();
  }, []);

  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <MapPin className="h-4 w-4 text-primary" />
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Detecting location...</span>
        </>
      ) : (
        <>
          <span>{location}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={detectLocation}
            className="h-6 px-2 text-xs"
          >
            Update
          </Button>
        </>
      )}
    </div>
  );
};

export default LocationDetector;
