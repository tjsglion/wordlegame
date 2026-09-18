export interface WordplayProgressPayload {
  currentLevel: number;
  coins: number;
  completed: Record<string, { bonus: number }>;
}
