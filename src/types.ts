export interface User {
  id: string;
  email: string;
  name: string;
}

export interface UserProfile {
  age: number;
  gender: 'male' | 'female' | 'other';
  height: number; // cm
  weight: number; // kg
  activityLevel: 'low' | 'medium' | 'high';
  goal: 'lose' | 'maintain' | 'gain' | 'muscle';
  allergies: string;
  budget: number; // VND per day
  location: string;
  planDuration: 1 | 7;
}

export interface MacroSplit {
  protein: number; // grams
  carbs: number; // grams
  fat: number; // grams
}

export interface NutritionAnalysis {
  tdee: number;
  targetCalories: number;
  macros: MacroSplit;
  explanation: string;
  progressAdvice?: string; // AI advice based on weight/height history
}

export interface Meal {
  id: string;
  type: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  price: number; // VND
  ingredients: string[];
  recipe: string;
  cheaperAlternative?: string;
  completed?: boolean;
}

export interface DailyPlan {
  day: number;
  meals: Meal[];
  totalCalories: number;
  totalPrice: number;
}

export interface AIResponse {
  analysis: NutritionAnalysis;
  weeklyPlan: DailyPlan[];
}

export interface WeightRecord {
  id: string;
  date: string;
  weight: number;
}

export interface HeightRecord {
  id: string;
  date: string;
  height: number;
}

export interface ExpenseRecord {
  id: string;
  date: string;
  amount: number;
  note: string;
}

export interface ImageAnalysisResult {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  ingredients: string[];
  explanation: string;
}
