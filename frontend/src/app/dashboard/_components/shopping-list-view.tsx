"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, Trash2, Check, Edit3, Filter, ChevronDown } from "lucide-react";
import { useShopping } from "@/context/shopping-context";
import { ShoppingItem, ItemCategory } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { AddItemModal } from "./add-item-modal";

const CATEGORY_EMOJIS: Record<ItemCategory, string> = {
  produce: "🥦",
  dairy: "🥛",
  bakery: "🍞",
  meat: "🥩",
  beverages: "🧃",
  snacks: "🍿",
  frozen: "🧊",
  household: "🧹",
  personal_care: "🧴",
  pantry: "🫙",
  other: "📦",
};

export function ShoppingListView() {
  const { items, isLoading, toggleChecked, removeItem } = useShopping();
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState<ItemCategory | "all">("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<ShoppingItem | null>(null);

  const filtered = items.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      filterCategory === "all" || item.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  // Group by category
  const grouped = filtered.reduce<Record<string, ShoppingItem[]>>((acc, item) => {
    const key = item.category;
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-[var(--border)]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold">Shopping List</h2>
            <p className="text-sm text-[var(--muted-foreground)]">
              {items.filter((i) => !i.checked).length} items remaining
            </p>
          </div>
          <Button size="sm" onClick={() => setShowAddModal(true)}>
            <Plus className="w-4 h-4" />
            Add Item
          </Button>
        </div>

        {/* Search + Filter */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
            <Input
              placeholder="Search items..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="relative">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value as ItemCategory | "all")}
              className="h-10 appearance-none pl-3 pr-8 rounded-lg border border-[var(--border)] bg-[var(--secondary)] text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
              aria-label="Filter by category"
            >
              <option value="all">All Categories</option>
              {Object.entries(CATEGORY_EMOJIS).map(([cat, emoji]) => (
                <option key={cat} value={cat}>
                  {emoji} {cat.replace("_", " ")}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)] pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Items List */}
      <div className="divide-y divide-[var(--border)] max-h-[500px] overflow-y-auto">
        {filtered.length === 0 ? (
          <EmptyState hasSearch={!!search || filterCategory !== "all"} onAdd={() => setShowAddModal(true)} />
        ) : (
          Object.entries(grouped).map(([category, catItems]) => (
            <div key={category}>
              <div className="px-6 py-2 bg-[var(--secondary)]/50 flex items-center gap-2">
                <span>{CATEGORY_EMOJIS[category as ItemCategory]}</span>
                <span className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
                  {category.replace("_", " ")}
                </span>
                <Badge variant="secondary" className="ml-auto text-xs py-0">
                  {catItems.length}
                </Badge>
              </div>
              <AnimatePresence initial={false}>
                {catItems.map((item) => (
                  <ItemRow
                    key={item._id}
                    item={item}
                    onToggle={() => toggleChecked(item._id)}
                    onRemove={() => removeItem(item._id)}
                    onEdit={() => setEditingItem(item)}
                  />
                ))}
              </AnimatePresence>
            </div>
          ))
        )}
      </div>

      {/* Modals */}
      <AddItemModal
        open={showAddModal || !!editingItem}
        item={editingItem}
        onClose={() => {
          setShowAddModal(false);
          setEditingItem(null);
        }}
      />
    </div>
  );
}

function ItemRow({
  item,
  onToggle,
  onRemove,
  onEdit,
}: {
  item: ShoppingItem;
  onToggle: () => void;
  onRemove: () => void;
  onEdit: () => void;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20, height: 0 }}
      transition={{ duration: 0.2 }}
      className="group flex items-center gap-3 px-6 py-4 hover:bg-[var(--secondary)]/50 transition-colors"
    >
      {/* Checkbox */}
      <button
        onClick={onToggle}
        aria-label={item.checked ? "Mark as unchecked" : "Mark as checked"}
        className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
          item.checked
            ? "border-emerald-500 bg-emerald-500"
            : "border-[var(--border)] hover:border-purple-500"
        }`}
      >
        {item.checked && <Check className="w-3 h-3 text-white" />}
      </button>

      {/* Item Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={`font-medium text-sm truncate ${item.checked ? "line-through text-[var(--muted-foreground)]" : ""}`}>
            {item.name}
          </span>
          {item.brand && (
            <span className="text-xs text-[var(--muted-foreground)] truncate">{item.brand}</span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-[var(--muted-foreground)]">
            {item.quantity} {item.unit}
          </span>
          {item.estimatedPrice && (
            <span className="text-xs text-emerald-400">
              ${(item.estimatedPrice * item.quantity).toFixed(2)}
            </span>
          )}
          {item.notes && (
            <span className="text-xs text-[var(--muted-foreground)] italic truncate">
              · {item.notes}
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button variant="ghost" size="icon" onClick={onEdit} aria-label="Edit item"
          className="h-7 w-7 rounded-lg">
          <Edit3 className="w-3.5 h-3.5" />
        </Button>
        <Button variant="ghost" size="icon" onClick={onRemove} aria-label="Remove item"
          className="h-7 w-7 rounded-lg hover:text-red-400">
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>
    </motion.div>
  );
}

function EmptyState({ hasSearch, onAdd }: { hasSearch: boolean; onAdd: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center py-16 px-6 text-center"
    >
      <div className="text-5xl mb-4">{hasSearch ? "🔍" : "🛒"}</div>
      <h3 className="font-semibold mb-1">
        {hasSearch ? "No items found" : "Your list is empty"}
      </h3>
      <p className="text-sm text-[var(--muted-foreground)] mb-4">
        {hasSearch
          ? "Try a different search or category filter."
          : 'Use the mic or click "Add Item" to get started.'}
      </p>
      {!hasSearch && (
        <Button size="sm" onClick={onAdd}>
          <Plus className="w-4 h-4" />
          Add your first item
        </Button>
      )}
    </motion.div>
  );
}
