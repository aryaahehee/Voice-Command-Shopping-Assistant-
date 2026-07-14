"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Calendar, ArrowRightLeft, RefreshCw, Plus, HelpCircle } from "lucide-react";
import { useShopping } from "@/context/shopping-context";
import { Suggestion, Substitute, ItemCategory } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import apiClient from "@/lib/api-client";
import { toast } from "sonner";

export function SuggestionsPanel() {
  const { addItem, items } = useShopping();
  const [smartSuggestions, setSmartSuggestions] = useState<Suggestion[]>([]);
  const [seasonalSuggestions, setSeasonalSuggestions] = useState<Suggestion[]>([]);
  const [substitutes, setSubstitutes] = useState<Substitute[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"smart" | "seasonal" | "substitutes">("smart");

  const fetchSuggestions = useCallback(async () => {
    setIsLoading(true);
    try {
      // Parallel fetch for suggestions
      const [smartRes, seasonalRes, substitutesRes] = await Promise.all([
        apiClient.get("/suggestions/smart").catch(() => ({ data: { data: [] } })),
        apiClient.get("/suggestions/seasonal").catch(() => ({ data: { data: [] } })),
        apiClient.post("/suggestions/substitutes", {
          items: items.map((i) => i.name),
        }).catch(() => ({ data: { data: [] } })),
      ]);

      setSmartSuggestions(smartRes.data.data || []);
      setSeasonalSuggestions(seasonalRes.data.data || []);
      setSubstitutes(substitutesRes.data.data || []);
    } catch {
      toast.error("Failed to load suggestions.");
    } finally {
      setIsLoading(false);
    }
  }, [items]);

  useEffect(() => {
    // Only load if items change significantly or on mount
    fetchSuggestions();
  }, [fetchSuggestions]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAddSuggested = async (name: string, category: ItemCategory) => {
    await addItem({
      name,
      category,
      quantity: 1,
      unit: "piece",
    });
  };

  const handleAddSubstitute = async (sub: Substitute, altName: string) => {
    // Find original item in list
    const originalItem = items.find(
      (i) => i.name.toLowerCase() === sub.original.toLowerCase()
    );

    if (originalItem) {
      await addItem({
        name: altName,
        category: originalItem.category,
        quantity: originalItem.quantity,
        unit: originalItem.unit,
        notes: `Substitute for ${originalItem.name}`,
      });
      toast.success(`Added ${altName} as substitute.`);
    } else {
      await addItem({
        name: altName,
        category: "other",
        quantity: 1,
        unit: "piece",
      });
    }
  };

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 space-y-4">
      {/* Title */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-400" />
          Smart suggestions
        </h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={fetchSuggestions}
          disabled={isLoading}
          className="h-8 w-8 rounded-lg"
          aria-label="Refresh suggestions"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-[var(--secondary)] rounded-xl border border-[var(--border)]">
        {[
          { id: "smart", label: "Smart", icon: Sparkles },
          { id: "seasonal", label: "Seasonal", icon: Calendar },
          { id: "substitutes", label: "Substitutes", icon: ArrowRightLeft },
        ].map((t) => {
          const Icon = t.icon;
          const active = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as "smart" | "seasonal" | "substitutes")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                active
                  ? "bg-[var(--card)] text-[var(--foreground)] border border-[var(--border)] shadow-sm"
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div className="min-h-56">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-2 py-4"
            >
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-14 rounded-xl bg-[var(--secondary)] shimmer" />
              ))}
            </motion.div>
          ) : (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className="space-y-2 py-2"
            >
              {activeTab === "smart" && (
                <SuggestionList
                  suggestions={smartSuggestions}
                  onAdd={handleAddSuggested}
                  emptyMessage="No smart suggestions. Shop more to train the engine!"
                />
              )}
              {activeTab === "seasonal" && (
                <SuggestionList
                  suggestions={seasonalSuggestions}
                  onAdd={handleAddSuggested}
                  emptyMessage="No seasonal recommendations available right now."
                />
              )}
              {activeTab === "substitutes" && (
                <SubstituteList
                  substitutes={substitutes}
                  onAdd={handleAddSubstitute}
                  emptyMessage="No substitute recommendations. Add items to see alternatives."
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function SuggestionList({
  suggestions,
  onAdd,
  emptyMessage,
}: {
  suggestions: Suggestion[];
  onAdd: (name: string, category: ItemCategory) => void;
  emptyMessage: string;
}) {
  if (suggestions.length === 0) {
    return <EmptyPanel message={emptyMessage} />;
  }

  return (
    <div className="space-y-2">
      {suggestions.map((s, idx) => (
        <motion.div
          key={s.name}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: idx * 0.05 }}
          className="flex items-center justify-between p-3 rounded-xl border border-[var(--border)] bg-[var(--secondary)]/30 hover:bg-[var(--secondary)]/50 transition-colors"
        >
          <div>
            <div className="text-sm font-semibold">{s.name}</div>
            <div className="flex gap-1.5 mt-1">
              <Badge variant="secondary" className="text-[10px] py-0 px-1.5 uppercase">
                {s.category}
              </Badge>
              <Badge variant="secondary" className="text-[10px] py-0 px-1.5 bg-purple-500/10 text-purple-400">
                {s.reason.replace("_", " ")}
              </Badge>
            </div>
          </div>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => onAdd(s.name, s.category)}
            className="w-8 h-8 rounded-lg"
            aria-label={`Add ${s.name}`}
          >
            <Plus className="w-4 h-4 text-purple-400" />
          </Button>
        </motion.div>
      ))}
    </div>
  );
}

function SubstituteList({
  substitutes,
  onAdd,
  emptyMessage,
}: {
  substitutes: Substitute[];
  onAdd: (sub: Substitute, altName: string) => void;
  emptyMessage: string;
}) {
  if (substitutes.length === 0) {
    return <EmptyPanel message={emptyMessage} />;
  }

  return (
    <div className="space-y-3">
      {substitutes.map((s, sIdx) => (
        <div key={s.original} className="p-3 rounded-xl border border-[var(--border)] bg-[var(--secondary)]/30 space-y-2">
          <div className="text-xs font-semibold text-[var(--muted-foreground)] uppercase">
            Alternatives for: <span className="text-[var(--foreground)]">{s.original}</span>
          </div>
          <div className="space-y-1.5">
            {s.alternatives.map((alt, aIdx) => (
              <motion.div
                key={alt.name}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: (sIdx + aIdx) * 0.05 }}
                className="flex items-center justify-between p-2 rounded-lg bg-[var(--card)] border border-[var(--border)] text-xs"
              >
                <div>
                  <div className="font-semibold">{alt.name}</div>
                  <div className="text-[10px] text-[var(--muted-foreground)] mt-0.5">
                    {alt.reason}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {alt.priceComparison && (
                    <span className={`text-[10px] ${
                      alt.priceComparison === "cheaper"
                        ? "text-emerald-400"
                        : alt.priceComparison === "similar"
                        ? "text-[var(--muted-foreground)]"
                        : "text-amber-400"
                    }`}>
                      {alt.priceComparison}
                    </span>
                  )}
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => onAdd(s, alt.name)}
                    className="w-6 h-6 rounded-md"
                    aria-label={`Add alternative ${alt.name}`}
                  >
                    <Plus className="w-3.5 h-3.5 text-purple-400" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyPanel({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
      <HelpCircle className="w-8 h-8 text-[var(--muted-foreground)] mb-2" />
      <p className="text-xs text-[var(--muted-foreground)] max-w-[200px]">
        {message}
      </p>
    </div>
  );
}
