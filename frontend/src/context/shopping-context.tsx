"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { ShoppingItem } from "@/types";
import apiClient from "@/lib/api-client";
import { toast } from "sonner";
import { useAuth } from "./auth-context";

interface ShoppingContextValue {
  items: ShoppingItem[];
  isLoading: boolean;
  addItem: (item: Partial<ShoppingItem>) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  updateItem: (id: string, updates: Partial<ShoppingItem>) => Promise<void>;
  toggleChecked: (id: string) => Promise<void>;
  refreshItems: () => Promise<void>;
}

const ShoppingContext = createContext<ShoppingContextValue | null>(null);

export function ShoppingProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const refreshItems = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    try {
      const { data } = await apiClient.get("/shopping");
      setItems(data.data || []);
    } catch {
      toast.error("Failed to load shopping items.");
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refreshItems();
  }, [refreshItems]);

  const addItem = useCallback(async (item: Partial<ShoppingItem>) => {
    try {
      const { data } = await apiClient.post("/shopping", item);
      setItems((prev) => [data.data, ...prev]);
      toast.success(`Added "${data.data.name}" to your list!`);
    } catch {
      toast.error("Failed to add item.");
    }
  }, []);

  const removeItem = useCallback(async (id: string) => {
    const prev = items;
    setItems((s) => s.filter((i) => i._id !== id));
    try {
      await apiClient.delete(`/shopping/${id}`);
      toast.success("Item removed.");
    } catch {
      setItems(prev);
      toast.error("Failed to remove item.");
    }
  }, [items]);

  const updateItem = useCallback(async (id: string, updates: Partial<ShoppingItem>) => {
    setItems((s) =>
      s.map((i) => (i._id === id ? { ...i, ...updates } : i))
    );
    try {
      const { data } = await apiClient.patch(`/shopping/${id}`, updates);
      setItems((s) => s.map((i) => (i._id === id ? data.data : i)));
    } catch {
      toast.error("Failed to update item.");
      refreshItems();
    }
  }, [refreshItems]);

  const toggleChecked = useCallback(async (id: string) => {
    const item = items.find((i) => i._id === id);
    if (!item) return;
    await updateItem(id, { checked: !item.checked });
  }, [items, updateItem]);

  return (
    <ShoppingContext.Provider
      value={{ items, isLoading, addItem, removeItem, updateItem, toggleChecked, refreshItems }}
    >
      {children}
    </ShoppingContext.Provider>
  );
}

export function useShopping() {
  const ctx = useContext(ShoppingContext);
  if (!ctx) throw new Error("useShopping must be used within ShoppingProvider");
  return ctx;
}
