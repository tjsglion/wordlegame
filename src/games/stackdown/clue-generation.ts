import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const blacklistRaw = require("naughty-words/en.json");
const blacklist = new Set(
  (blacklistRaw as string[]).map((word) => word.toLowerCase()),
);

const DEEPSEEK_URL = "https://api.deepseek.com/chat/completions";
const DEEPSEEK_MODEL = "deepseek-chat";
const DICTIONARY_URL = "https://api.dictionaryapi.dev/api/v2/entries/en";

export const STACKDOWN_CLUE_BATCH_SIZE = 20;
export const STACKDOWN_CLUE_MAX_LLM_ROUNDS = 3;

const MIN_CLUE_CHARS = 5;
const MAX_CLUE_CHARS = 80;
const MAX_CLUE_WORDS = 12;

export type ClueSource = "llm" | "dictionary" | "override";

export interface GeneratedClue {
  clue: string;
  source: Exclude<ClueSource, "override">;
}

interface DeepSeekResponse {
  choices?: { message?: { content?: string } }[];
}

interface DictionaryEntry {
  meanings?: {
    definitions?: { definition?: string }[];
  }[];
}

/** Leak/quality gate shared by offline generation and runtime backfill. */
export function validateClue(word: string, clue: unknown): clue is string {
  if (typeof clue !== "string") return false;
  const text = clue.trim();
  if (text.length < MIN_CLUE_CHARS || text.length > MAX_CLUE_CHARS) {
    return false;
  }
  if (text.includes("\n")) return false;
  const tokens = text.toLowerCase().split(/[^a-z']+/).filter(Boolean);
  if (tokens.length === 0 || tokens.length > MAX_CLUE_WORDS) return false;

  const forms = new Set([
    word,
    `${word}s`,
    `${word}es`,
    `${word}ed`,
    `${word}d`,
    `${word}ing`,
  ]);
  if (tokens.some((token) => forms.has(token))) return false;
  if (tokens.some((token) => blacklist.has(token))) return false;
  return true;
}

export async function generateLlmClueBatch(
  apiKey: string,
  words: string[],
  strict: boolean,
): Promise<Record<string, unknown>> {
  const response = await fetch(DEEPSEEK_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: DEEPSEEK_MODEL,
      response_format: { type: "json_object" },
      temperature: strict ? 0.3 : 0.8,
      messages: [
        {
          role: "system",
          content: [
            "You write clues for a casual word puzzle game, in the style of",
            "friendly crossword clues: short, conversational, evocative —",
            'e.g. "Man\'s best friend" for DOG. Rules for every clue:',
            "- at most 10 words, no period needed",
            "- never contain the answer word or any inflection of it",
            "- never a dry dictionary definition; no Latin names, no jargon",
            "- target the most common meaning of the word",
            '- reply with JSON only: {"clues": {"word": "clue", ...}}',
            strict
              ? "- previous attempts were rejected for breaking these rules; follow them exactly"
              : "",
          ]
            .filter(Boolean)
            .join("\n"),
        },
        {
          role: "user",
          content: `Write one clue per word: ${words.join(", ")}`,
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(
      `DeepSeek ${response.status}: ${(await response.text()).slice(0, 200)}`,
    );
  }

  const data = (await response.json()) as DeepSeekResponse;
  const content = data.choices?.[0]?.message?.content;
  if (!content) return {};

  try {
    const parsed = JSON.parse(content) as { clues?: Record<string, unknown> };
    return parsed.clues ?? {};
  } catch {
    return {};
  }
}

/** Shortest dictionary definition that passes the same validation gate. */
export async function dictionaryFallbackClue(
  word: string,
): Promise<string | null> {
  let response: Response;
  try {
    response = await fetch(`${DICTIONARY_URL}/${word}`);
  } catch {
    return null;
  }
  if (!response.ok) return null;

  let entries: DictionaryEntry[];
  try {
    entries = (await response.json()) as DictionaryEntry[];
  } catch {
    return null;
  }
  if (!Array.isArray(entries)) return null;

  const candidates = entries
    .flatMap((entry) => entry.meanings ?? [])
    .flatMap((meaning) => meaning.definitions ?? [])
    .map((definition) => definition.definition?.trim() ?? "")
    .filter((definition) => validateClue(word, definition))
    .sort((a, b) => a.length - b.length);

  return candidates[0] ?? null;
}

/**
 * Best-effort runtime backfill:
 * 1. Try LLM for a few strictness rounds when a key is available.
 * 2. Fall back to dictionary content.
 * 3. Return null if nothing usable can be produced.
 */
export async function generateRuntimeClue(
  word: string,
  apiKey = process.env.DEEPSEEK_API_KEY,
): Promise<GeneratedClue | null> {
  if (apiKey) {
    for (
      let round = 1;
      round <= STACKDOWN_CLUE_MAX_LLM_ROUNDS;
      round += 1
    ) {
      try {
        const clues = await generateLlmClueBatch(apiKey, [word], round > 1);
        const clue = clues[word];
        if (validateClue(word, clue)) {
          return {
            clue: clue.trim(),
            source: "llm",
          };
        }
      } catch {
        // Ignore transient LLM failures and keep the hint flow on the fast path.
      }
    }
  }

  const clue = await dictionaryFallbackClue(word);
  if (!clue) return null;

  return {
    clue,
    source: "dictionary",
  };
}
