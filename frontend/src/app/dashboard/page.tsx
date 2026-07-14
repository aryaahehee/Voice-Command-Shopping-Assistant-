"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { Skeleton } from "@/components/ui/skeleton";
import { DashboardHeader } from "./_components/dashboard-header";
import { StatsCards } from "./_components/stats-cards";
import { ShoppingListView } from "./_components/shopping-list-view";
import { VoicePanel } from "./_components/voice-panel";
import { SuggestionsPanel } from "./_components/suggestions-panel";

export default function DashboardPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-grid p-6 space-y-6 max-w-7xl mx-auto">
        <Skeleton className="h-16 w-full rounded-2xl" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="lg:col-span-2 h-96 rounded-2xl" />
          <Skeleton className="h-96 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-grid relative overflow-hidden">
      {/* Ambient orbs */}
      <div className="fixed top-0 right-0 w-[400px] h-[400px] rounded-full opacity-10 pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(124,58,237,0.8) 0%, transparent 70%)", filter: "blur(80px)" }} />
      <div className="fixed bottom-0 left-0 w-[300px] h-[300px] rounded-full opacity-10 pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(236,72,153,0.8) 0%, transparent 70%)", filter: "blur(80px)" }} />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        <DashboardHeader />
        <StatsCards />

        {/* Voice Panel — center stage */}
        <VoicePanel />

        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ShoppingListView />
          </div>
          <div>
            <SuggestionsPanel />
          </div>
        </div>
      </div>
    </div>
  );
}
