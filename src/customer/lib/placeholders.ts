import { groupDishesByRestaurant, RestaurantWithDishes } from './csvDataLoader';
import { getCuisineImage } from './imageUtils';

export interface Review {
  id: string;
  author: string;
  rating: number;
  text: string;
}

export interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  description: string;
  menu: string[];
  menuDetails?: Array<{ name: string; price: number; rating: number; description: string; type: string }>;
  menuImages?: Record<string, string>;
  imageUrl: string;
  gallery: string[];
  mapUrl?: string;
  location?: string;
  lat?: number;
  lon?: number;
  phone?: string;
  website?: string;
  priceRange?: string;
  hours?: Record<string, string>;
  rating: number;
  reviewCount: number;
  reviews: Review[];
}

function generateRestaurantsFromCSV(): Restaurant[] {
  const csvRestaurants = groupDishesByRestaurant();
  
  return csvRestaurants.map((csvRest: RestaurantWithDishes, index: number) => {
    const menu = csvRest.dishes.map(d => d.dish_name);
    
    const menuDetails = csvRest.dishes.map(d => ({
      name: d.dish_name,
      price: d.price,
      rating: d.rating,
      description: d.description,
      type: d.food_type,
    }));
    
    const reviewCount = csvRest.totalReviews;
    const reviews: Review[] = [
      { id: `rv-${index}-1`, author: 'Sarah M.', rating: Math.min(5, Math.round(csvRest.avgRating)), text: 'Great food and atmosphere!' },
      { id: `rv-${index}-2`, author: 'John D.', rating: Math.min(5, Math.round(csvRest.avgRating)), text: 'Highly recommend this place!' },
    ];
    
    const hours = {
      Mon: "11:00–22:00",
      Tue: "11:00–22:00",
      Wed: "11:00–22:00",
      Thu: "11:00–23:00",
      Fri: "11:00–23:00",
      Sat: "11:00–23:00",
      Sun: "12:00–21:00"
    };
    
    const imageUrl = getCuisineImage(csvRest.cuisine);
    
    const mapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${csvRest.latitude},${csvRest.longitude}&zoom=15&size=600x300&markers=color:red%7C${csvRest.latitude},${csvRest.longitude}&key=YOUR_API_KEY`;
    
    return {
      id: `r-${index + 1}`,
      name: csvRest.name,
      cuisine: csvRest.cuisine,
      description: `Serving delicious ${csvRest.cuisine} cuisine with a variety of authentic dishes.`,
      menu,
      menuDetails,
      menuImages: {},
      imageUrl,
      gallery: [imageUrl],
      mapUrl,
      location: `Dallas, TX`,
      lat: csvRest.latitude,
      lon: csvRest.longitude,
      phone: `(555) ${Math.floor(100 + Math.random() * 900)}-${Math.floor(1000 + Math.random() * 9000)}`,
      website: `https://${csvRest.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.example.com`,
      priceRange: csvRest.priceRange,
      hours,
      rating: csvRest.avgRating,
      reviewCount,
      reviews,
    };
  });
}

export const PLACEHOLDER_RESTAURANTS: Restaurant[] = generateRestaurantsFromCSV();

export default PLACEHOLDER_RESTAURANTS;
