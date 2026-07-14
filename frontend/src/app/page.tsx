"use client";

import { motion } from "framer-motion";
import { Mic, ShoppingCart, Sparkles, Zap, Brain, Globe } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: Mic,
    title: "Voice Commands",
    description:
      'Just say "Add 2 liters of milk" and watch your list update instantly.',
    gradient: "from-violet-500 to-purple-600",
  },
  {
    icon: Brain,
    title: "AI Understanding",
    description:
      "Natural language processing understands what you mean, not just what you say.",
    gradient: "from-pink-500 to-rose-600",
  },
  {
    icon: Sparkles,
    title: "Smart Suggestions",
    description:
      "Personalized recommendations based on your habits and the season.",
    gradient: "from-amber-500 to-orange-600",
  },
  {
    icon: Globe,
    title: "Multi-language",
    description:
      "Shop in your language. Supports 30+ languages via the Web Speech API.",
    gradient: "from-cyan-500 to-blue-600",
  },
  {
    icon: Zap,
    title: "Instant Action",
    description:
      "Sub-second response time. No lag between your voice and the result.",
    gradient: "from-emerald-500 to-teal-600",
  },
  {
    icon: ShoppingCart,
    title: "Smart Lists",
    description:
      "Auto-categorize items, track prices, and never forget an ingredient.",
    gradient: "from-indigo-500 to-violet-600",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

export default function HomePage() {
  return (
    <div className="relative min-h-screen bg-grid overflow-hidden">
      {/* Ambient background orbs */}
      <div
        className="fixed top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full opacity-20"
        style={{
          background:
            "radial-gradient(circle, rgba(124,58,237,0.8) 0%, transparent 70%)",
          filter: "blur(80px)",
        }}
      />
      <div
        className="fixed bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full opacity-15"
        style={{
          background:
            "radial-gradient(circle, rgba(236,72,153,0.8) 0%, transparent 70%)",
          filter: "blur(80px)",
        }}
      />

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-5 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2"
        >
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: "var(--gradient-primary)" }}
          >
            <Mic className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold gradient-text">VoiceCart</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3"
        >
          <Link href="/login">
            <Button variant="ghost" size="sm">
              Sign In
            </Button>
          </Link>
          <Link href="/register">
            <Button size="sm">Get Started</Button>
          </Link>
        </motion.div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 flex flex-col items-center text-center px-6 pt-16 pb-24 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[var(--border)] bg-[var(--secondary)] text-sm text-[var(--muted-foreground)] mb-8"
        >
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span>Powered by OpenAI + Web Speech API</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-5xl md:text-7xl font-extrabold leading-tight mb-6"
        >
          Shop smarter with{" "}
          <span className="gradient-text">your voice</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-lg md:text-xl text-[var(--muted-foreground)] max-w-2xl mb-10"
        >
          Just speak naturally. VoiceCart understands "Add two cartons of milk"
          and instantly updates your smart shopping list. No typing, no tapping.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center gap-4"
        >
          <Link href="/register">
            <Button size="xl" className="pulse-glow">
              <Mic className="w-5 h-5" />
              Start Shopping Free
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="outline" size="xl">
              View Dashboard
            </Button>
          </Link>
        </motion.div>

        {/* Hero Visual — Animated mic ring */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="relative mt-20 flex items-center justify-center"
        >
          <div className="absolute w-64 h-64 rounded-full border border-purple-500/20 animate-ping" />
          <div className="absolute w-48 h-48 rounded-full border border-purple-500/30 animate-pulse" />
          <div
            className="w-32 h-32 rounded-full flex items-center justify-center glow pulse-glow"
            style={{ background: "var(--gradient-primary)" }}
          >
            <Mic className="w-14 h-14 text-white" />
          </div>
        </motion.div>

        {/* Sample commands floating */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="mt-12 flex flex-wrap justify-center gap-3"
        >
          {[
            '"Add 2 liters of milk"',
            '"Remove bread"',
            '"I need bananas"',
            '"Find toothpaste under $5"',
            '"Increase milk quantity"',
          ].map((cmd, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 + i * 0.1 }}
              className="px-4 py-2 rounded-full glass text-sm text-[var(--muted-foreground)] border border-purple-500/20"
            >
              {cmd}
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="relative z-10 px-6 py-20 max-w-7xl mx-auto">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-16"
        >
          <motion.h2 variants={itemVariants} className="text-4xl font-bold mb-4">
            Everything you need to{" "}
            <span className="gradient-text">shop smarter</span>
          </motion.h2>
          <motion.p
            variants={itemVariants}
            className="text-[var(--muted-foreground)] text-lg"
          >
            Built for busy people who value their time.
          </motion.p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature, i) => (
            <motion.div
              key={i}
              variants={itemVariants}
              whileHover={{ y: -5, scale: 1.02 }}
              className="group relative p-6 rounded-2xl border border-[var(--border)] bg-[var(--card)] overflow-hidden cursor-default"
            >
              {/* Card glow on hover */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                style={{
                  background: `radial-gradient(circle at 50% 0%, rgba(124,58,237,0.08) 0%, transparent 70%)`
                }}
              />
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 shadow-lg`}
              >
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-[var(--muted-foreground)] text-sm leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* CTA */}
      <section className="relative z-10 px-6 py-24 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto"
        >
          <h2 className="text-4xl font-bold mb-4">
            Ready to <span className="gradient-text">never forget milk</span>{" "}
            again?
          </h2>
          <p className="text-[var(--muted-foreground)] mb-8">
            Join thousands of shoppers using VoiceCart to save time and never
            miss an item.
          </p>
          <Link href="/register">
            <Button size="xl" className="pulse-glow">
              <Mic className="w-5 h-5" />
              Start for Free
            </Button>
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-[var(--border)] px-6 py-8 text-center text-sm text-[var(--muted-foreground)]">
        <p>© 2025 VoiceCart. Built with ❤️ using Next.js, OpenAI & Web Speech API.</p>
      </footer>
    </div>
  );
}
