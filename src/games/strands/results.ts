export const OPEN_STRANDS_RESULTS_EVENT = "strands:open-results";

export function requestStrandsResults(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(OPEN_STRANDS_RESULTS_EVENT));
}
