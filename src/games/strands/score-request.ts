export interface ParsedStrandsScoreRequest {
  date: string;
  puzzleId: string;
  anonymousId?: string;
  hintsUsed: number;
}

const MAX_IDENTIFIER_LENGTH = 128;

function isUtcDate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

function isIdentifier(value: unknown): value is string {
  return typeof value === "string" && value.length > 0 && value.length <= MAX_IDENTIFIER_LENGTH;
}

export function parseStrandsScoreRequest(
  input: unknown,
  fallbackDate: string,
): ParsedStrandsScoreRequest | null {
  if (!input || typeof input !== "object") return null;
  const body = input as Record<string, unknown>;
  const date = body.date === undefined ? fallbackDate : body.date;
  const hintsUsed = body.hintsUsed;
  if (
    typeof date !== "string" ||
    !isUtcDate(date) ||
    !isIdentifier(body.puzzleId) ||
    (body.anonymousId !== undefined && !isIdentifier(body.anonymousId)) ||
    typeof hintsUsed !== "number" ||
    !Number.isInteger(hintsUsed) ||
    hintsUsed < 0 ||
    hintsUsed > 255 ||
    (body.completed !== undefined && body.completed !== true)
  ) {
    return null;
  }
  return {
    date,
    puzzleId: body.puzzleId,
    ...(isIdentifier(body.anonymousId) ? { anonymousId: body.anonymousId } : {}),
    hintsUsed,
  };
}
