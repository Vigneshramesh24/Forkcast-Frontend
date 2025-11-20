// This file parses the dallas_menu_augmented.csv data and structures it for the app
import { Restaurant, Review } from './placeholders';

export interface DishData {
  dish_name: string;
  restaurant: string;
  price: number;
  cuisine: string;
  description: string;
  food_type: string;
  latitude: number;
  longitude: number;
  rating: number;
}

// Raw CSV data as a string - we'll parse this
const csvData = `dish_name,restaurant,price,cuisine,description,food_type,latitude,longitude,rating
Tres Leches Cake,Mi Cocina - Highland Park,10.64,Mexican,Soaked sponge cake,dessert,32.8368,-96.8051,4.24
Beef Fajitas,Mi Cocina - Highland Park,41.62,Mexican,"Grilled skirt steak, peppers, onions",entree,32.8368,-96.8051,4.53
Chicken Enchiladas Verdes,Mi Cocina - Highland Park,38.24,Mexican,"Tomatillo sauce, queso fresco",entree,32.8368,-96.8051,3.5
Chicken Tortilla Soup,Mi Cocina - Highland Park,11.07,Mexican,"Tomato-chile broth, tortilla strips",soup,32.8368,-96.8051,4.63
Queso & Chips,Mi Cocina - Highland Park,9.04,Mexican,"Melted cheese dip, tortilla chips",appetizer,32.8368,-96.8051,4.3
Horchata,El Fenix Downtown,5.68,Mexican,Cinnamon rice drink,beverage,32.7825,-96.8022,4.95
Queso & Chips,El Fenix Downtown,11.61,Mexican,"Melted cheese dip, tortilla chips",appetizer,32.7825,-96.8022,4.42
Beef Fajitas,El Fenix Downtown,33.77,Mexican,"Grilled skirt steak, peppers, onions",entree,32.7825,-96.8022,4.11
Chicken Tortilla Soup,El Fenix Downtown,5.5,Mexican,"Tomato-chile broth, tortilla strips",soup,32.7825,-96.8022,4.36
Tres Leches Cake,El Fenix Downtown,9.81,Mexican,Soaked sponge cake,dessert,32.7825,-96.8022,4.41
Chicken Enchiladas Verdes,El Fenix Downtown,29.89,Mexican,"Tomatillo sauce, queso fresco",entree,32.7825,-96.8022,4.18
Beef Fajitas,Javier's Gourmet Mexicano,41.73,Mexican,"Grilled skirt steak, peppers, onions",entree,32.8331,-96.8089,4.03
Chicken Tortilla Soup,Javier's Gourmet Mexicano,9.48,Mexican,"Tomato-chile broth, tortilla strips",soup,32.8331,-96.8089,3.66
Tres Leches Cake,Javier's Gourmet Mexicano,9.34,Mexican,Soaked sponge cake,dessert,32.8331,-96.8089,4.46
Horchata,Javier's Gourmet Mexicano,5.74,Mexican,Cinnamon rice drink,beverage,32.8331,-96.8089,4.56
Beef Fajitas,E Bar Tex Mex,26.43,Mexican,"Grilled skirt steak, peppers, onions",entree,32.8042,-96.7841,3.97
Chicken Enchiladas Verdes,E Bar Tex Mex,17.72,Mexican,"Tomatillo sauce, queso fresco",entree,32.8042,-96.7841,3.63
Queso & Chips,E Bar Tex Mex,13.31,Mexican,"Melted cheese dip, tortilla chips",appetizer,32.8042,-96.7841,3.56
Beef Fajitas,Meso Maya,19.71,Mexican,"Grilled skirt steak, peppers, onions",entree,32.7887,-96.8052,4.84
Chicken Tortilla Soup,Meso Maya,5.98,Mexican,"Tomato-chile broth, tortilla strips",soup,32.7887,-96.8052,4.94
Tres Leches Cake,Meso Maya,10.47,Mexican,Soaked sponge cake,dessert,32.7887,-96.8052,3.75
Queso & Chips,Meso Maya,10.31,Mexican,"Melted cheese dip, tortilla chips",appetizer,32.7887,-96.8052,3.7
Horchata,Meso Maya,5.99,Mexican,Cinnamon rice drink,beverage,32.7887,-96.8052,3.73
Tamal de Pollo,Gloria's Latin Cuisine - Bishop Arts,21.7,Salvadoran & Tex‑Mex,"Steamed corn masa, chicken",entree,32.7503,-96.8281,3.77
Yuca Frita,Gloria's Latin Cuisine - Bishop Arts,9.99,Salvadoran & Tex‑Mex,Fried cassava,side,32.7503,-96.8281,4.57
Pupusa Revuelta,Gloria's Latin Cuisine - Bishop Arts,29.25,Salvadoran & Tex‑Mex,"Pork, cheese & beans",entree,32.7503,-96.8281,3.89
Spicy Tikka Chicken Taco,Velvet Taco - Henderson,5.51,Tacos,"Chicken, tikka sauce, crema",taco,32.8078,-96.785,4.35
Churros,Velvet Taco - Henderson,10.75,Tacos,Cinnamon-sugar dough sticks,dessert,32.8078,-96.785,4.65
Elote Corn,Velvet Taco - Henderson,6.53,Tacos,Street corn with cotija,side,32.8078,-96.785,4.41
Elote Corn,La Ventana - Downtown,9.98,Tacos,Street corn with cotija,side,32.7829,-96.8026,3.75
Churros,La Ventana - Downtown,9.17,Tacos,Cinnamon-sugar dough sticks,dessert,32.7829,-96.8026,4.01
Baja Fish Taco,La Ventana - Downtown,6.88,Tacos,"Fried fish, cabbage, crema",taco,32.7829,-96.8026,4.77
Baja Fish Taco,Tacodeli - Dallas,4.95,Tacos,"Fried fish, cabbage, crema",taco,32.8373,-96.7715,4.2
Spicy Tikka Chicken Taco,Tacodeli - Dallas,4.42,Tacos,"Chicken, tikka sauce, crema",taco,32.8373,-96.7715,4.46
Buffalo Chicken Taco,Tacodeli - Dallas,4.03,Tacos,"Buffalo sauce, ranch slaw",taco,32.8373,-96.7715,4.8
Churros,Tacodeli - Dallas,7.68,Tacos,Cinnamon-sugar dough sticks,dessert,32.8373,-96.7715,4.39
Elote Corn,Tacodeli - Dallas,7.58,Tacos,Street corn with cotija,side,32.8373,-96.7715,4.06
Churros,Torchy's Tacos - Dallas,7.45,Tacos,Cinnamon-sugar dough sticks,dessert,32.8245,-96.7843,4.49
Spicy Tikka Chicken Taco,Torchy's Tacos - Dallas,4.63,Tacos,"Chicken, tikka sauce, crema",taco,32.8245,-96.7843,4.61
Baja Fish Taco,Torchy's Tacos - Dallas,5.22,Tacos,"Fried fish, cabbage, crema",taco,32.8245,-96.7843,4.1
Elote Corn,Torchy's Tacos - Dallas,5.44,Tacos,Street corn with cotija,side,32.8245,-96.7843,4.98
Buffalo Chicken Taco,Torchy's Tacos - Dallas,4.9,Tacos,"Buffalo sauce, ranch slaw",taco,32.8245,-96.7843,3.74
Elote Corn,El Come Taco,6.43,Tacos,Street corn with cotija,side,32.8091,-96.788,4.72
Spicy Tikka Chicken Taco,El Come Taco,3.97,Tacos,"Chicken, tikka sauce, crema",taco,32.8091,-96.788,4.4
Churros,El Come Taco,9.98,Tacos,Cinnamon-sugar dough sticks,dessert,32.8091,-96.788,4.67
Buffalo Chicken Taco,El Come Taco,4.48,Tacos,"Buffalo sauce, ranch slaw",taco,32.8091,-96.788,3.62
Baja Fish Taco,El Come Taco,5.21,Tacos,"Fried fish, cabbage, crema",taco,32.8091,-96.788,3.99
Chicken Enchiladas Verdes,Jose,20.67,Mexican,"Tomatillo sauce, queso fresco",entree,32.8305,-96.8223,3.62
Beef Fajitas,Jose,16.37,Mexican,"Grilled skirt steak, peppers, onions",entree,32.8305,-96.8223,4.6
Tres Leches Cake,Jose,7.43,Mexican,Soaked sponge cake,dessert,32.8305,-96.8223,3.98
Queso & Chips,Jose,13.24,Mexican,"Melted cheese dip, tortilla chips",appetizer,32.8305,-96.8223,3.79
Chicken Tortilla Soup,Jose,8.74,Mexican,"Tomato-chile broth, tortilla strips",soup,32.8305,-96.8223,3.63
BBQ Pulled Pork,Pecan Lodge,23.48,BBQ,"Slow-smoked pulled pork, Texas toast",entree,32.7849,-96.7826,4.88
Smoked Brisket,Pecan Lodge,26.64,BBQ,Texas-style brisket,entree,32.7849,-96.7826,4.68
Mac & Cheese,Pecan Lodge,13.97,BBQ,Creamy mac & cheese,side,32.7849,-96.7826,4.58
BBQ Ribs,Pecan Lodge,21.15,BBQ,Hickory-smoked pork ribs,entree,32.7849,-96.7826,4.41
Coleslaw,Pecan Lodge,5.32,BBQ,Tangy coleslaw,side,32.7849,-96.7826,4.03
BBQ Ribs,Lockhart Smokehouse,17.77,BBQ,Hickory-smoked pork ribs,entree,32.8091,-96.788,4.07
Mac & Cheese,Lockhart Smokehouse,13.62,BBQ,Creamy mac & cheese,side,32.8091,-96.788,4.06
Smoked Brisket,Lockhart Smokehouse,18.03,BBQ,Texas-style brisket,entree,32.8091,-96.788,4.77
BBQ Pulled Pork,Lockhart Smokehouse,23.11,BBQ,"Slow-smoked pulled pork, Texas toast",entree,32.8091,-96.788,4.4
Coleslaw,Lockhart Smokehouse,5.2,BBQ,Tangy coleslaw,side,32.8091,-96.788,3.63
BBQ Pulled Pork,Sonny Bryan's Smokehouse,20.11,BBQ,"Slow-smoked pulled pork, Texas toast",entree,32.8042,-96.7841,4.78
Smoked Brisket,Sonny Bryan's Smokehouse,27.43,BBQ,Texas-style brisket,entree,32.8042,-96.7841,4.82
Coleslaw,Sonny Bryan's Smokehouse,4.78,BBQ,Tangy coleslaw,side,32.8042,-96.7841,4.81
BBQ Ribs,Sonny Bryan's Smokehouse,14.28,BBQ,Hickory-smoked pork ribs,entree,32.8042,-96.7841,4.95
Mac & Cheese,Sonny Bryan's Smokehouse,10.84,BBQ,Creamy mac & cheese,side,32.8042,-96.7841,3.6
Mac & Cheese,Cattleack Barbeque,7.82,BBQ,Creamy mac & cheese,side,32.8447,-96.8523,4.73
BBQ Ribs,Cattleack Barbeque,21.59,BBQ,Hickory-smoked pork ribs,entree,32.8447,-96.8523,3.87
BBQ Pulled Pork,Cattleack Barbeque,23.62,BBQ,"Slow-smoked pulled pork, Texas toast",entree,32.8447,-96.8523,3.97
Smoked Brisket,Cattleack Barbeque,22.23,BBQ,Texas-style brisket,entree,32.8447,-96.8523,4.88
Coleslaw,Cattleack Barbeque,4.96,BBQ,Tangy coleslaw,side,32.8447,-96.8523,4.22
Smoked Brisket,Heim Barbecue,20.04,BBQ,Texas-style brisket,entree,32.7331,-97.3529,4.57
BBQ Pulled Pork,Heim Barbecue,24.38,BBQ,"Slow-smoked pulled pork, Texas toast",entree,32.7331,-97.3529,4.49
Coleslaw,Heim Barbecue,4.84,BBQ,Tangy coleslaw,side,32.7331,-97.3529,4.66
Mac & Cheese,Heim Barbecue,7.76,BBQ,Creamy mac & cheese,side,32.7331,-97.3529,4.99
BBQ Ribs,Heim Barbecue,19.4,BBQ,Hickory-smoked pork ribs,entree,32.7331,-97.3529,4.16
Croissant,85°C Bakery Cafe,5.75,Bakery,Buttery croissant,pastry,32.7825,-96.8022,4.9
Tiramisu,85°C Bakery Cafe,8.73,Bakery,Italian layered dessert,dessert,32.7825,-96.8022,4.4
Chocolate Eclair,85°C Bakery Cafe,7.46,Bakery,Choux pastry with chocolate,pastry,32.7825,-96.8022,4.02
Chocolate Eclair,Emporium Pies,6.79,Bakery,Choux pastry with chocolate,pastry,32.7825,-96.8022,4.81
Tiramisu,Emporium Pies,7.56,Bakery,Italian layered dessert,dessert,32.7825,-96.8022,4.25
Croissant,Emporium Pies,5.65,Bakery,Buttery croissant,pastry,32.7825,-96.8022,3.69
Chocolate Eclair,Hypnotic Donuts,7.19,Bakery,Choux pastry with chocolate,pastry,32.7825,-96.8022,4.59
Tiramisu,Hypnotic Donuts,6.16,Bakery,Italian layered dessert,dessert,32.7825,-96.8022,4.74
Croissant,Hypnotic Donuts,4.74,Bakery,Buttery croissant,pastry,32.7825,-96.8022,4.97
Tiramisu,Saint Ann,7.15,Bakery,Italian layered dessert,dessert,32.7825,-96.8022,4.02
Chocolate Eclair,Saint Ann,5.6,Bakery,Choux pastry with chocolate,pastry,32.7825,-96.8022,4.11
Croissant,Saint Ann,4.74,Bakery,Buttery croissant,pastry,32.7825,-96.8022,4.93
Tiramisu,Bisous Bisous Patisserie,8.75,Bakery,Italian layered dessert,dessert,32.7825,-96.8022,4.4
Croissant,Bisous Bisous Patisserie,5.23,Bakery,Buttery croissant,pastry,32.7825,-96.8022,4.81
Chocolate Eclair,Bisous Bisous Patisserie,6.48,Bakery,Choux pastry with chocolate,pastry,32.7825,-96.8022,4.7
French Onion Soup,The French Room,12.74,French,Caramelized onions & croutons,soup,32.7887,-96.8052,4.93
Beef Bourguignon,The French Room,41.86,French,Red wine braised beef,entree,32.7887,-96.8052,4.84
Escargot,The French Room,14.73,French,Garlic butter snails,appetizer,32.7887,-96.8052,4.69
French Onion Soup,Rodeo Goat - Lowest Greenville,8.45,French,Caramelized onions & croutons,soup,32.8368,-96.7717,4.07
Escargot,Rodeo Goat - Lowest Greenville,14.06,French,Garlic butter snails,appetizer,32.8368,-96.7717,4.68
Beef Bourguignon,Rodeo Goat - Lowest Greenville,49.66,French,Red wine braised beef,entree,32.8368,-96.7717,4.17
French Onion Soup,Boulevardier,8.02,French,Caramelized onions & croutons,soup,32.7503,-96.8281,4.78
Beef Bourguignon,Boulevardier,36.87,French,Red wine braised beef,entree,32.7503,-96.8281,4.44
Escargot,Boulevardier,18.48,French,Garlic butter snails,appetizer,32.7503,-96.8281,4.94
Kung Pao Chicken,Royal China Restaurant,22.63,Chinese,"Spicy chicken, peanuts",entree,32.8078,-96.785,4.57
General Tso's Chicken,Royal China Restaurant,15.32,Chinese,Crispy battered chicken,entree,32.8078,-96.785,4.8
Spring Rolls,Royal China Restaurant,8.15,Chinese,Crispy vegetable rolls,appetizer,32.8078,-96.785,4.8
Spring Rolls,P.F. Chang's - Dallas,6.49,Chinese,Crispy vegetable rolls,appetizer,32.8091,-96.788,4.16
Kung Pao Chicken,P.F. Chang's - Dallas,17.28,Chinese,"Spicy chicken, peanuts",entree,32.8091,-96.788,4.94
General Tso's Chicken,P.F. Chang's - Dallas,14.85,Chinese,Crispy battered chicken,entree,32.8091,-96.788,4.24
General Tso's Chicken,Shanghai Restaurant,14.62,Chinese,Crispy battered chicken,entree,32.7767,-96.797,4.48
Kung Pao Chicken,Shanghai Restaurant,20.94,Chinese,"Spicy chicken, peanuts",entree,32.7767,-96.797,4.01
Spring Rolls,Shanghai Restaurant,7.15,Chinese,Crispy vegetable rolls,appetizer,32.7767,-96.797,4.87
Pad Thai,Thai Chili 2 Go,17.96,Thai,"Stir-fried noodles, tamarind, peanuts",noodles,32.8042,-96.7841,4.47
Green Curry,Thai Chili 2 Go,22.69,Thai,Coconut curry & vegetables,curry,32.8042,-96.7841,4.38
Tom Yum Soup,Thai Chili 2 Go,9.76,Thai,"Hot & sour soup, lemongrass",soup,32.8042,-96.7841,4.64
Tom Yum Soup,Thai Ocha,7.32,Thai,"Hot & sour soup, lemongrass",soup,32.7767,-96.797,4.45
Green Curry,Thai Ocha,26.54,Thai,Coconut curry & vegetables,curry,32.7767,-96.797,4.63
Pad Thai,Thai Ocha,20.56,Thai,"Stir-fried noodles, tamarind, peanuts",noodles,32.7767,-96.797,3.93
Green Curry,Monkey King Noodle,20.5,Thai,Coconut curry & vegetables,curry,32.7767,-96.797,4.84
Pad Thai,Monkey King Noodle,16.49,Thai,"Stir-fried noodles, tamarind, peanuts",noodles,32.7767,-96.797,4.76
Tom Yum Soup,Monkey King Noodle,9.54,Thai,"Hot & sour soup, lemongrass",soup,32.7767,-96.797,4.78
Chicken Biryani,Taj Chaat House,20.98,Indian,"Aromatic rice, tender chicken",rice,32.7767,-96.797,4.24
Butter Chicken,Taj Chaat House,27.99,Indian,Creamy tomato curry,curry,32.7767,-96.797,4.67
Samosas,Taj Chaat House,7.57,Indian,"Fried pastry, spiced potato",appetizer,32.7767,-96.797,4.98
Chicken Biryani,Bawarchi,15.31,Indian,"Aromatic rice, tender chicken",rice,32.7767,-96.797,4.94
Butter Chicken,Bawarchi,23.31,Indian,Creamy tomato curry,curry,32.7767,-96.797,4.6
Samosas,Bawarchi,5.8,Indian,"Fried pastry, spiced potato",appetizer,32.7767,-96.797,4.08
Samosas,Kebab House,5.05,Indian,"Fried pastry, spiced potato",appetizer,32.7767,-96.797,3.89
Chicken Biryani,Kebab House,21.13,Indian,"Aromatic rice, tender chicken",rice,32.7767,-96.797,4.59
Butter Chicken,Kebab House,25.42,Indian,Creamy tomato curry,curry,32.7767,-96.797,4.33
Falafel Wrap,Afrah Mediterranean,15.78,Mediterranean,Chickpea fritters in pita,sandwich,32.8091,-96.788,4.12
Lamb Kebab Plate,Afrah Mediterranean,21.44,Mediterranean,Grilled lamb skewers,entree,32.8091,-96.788,4.98
Hummus & Pita,Afrah Mediterranean,7.13,Mediterranean,Creamy chickpea spread,appetizer,32.8091,-96.788,4.74
Hummus & Pita,Fadi's Mediterranean Grill,6.84,Mediterranean,Creamy chickpea spread,appetizer,32.7767,-96.797,4.56
Lamb Kebab Plate,Fadi's Mediterranean Grill,26.97,Mediterranean,Grilled lamb skewers,entree,32.7767,-96.797,4.71
Falafel Wrap,Fadi's Mediterranean Grill,14.36,Mediterranean,Chickpea fritters in pita,sandwich,32.7767,-96.797,4.55
Lamb Kebab Plate,Ali Baba Mediterranean Grill,24.67,Mediterranean,Grilled lamb skewers,entree,32.7767,-96.797,4.49
Falafel Wrap,Ali Baba Mediterranean Grill,10.79,Mediterranean,Chickpea fritters in pita,sandwich,32.7767,-96.797,4.81
Hummus & Pita,Ali Baba Mediterranean Grill,7.29,Mediterranean,Creamy chickpea spread,appetizer,32.7767,-96.797,4.56
Pork Katsu,Sushi Sake,21.2,Japanese,"Breaded pork cutlet, tonkatsu sauce",entree,32.8331,-96.8089,4.66
Miso Soup,Sushi Sake,4.79,Japanese,Soybean paste soup,soup,32.8331,-96.8089,3.64
Edamame,Sushi Sake,7.02,Japanese,Steamed soybeans,appetizer,32.8331,-96.8089,3.64
Edamame,Sushi Robata,7.21,Japanese,Steamed soybeans,appetizer,32.8078,-96.785,4.86
Pork Katsu,Sushi Robata,23.18,Japanese,"Breaded pork cutlet, tonkatsu sauce",entree,32.8078,-96.785,4.84
Miso Soup,Sushi Robata,3.99,Japanese,Soybean paste soup,soup,32.8078,-96.785,4.65
Pork Katsu,Blue Sushi Sake Grill,16.18,Japanese,"Breaded pork cutlet, tonkatsu sauce",entree,32.8042,-96.7841,4.96
Miso Soup,Blue Sushi Sake Grill,3.66,Japanese,Soybean paste soup,soup,32.8042,-96.7841,4.02
Edamame,Blue Sushi Sake Grill,5.24,Japanese,Steamed soybeans,appetizer,32.8042,-96.7841,4.91
Margherita Pizza,Zoli's NY Pizza,18.53,Pizza,"Tomato sauce, mozzarella, basil",pizza,32.7503,-96.8281,4.69
Caesar Salad,Zoli's NY Pizza,12.75,Pizza,Classic Caesar,salad,32.7503,-96.8281,4.64
Garlic Bread,Zoli's NY Pizza,6.65,Pizza,Toasted garlic butter bread,appetizer,32.7503,-96.8281,4.11
Margherita Pizza,Cane Rosso,16.63,Pizza,"Tomato sauce, mozzarella, basil",pizza,32.8091,-96.788,4.7
Caesar Salad,Cane Rosso,11.78,Pizza,Classic Caesar,salad,32.8091,-96.788,3.56
Garlic Bread,Cane Rosso,4.93,Pizza,Toasted garlic butter bread,appetizer,32.8091,-96.788,4.58
Garlic Bread,Coal Vines,5.92,Pizza,Toasted garlic butter bread,appetizer,32.8042,-96.7841,4.61
Caesar Salad,Coal Vines,9.32,Pizza,Classic Caesar,salad,32.8042,-96.7841,4.67
Margherita Pizza,Coal Vines,15.1,Pizza,"Tomato sauce, mozzarella, basil",pizza,32.8042,-96.7841,4.01
Filet Mignon,Nick & Sam's Steakhouse,65.5,Steakhouse,Tender beef filet,steak,32.8368,-96.8051,4.74
Lobster Bisque,Nick & Sam's Steakhouse,17.04,Steakhouse,Rich seafood soup,soup,32.8368,-96.8051,4.47
Wedge Salad,Nick & Sam's Steakhouse,13.16,Steakhouse,Iceberg lettuce & blue cheese,salad,32.8368,-96.8051,4.01
Wedge Salad,Bob's Steak & Chop House,10.59,Steakhouse,Iceberg lettuce & blue cheese,salad,32.7887,-96.8052,4.85
Lobster Bisque,Bob's Steak & Chop House,18.82,Steakhouse,Rich seafood soup,soup,32.7887,-96.8052,4.25
Filet Mignon,Bob's Steak & Chop House,67.85,Steakhouse,Tender beef filet,steak,32.7887,-96.8052,4.73
Filet Mignon,Del Frisco's Double Eagle Steakhouse,66.6,Steakhouse,Tender beef filet,steak,32.7887,-96.8052,4.44
Lobster Bisque,Del Frisco's Double Eagle Steakhouse,18.98,Steakhouse,Rich seafood soup,soup,32.7887,-96.8052,4.78
Wedge Salad,Del Frisco's Double Eagle Steakhouse,9.14,Steakhouse,Iceberg lettuce & blue cheese,salad,32.7887,-96.8052,4.35
Wedge Salad,Y.O. Ranch Steakhouse,12.06,Steakhouse,Iceberg lettuce & blue cheese,salad,32.7825,-96.8022,4.22
Lobster Bisque,Y.O. Ranch Steakhouse,15.76,Steakhouse,Rich seafood soup,soup,32.7825,-96.8022,4.18
Filet Mignon,Y.O. Ranch Steakhouse,58.91,Steakhouse,Tender beef filet,steak,32.7825,-96.8022,4.35
Lobster Bisque,Pappas Bros. Steakhouse,18.47,Steakhouse,Rich seafood soup,soup,32.7887,-96.8052,4.85
Wedge Salad,Pappas Bros. Steakhouse,11.53,Steakhouse,Iceberg lettuce & blue cheese,salad,32.7887,-96.8052,4.03
Filet Mignon,Pappas Bros. Steakhouse,59.97,Steakhouse,Tender beef filet,steak,32.7887,-96.8052,4.65
Grilled Chicken Breast,Whole Foods Market - Uptown,13.91,Health Food,Herb-marinated chicken,entree,32.8052,-96.8022,4.78
Quinoa Salad,Whole Foods Market - Uptown,11.92,Health Food,"Quinoa, veggies",salad,32.8052,-96.8022,4.37
Avocado Toast,Whole Foods Market - Uptown,10.26,Health Food,"Mashed avocado, toast",breakfast,32.8052,-96.8022,4.85
Avocado Toast,Snap Kitchen,8.51,Health Food,"Mashed avocado, toast",breakfast,32.7767,-96.797,4.19
Quinoa Salad,Snap Kitchen,9.09,Health Food,"Quinoa, veggies",salad,32.7767,-96.797,4.64
Grilled Chicken Breast,Snap Kitchen,10.95,Health Food,Herb-marinated chicken,entree,32.7767,-96.797,4.78
Quinoa Salad,True Food Kitchen - Legacy West,11.97,Health Food,"Quinoa, veggies",salad,32.9243,-96.8222,4.44
Grilled Chicken Breast,True Food Kitchen - Legacy West,11.43,Health Food,Herb-marinated chicken,entree,32.9243,-96.8222,4.13
Avocado Toast,True Food Kitchen - Legacy West,11.45,Health Food,"Mashed avocado, toast",breakfast,32.9243,-96.8222,3.92
Club Sandwich,Bread Winners Café & Bakery,14.47,American,"Turkey, bacon, lettuce, tomato",sandwich,32.8091,-96.788,4.61
Chicken Tenders,Bread Winners Café & Bakery,15.31,American,Crispy fried chicken strips,entree,32.8091,-96.788,4.35
Fries,Bread Winners Café & Bakery,6.55,American,Crispy fried potatoes,side,32.8091,-96.788,4.96
Fries,Snuffer's Restaurant & Bar,5.39,American,Crispy fried potatoes,side,32.7767,-96.797,4.98
Chicken Tenders,Snuffer's Restaurant & Bar,11.03,American,Crispy fried chicken strips,entree,32.7767,-96.797,4.74
Club Sandwich,Snuffer's Restaurant & Bar,12.76,American,"Turkey, bacon, lettuce, tomato",sandwich,32.7767,-96.797,3.91
Club Sandwich,Twisted Root Burger Co.,13.21,American,"Turkey, bacon, lettuce, tomato",sandwich,32.7767,-96.797,4.76
Chicken Tenders,Twisted Root Burger Co.,11.54,American,Crispy fried chicken strips,entree,32.7767,-96.797,4.02
Fries,Twisted Root Burger Co.,5.22,American,Crispy fried potatoes,side,32.7767,-96.797,4.62
Biscuits & Gravy,The Biscuit Bar,16.03,Southern,Fluffy biscuits & sausage gravy,breakfast,32.7767,-96.797,4.45
Fried Catfish,The Biscuit Bar,25.31,Southern,Cornmeal-crusted catfish,entree,32.7767,-96.797,4.64
Fried Chicken Plate,The Biscuit Bar,17.53,Southern,Buttermilk fried chicken,entree,32.7767,-96.797,4.63
Collard Greens,The Biscuit Bar,6.37,Southern,Slow-cooked greens,side,32.7767,-96.797,4.75
Fried Chicken Plate,Tupelo Honey Southern Kitchen,20.4,Southern,Buttermilk fried chicken,entree,32.7767,-96.797,4.46
Biscuits & Gravy,Tupelo Honey Southern Kitchen,11.18,Southern,Fluffy biscuits & sausage gravy,breakfast,32.7767,-96.797,3.79
Collard Greens,Tupelo Honey Southern Kitchen,6.18,Southern,Slow-cooked greens,side,32.7767,-96.797,3.83
Fried Catfish,Tupelo Honey Southern Kitchen,26.63,Southern,Cornmeal-crusted catfish,entree,32.7767,-96.797,4.57
Biscuits & Gravy,Biscuit 'n Bacon,13.62,Southern,Fluffy biscuits & sausage gravy,breakfast,32.7767,-96.797,4.96
Fried Catfish,Biscuit 'n Bacon,26.71,Southern,Cornmeal-crusted catfish,entree,32.7767,-96.797,4.23
Fried Chicken Plate,Biscuit 'n Bacon,22.49,Southern,Buttermilk fried chicken,entree,32.7767,-96.797,4.51
Collard Greens,Biscuit 'n Bacon,8.13,Southern,Slow-cooked greens,side,32.7767,-96.797,4.16
Collard Greens,Screen Door,9.82,Southern,Slow-cooked greens,side,32.7767,-96.797,4.88
Biscuits & Gravy,Screen Door,11.34,Southern,Fluffy biscuits & sausage gravy,breakfast,32.7767,-96.797,4.75
Fried Catfish,Screen Door,23.5,Southern,Cornmeal-crusted catfish,entree,32.7767,-96.797,4.08
Fried Chicken Plate,Screen Door,27.37,Southern,Buttermilk fried chicken,entree,32.7767,-96.797,4.01
Fried Catfish,Yardbird Table & Bar,26.86,Southern,Cornmeal-crusted catfish,entree,32.7767,-96.797,4.25
Biscuits & Gravy,Yardbird Table & Bar,14.09,Southern,Fluffy biscuits & sausage gravy,breakfast,32.7767,-96.797,4.89
Fried Chicken Plate,Yardbird Table & Bar,26.13,Southern,Buttermilk fried chicken,entree,32.7767,-96.797,4.11
Collard Greens,Yardbird Table & Bar,9.68,Southern,Slow-cooked greens,side,32.7767,-96.797,3.6
Comeback Slaw,Hattie B's Hot Chicken (Legacy pickup),4.5,Hot Chicken,Tangy slaw,side,32.7767,-96.797,4.95
Nashville Hot Sandwich,Hattie B's Hot Chicken (Legacy pickup),13.43,Hot Chicken,Hot seasoned chicken,sandwich,32.7767,-96.797,4.23
BBQ Jackfruit Sandwich,Wayward Vegan,15.18,Vegan,Pulled jackfruit bun,sandwich,32.7767,-96.797,4.19
Vegan Nachos,Wayward Vegan,13.27,Vegan,"Cashew queso, black beans",appetizer,32.7767,-96.797,4.18
Kale Caesar,Wayward Vegan,16.44,Vegan,Vegan Caesar,salad,32.7767,-96.797,4.97
Vegan Nachos,Spiral Diner & Bakery,10.76,Vegan,"Cashew queso, black beans",appetizer,32.7767,-96.797,4.5
Kale Caesar,Spiral Diner & Bakery,16.42,Vegan,Vegan Caesar,salad,32.7767,-96.797,4.23
BBQ Jackfruit Sandwich,Spiral Diner & Bakery,17.37,Vegan,Pulled jackfruit bun,sandwich,32.7767,-96.797,4.09
Grilled Salmon,Si Tapas,39.82,Spanish,Lemon herb butter,entree,32.7767,-96.797,4.87
House Salad,Si Tapas,10.63,Spanish,"Greens, vinaigrette",salad,32.7767,-96.797,4.77
Tomato Basil Soup,Si Tapas,9.1,Spanish,Comfort soup,soup,32.7767,-96.797,4.35
Grilled Salmon,Cafe Madrid,26.62,Spanish,Lemon herb butter,entree,32.7767,-96.797,4.05
House Salad,Cafe Madrid,11.89,Spanish,"Greens, vinaigrette",salad,32.7767,-96.797,4.57
Tomato Basil Soup,Cafe Madrid,5.73,Spanish,Comfort soup,soup,32.7767,-96.797,3.93`;

export function parseCSVData(): DishData[] {
  const lines = csvData.trim().split('\n');
  const dishes: DishData[] = [];
  
  // Skip header line
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // Parse CSV line with proper handling of quoted fields
    const fields: string[] = [];
    let currentField = '';
    let inQuotes = false;
    
    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        fields.push(currentField);
        currentField = '';
      } else {
        currentField += char;
      }
    }
    fields.push(currentField); // Add last field
    
    if (fields.length >= 9) {
      dishes.push({
        dish_name: fields[0],
        restaurant: fields[1],
        price: parseFloat(fields[2]) || 0,
        cuisine: fields[3],
        description: fields[4],
        food_type: fields[5],
        latitude: parseFloat(fields[6]) || 0,
        longitude: parseFloat(fields[7]) || 0,
        rating: parseFloat(fields[8]) || 0,
      });
    }
  }
  
  return dishes;
}

export interface RestaurantWithDishes {
  name: string;
  cuisine: string;
  latitude: number;
  longitude: number;
  dishes: DishData[];
  avgRating: number;
  totalReviews: number;
  priceRange: string;
}

export function groupDishesByRestaurant(): RestaurantWithDishes[] {
  const dishes = parseCSVData();
  const restaurantMap = new Map<string, DishData[]>();
  
  // Group dishes by restaurant
  dishes.forEach(dish => {
    if (!restaurantMap.has(dish.restaurant)) {
      restaurantMap.set(dish.restaurant, []);
    }
    restaurantMap.get(dish.restaurant)!.push(dish);
  });
  
  // Convert to restaurant objects
  const restaurants: RestaurantWithDishes[] = [];
  
  restaurantMap.forEach((dishes, restaurantName) => {
    const avgRating = dishes.reduce((sum, d) => sum + d.rating, 0) / dishes.length;
    const avgPrice = dishes.reduce((sum, d) => sum + d.price, 0) / dishes.length;
    
    // Determine price range based on average price
    let priceRange = '$$';
    if (avgPrice < 10) priceRange = '$';
    else if (avgPrice < 20) priceRange = '$$';
    else if (avgPrice < 40) priceRange = '$$$';
    else priceRange = '$$$$';
    
    restaurants.push({
      name: restaurantName,
      cuisine: dishes[0].cuisine, // Use first dish's cuisine
      latitude: dishes[0].latitude,
      longitude: dishes[0].longitude,
      dishes: dishes,
      avgRating: parseFloat(avgRating.toFixed(2)),
      totalReviews: Math.floor(Math.random() * 300) + 50, // Generate random review count
      priceRange,
    });
  });
  
  return restaurants.sort((a, b) => b.avgRating - a.avgRating);
}

// Calculate distance between two coordinates using Haversine formula
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 3959; // Earth's radius in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Get nearest restaurants based on user location
export function getNearestRestaurants(
  userLat: number,
  userLon: number,
  count: number = 8
): Array<RestaurantWithDishes & { distance: number }> {
  const restaurants = groupDishesByRestaurant();
  
  // Calculate distance for each restaurant
  const restaurantsWithDistance = restaurants.map(r => ({
    ...r,
    distance: calculateDistance(userLat, userLon, r.latitude, r.longitude),
  }));
  
  // Sort by distance and return top N
  return restaurantsWithDistance
    .sort((a, b) => a.distance - b.distance)
    .slice(0, count);
}

export function getRestaurantByName(name: string): RestaurantWithDishes | null {
  const restaurants = groupDishesByRestaurant();
  const exact = restaurants.find(r => r.name.toLowerCase() === name.toLowerCase());
  if (exact) return exact;
  // fallback: partial match
  return restaurants.find(r => r.name.toLowerCase().includes(name.toLowerCase())) || null;
}
