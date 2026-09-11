"use client";

import { Delete } from "lucide-react";

import type { LetterState } from "./shared";

interface KeyboardProps {
  letterStates: Record<string, LetterState>;
  onChar: (ch: string) => void;
  onDelete: () => void;
  onEnter: () => void;
  /** Locks the visual keyboard during reveal, network submission, and after
   * the round ends, so its affordance matches the playable state. */
  disabled?: boolean;
  enterLabel: string;
  deleteLabel: string;
}

const KEY_ROWS = ["qwertyuiop", "asdfghjkl", "zxcvbnm"];

export function Keyboard({
  letterStates,
  onChar,
  onDelete,
  onEnter,
  disabled = false,
  enterLabel,
  deleteLabel,
}: KeyboardProps) {
  return (
    <div className="wordle-keyboard mx-auto flex w-full max-w-lg flex-col gap-2 px-1 pb-[env(safe-area-inset-bottom)] select-none">
      {KEY_ROWS.map((row, rowIndex) => (
        <div key={row} className="flex justify-center gap-2">
          {rowIndex === 2 && (
            <button
              type="button"
              onClick={onEnter}
              disabled={disabled}
              aria-label={enterLabel}
              className="wordle-key wordle-key-primary flex-[1.5] text-xs font-semibold uppercase"
            >
              {enterLabel}
            </button>
          )}
          {row.split("").map((ch) => (
            <button
              key={ch}
              type="button"
              onClick={() => onChar(ch)}
              disabled={disabled}
              className={`wordle-key flex-1 text-sm font-semibold uppercase ${
                letterStates[ch] ?? ""
              }`}
            >
              {ch}
            </button>
          ))}
          {rowIndex === 2 && (
            <button
              type="button"
              onClick={onDelete}
              disabled={disabled}
              aria-label={deleteLabel}
              className="wordle-key flex-[1.5] text-xs font-semibold uppercase"
            >
              <Delete className="h-5 w-5" aria-hidden />
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
