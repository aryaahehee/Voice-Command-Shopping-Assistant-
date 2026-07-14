import { getOpenAIClient } from "../config/openai";
import { ItemUnit } from "../models/ShoppingItem.model";
import logger from "../config/logger";

export interface VoiceCommand {
  action: "add" | "remove" | "update" | "search" | "unknown";
  itemName?: string;
  quantity?: number;
  unit?: ItemUnit;
  notes?: string;
  searchQuery?: string;
  rawText: string;
  confidence: number;
}

interface CurrentItem {
  name: string;
  id: string;
}

// ─── Regex-based fallback parser ──────────────────────────────────────────────
// Handles common command patterns without requiring OpenAI.

const QUANTITY_WORDS: Record<string, number> = {
  one: 1, a: 1, an: 1,
  two: 2, three: 3, four: 4, five: 5,
  six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
  half: 0.5, dozen: 12, couple: 2, few: 3,
};

function parseQuantityWord(word: string): number | null {
  return QUANTITY_WORDS[word.toLowerCase()] ?? null;
}

function extractQuantityAndUnit(text: string): { quantity: number; unit: ItemUnit; rest: string } {
  // Match patterns: "2 kg", "3 liters", "half a dozen", "a pack of", "2.5 lb"
  const numericMatch = text.match(/^(\d+(?:\.\d+)?)\s*(kg|g|lb|oz|liter|liters|ml|pack|packs|dozen|carton|bottle|bottles|box|boxes|bag|bags|can|cans|bunch|bunches|piece|pieces?)?\s+(?:of\s+)?/i);
  if (numericMatch) {
    const qty = parseFloat(numericMatch[1]);
    const rawUnit = numericMatch[2]?.toLowerCase().replace(/s$/, "") as ItemUnit | undefined;
    const unitMap: Record<string, ItemUnit> = {
      liter: "liter", ml: "ml", kg: "kg", g: "g", lb: "lb", oz: "oz",
      pack: "pack", dozen: "dozen", carton: "carton", bottle: "bottle",
      box: "box", bag: "bag", can: "can", bunch: "bunch", piece: "piece",
    };
    const unit: ItemUnit = (rawUnit && unitMap[rawUnit]) ? unitMap[rawUnit] : "piece";
    const rest = text.slice(numericMatch[0].length).trim();
    return { quantity: qty, unit, rest };
  }

  // Word-based quantities: "two apples", "a milk"
  const wordMatch = text.match(/^(one|a|an|two|three|four|five|six|seven|eight|nine|ten|half|dozen|couple|few)\s+(?:of\s+)?/i);
  if (wordMatch) {
    const qty = parseQuantityWord(wordMatch[1]) ?? 1;
    const rest = text.slice(wordMatch[0].length).trim();
    return { quantity: qty, unit: "piece", rest };
  }

  return { quantity: 1, unit: "piece", rest: text };
}

function heuristicParse(text: string): VoiceCommand {
  const normalized = text.trim().toLowerCase();

  // ── Remove patterns ────────────────────────────────────────────────────────
  const removePatterns = [
    /^(?:remove|delete|take off|take out|drop|get rid of|scratch|cancel)\s+(.+)$/i,
    /^(.+)\s+(?:is|from the list|off the list|off)$/i,
  ];
  for (const pattern of removePatterns) {
    const m = normalized.match(pattern);
    if (m) {
      const itemName = m[1].replace(/^(the|my|some|a|an)\s+/i, "").trim();
      return { action: "remove", itemName, rawText: text, confidence: 0.75 };
    }
  }

  // ── Update/increase/decrease patterns ─────────────────────────────────────
  const updatePatterns = [
    /^(?:increase|change|update|set|make it)\s+(.+?)\s+(?:to|quantity to)?\s+(\d+(?:\.\d+)?)$/i,
    /^(?:i need|i want)\s+(\d+(?:\.\d+)?)\s+(?:of\s+)?(.+)$/i,
  ];
  for (const pattern of updatePatterns) {
    const m = normalized.match(pattern);
    if (m) {
      return {
        action: "update",
        itemName: m[1].trim(),
        quantity: parseFloat(m[2]),
        rawText: text,
        confidence: 0.7,
      };
    }
  }

  // ── Search patterns ────────────────────────────────────────────────────────
  const searchPatterns = [
    /^(?:find|search|look for|show me|where is|what about)\s+(.+)$/i,
    /^(.+)\s+under\s+\$?(\d+(?:\.\d+)?)$/i,
  ];
  for (const pattern of searchPatterns) {
    const m = normalized.match(pattern);
    if (m) {
      return {
        action: "search",
        searchQuery: m[1].trim(),
        rawText: text,
        confidence: 0.7,
      };
    }
  }

  // ── Add patterns (most common) ────────────────────────────────────────────
  const addPatterns = [
    /^(?:add|buy|get|purchase|pick up|grab|we need|need|i need|i want|please (?:add|buy|get|purchase)|put|include)\s+(.+)$/i,
    /^(.+)\s+(?:please|to (?:the |my )?(?:list|cart))$/i,
  ];

  for (const pattern of addPatterns) {
    const m = normalized.match(pattern);
    if (m) {
      let raw = m[1]
        .replace(/^(some|a|an|the|more|extra)\s+/i, "")
        .replace(/\s+(please|to (?:the |my )?(?:list|cart)|on (?:the |my )?(?:list|cart))$/i, "")
        .trim();

      const { quantity, unit, rest } = extractQuantityAndUnit(raw);
      const itemName = rest || raw;

      return {
        action: "add",
        itemName: itemName.trim(),
        quantity,
        unit,
        rawText: text,
        confidence: 0.65,
      };
    }
  }

  // ── Plain noun fallback — treat anything left as an "add" ─────────────────
  if (normalized.split(" ").length <= 4) {
    return {
      action: "add",
      itemName: normalized.trim(),
      quantity: 1,
      unit: "piece",
      rawText: text,
      confidence: 0.4,
    };
  }

  return { action: "unknown", rawText: text, confidence: 0 };
}

// ─── OpenAI-powered parser ────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are a voice command parser for a shopping assistant app.
Parse the user's spoken command and return ONLY a valid JSON object with these fields:
- action: "add" | "remove" | "update" | "search" | "unknown"
- itemName: string (the item name, singular, lowercase — omit if not applicable)
- quantity: number (default 1 — omit if not applicable)
- unit: one of ["piece","kg","g","lb","oz","liter","ml","pack","dozen","carton","bottle","box","bag","can","bunch"] (omit if not applicable)
- notes: string (any extra detail, e.g. "organic", "low fat" — omit if not applicable)
- searchQuery: string (only for search actions)
- confidence: number between 0 and 1

Rules:
- "add milk" → action=add, itemName=milk, quantity=1, unit=piece
- "buy 2 kg apples" → action=add, itemName=apples, quantity=2, unit=kg
- "remove bread" → action=remove, itemName=bread
- "increase milk quantity" → action=update, itemName=milk, quantity=2
- "find toothpaste under five dollars" → action=search, searchQuery=toothpaste under $5
- Be smart about synonyms: "grab", "get", "purchase", "need", "want" → action=add
- Normalize item names to singular lowercase English
- Return ONLY the JSON, no markdown, no explanation`;

export async function processVoiceCommand(
  text: string,
  _language: string,
  _currentItems: CurrentItem[]
): Promise<VoiceCommand> {
  const apiKey = process.env.OPENAI_API_KEY;

  // Use heuristic parser if OpenAI key is missing
  if (!apiKey || apiKey === "missing") {
    logger.warn("OpenAI key not configured — using heuristic voice parser.");
    return heuristicParse(text);
  }

  try {
    const client = getOpenAIClient();

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: text },
      ],
      temperature: 0,
      max_tokens: 200,
      response_format: { type: "json_object" },
    });

    const raw = completion.choices[0]?.message?.content ?? "{}";
    const parsed = JSON.parse(raw) as Partial<VoiceCommand>;

    // Validate and sanitize
    const action = (["add", "remove", "update", "search", "unknown"] as const).includes(
      parsed.action as VoiceCommand["action"]
    )
      ? (parsed.action as VoiceCommand["action"])
      : "unknown";

    return {
      action,
      itemName: parsed.itemName?.trim().toLowerCase(),
      quantity: typeof parsed.quantity === "number" && parsed.quantity > 0
        ? parsed.quantity
        : undefined,
      unit: parsed.unit,
      notes: parsed.notes,
      searchQuery: parsed.searchQuery,
      rawText: text,
      confidence: typeof parsed.confidence === "number"
        ? Math.min(1, Math.max(0, parsed.confidence))
        : 0.8,
    };
  } catch (err) {
    logger.error("OpenAI voice parsing failed — falling back to heuristic.", err);
    return heuristicParse(text);
  }
}
