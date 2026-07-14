import mongoose, { Document, Model, Schema } from "mongoose";

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

export interface IShoppingItem extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  name: string;
  quantity: number;
  unit: ItemUnit;
  category: ItemCategory;
  notes?: string;
  estimatedPrice?: number;
  brand?: string;
  checked: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CATEGORIES: ItemCategory[] = [
  "produce", "dairy", "bakery", "meat", "beverages",
  "snacks", "frozen", "household", "personal_care", "pantry", "other",
];

const UNITS: ItemUnit[] = [
  "piece", "kg", "g", "lb", "oz", "liter", "ml",
  "pack", "dozen", "carton", "bottle", "box", "bag", "can", "bunch",
];

const ShoppingItemSchema = new Schema<IShoppingItem>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required."],
      index: true,
    },
    name: {
      type: String,
      required: [true, "Item name is required."],
      trim: true,
      minlength: [1, "Item name cannot be empty."],
      maxlength: [100, "Item name must be at most 100 characters."],
    },
    quantity: {
      type: Number,
      required: [true, "Quantity is required."],
      min: [0.01, "Quantity must be greater than 0."],
      default: 1,
    },
    unit: {
      type: String,
      enum: { values: UNITS, message: "Invalid unit." },
      default: "piece",
    },
    category: {
      type: String,
      enum: { values: CATEGORIES, message: "Invalid category." },
      default: "other",
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [300, "Notes must be at most 300 characters."],
    },
    estimatedPrice: {
      type: Number,
      min: [0, "Price cannot be negative."],
    },
    brand: {
      type: String,
      trim: true,
      maxlength: [60, "Brand must be at most 60 characters."],
    },
    checked: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

// ─── Compound index: faster per-user list queries ─────────────────────────────
ShoppingItemSchema.index({ userId: 1, createdAt: -1 });
ShoppingItemSchema.index({ userId: 1, category: 1 });
ShoppingItemSchema.index({ userId: 1, checked: 1 });

const ShoppingItem: Model<IShoppingItem> = mongoose.model<IShoppingItem>(
  "ShoppingItem",
  ShoppingItemSchema
);
export default ShoppingItem;
