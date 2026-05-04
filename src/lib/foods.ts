export type FoodCategory = "Grains" | "Fruit" | "Vegetable" | "Protein" | "Fast Food" | "Dairy" | "Snack" | "Beverage" | "Dessert";

export interface Food {
  name: string;
  calories: number; // per serving
  protein: number;  // g
  carbs: number;    // g
  fat: number;      // g
  category: FoodCategory;
  icon: string;     // emoji
  serving: string;
}

export const FOODS: Food[] = [
  { name: "Rice", calories: 206, protein: 4.3, carbs: 45, fat: 0.4, category: "Grains", icon: "🍚", serving: "1 cup cooked" },
  { name: "Roti", calories: 120, protein: 3.1, carbs: 18, fat: 3.7, category: "Grains", icon: "🫓", serving: "1 piece" },
  { name: "Bread", calories: 79, protein: 2.7, carbs: 14, fat: 1, category: "Grains", icon: "🍞", serving: "1 slice" },
  { name: "Pasta", calories: 220, protein: 8, carbs: 43, fat: 1.3, category: "Grains", icon: "🍝", serving: "1 cup" },
  { name: "Oats", calories: 150, protein: 5, carbs: 27, fat: 3, category: "Grains", icon: "🥣", serving: "1 cup cooked" },
  { name: "Apple", calories: 95, protein: 0.5, carbs: 25, fat: 0.3, category: "Fruit", icon: "🍎", serving: "1 medium" },
  { name: "Banana", calories: 105, protein: 1.3, carbs: 27, fat: 0.4, category: "Fruit", icon: "🍌", serving: "1 medium" },
  { name: "Orange", calories: 62, protein: 1.2, carbs: 15, fat: 0.2, category: "Fruit", icon: "🍊", serving: "1 medium" },
  { name: "Mango", calories: 99, protein: 1.4, carbs: 25, fat: 0.6, category: "Fruit", icon: "🥭", serving: "1 cup" },
  { name: "Grapes", calories: 104, protein: 1.1, carbs: 27, fat: 0.2, category: "Fruit", icon: "🍇", serving: "1 cup" },
  { name: "Salad", calories: 33, protein: 1.8, carbs: 6, fat: 0.4, category: "Vegetable", icon: "🥗", serving: "1 bowl" },
  { name: "Broccoli", calories: 55, protein: 3.7, carbs: 11, fat: 0.6, category: "Vegetable", icon: "🥦", serving: "1 cup" },
  { name: "Carrot", calories: 25, protein: 0.5, carbs: 6, fat: 0.1, category: "Vegetable", icon: "🥕", serving: "1 medium" },
  { name: "Egg", calories: 78, protein: 6, carbs: 0.6, fat: 5, category: "Protein", icon: "🥚", serving: "1 large" },
  { name: "Chicken Breast", calories: 165, protein: 31, carbs: 0, fat: 3.6, category: "Protein", icon: "🍗", serving: "100 g" },
  { name: "Fish", calories: 206, protein: 22, carbs: 0, fat: 12, category: "Protein", icon: "🐟", serving: "100 g" },
  { name: "Paneer", calories: 265, protein: 18, carbs: 6, fat: 20, category: "Protein", icon: "🧀", serving: "100 g" },
  { name: "Tofu", calories: 144, protein: 17, carbs: 3, fat: 9, category: "Protein", icon: "🍱", serving: "100 g" },
  { name: "Pizza", calories: 285, protein: 12, carbs: 36, fat: 10, category: "Fast Food", icon: "🍕", serving: "1 slice" },
  { name: "Burger", calories: 354, protein: 17, carbs: 30, fat: 17, category: "Fast Food", icon: "🍔", serving: "1 burger" },
  { name: "Fries", calories: 365, protein: 4, carbs: 48, fat: 17, category: "Fast Food", icon: "🍟", serving: "medium" },
  { name: "Hot Dog", calories: 290, protein: 10, carbs: 24, fat: 17, category: "Fast Food", icon: "🌭", serving: "1 hot dog" },
  { name: "Sandwich", calories: 250, protein: 12, carbs: 30, fat: 9, category: "Fast Food", icon: "🥪", serving: "1 sandwich" },
  { name: "Tacos", calories: 226, protein: 9, carbs: 20, fat: 13, category: "Fast Food", icon: "🌮", serving: "1 taco" },
  { name: "Milk", calories: 122, protein: 8, carbs: 12, fat: 5, category: "Dairy", icon: "🥛", serving: "1 cup" },
  { name: "Yogurt", calories: 100, protein: 10, carbs: 12, fat: 0, category: "Dairy", icon: "🍦", serving: "170 g" },
  { name: "Cheese", calories: 113, protein: 7, carbs: 0.4, fat: 9, category: "Dairy", icon: "🧀", serving: "1 slice" },
  { name: "Chips", calories: 152, protein: 2, carbs: 15, fat: 10, category: "Snack", icon: "🥔", serving: "1 oz" },
  { name: "Popcorn", calories: 31, protein: 1, carbs: 6, fat: 0.4, category: "Snack", icon: "🍿", serving: "1 cup" },
  { name: "Nuts", calories: 170, protein: 6, carbs: 6, fat: 15, category: "Snack", icon: "🥜", serving: "1 oz" },
  { name: "Coffee", calories: 5, protein: 0.3, carbs: 0, fat: 0, category: "Beverage", icon: "☕", serving: "1 cup black" },
  { name: "Tea", calories: 2, protein: 0, carbs: 0.5, fat: 0, category: "Beverage", icon: "🍵", serving: "1 cup" },
  { name: "Orange Juice", calories: 112, protein: 1.7, carbs: 26, fat: 0.5, category: "Beverage", icon: "🧃", serving: "1 cup" },
  { name: "Soda", calories: 140, protein: 0, carbs: 39, fat: 0, category: "Beverage", icon: "🥤", serving: "1 can" },
  { name: "Ice Cream", calories: 207, protein: 3.5, carbs: 24, fat: 11, category: "Dessert", icon: "🍨", serving: "1 cup" },
  { name: "Chocolate", calories: 235, protein: 3, carbs: 26, fat: 13, category: "Dessert", icon: "🍫", serving: "1 bar" },
  { name: "Donut", calories: 195, protein: 2, carbs: 22, fat: 11, category: "Dessert", icon: "🍩", serving: "1 donut" },
  { name: "Cake", calories: 257, protein: 4, carbs: 38, fat: 11, category: "Dessert", icon: "🍰", serving: "1 slice" },
];

export function findFood(query: string): Food | null {
  const q = query.trim().toLowerCase();
  if (!q) return null;
  const exact = FOODS.find(f => f.name.toLowerCase() === q);
  if (exact) return exact;
  const partial = FOODS.find(f => f.name.toLowerCase().includes(q) || q.includes(f.name.toLowerCase()));
  return partial ?? null;
}

export function suggestFoods(query: string, limit = 6): Food[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return FOODS.filter(f => f.name.toLowerCase().includes(q)).slice(0, limit);
}
