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
  imageUrl: string;
  gallery: string[];
  mapUrl?: string;
  location?: string;
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
    imageUrl: "https://images.unsplash.com/photo-1541698444083-023c97d3f4b6?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.0.3&s=abcd",
    gallery: [
      "https://images.unsplash.com/photo-1541698444083-023c97d3f4b6?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.0.3&s=abcd",
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.0.3&s=efgh",
    ],
    mapUrl: "https://images.unsplash.com/photo-1509395176047-4a66953fd231?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.0.3&s=map1",
    location: "123 Main St, City",
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
    imageUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.0.3&s=ijkl",
    gallery: [
      "https://images.unsplash.com/photo-1553621042-f6e147245754?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.0.3&s=mnop",
      "https://images.unsplash.com/photo-1541542684-3f9f2f0b7b3a?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.0.3&s=qrst",
    ],
  mapUrl: "https://images.unsplash.com/photo-1528909514045-2fa4ac7a08ba?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.0.3&s=map2",
    location: "45 Sakura Ave, City",
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
    imageUrl: "https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.0.3&s=uvwx",
    gallery: [
      "https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.0.3&s=yzab",
      "https://images.unsplash.com/photo-1541542684-3f9f2f0b7b3a?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.0.3&s=cdef",
    ],
  mapUrl: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.0.3&s=map3",
    location: "78 Burger Ln, City",
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
    imageUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.0.3&s=ghij",
    gallery: [
      "https://images.unsplash.com/photo-1525755662778-989d0524087e?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.0.3&s=klmn",
    ],
  mapUrl: "https://images.unsplash.com/photo-1491553895911-0055eca6402d?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.0.3&s=map4",
    location: "9 Fiesta St, City",
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
    imageUrl: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.0.3&s=bella",
    gallery: [
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.0.3&s=b1",
      "https://images.unsplash.com/photo-1517244683847-5f9a0c4f6d0a?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.0.3&s=b2",
    ],
    mapUrl: "https://images.unsplash.com/photo-1509395176047-4a66953fd231?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.0.3&s=map_bella",
    location: "123 Main St, Downtown",
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
    imageUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.0.3&s=sushi",
    gallery: [
      "https://images.unsplash.com/photo-1553621042-f6e147245754?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.0.3&s=s1",
      "https://images.unsplash.com/photo-1541542684-3f9f2f0b7b3a?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.0.3&s=s2",
    ],
    mapUrl: "https://images.unsplash.com/photo-1528909514045-2fa4ac7a08ba?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.0.3&s=map_sushi",
    location: "456 Oak Ave, Midtown",
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
    imageUrl: "https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.0.3&s=taco",
    gallery: [
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.0.3&s=t1",
    ],
    mapUrl: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.0.3&s=map_taco",
    location: "789 Pine Rd, East Side",
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
    imageUrl: "https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.0.3&s=burger",
    gallery: [
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.0.3&s=bj1",
    ],
    mapUrl: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.0.3&s=map_burger",
    location: "321 Elm St, West End",
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
    imageUrl: "https://images.unsplash.com/photo-1541698444083-023c97d3f4b6?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.0.3&s=dragon",
    gallery: [
      "https://images.unsplash.com/photo-1553621042-f6e147245754?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.0.3&s=d1",
    ],
    mapUrl: "https://images.unsplash.com/photo-1528909514045-2fa4ac7a08ba?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.0.3&s=map_dragon",
    location: "654 Maple Dr, North Side",
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
    imageUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.0.3&s=pizza",
    gallery: [
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.0.3&s=p1",
    ],
    mapUrl: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.0.3&s=map_pizza",
    location: "987 Cedar Ln, South End",
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
    imageUrl: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.0.3&s=thai",
    gallery: [
      "https://images.unsplash.com/photo-1541542684-3f9f2f0b7b3a?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.0.3&s=t1",
    ],
    mapUrl: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.0.3&s=map_thai",
    location: "159 Birch St, Central",
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
    imageUrl: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.0.3&s=steak",
    gallery: [
      "https://images.unsplash.com/photo-1541698444083-023c97d3f4b6?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.0.3&s=st1",
    ],
    mapUrl: "https://images.unsplash.com/photo-1491553895911-0055eca6402d?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.0.3&s=map_steak",
    location: "753 Walnut Ave, Uptown",
    rating: 4.9,
    reviewCount: 512,
    reviews: [
      { id: "rv19", author: "Alex", rating: 5, text: "Fantastic steaks and service." },
    ],
  },
];

export default PLACEHOLDER_RESTAURANTS;
