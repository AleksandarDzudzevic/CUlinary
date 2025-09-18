import { MenuItem } from '../types/database';

export interface CornellFoodClassification {
  // Core Food Types (high confidence)
  seafood: number;
  poultry: number;
  beef_pork: number;
  vegetarian: number;
  vegan: number;
  
  // Nutritional Categories
  protein_rich: number;
  healthy_option: number;
  fried_food: number;
  comfort_food: number;
  
  // Cuisine Types (based on actual Cornell menus)
  asian: number;
  italian: number;
  mexican: number;
  american: number;
  indian: number;
  
  // Meal Categories
  breakfast_food: number;
  dessert: number;
}

export class CornellFoodClassifier {
  // Based on actual Cornell dining hall food data
  private static readonly FOOD_PATTERNS = {
    // Seafood (very specific)
    seafood: [
      'pollock', 'fish', 'salmon', 'shrimp', 'tuna', 'clam', 'seafood', 'cioppino', 
      'manhattan clam chowder', 'shrimp fried rice', 'crab', 'lobster', 'scallop',
      'cod', 'halibut', 'mahi mahi', 'tilapia', 'catfish', 'sea bass', 'mussels'
    ],
    
    // Poultry (very common at Cornell)
    poultry: [
      'chicken', 'turkey', 'poultry', 'buffalo chicken', 'bbq chicken', 'fried chicken',
      'chicken tikka', 'korean bbq chicken', 'chicken thigh', 'chicken breast',
      'chicken drumstick', 'chicken nugget', 'chicken cordon', 'orange chicken'
    ],
    
    // Beef & Pork
    beef_pork: [
      'beef', 'pork', 'burger', 'cheeseburger', 'hamburger', 'pulled pork',
      'bacon', 'sausage', 'meatball', 'gyro', 'bbq pork', 'bulgogi',
      'taco beef', 'spicy beef'
    ],
    
    // Vegetarian (clear indicators)
    vegetarian: [
      'vegetarian', 'veggie', 'tofu', 'hummus', 'falafel', 'cheese pizza',
      'mac and cheese', 'pasta', 'eggplant', 'quinoa', 'lentil', 'chickpea',
      'black bean burger', 'veggie supreme', 'marinara', 'alfredo'
    ],
    
    // Vegan (explicit)
    vegan: [
      'vegan', 'plant-based', 'meatless', "chick'n", 'dairy-free', 'tofu',
      'tempeh', 'seitan', 'coconut milk', 'almond', 'soy'
    ],
    
    // High Protein
    protein_rich: [
      'chicken', 'beef', 'pork', 'fish', 'salmon', 'tuna', 'shrimp', 'turkey',
      'tofu', 'eggs', 'quinoa', 'lentil', 'chickpea', 'beans', 'cheese',
      'yogurt', 'protein', 'masala', 'tikka'
    ],
    
    // Healthy Options (Cornell marks some as healthy)
    healthy_option: [
      'salad', 'steamed', 'grilled', 'roasted', 'fresh fruit', 'vegetables',
      'quinoa', 'brown rice', 'whole grain', 'organic', 'harvest salad',
      'yogurt', 'hummus', 'broccoli', 'carrots', 'green beans'
    ],
    
    // Fried Foods
    fried_food: [
      'fried', 'crispy', 'breaded', 'battered', 'fries', 'nuggets', 
      'fried chicken', 'fried rice', 'tempura', 'spring roll', 'fritters',
      'fried potato', 'popcorn chicken'
    ],
    
    // Comfort Food
    comfort_food: [
      'mac and cheese', 'pizza', 'burger', 'fries', 'mashed potato', 
      'comfort', 'casserole', 'gravy', 'cheese sauce', 'fried chicken',
      'pot pie', 'meatloaf', 'chili'
    ],
    
    // Asian Cuisine (very common at Cornell)
    asian: [
      'asian', 'chinese', 'korean', 'thai', 'japanese', 'stir fry', 'wok',
      'teriyaki', 'sesame', 'ginger', 'soy sauce', 'kimchi', 'bulgogi',
      'lo mein', 'fried rice', 'dumpling', 'pot sticker', 'ramen',
      'szechuan', 'orange chicken', 'sweet and sour', 'jasmine rice',
      'egg drop soup', 'hot and sour', 'udon', 'curry', 'pad thai'
    ],
    
    // Italian (enhanced for Cornell dining)
    italian: [
      'pasta', 'pizza', 'italian', 'marinara', 'alfredo', 'parmesan',
      'mozzarella', 'basil', 'pesto', 'risotto', 'gnocchi', 'ravioli',
      'tortellini', 'lasagna', 'spaghetti', 'penne', 'farfalle', 'gemelli',
      'fettuccine', 'linguine', 'rigatoni', 'fusilli', 'capellini', 'angel hair',
      'bolognese', 'carbonara', 'aglio e olio', 'cacio e pepe', 'arrabbiata',
      'puttanesca', 'primavera', 'romano', 'pecorino', 'ricotta', 'provolone',
      'focaccia', 'ciabatta', 'bruschetta', 'antipasto', 'caprese', 'minestrone',
      'italian sausage', 'prosciutto', 'pancetta', 'salami', 'mortadella'
    ],
    
    // Mexican/Latin
    mexican: [
      'mexican', 'taco', 'burrito', 'quesadilla', 'salsa', 'guacamole',
      'chipotle', 'jalapeño', 'cilantro', 'lime', 'enchilada', 'fajita',
      'nachos', 'tortilla', 'pico de gallo', 'black bean', 'corn salsa',
      'ancho chili', 'birria', 'peruvian'
    ],
    
    // American
    american: [
      'american', 'burger', 'fries', 'bbq', 'sandwich', 'hot dog',
      'classic', 'southern', 'nashville', 'carolina', 'buffalo',
      'ranch', 'cheddar', 'bacon', 'pulled pork', 'coleslaw'
    ],
    
    // Indian
    indian: [
      'indian', 'curry', 'tikka', 'masala', 'tandoor', 'naan', 'basmati',
      'turmeric', 'cumin', 'coriander', 'garam masala', 'dal', 'chana',
      'biryani', 'vindaloo', 'korma', 'makhani', 'chutney'
    ],
    
    // Breakfast
    breakfast_food: [
      'breakfast', 'pancake', 'waffle', 'eggs', 'bacon', 'sausage',
      'cereal', 'oatmeal', 'bagel', 'muffin', 'toast', 'hash browns',
      'scrambled', 'omelet', 'frittata', 'continental breakfast'
    ],
    
    // Dessert
    dessert: [
      'dessert', 'cake', 'pie', 'cookie', 'ice cream', 'chocolate',
      'sweet', 'waffle bar', 'bread pudding', 'bars', 'treats',
      'pastries', 'vegan chocolate cake'
    ]
  };

  static classifyItem(item: MenuItem): CornellFoodClassification {
    const classification: CornellFoodClassification = {
      seafood: 0,
      poultry: 0,
      beef_pork: 0,
      vegetarian: 0,
      vegan: 0,
      protein_rich: 0,
      healthy_option: 0,
      fried_food: 0,
      comfort_food: 0,
      asian: 0,
      italian: 0,
      mexican: 0,
      american: 0,
      indian: 0,
      breakfast_food: 0,
      dessert: 0
    };

    // Combine all text for analysis
    const itemText = `${item.name} ${item.category}`.toLowerCase();
    
    // Use Cornell's healthy flag
    if (item.healthy) {
      classification.healthy_option = 1.0;
    }

    // Pattern matching with confidence scores
    for (const [category, patterns] of Object.entries(this.FOOD_PATTERNS)) {
      let maxScore = 0;
      
      for (const pattern of patterns) {
        if (itemText.includes(pattern)) {
          // Higher confidence for exact matches, lower for partial
          const confidence = pattern.length > 6 ? 0.9 : 0.7;
          maxScore = Math.max(maxScore, confidence);
        }
      }
      
      (classification as any)[category] = maxScore;
    }

    // Mutual exclusivity rules for protein types
    const proteinScores = [
      classification.seafood,
      classification.poultry, 
      classification.beef_pork
    ];
    const maxProtein = Math.max(...proteinScores);
    
    // If there's a clear protein winner, reduce others
    if (maxProtein > 0.5) {
      if (classification.seafood < maxProtein) classification.seafood *= 0.3;
      if (classification.poultry < maxProtein) classification.poultry *= 0.3;
      if (classification.beef_pork < maxProtein) classification.beef_pork *= 0.3;
    }

    // Boost vegetarian/vegan scores if no meat detected
    if (maxProtein === 0) {
      classification.vegetarian = Math.max(classification.vegetarian, 0.6);
    }

    return classification;
  }
}
