import ShoppingItem, { IShoppingItem, ItemCategory, ItemUnit } from "../models/ShoppingItem.model";
import PurchaseHistory from "../models/PurchaseHistory.model";
import { AppError } from "../middleware/error.middleware";
import mongoose from "mongoose";

export interface CreateItemDTO {
  name: string;
  quantity?: number;
  unit?: ItemUnit;
  category?: ItemCategory;
  notes?: string;
  estimatedPrice?: number;
  brand?: string;
}

export interface UpdateItemDTO {
  name?: string;
  quantity?: number;
  unit?: ItemUnit;
  category?: ItemCategory;
  notes?: string;
  estimatedPrice?: number;
  brand?: string;
  checked?: boolean;
}

export interface ListItemsQuery {
  category?: ItemCategory;
  checked?: boolean;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: "createdAt" | "name" | "category";
  sortOrder?: "asc" | "desc";
}

// ─── Auto-categorize item name heuristically (fallback when AI is unavailable) ─
const CATEGORY_KEYWORDS: Record<ItemCategory, string[]> = {
  produce: ["apple", "banana", "orange", "grape", "mango", "strawberry", "tomato", "potato", "onion", "garlic", "carrot", "spinach", "lettuce", "cucumber", "pepper", "broccoli", "lemon", "lime", "avocado", "berry", "peach", "plum", "cherry", "melon", "vegetable", "fruit", "herb", "basil", "cilantro", "parsley"],
  dairy: ["milk", "cheese", "yogurt", "butter", "cream", "curd", "paneer", "ghee", "whey", "kefir", "lactose"],
  bakery: ["bread", "bun", "roll", "muffin", "croissant", "bagel", "cake", "pastry", "cookie", "biscuit", "donut", "pie", "waffle", "tortilla", "pita", "naan"],
  meat: ["chicken", "beef", "pork", "lamb", "turkey", "fish", "salmon", "tuna", "shrimp", "prawn", "bacon", "sausage", "ham", "steak", "mutton", "seafood", "crab", "lobster"],
  beverages: ["juice", "soda", "water", "tea", "coffee", "wine", "beer", "whiskey", "vodka", "rum", "gin", "smoothie", "shake", "lemonade", "cola", "sprite", "energy drink", "kombucha"],
  snacks: ["chips", "popcorn", "pretzel", "cracker", "nuts", "peanut", "almond", "cashew", "trail mix", "granola", "bar", "chocolate", "candy", "gummy", "licorice", "jerky"],
  frozen: ["frozen", "ice cream", "gelato", "sorbet", "popsicle", "pizza", "nugget", "waffle fries", "edamame"],
  household: ["detergent", "soap", "shampoo", "conditioner", "toilet", "tissue", "paper towel", "trash bag", "aluminum foil", "plastic wrap", "sponge", "cleaner", "bleach", "disinfectant", "candle", "match", "battery", "light bulb", "laundry"],
  personal_care: ["toothpaste", "toothbrush", "floss", "mouthwash", "deodorant", "razor", "lotion", "moisturizer", "sunscreen", "makeup", "lipstick", "mascara", "nail", "perfume", "cologne", "hair", "face wash"],
  pantry: ["rice", "pasta", "flour", "sugar", "salt", "pepper", "oil", "vinegar", "sauce", "ketchup", "mustard", "mayonnaise", "jam", "peanut butter", "honey", "syrup", "cereal", "oats", "lentil", "bean", "chickpea", "corn", "canned", "soup", "broth", "stock", "spice", "curry", "turmeric", "cumin"],
  other: [],
};

export function autoCategorize(itemName: string): ItemCategory {
  const lower = itemName.toLowerCase();
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some((kw) => lower.includes(kw))) {
      return category as ItemCategory;
    }
  }
  return "other";
}

// ─── Service functions ────────────────────────────────────────────────────────

export async function getItems(
  userId: string,
  query: ListItemsQuery = {}
): Promise<{ items: IShoppingItem[]; total: number }> {
  const {
    category,
    checked,
    search,
    page = 1,
    limit = 100,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = query;

  const filter: mongoose.FilterQuery<IShoppingItem> = {
    userId: new mongoose.Types.ObjectId(userId),
  };

  if (category) filter.category = category;
  if (typeof checked === "boolean") filter.checked = checked;
  if (search?.trim()) {
    filter.name = { $regex: search.trim(), $options: "i" };
  }

  const sort: Record<string, 1 | -1> = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

  const [items, total] = await Promise.all([
    ShoppingItem.find(filter)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean<IShoppingItem[]>(),
    ShoppingItem.countDocuments(filter),
  ]);

  return { items, total };
}

export async function createItem(
  userId: string,
  dto: CreateItemDTO
): Promise<IShoppingItem> {
  const category = dto.category ?? autoCategorize(dto.name);

  const item = await ShoppingItem.create({
    userId: new mongoose.Types.ObjectId(userId),
    ...dto,
    category,
    quantity: dto.quantity ?? 1,
    unit: dto.unit ?? "piece",
  });

  return item;
}

export async function updateItem(
  userId: string,
  itemId: string,
  dto: UpdateItemDTO
): Promise<IShoppingItem> {
  const item = await ShoppingItem.findOneAndUpdate(
    {
      _id: new mongoose.Types.ObjectId(itemId),
      userId: new mongoose.Types.ObjectId(userId),
    },
    { $set: dto },
    { new: true, runValidators: true }
  );

  if (!item) throw new AppError("Item not found.", 404);

  // If item was just checked off, record it in purchase history
  if (dto.checked === true) {
    await PurchaseHistory.create({
      userId: new mongoose.Types.ObjectId(userId),
      itemName: item.name.toLowerCase(),
      category: item.category,
      purchasedAt: new Date(),
    }).catch(() => null); // non-critical — don't fail the request
  }

  return item;
}

export async function deleteItem(
  userId: string,
  itemId: string
): Promise<void> {
  const result = await ShoppingItem.deleteOne({
    _id: new mongoose.Types.ObjectId(itemId),
    userId: new mongoose.Types.ObjectId(userId),
  });

  if (result.deletedCount === 0) throw new AppError("Item not found.", 404);
}

export async function deleteCheckedItems(userId: string): Promise<number> {
  const result = await ShoppingItem.deleteMany({
    userId: new mongoose.Types.ObjectId(userId),
    checked: true,
  });
  return result.deletedCount;
}

export async function getItemById(
  userId: string,
  itemId: string
): Promise<IShoppingItem> {
  const item = await ShoppingItem.findOne({
    _id: new mongoose.Types.ObjectId(itemId),
    userId: new mongoose.Types.ObjectId(userId),
  });
  if (!item) throw new AppError("Item not found.", 404);
  return item;
}
