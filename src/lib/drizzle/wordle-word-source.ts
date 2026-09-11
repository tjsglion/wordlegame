import { readFileSync } from "node:fs";

function extractQuotedWords(section: string): string[] {
  return [...section.matchAll(/"([a-z]{5})"/g)].map((match) => match[1]);
}

export function loadWordListsFromSource() {
  const source = readFileSync(
    new URL("../game/words.ts", import.meta.url),
    "utf8",
  );
  const answerSection = source.match(/const answerWords = \[([\s\S]*?)\];/)?.[1];
  const extraSection = source.match(/const extraGuessWords = \[([\s\S]*?)\];/)?.[1];

  if (!answerSection || !extraSection) {
    throw new Error("Failed to parse src/lib/game/words.ts");
  }

  const answers = extractQuotedWords(answerSection);
  const extraGuesses = extractQuotedWords(extraSection);
  const allowedGuesses = [...new Set([...answers, ...extraGuesses])];

  return { answers, allowedGuesses };
}
