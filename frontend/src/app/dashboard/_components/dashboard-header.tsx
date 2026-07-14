"use client";

import { motion } from "framer-motion";
import { Mic, LogOut, Bell, User, Settings } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";

export function DashboardHeader() {
  const { user, logout } = useAuth();

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between py-2"
    >
      {/* Logo + Greeting */}
      <div className="flex items-center gap-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: "var(--gradient-primary)" }}>
            <Mic className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold gradient-text hidden sm:block">VoiceCart</span>
        </Link>

        <div className="hidden md:block">
          <h1 className="text-lg font-semibold">
            Good {getTimeOfDay()},{" "}
            <span className="gradient-text">{user?.name?.split(" ")[0] ?? "Shopper"}</span> 👋
          </h1>
          <p className="text-xs text-[var(--muted-foreground)]">What are we shopping for today?</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-purple-500" />
        </Button>

        <div className="flex items-center gap-2 px-3 py-2 rounded-xl glass border border-[var(--border)]">
          <div className="w-7 h-7 rounded-full flex items-center justify-center"
            style={{ background: "var(--gradient-primary)" }}>
            <User className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-sm font-medium hidden sm:block">{user?.name ?? "User"}</span>
        </div>

        <Button variant="ghost" size="icon" aria-label="Settings">
          <Settings className="w-4 h-4" />
        </Button>

        <Button variant="ghost" size="icon" onClick={logout} aria-label="Logout">
          <LogOut className="w-4 h-4" />
        </Button>
      </div>
    </motion.header>
  );
}

function getTimeOfDay(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "morning";
  if (hour < 18) return "afternoon";
  return "evening";
}
