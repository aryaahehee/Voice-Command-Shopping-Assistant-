import mongoose, { Document, Model, Schema } from "mongoose";
import { ItemCategory } from "./ShoppingItem.model";

/**
 * Tracks every item that was *checked off* (purchased).
 * Used by the recommendation engine to surface frequent buys.
 */
export interface IPurchaseHistory extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  itemName: string;
  category: ItemCategory;
  purchasedAt: Date;
}

const PurchaseHistorySchema = new Schema<IPurchaseHistory>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    itemName: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    category: {
      type: String,
      required: true,
    },
    purchasedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: false }
);

PurchaseHistorySchema.index({ userId: 1, itemName: 1 });
PurchaseHistorySchema.index({ userId: 1, purchasedAt: -1 });

const PurchaseHistory: Model<IPurchaseHistory> = mongoose.model<IPurchaseHistory>(
  "PurchaseHistory",
  PurchaseHistorySchema
);
export default PurchaseHistory;
