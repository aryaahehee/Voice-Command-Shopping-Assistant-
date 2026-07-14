"use client";

import { motion } from "framer-motion";
import { ShoppingCart, CheckCircle2, DollarSign, TrendingUp } from "lucide-react";
import { useShopping } from "@/context/shopping-context";
import { Skeleton } from "@/components/ui/skeleton";

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  gradient: string;
  index: number;
}

function StatCard({ icon: Icon, label, value, sub, gradient, index }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      whileHover={{ y: -4, scale: 1.02 }}
      className="group relative p-5 rounded-2xl border border-[var(--border)] bg-[var(--card)] overflow-hidden cursor-default"
    >
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{ background: `radial-gradient(circle at 0% 0%, rgba(124,58,237,0.06) 0%, transparent 60%)` }}
      />
      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-3 shadow-lg`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div className="text-2xl font-bold mb-0.5">{value}</div>
      <div className="text-sm text-[var(--muted-foreground)]">{label}</div>
      {sub && <div className="text-xs text-purple-400 mt-1">{sub}</div>}
    </motion.div>
  );
}

export function StatsCards() {
  const { items, isLoading } = useShopping();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-2xl" />
        ))}
      </div>
    );
  }

  const totalItems = items.length;
  const checked = items.filter((i) => i.checked).length;
  const unchecked = totalItems - checked;
  const totalCost = items.reduce((sum, i) => sum + (i.estimatedPrice ?? 0) * i.quantity, 0);
  const completionPct = totalItems > 0 ? Math.round((checked / totalItems) * 100) : 0;

  const stats = [
    {
      icon: ShoppingCart,
      label: "Total Items",
      value: totalItems,
      sub: `${unchecked} remaining`,
      gradient: "from-violet-500 to-purple-600",
    },
    {
      icon: CheckCircle2,
      label: "Completed",
      value: checked,
      sub: `${completionPct}% done`,
      gradient: "from-emerald-500 to-teal-600",
    },
    {
      icon: DollarSign,
      label: "Est. Total",
      value: `$${totalCost.toFixed(2)}`,
      sub: "estimated cost",
      gradient: "from-amber-500 to-orange-600",
    },
    {
      icon: TrendingUp,
      label: "This Week",
      value: items.filter((i) => {
        const added = new Date(i.addedAt);
        const diff = (Date.now() - added.getTime()) / (1000 * 60 * 60 * 24);
        return diff <= 7;
      }).length,
      sub: "items added",
      gradient: "from-pink-500 to-rose-600",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((s, i) => (
        <StatCard key={s.label} {...s} index={i} />
      ))}
    </div>
  );
}
