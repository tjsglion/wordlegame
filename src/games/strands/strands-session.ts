import { isAdjacent, pointKey, type InteractionMode, type Point } from "./shared";

export interface StrandsPointerState {
  mode: InteractionMode;
  path: Point[];
}

export type StrandsPointerEvent =
  | { kind: "down"; point: Point; locked: boolean }
  | { kind: "move"; point: Point; buttons: number; locked: boolean }
  | { kind: "up" }
  | { kind: "activate"; point: Point; locked: boolean };

const IDLE_POINTER: StrandsPointerState = { mode: "idle", path: [] };

export function isSamePoint(first: Point, second: Point) {
  return pointKey(first) === pointKey(second);
}

function canAppend(path: Point[], point: Point, locked: boolean) {
  const last = path[path.length - 1];
  return !locked && !path.some((item) => isSamePoint(item, point)) && Boolean(last && isAdjacent(last, point));
}

/** Pure pointer/keyboard session state machine. */
export function transitionStrandsPointer(state: StrandsPointerState, event: StrandsPointerEvent): { state: StrandsPointerState; submitPath: Point[] | null } {
  if (event.kind === "activate") {
    if (event.locked) return { state, submitPath: null };
    if (state.mode === "idle") return { state: { mode: "clicking", path: [event.point] }, submitPath: null };
    const endpoint = state.path[state.path.length - 1];
    const penultimate = state.path[state.path.length - 2];
    if (endpoint && isSamePoint(endpoint, event.point) && state.path.length > 1) return { state: IDLE_POINTER, submitPath: state.path };
    if (penultimate && isSamePoint(penultimate, event.point)) return { state: { mode: "clicking", path: state.path.slice(0, -1) }, submitPath: null };
    if (canAppend(state.path, event.point, false)) return { state: { mode: "clicking", path: [...state.path, event.point] }, submitPath: null };
    return { state: { mode: "clicking", path: [event.point] }, submitPath: null };
  }
  if (event.kind === "up") {
    if (state.mode !== "dragging") return { state, submitPath: null };
    return state.path.length === 1 ? { state: { mode: "clicking", path: state.path }, submitPath: null } : { state: IDLE_POINTER, submitPath: state.path };
  }
  if (event.kind === "move") {
    if (state.mode === "idle" || event.buttons === 0 || event.locked) return { state, submitPath: null };
    const penultimate = state.path[state.path.length - 2];
    if (penultimate && isSamePoint(penultimate, event.point)) return { state: { mode: "dragging", path: state.path.slice(0, -1) }, submitPath: null };
    if (!canAppend(state.path, event.point, false)) return { state, submitPath: null };
    return { state: { mode: "dragging", path: [...state.path, event.point] }, submitPath: null };
  }
  if (event.locked) return { state, submitPath: null };
  if (state.mode === "idle" || state.mode === "dragging") return { state: { mode: "dragging", path: [event.point] }, submitPath: null };
  const endpoint = state.path[state.path.length - 1];
  const penultimate = state.path[state.path.length - 2];
  if (endpoint && isSamePoint(endpoint, event.point) && state.path.length > 1) return { state: IDLE_POINTER, submitPath: state.path };
  if (penultimate && isSamePoint(penultimate, event.point)) return { state: { mode: "clicking", path: state.path.slice(0, -1) }, submitPath: null };
  if (canAppend(state.path, event.point, false)) return { state: { mode: "clicking", path: [...state.path, event.point] }, submitPath: null };
  return { state: { mode: "dragging", path: [event.point] }, submitPath: null };
}

export { IDLE_POINTER };
