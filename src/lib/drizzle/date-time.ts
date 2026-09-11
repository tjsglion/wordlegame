function pad(value: number): string {
  return String(value).padStart(2, "0");
}

export function formatSqliteDateTime(
  value: Date | number | string = new Date(),
): string {
  const date = value instanceof Date ? value : new Date(value);
  const time = date.getTime();
  if (Number.isNaN(time)) {
    throw new Error(`Invalid date value: ${String(value)}`);
  }

  return [
    date.getUTCFullYear(),
    pad(date.getUTCMonth() + 1),
    pad(date.getUTCDate()),
  ].join("-")
    .concat(" ")
    .concat(
      [
        pad(date.getUTCHours()),
        pad(date.getUTCMinutes()),
        pad(date.getUTCSeconds()),
      ].join(":"),
    );
}

export function parseSqliteDateTime(value: string | null | undefined): number {
  if (!value) {
    return 0;
  }

  if (/^\d+$/.test(value)) {
    return Number(value);
  }

  const normalized = value.includes("T") ? value : value.replace(" ", "T");
  const timestamp = Date.parse(
    normalized.endsWith("Z") ? normalized : `${normalized}Z`,
  );

  return Number.isNaN(timestamp) ? 0 : timestamp;
}
