export type FoodPreset = {
  name: string;
  calories: number;
  protein: number;
  notes: string;
  group: "ready" | "fruit" | "pre" | "post";
};

export const foodPresets: FoodPreset[] = [
  {
    name: "Starbucks Venti Iced Oatmilk Lavender Latte",
    calories: 240,
    protein: 3,
    notes: "Rough cafe estimate. Good as a treat, not a protein anchor.",
    group: "ready",
  },
  {
    name: "Huel Black Edition RTD bottle",
    calories: 400,
    protein: 35,
    notes: "Complete meal shake; strong post-workout or emergency meal option.",
    group: "ready",
  },
  {
    name: "Organic black beans, 1 can drained",
    calories: 330,
    protein: 21,
    notes: "High fiber, high satiety. Add salsa, rice, eggs, or lean meat.",
    group: "ready",
  },
  { name: "Banana", calories: 105, protein: 1, notes: "Fast carbs before training.", group: "fruit" },
  { name: "Apple", calories: 95, protein: 1, notes: "Easy portable snack.", group: "fruit" },
  { name: "Orange", calories: 62, protein: 1, notes: "Hydrating carbs and vitamin C.", group: "fruit" },
  { name: "Blueberries, 1 cup", calories: 85, protein: 1, notes: "Good with yogurt or Huel.", group: "fruit" },
  { name: "Raspberries, 1 cup", calories: 64, protein: 1, notes: "High fiber, low calorie.", group: "fruit" },
  { name: "Blackberries, 1 cup", calories: 62, protein: 2, notes: "High fiber, easy snack.", group: "fruit" },
  { name: "Strawberries, 1 cup", calories: 50, protein: 1, notes: "Low calorie volume.", group: "fruit" },
  { name: "Grapes, 1 cup", calories: 104, protein: 1, notes: "Quick carb snack.", group: "fruit" },
  { name: "Mango, 1 cup", calories: 99, protein: 1, notes: "Higher-carb fruit option.", group: "fruit" },
  { name: "Pineapple, 1 cup", calories: 82, protein: 1, notes: "Good post-workout carb add-on.", group: "fruit" },
  { name: "Pear", calories: 101, protein: 1, notes: "Fiber-heavy portable fruit.", group: "fruit" },
  { name: "Peach", calories: 59, protein: 1, notes: "Light carb option.", group: "fruit" },
  { name: "Grapefruit", calories: 82, protein: 2, notes: "Tart, hydrating fruit option.", group: "fruit" },
  { name: "Cherries, 1 cup", calories: 97, protein: 2, notes: "Sweet recovery snack.", group: "fruit" },
  { name: "Watermelon, 2 cups", calories: 92, protein: 2, notes: "Hydrating, high volume.", group: "fruit" },
  { name: "Cantaloupe, 1 cup", calories: 54, protein: 1, notes: "Hydrating, light carb option.", group: "fruit" },
  { name: "Honeydew, 1 cup", calories: 61, protein: 1, notes: "Light, easy pre-workout fruit.", group: "fruit" },
  { name: "Kiwi, 2 fruit", calories: 84, protein: 2, notes: "Good vitamin C and fiber.", group: "fruit" },
  { name: "Avocado", calories: 240, protein: 3, notes: "Healthy fats; better with meals than right before hard cardio.", group: "fruit" },
  { name: "Greek yogurt + banana", calories: 245, protein: 20, notes: "Pre-workout: protein plus easy carbs.", group: "pre" },
  { name: "Oats + berries", calories: 260, protein: 9, notes: "Pre-workout: steady carbs before cardio or lifting.", group: "pre" },
  { name: "Rice cakes + peanut butter", calories: 240, protein: 8, notes: "Pre-workout: light, quick energy.", group: "pre" },
  { name: "Huel + fruit", calories: 505, protein: 36, notes: "Post-workout: complete meal plus carbs.", group: "post" },
  { name: "Chicken rice bowl", calories: 520, protein: 42, notes: "Post-workout: lean protein, carbs, sodium.", group: "post" },
  { name: "Eggs + black beans", calories: 430, protein: 30, notes: "Post-workout: protein and fiber-heavy recovery meal.", group: "post" },
];

export const foodGroups = [
  { id: "ready", label: "Ready-made" },
  { id: "pre", label: "Pre-workout" },
  { id: "post", label: "Post-workout" },
  { id: "fruit", label: "Fruit" },
] as const;
