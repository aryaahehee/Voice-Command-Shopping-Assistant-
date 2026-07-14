"use client";

import { useEffect, useState } from "react";
import { X, Save, AlertCircle } from "lucide-react";
import { useShopping } from "@/context/shopping-context";
import { ShoppingItem, ItemCategory, ItemUnit } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface AddItemModalProps {
  open: boolean;
  item: ShoppingItem | null;
  onClose: () => void;
}

const CATEGORIES: ItemCategory[] = [
  "produce",
  "dairy",
  "bakery",
  "meat",
  "beverages",
  "snacks",
  "frozen",
  "household",
  "personal_care",
  "pantry",
  "other",
];

const UNITS: ItemUnit[] = [
  "piece",
  "kg",
  "g",
  "lb",
  "oz",
  "liter",
  "ml",
  "pack",
  "dozen",
  "carton",
  "bottle",
  "box",
  "bag",
  "can",
  "bunch",
];

export function AddItemModal({ open, item, onClose }: AddItemModalProps) {
  const { addItem, updateItem } = useShopping();
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState<ItemUnit>("piece");
  const [category, setCategory] = useState<ItemCategory>("other");
  const [notes, setNotes] = useState("");
  const [brand, setBrand] = useState("");
  const [estimatedPrice, setEstimatedPrice] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (item) {
      setName(item.name);
      setQuantity(item.quantity);
      setUnit(item.unit);
      setCategory(item.category);
      setNotes(item.notes || "");
      setBrand(item.brand || "");
      setEstimatedPrice(item.estimatedPrice?.toString() || "");
    } else {
      setName("");
      setQuantity(1);
      setUnit("piece");
      setCategory("other");
      setNotes("");
      setBrand("");
      setEstimatedPrice("");
    }
  }, [item, open]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    const parsedPrice = parseFloat(estimatedPrice);
    const itemData = {
      name: name.trim(),
      quantity: Number(quantity),
      unit,
      category,
      notes: notes.trim() || undefined,
      brand: brand.trim() || undefined,
      estimatedPrice: isNaN(parsedPrice) ? undefined : parsedPrice,
    };

    try {
      if (item) {
        await updateItem(item._id, itemData);
      } else {
        await addItem(itemData);
      }
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-2xl z-10">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-[var(--muted-foreground)] hover:bg-[var(--secondary)] hover:text-[var(--foreground)] transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-bold mb-6 gradient-text">
          {item ? "Edit Shopping Item" : "Add Shopping Item"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="modal-name" className="block text-sm font-medium mb-1">
              Item Name <span className="text-red-400">*</span>
            </label>
            <Input
              id="modal-name"
              placeholder="e.g. Organic Milk"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="modal-quantity" className="block text-sm font-medium mb-1">
                Quantity
              </label>
              <Input
                id="modal-quantity"
                type="number"
                min="0.1"
                step="any"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                required
              />
            </div>
            <div>
              <label htmlFor="modal-unit" className="block text-sm font-medium mb-1">
                Unit
              </label>
              <select
                id="modal-unit"
                value={unit}
                onChange={(e) => setUnit(e.target.value as ItemUnit)}
                className="w-full h-10 px-3 rounded-lg border border-[var(--border)] bg-[var(--secondary)] text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
              >
                {UNITS.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="modal-category" className="block text-sm font-medium mb-1">
                Category
              </label>
              <select
                id="modal-category"
                value={category}
                onChange={(e) => setCategory(e.target.value as ItemCategory)}
                className="w-full h-10 px-3 rounded-lg border border-[var(--border)] bg-[var(--secondary)] text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c.replace("_", " ")}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="modal-price" className="block text-sm font-medium mb-1">
                Est. Unit Price ($)
              </label>
              <Input
                id="modal-price"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={estimatedPrice}
                onChange={(e) => setEstimatedPrice(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="modal-brand" className="block text-sm font-medium mb-1">
                Brand (Optional)
              </label>
              <Input
                id="modal-brand"
                placeholder="e.g. Kirkland"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="modal-notes" className="block text-sm font-medium mb-1">
                Notes (Optional)
              </label>
              <Input
                id="modal-notes"
                placeholder="e.g. Low fat"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border)]">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                "Saving..."
              ) : (
                <span className="flex items-center gap-1.5">
                  <Save className="w-4 h-4" />
                  {item ? "Save Changes" : "Add Item"}
                </span>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
