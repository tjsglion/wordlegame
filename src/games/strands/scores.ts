export interface StrandsScoreRequestInput {
  date: string;
  puzzleId: string;
  hintsUsed: number;
  anonymousId?: string;
}

const ANONYMOUS_ID_KEY = "wg:strands:anonymous_id";

export function getStrandsAnonymousId(): string | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    const existing = window.localStorage.getItem(ANONYMOUS_ID_KEY);
    if (existing) return existing;
    const anonymousId = crypto.randomUUID();
    window.localStorage.setItem(ANONYMOUS_ID_KEY, anonymousId);
    return anonymousId;
  } catch {
    return undefined;
  }
}

export function getStrandsScoreEndpoint(apiBase: string | undefined): string | null {
  if (!apiBase) return null;
  return `${apiBase.replace(/\/$/, "")}/api/theme-weave/scores`;
}

export function buildStrandsScoreRequest({
  date,
  puzzleId,
  hintsUsed,
  anonymousId,
}: StrandsScoreRequestInput) {
  return {
    date,
    puzzleId,
    hintsUsed,
    completed: true,
    ...(anonymousId ? { anonymousId } : {}),
  };
}

export async function submitStrandsScore(input: StrandsScoreRequestInput): Promise<boolean> {
  const endpoint = getStrandsScoreEndpoint(process.env.NEXT_PUBLIC_WORKER_API_URL);
  if (!endpoint || typeof fetch !== "function") return false;

  try {
    const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(buildStrandsScoreRequest({
      ...input,
      anonymousId: input.anonymousId ?? getStrandsAnonymousId(),
    })),
    });
    return response.ok;
  } catch {
    return false;
  }
}
