/** Shared TypeScript types across the frontend application */

export type ItemCategory =
  | "produce"
  | "dairy"
  | "bakery"
  | "meat"
  | "beverages"
  | "snacks"
  | "frozen"
  | "household"
  | "personal_care"
  | "pantry"
  | "other";

export type ItemUnit =
  | "piece"
  | "kg"
  | "g"
  | "lb"
  | "oz"
  | "liter"
  | "ml"
  | "pack"
  | "dozen"
  | "carton"
  | "bottle"
  | "box"
  | "bag"
  | "can"
  | "bunch";

export interface ShoppingItem {
  _id: string;
  name: string;
  quantity: number;
  unit: ItemUnit;
  category: ItemCategory;
  notes?: string;
  estimatedPrice?: number;
  brand?: string;
  checked: boolean;
  addedAt: string;
  updatedAt: string;
  userId: string;
}

export interface ShoppingList {
  _id: string;
  name: string;
  items: ShoppingItem[];
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  createdAt: string;
  preferredLanguage?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface Suggestion {
  name: string;
  category: ItemCategory;
  reason: "frequently_bought" | "seasonal" | "weather" | "trending";
  confidence: number;
}

export interface Substitute {
  original: string;
  alternatives: Array<{
    name: string;
    reason: string;
    priceComparison?: "cheaper" | "similar" | "pricier";
  }>;
}

export interface VoiceCommand {
  action: "add" | "remove" | "update" | "search" | "unknown";
  itemName?: string;
  quantity?: number;
  unit?: ItemUnit;
  notes?: string;
  searchQuery?: string;
  rawText: string;
  confidence: number;
}

export interface ShoppingStats {
  totalItems: number;
  completedItems: number;
  totalEstimatedCost: number;
  categoryCounts: Record<ItemCategory, number>;
  mostFrequentItem: string;
  weeklyActivity: Array<{ day: string; count: number }>;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  page: number;
  limit: number;
}
