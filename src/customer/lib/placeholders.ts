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
  // Optional explicit images per menu item (by item name)
  menuImages?: Record<string, string>;
  imageUrl: string;
  gallery: string[];
  mapUrl?: string;
  location?: string;
  // Geo for static maps and deep links
  lat?: number;
  lon?: number;
  // Basic business info for sidebar
  phone?: string;
  website?: string;
  priceRange?: string; // $, $$, $$$
  hours?: Record<string, string>; // e.g., { Mon: "11:00–22:00", ... }
  rating: number;
  reviewCount: number;
  reviews: Review[];
}

export const PLACEHOLDER_RESTAURANTS: Restaurant[] = [
  {
    id: "r1",
    name: "Mario's Pizzeria",
    cuisine: "Italian",
    description: "Classic wood-fired pizzas, fresh ingredients, and family recipes.",
    menu: ["pizza", "pasta", "salad"],
    menuImages: {
      // Local asset served from public/assets
      pizza: "/assets/slice-crispy-pizza-with-meat-cheese.jpg",
      // Updated pasta image per user request
      pasta: "/assets/Pasta.jpg",
      salad: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=1200&auto=format&fit=crop"
    },
    imageUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1600&auto=format&fit=crop", // interior shot
    gallery: [
      "https://images.unsplash.com/photo-1528605248644-14dd04022da1?q=80&w=1200&auto=format&fit=crop", // dining room
      "https://images.unsplash.com/photo-1542831371-29b0f74f9713?q=80&w=1200&auto=format&fit=crop" // pizza oven
    ],
    location: "123 Main St, City",
    lat: 40.7129,
    lon: -74.0059,
    phone: "(555) 123-4567",
    website: "https://mariospizzeria.example.com",
    priceRange: "$$",
    hours: { Mon: "11:00–22:00", Tue: "11:00–22:00", Wed: "11:00–22:00", Thu: "11:00–23:00", Fri: "11:00–23:00", Sat: "11:00–23:00", Sun: "12:00–21:00" },
    rating: 4.5,
    reviewCount: 128,
    reviews: [
      { id: "rv1", author: "Asha", rating: 5, text: "Amazing crust and toppings!" },
      { id: "rv2", author: "Liam", rating: 4, text: "Great flavors, service was quick." },
    ],
  },
  {
    id: "r2",
    name: "Sakura Sushi",
    cuisine: "Japanese",
    description: "Fresh sushi and sashimi prepared by experienced chefs.",
    menu: ["sushi", "ramen", "tempura"],
    menuImages: {
      sushi: "https://images.unsplash.com/photo-1553621042-f6e147245754?q=80&w=1200&auto=format&fit=crop",
      ramen: "https://images.unsplash.com/photo-1541542684-3f9f2f0b7b3a?q=80&w=1200&auto=format&fit=crop",
      tempura: "https://images.unsplash.com/photo-1606112219348-204d7d8b94ee?q=80&w=1200&auto=format&fit=crop"
    },
    imageUrl: "https://images.unsplash.com/photo-1528605248644-14dd04022da1?q=80&w=1600&auto=format&fit=crop", // elegant interior
    gallery: [
      "https://images.unsplash.com/photo-1533777324565-a040eb52fac1?q=80&w=1200&auto=format&fit=crop", // sushi bar
      "https://images.unsplash.com/photo-1562158070-9a8a0f0f15c3?q=80&w=1200&auto=format&fit=crop"
    ],
    location: "45 Sakura Ave, City",
    lat: 40.7135,
    lon: -74.002,
    phone: "(555) 987-6543",
    website: "https://sakurasushi.example.com",
    priceRange: "$$$",
    hours: { Mon: "11:30–22:00", Tue: "11:30–22:00", Wed: "11:30–22:00", Thu: "11:30–22:30", Fri: "11:30–23:00", Sat: "12:00–23:00", Sun: "12:00–21:00" },
    rating: 4.7,
    reviewCount: 94,
    reviews: [
      { id: "rv3", author: "Mina", rating: 5, text: "Best sushi I've had in years." },
      { id: "rv4", author: "Ethan", rating: 4, text: "Lovely ambiance and fresh fish." },
    ],
  },
  {
    id: "r3",
    name: "Burger Barn",
    cuisine: "American",
    description: "Juicy gourmet burgers with creative toppings and hand-cut fries.",
    menu: ["burgers", "fries", "shakes"],
    menuImages: {
      burgers: "https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=1200&auto=format&fit=crop",
      fries: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1200&auto=format&fit=crop",
      shakes: "https://images.unsplash.com/photo-1528909514045-2fa4ac7a08ba?q=80&w=1200&auto=format&fit=crop"
    },
    imageUrl: "https://images.unsplash.com/photo-1555992336-03a23c4a7e48?q=80&w=1600&auto=format&fit=crop", // burger counter
    gallery: [
      "https://images.unsplash.com/photo-1561758033-d89a9ad46330?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?q=80&w=1200&auto=format&fit=crop"
    ],
    location: "78 Burger Ln, City",
    lat: 40.7102,
    lon: -74.01,
    phone: "(555) 222-9988",
    website: "https://burgerbarn.example.com",
    priceRange: "$$",
    hours: { Mon: "11:00–21:00", Tue: "11:00–21:00", Wed: "11:00–21:00", Thu: "11:00–22:00", Fri: "11:00–22:00", Sat: "11:00–22:00", Sun: "12:00–20:00" },
    rating: 4.3,
    reviewCount: 210,
    reviews: [
      { id: "rv5", author: "Noah", rating: 5, text: "Fantastic burger and crispy fries." },
      { id: "rv6", author: "Olivia", rating: 4, text: "Loved the shake options." },
    ],
  },
  {
    id: "r4",
    name: "Taco Loco",
    cuisine: "Mexican",
    description: "Street-style tacos, vibrant salsas, and refreshing drinks.",
    menu: ["tacos", "burritos", "salsa"],
    menuImages: {
      tacos: "https://images.unsplash.com/photo-1601924577973-3c37a5c6a8b3?q=80&w=1200&auto=format&fit=crop",
      burritos: "https://images.unsplash.com/photo-1610440042657-612c134b6df7?q=80&w=1200&auto=format&fit=crop",
      salsa: "https://images.unsplash.com/photo-1525755662778-989d0524087e?q=80&w=1200&auto=format&fit=crop"
    },
    imageUrl: "https://images.unsplash.com/photo-1528605248644-14dd04022da1?q=80&w=1600&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1541558619105-836cb1c4a2d3?q=80&w=1200&auto=format&fit=crop",
    ],
    location: "9 Fiesta St, City",
    lat: 40.7165,
    lon: -74.0123,
    phone: "(555) 444-2211",
    website: "https://tacoloco.example.com",
    priceRange: "$",
    hours: { Mon: "11:00–21:00", Tue: "11:00–21:00", Wed: "11:00–21:00", Thu: "11:00–22:00", Fri: "11:00–22:00", Sat: "11:00–22:00", Sun: "12:00–20:00" },
    rating: 4.1,
    reviewCount: 67,
    reviews: [
      { id: "rv7", author: "Ava", rating: 4, text: "Tasty tacos and great value." },
    ],
  },
  {
    id: "r5",
    name: "Bella Italia",
    cuisine: "Italian",
    description: "Cozy Italian eatery serving classic pasta, pizza and antipasti.",
    menu: ["pizza", "pasta", "antipasti"],
    menuImages: {
      // Use user-provided pizza photo from public/assets
      pizza: "/assets/slice-crispy-pizza-with-meat-cheese.jpg",
      // Updated pasta image per user request
      pasta: "/assets/Pasta.jpg",
      antipasti: "https://images.unsplash.com/photo-1478144592103-25e218a04891?q=80&w=1200&auto=format&fit=crop"
    },
    imageUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1600&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1542831371-29b0f74f9713?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1528605248644-14dd04022da1?q=80&w=1200&auto=format&fit=crop",
    ],
    location: "123 Main St, Downtown",
    lat: 40.718,
    lon: -74.0,
    phone: "(555) 555-1212",
    website: "https://bellaitalia.example.com",
    priceRange: "$$$",
    hours: { Mon: "12:00–22:00", Tue: "12:00–22:00", Wed: "12:00–22:00", Thu: "12:00–23:00", Fri: "12:00–23:00", Sat: "12:00–23:00", Sun: "12:00–21:00" },
    rating: 4.5,
    reviewCount: 234,
    reviews: [
      { id: "rv8", author: "Marco", rating: 5, text: "Lovely pasta and warm service." },
      { id: "rv9", author: "Priya", rating: 4, text: "Authentic flavors, will return." },
    ],
  },
  {
    id: "r6",
    name: "Sushi Paradise",
    cuisine: "Japanese",
    description: "Handmade sushi and fresh sashimi prepared daily.",
    menu: ["sushi", "sashimi", "ramen"],
    menuImages: {
      sushi: "https://images.unsplash.com/photo-1553621042-f6e147245754?q=80&w=1200&auto=format&fit=crop",
      sashimi: "https://images.unsplash.com/photo-1553621042-f6e147245754?q=80&w=1200&auto=format&fit=crop",
      ramen: "https://images.unsplash.com/photo-1541542684-3f9f2f0b7b3a?q=80&w=1200&auto=format&fit=crop"
    },
    imageUrl: "https://images.unsplash.com/photo-1533777324565-a040eb52fac1?q=80&w=1600&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1533777324565-a040eb52fac1?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1562158070-9a8a0f0f15c3?q=80&w=1200&auto=format&fit=crop",
    ],
    location: "456 Oak Ave, Midtown",
    lat: 40.7112,
    lon: -74.0081,
    phone: "(555) 888-3344",
    website: "https://sushiparadise.example.com",
    priceRange: "$$$",
    hours: { Mon: "11:30–22:00", Tue: "11:30–22:00", Wed: "11:30–22:00", Thu: "11:30–22:30", Fri: "11:30–23:00", Sat: "12:00–23:00", Sun: "12:00–21:00" },
    rating: 4.8,
    reviewCount: 456,
    reviews: [
      { id: "rv10", author: "Mina", rating: 5, text: "Best sushi I've had in years." },
      { id: "rv11", author: "Ethan", rating: 4, text: "Fresh fish and great rolls." },
    ],
  },
  {
    id: "r7",
    name: "Taco Fiesta",
    cuisine: "Mexican",
    description: "Vibrant tacos and handcrafted salsas with bold flavors.",
    menu: ["tacos", "burritos", "quesadillas"],
    menuImages: {
      tacos: "https://images.unsplash.com/photo-1601924577973-3c37a5c6a8b3?q=80&w=1200&auto=format&fit=crop",
      burritos: "https://images.unsplash.com/photo-1610440042657-612c134b6df7?q=80&w=1200&auto=format&fit=crop",
      quesadillas: "https://images.unsplash.com/photo-1605478201426-425fe32f0a6c?q=80&w=1200&auto=format&fit=crop"
    },
    imageUrl: "https://images.unsplash.com/photo-1528605248644-14dd04022da1?q=80&w=1600&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1541558619105-836cb1c4a2d3?q=80&w=1200&auto=format&fit=crop",
    ],
    location: "789 Pine Rd, East Side",
    lat: 40.7142,
    lon: -74.0044,
    phone: "(555) 111-7788",
    website: "https://tacofiesta.example.com",
    priceRange: "$",
    hours: { Mon: "11:00–21:00", Tue: "11:00–21:00", Wed: "11:00–21:00", Thu: "11:00–22:00", Fri: "11:00–22:00", Sat: "11:00–22:00", Sun: "12:00–20:00" },
    rating: 4.3,
    reviewCount: 189,
    reviews: [
      { id: "rv12", author: "Diego", rating: 5, text: "Flavor-packed tacos!" },
      { id: "rv13", author: "Lena", rating: 4, text: "Great value and taste." },
    ],
  },
  {
    id: "r8",
    name: "The Burger Joint",
    cuisine: "American",
    description: "Gourmet burgers, hand-cut fries and house-made sauces.",
    menu: ["burgers", "fries", "shakes"],
    menuImages: {
      burgers: "https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=1200&auto=format&fit=crop",
      fries: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1200&auto=format&fit=crop",
      shakes: "https://images.unsplash.com/photo-1528909514045-2fa4ac7a08ba?q=80&w=1200&auto=format&fit=crop"
    },
    imageUrl: "https://images.unsplash.com/photo-1555992336-03a23c4a7e48?q=80&w=1600&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1561758033-d89a9ad46330?q=80&w=1200&auto=format&fit=crop",
    ],
    location: "321 Elm St, West End",
    lat: 40.7192,
    lon: -74.0066,
    phone: "(555) 222-3344",
    website: "https://theburgerjoint.example.com",
    priceRange: "$$",
    hours: { Mon: "11:00–21:00", Tue: "11:00–21:00", Wed: "11:00–21:00", Thu: "11:00–22:00", Fri: "11:00–22:00", Sat: "11:00–22:00", Sun: "12:00–20:00" },
    rating: 4.6,
    reviewCount: 312,
    reviews: [
      { id: "rv14", author: "Noah", rating: 5, text: "Fantastic burger and crispy fries." },
      { id: "rv15", author: "Olivia", rating: 4, text: "Loved the shake options." },
    ],
  },
  {
    id: "r9",
    name: "Dragon Wok",
    cuisine: "Chinese",
    description: "Stir-fried favorites with bold sauces and fresh vegetables.",
    menu: ["noodles", "dumplings", "stir fry"],
     menuImages: {
      noodles: "https://images.unsplash.com/photo-1604908176997-431c2068a9c3?q=80&w=1200&auto=format&fit=crop",
      dumplings: "https://images.unsplash.com/photo-1553621042-f6e147245754?q=80&w=1200&auto=format&fit=crop",
      "stir fry": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=1200&auto=format&fit=crop"
    },
    imageUrl: "https://images.unsplash.com/photo-1528605248644-14dd04022da1?q=80&w=1600&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?q=80&w=1200&auto=format&fit=crop",
    ],
    location: "654 Maple Dr, North Side",
    lat: 40.7171,
    lon: -74.0073,
    phone: "(555) 333-6677",
    website: "https://dragonwok.example.com",
    priceRange: "$$",
    hours: { Mon: "11:00–21:30", Tue: "11:00–21:30", Wed: "11:00–21:30", Thu: "11:00–22:00", Fri: "11:00–22:00", Sat: "11:00–22:00", Sun: "12:00–20:30" },
    rating: 4.4,
    reviewCount: 267,
    reviews: [
      { id: "rv16", author: "Hua", rating: 5, text: "Great noodles and friendly staff." },
    ],
  },
  {
    id: "r10",
    name: "Pizza Palace",
    cuisine: "Pizza",
    description: "Wood-fired pies with creative toppings and local ingredients.",
    menu: ["pizza", "calzones", "salads"],
    menuImages: {
      // Local asset served from public/assets
      pizza: "/assets/slice-crispy-pizza-with-meat-cheese.jpg",
      calzones: "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1200&auto=format&fit=crop",
      salads: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=1200&auto=format&fit=crop"
    },
    imageUrl: "https://images.unsplash.com/photo-1542831371-29b0f74f9713?q=80&w=1600&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1542831371-29b0f74f9713?q=80&w=1200&auto=format&fit=crop",
    ],
    location: "987 Cedar Ln, South End",
    lat: 40.7098,
    lon: -74.0033,
    phone: "(555) 444-5555",
    website: "https://pizzapalace.example.com",
    priceRange: "$$",
    hours: { Mon: "11:00–22:00", Tue: "11:00–22:00", Wed: "11:00–22:00", Thu: "11:00–23:00", Fri: "11:00–23:00", Sat: "11:00–23:00", Sun: "12:00–21:00" },
    rating: 4.7,
    reviewCount: 398,
    reviews: [
      { id: "rv17", author: "Sam", rating: 5, text: "Amazing crust and toppings." },
    ],
  },
  {
    id: "r11",
    name: "Thai Orchid",
    cuisine: "Thai",
    description: "Fragrant curries, pad thai, and authentic Thai street eats.",
    menu: ["pad thai", "curry", "satay"],
    menuImages: {
      "pad thai": "https://images.unsplash.com/photo-1543352634-8732d7c31f5a?q=80&w=1200&auto=format&fit=crop",
      curry: "https://images.unsplash.com/photo-1604908176997-431c2068a9c3?q=80&w=1200&auto=format&fit=crop",
      satay: "https://images.unsplash.com/photo-1543353071-10c8ba85a904?q=80&w=1200&auto=format&fit=crop"
    },
    // Replaced hero image with local thai-orchid.jpg provided by user
    imageUrl: "/assets/thai-orchid.jpg",
    gallery: [
      "https://images.unsplash.com/photo-1528605248644-14dd04022da1?q=80&w=1200&auto=format&fit=crop",
    ],
    location: "159 Birch St, Central",
    lat: 40.713,
    lon: -74.012,
    phone: "(555) 666-9999",
    website: "https://thaiorchid.example.com",
    priceRange: "$$",
    hours: { Mon: "11:30–21:30", Tue: "11:30–21:30", Wed: "11:30–21:30", Thu: "11:30–22:00", Fri: "11:30–22:00", Sat: "12:00–22:00", Sun: "12:00–21:00" },
    rating: 4.5,
    reviewCount: 223,
    reviews: [
      { id: "rv18", author: "Nok", rating: 5, text: "Excellent curry and atmosphere." },
    ],
  },
  {
    id: "r12",
    name: "Steakhouse Prime",
    cuisine: "Steakhouse",
    description: "Prime cuts, dry-aged steaks, and an extensive wine selection.",
    menu: ["steak", "sides", "wine"],
    menuImages: {
      steak: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?q=80&w=1200&auto=format&fit=crop",
      sides: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1200&auto=format&fit=crop",
      wine: "https://images.unsplash.com/photo-1514361892635-6b07e31d21e5?q=80&w=1200&auto=format&fit=crop"
    },
    imageUrl: "https://images.unsplash.com/photo-1528605248644-14dd04022da1?q=80&w=1600&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1551183053-bf91a1d81141?q=80&w=1200&auto=format&fit=crop",
    ],
    location: "753 Walnut Ave, Uptown",
    lat: 40.7124,
    lon: -74.014,
    phone: "(555) 777-4444",
    website: "https://steakhouseprime.example.com",
    priceRange: "$$$$",
    hours: { Mon: "17:00–22:00", Tue: "17:00–22:00", Wed: "17:00–22:00", Thu: "17:00–23:00", Fri: "17:00–23:00", Sat: "17:00–23:00", Sun: "17:00–21:00" },
    rating: 4.9,
    reviewCount: 512,
    reviews: [
      { id: "rv19", author: "Alex", rating: 5, text: "Fantastic steaks and service." },
    ],
  },
];

export default PLACEHOLDER_RESTAURANTS;
