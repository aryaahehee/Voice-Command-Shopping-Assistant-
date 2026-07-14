"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Loader2, Volume2, Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useShopping } from "@/context/shopping-context";
import apiClient from "@/lib/api-client";
import { toast } from "sonner";

// Type declarations for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

const LANGUAGES = [
  { code: "en-US", label: "English" },
  { code: "es-ES", label: "Español" },
  { code: "fr-FR", label: "Français" },
  { code: "de-DE", label: "Deutsch" },
  { code: "hi-IN", label: "हिंदी" },
  { code: "zh-CN", label: "中文" },
  { code: "ar-SA", label: "العربية" },
  { code: "pt-BR", label: "Português" },
];

export function VoicePanel() {
  const { addItem, removeItem, updateItem, items } = useShopping();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [language, setLanguage] = useState("en-US");
  const [isSupported, setIsSupported] = useState(true);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = language;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = "";
      let final = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }
      setInterimTranscript(interim);
      if (final) {
        setTranscript((prev) => (prev + " " + final).trim());
        processCommand(final.trim());
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error("Speech recognition error:", event.error);
      if (event.error !== "aborted") {
        toast.error("Voice recognition error. Please try again.");
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening((prev) => {
        if (prev) recognition.start(); // auto-restart while listening
        return prev;
      });
    };

    recognitionRef.current = recognition;
  }, [language]); // eslint-disable-line react-hooks/exhaustive-deps

  const processCommand = useCallback(async (text: string) => {
    setIsProcessing(true);
    try {
      const { data } = await apiClient.post("/voice/process", {
        text,
        language,
        currentItems: items.map((i) => ({ name: i.name, id: i._id })),
      });
      const command = data.data;

      if (command.action === "add" && command.itemName) {
        await addItem({
          name: command.itemName,
          quantity: command.quantity ?? 1,
          unit: command.unit ?? "piece",
          notes: command.notes,
        });
      } else if (command.action === "remove" && command.itemName) {
        const match = items.find((i) =>
          i.name.toLowerCase().includes(command.itemName.toLowerCase())
        );
        if (match) {
          await removeItem(match._id);
        } else {
          toast.warning(`Could not find "${command.itemName}" in your list.`);
        }
      } else if (command.action === "update" && command.itemName) {
        const match = items.find((i) =>
          i.name.toLowerCase().includes(command.itemName.toLowerCase())
        );
        if (match && command.quantity) {
          await updateItem(match._id, { quantity: command.quantity });
        }
      } else if (command.action === "unknown") {
        toast.info(`I heard: "${text}" — but wasn't sure what to do.`);
      }
    } catch {
      toast.error("Failed to process voice command.");
    } finally {
      setIsProcessing(false);
    }
  }, [addItem, removeItem, updateItem, items, language]);

  const toggleListening = () => {
    const recognition = recognitionRef.current;
    if (!recognition) return;

    if (isListening) {
      recognition.stop();
      setIsListening(false);
      setInterimTranscript("");
    } else {
      setTranscript("");
      recognition.lang = language;
      recognition.start();
      setIsListening(true);
      toast.info("Listening... Say a command!");
    }
  };

  const clearTranscript = () => setTranscript("");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="relative rounded-2xl border border-[var(--border)] bg-[var(--card)] overflow-hidden p-6"
    >
      {/* Animated background when listening */}
      <AnimatePresence>
        {isListening && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(circle at 50% 50%, rgba(124,58,237,0.08) 0%, transparent 70%)",
            }}
          />
        )}
      </AnimatePresence>

      <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
        {/* Mic Button */}
        <div className="flex flex-col items-center gap-3">
          <motion.button
            onClick={isSupported ? toggleListening : undefined}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={!isSupported || isProcessing}
            aria-label={isListening ? "Stop listening" : "Start listening"}
            className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
              isListening
                ? "bg-red-500 shadow-[0_0_30px_rgba(239,68,68,0.5)]"
                : "shadow-[0_0_30px_rgba(124,58,237,0.4)]"
            }`}
            style={
              !isListening
                ? { background: "var(--gradient-primary)" }
                : undefined
            }
          >
            {/* Ripple rings when listening */}
            {isListening && (
              <>
                <motion.span
                  className="absolute inset-0 rounded-full border-2 border-red-400"
                  animate={{ scale: [1, 1.4], opacity: [0.6, 0] }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                />
                <motion.span
                  className="absolute inset-0 rounded-full border-2 border-red-400"
                  animate={{ scale: [1, 1.8], opacity: [0.4, 0] }}
                  transition={{ duration: 1.2, repeat: Infinity, delay: 0.4 }}
                />
              </>
            )}

            {isProcessing ? (
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            ) : isListening ? (
              <MicOff className="w-8 h-8 text-white" />
            ) : (
              <Mic className="w-8 h-8 text-white" />
            )}
          </motion.button>

          <span className="text-sm font-medium text-[var(--muted-foreground)]">
            {!isSupported
              ? "Not supported"
              : isProcessing
              ? "Processing..."
              : isListening
              ? "Tap to stop"
              : "Tap to speak"}
          </span>
        </div>

        {/* Transcript + Controls */}
        <div className="flex-1 w-full space-y-3">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Volume2 className="w-4 h-4 text-purple-400" />
              <span>Voice Command</span>
              {isListening && (
                <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-xs animate-pulse">
                  LIVE
                </span>
              )}
            </div>

            {/* Language selector */}
            <div className="flex items-center gap-1.5">
              <Languages className="w-3.5 h-3.5 text-[var(--muted-foreground)]" />
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="text-xs bg-[var(--secondary)] border border-[var(--border)] rounded-lg px-2 py-1 text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--ring)]"
                aria-label="Select language"
              >
                {LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Transcript Display */}
          <div className="min-h-16 max-h-32 overflow-y-auto rounded-xl bg-[var(--secondary)] border border-[var(--border)] px-4 py-3">
            {transcript || interimTranscript ? (
              <p className="text-sm leading-relaxed">
                <span className="text-[var(--foreground)]">{transcript}</span>
                {interimTranscript && (
                  <span className="text-[var(--muted-foreground)] italic">
                    {" "}{interimTranscript}
                  </span>
                )}
              </p>
            ) : (
              <p className="text-sm text-[var(--muted-foreground)] italic">
                {isListening
                  ? "Listening for your command..."
                  : 'Try: "Add 2 liters of milk" or "Remove bread"'}
              </p>
            )}
          </div>

          {/* Sample commands */}
          <div className="flex flex-wrap gap-2">
            {[
              "Add milk",
              "Remove bread",
              "I need bananas",
              "Buy 2 apples",
              "Increase milk quantity",
            ].map((cmd) => (
              <button
                key={cmd}
                onClick={() => processCommand(cmd)}
                className="px-3 py-1 rounded-full text-xs border border-[var(--border)] bg-[var(--secondary)] text-[var(--muted-foreground)] hover:border-purple-500/50 hover:text-purple-400 transition-all duration-200"
              >
                {cmd}
              </button>
            ))}
          </div>

          {transcript && (
            <Button variant="ghost" size="sm" onClick={clearTranscript} className="text-xs">
              Clear transcript
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
