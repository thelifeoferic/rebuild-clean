"use client";

import { Flag, Pause, Play, RotateCcw, Timer } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type StopwatchState = {
  elapsedMs: number;
  laps: number[];
  running: boolean;
  startedAt: number | null;
};

const storageKey = "rebuild:workout-stopwatch:v1";
const initialState: StopwatchState = {
  elapsedMs: 0,
  laps: [],
  running: false,
  startedAt: null,
};

export function WorkoutStopwatch() {
  const [loaded, setLoaded] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const [state, setState] = useState<StopwatchState>(initialState);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored) as Partial<StopwatchState>;
        setState({
          elapsedMs: Number(parsed.elapsedMs) || 0,
          laps: Array.isArray(parsed.laps) ? parsed.laps.map(Number).filter(Number.isFinite).slice(0, 6) : [],
          running: Boolean(parsed.running),
          startedAt: typeof parsed.startedAt === "number" ? parsed.startedAt : null,
        });
      }
    } catch {
      setState(initialState);
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!state.running) return;
    const interval = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(interval);
  }, [state.running]);

  useEffect(() => {
    if (!loaded) return;
    window.localStorage.setItem(storageKey, JSON.stringify(state));
  }, [loaded, state]);

  const elapsedMs = useMemo(() => currentElapsed(state, now), [now, state]);
  const latestLap = state.laps[0];

  function start() {
    setState((current) => (current.running ? current : { ...current, running: true, startedAt: Date.now() }));
  }

  function pause() {
    setState((current) => ({
      ...current,
      elapsedMs: currentElapsed(current, Date.now()),
      running: false,
      startedAt: null,
    }));
  }

  function lap() {
    setState((current) => ({
      ...current,
      laps: [currentElapsed(current, Date.now()), ...current.laps].slice(0, 6),
    }));
  }

  function reset() {
    setState(initialState);
    setNow(Date.now());
  }

  return (
    <div className="panel mb-4 overflow-hidden p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="metric-label">Workout timer</p>
          <p className="mt-1 font-display text-5xl font-black leading-none text-porcelain tabular-nums">{formatElapsed(elapsedMs)}</p>
          <p className="mt-2 text-xs font-bold uppercase tracking-[0.12em] text-white/40">
            {state.running ? "Running" : latestLap ? `Last split ${formatElapsed(latestLap)}` : "Ready"}
          </p>
        </div>
        <div className="grid size-12 shrink-0 place-items-center rounded-full bg-ember/14 text-ember">
          <Timer size={22} strokeWidth={2.2} aria-hidden />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <button
          type="button"
          onClick={state.running ? pause : start}
          className="flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-ember px-3 text-sm font-black text-white shadow-glow active:scale-[0.97]"
        >
          {state.running ? <Pause size={17} strokeWidth={2.4} aria-hidden /> : <Play size={17} strokeWidth={2.4} aria-hidden />}
          {state.running ? "Pause" : "Start"}
        </button>
        <button
          type="button"
          onClick={lap}
          disabled={elapsedMs < 1000}
          className="flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.055] px-3 text-sm font-black text-porcelain disabled:opacity-35 active:scale-[0.97]"
        >
          <Flag size={16} strokeWidth={2.2} aria-hidden />
          Lap
        </button>
        <button
          type="button"
          onClick={reset}
          disabled={elapsedMs < 1000 && !state.laps.length}
          className="flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.055] px-3 text-sm font-black text-porcelain disabled:opacity-35 active:scale-[0.97]"
        >
          <RotateCcw size={16} strokeWidth={2.2} aria-hidden />
          Clear
        </button>
      </div>

      {state.laps.length ? (
        <div className="mt-4 grid gap-2">
          {state.laps.slice(0, 3).map((lapTime, index) => (
            <div key={`${lapTime}-${index}`} className="flex items-center justify-between rounded-xl bg-carbon/70 px-3 py-2 text-sm font-bold">
              <span className="text-white/42">Split {state.laps.length - index}</span>
              <span className="font-display text-porcelain tabular-nums">{formatElapsed(lapTime)}</span>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function currentElapsed(state: StopwatchState, timestamp: number) {
  if (!state.running || !state.startedAt) return state.elapsedMs;
  return Math.max(0, state.elapsedMs + timestamp - state.startedAt);
}

function formatElapsed(ms: number) {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) return `${hours}:${pad(minutes)}:${pad(seconds)}`;
  return `${pad(minutes)}:${pad(seconds)}`;
}

function pad(value: number) {
  return String(value).padStart(2, "0");
}
