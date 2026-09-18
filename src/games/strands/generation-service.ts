import type { StrandsDictionary } from "./dictionary";
import {
  buildGeneratedStrandsPuzzle,
  isNearDuplicateTopic,
  parseStrandsCandidates,
  type GeneratedStrandsPuzzle,
} from "./generation";
import type { GridGenerationOptions } from "./grid-generator";

const SILICONFLOW_BASE_URL = "https://api.siliconflow.cn/v1";
const DEFAULT_CHAT_MODEL = "deepseek-ai/DeepSeek-V3";
const DEFAULT_EMBEDDING_MODEL = "BAAI/bge-m3";
const MAX_TOPIC_ATTEMPTS = 3;
const MAX_CANDIDATE_ATTEMPTS = 3;

export interface StrandsGenerationClient {
  completeJson(input: { system: string; user: string; temperature: number }): Promise<unknown>;
  embed(input: string): Promise<number[]>;
}

export interface StrandsTopicHistory {
  readonly topic: string;
  readonly embedding: readonly number[] | null;
}

export interface GeneratedDailyStrandsPuzzle extends GeneratedStrandsPuzzle {
  readonly topic: string;
  readonly themeEmbedding: readonly number[] | null;
}

interface SiliconFlowChatResponse {
  choices?: { message?: { content?: string } }[];
}

interface SiliconFlowEmbeddingResponse {
  data?: { embedding?: unknown }[];
}

export function createSiliconFlowStrandsClient(
  runtime: {
    apiKey?: string;
    baseUrl?: string;
    chatModel?: string;
    embeddingModel?: string;
  } = {},
  fetchImpl: typeof fetch = fetch,
): StrandsGenerationClient {
  const apiKey = runtime.apiKey || process.env.SILICONFLOW_API_KEY || process.env.DEEPSEEK_API_KEY;
  if (!apiKey) throw new Error("Missing SILICONFLOW_API_KEY");
  const baseUrl = (runtime.baseUrl || process.env.SILICONFLOW_BASE_URL || SILICONFLOW_BASE_URL).replace(/\/$/, "");
  const chatModel = runtime.chatModel || process.env.SILICONFLOW_CHAT_MODEL || DEFAULT_CHAT_MODEL;
  const embeddingModel = runtime.embeddingModel || process.env.SILICONFLOW_EMBEDDING_MODEL || DEFAULT_EMBEDDING_MODEL;

  async function request(path: string, body: Record<string, unknown>) {
    const response = await fetchImpl(`${baseUrl}${path}`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${apiKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      throw new Error(`SiliconFlow ${response.status}: ${(await response.text()).slice(0, 200)}`);
    }
    return response.json() as Promise<unknown>;
  }

  return {
    async completeJson({ system, user, temperature }) {
      const data = await request("/chat/completions", {
        model: chatModel,
        response_format: { type: "json_object" },
        temperature,
        messages: [{ role: "system", content: system }, { role: "user", content: user }],
      }) as SiliconFlowChatResponse;
      const content = data.choices?.[0]?.message?.content;
      if (!content) throw new Error("SiliconFlow returned no chat content");
      try {
        return JSON.parse(content) as unknown;
      } catch {
        throw new Error("SiliconFlow returned invalid JSON");
      }
    },
    async embed(input) {
      const data = await request("/embeddings", {
        model: embeddingModel,
        input,
        encoding_format: "float",
      }) as SiliconFlowEmbeddingResponse;
      const value = data.data?.[0]?.embedding;
      if (!Array.isArray(value) || value.length !== 1024 || value.some((item) => typeof item !== "number" || !Number.isFinite(item))) {
        throw new Error("SiliconFlow returned an invalid embedding");
      }
      return value as number[];
    },
  };
}

export async function generateDailyStrandsPuzzle({
  client,
  dictionary,
  history,
  gridOptions,
}: {
  client: StrandsGenerationClient;
  dictionary: StrandsDictionary;
  history: readonly StrandsTopicHistory[];
  gridOptions?: GridGenerationOptions;
}): Promise<GeneratedDailyStrandsPuzzle> {
  for (let topicAttempt = 0; topicAttempt < MAX_TOPIC_ATTEMPTS; topicAttempt += 1) {
    let topic: string;
    try {
      topic = await requestTopic(client);
    } catch {
      continue;
    }
    let embedding: number[] | null = null;
    try {
      embedding = await client.embed(topic);
    } catch {
      // Exact topic matching remains safe when the vector service is transiently unavailable.
      embedding = null;
    }
    if (isNearDuplicateTopic(topic, embedding, history)) continue;

    const failures: string[] = [];
    for (let candidateAttempt = 0; candidateAttempt < MAX_CANDIDATE_ATTEMPTS; candidateAttempt += 1) {
      let rawCandidates: unknown;
      try {
        rawCandidates = await requestCandidates(client, topic, candidateAttempt, failures);
      } catch (error) {
        failures.push(error instanceof Error ? error.message : "candidate request failed");
        continue;
      }
      const candidates = parseStrandsCandidates(rawCandidates);
      if (!candidates) {
        failures.push("response did not meet the required JSON schema");
        continue;
      }
      const puzzle = buildGeneratedStrandsPuzzle(candidates, dictionary, gridOptions);
      if (puzzle) return { ...puzzle, topic, themeEmbedding: embedding };
      failures.push("candidate words did not yield a valid 48-letter grid");
    }
  }
  throw new Error("Unable to generate a unique, valid Strands puzzle after bounded retries");
}

async function requestTopic(client: StrandsGenerationClient) {
  const response = await client.completeJson({
    temperature: 1,
    system: [
      "You are a creative editor for a daily Strands-style word puzzle.",
      "Return JSON only in exactly this form: {\"topic\": \"...\"}.",
      "The topic must be specific, fun, broadly familiar, and support at least 15 related English words.",
      "Do not use generic topics such as Food, Animals, or Nature.",
    ].join(" "),
    user: "Create one original, specific theme seed. Vary across everyday life, culture, nature, food, hobbies, concepts, and scenarios.",
  });
  if (!isRecord(response) || typeof response.topic !== "string") throw new Error("Invalid Strands topic response");
  const topic = response.topic.trim().replace(/^['\"]|['\".]$/g, "");
  if (topic.length < 3 || topic.length > 100) throw new Error("Invalid Strands topic");
  return topic;
}

async function requestCandidates(client: StrandsGenerationClient, topic: string, attempt: number, failures: readonly string[]) {
  return client.completeJson({
    temperature: attempt === 0 ? 0.8 : 0.55,
    system: [
      "You construct accessible Strands-style word puzzles.",
      "Return JSON only with {theme:string, spangrams:string[], words:string[]}.",
      "theme is a player-facing clue of 1 to 4 English words.",
      "spangrams contains 1 to 5 uppercase A-Z strings, each 6 to 15 letters, no spaces.",
      "words contains 15 to 30 unique uppercase A-Z strings, each 4 to 15 letters, no spaces.",
      "All words must be common, directly related to the theme, and must not include a spangram.",
    ].join(" "),
    user: [
      `Create candidate words for a Strands puzzle about: ${JSON.stringify(topic)}. Include varied word lengths so a 48-letter board can be constructed.`,
      failures.length > 0 ? `Previous attempts failed because: ${failures.map((failure) => `- ${failure}`).join(" ")}. Return a corrected JSON object.` : "",
    ].filter(Boolean).join("\n"),
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
