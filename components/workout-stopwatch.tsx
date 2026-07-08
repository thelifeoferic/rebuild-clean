"use client";

import { BellRing, Flag, Pause, Play, RotateCcw, Timer } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type StopwatchState = {
  alarmDismissed?: boolean;
  alarmMinutes?: number;
  elapsedMs: number;
  laps: number[];
  running: boolean;
  startedAt: number | null;
};

const storageKey = "rebuild:workout-stopwatch:v1";
const initialState: StopwatchState = {
  alarmDismissed: false,
  alarmMinutes: 0,
  elapsedMs: 0,
  laps: [],
  running: false,
  startedAt: null,
};

export function WorkoutStopwatch() {
  const [loaded, setLoaded] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const [state, setState] = useState<StopwatchState>(initialState);
  const [alarmTestStatus, setAlarmTestStatus] = useState<string | null>(null);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored) as Partial<StopwatchState>;
        setState({
          alarmDismissed: Boolean(parsed.alarmDismissed),
          alarmMinutes: Number(parsed.alarmMinutes) || 0,
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
  const alarmTargetMs = (state.alarmMinutes ?? 0) * 60_000;
  const alarmActive = alarmTargetMs > 0 && elapsedMs >= alarmTargetMs && !state.alarmDismissed;

  useEffect(() => {
    if (!alarmActive) return;
    const ring = () => {
      window.navigator.vibrate?.([320, 120, 320, 120, 620, 160, 620]);
      void playAlarmSequence();
    };

    ring();
    const interval = window.setInterval(ring, 1800);
    return () => window.clearInterval(interval);
  }, [alarmActive]);

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
    setState((current) => ({ ...initialState, alarmMinutes: current.alarmMinutes ?? 0 }));
    setNow(Date.now());
  }

  function setAlarmMinutes(value: string) {
    const parsed = Number(value);
    const minutes = Number.isFinite(parsed) ? Math.max(0, Math.min(240, parsed)) : 0;
    setState((current) => ({
      ...current,
      alarmDismissed: false,
      alarmMinutes: minutes,
    }));
  }

  function dismissAlarm() {
    setState((current) => ({ ...current, alarmDismissed: true }));
  }

  function testAlarm() {
    window.navigator.vibrate?.([320, 120, 320, 120, 620, 160, 620]);
    setAlarmTestStatus("Testing alarm now...");
    void playAlarmSequence().then((played) => {
      setAlarmTestStatus(played ? "Alarm test played." : "Your browser blocked sound. Vibration still fired.");
      window.setTimeout(() => setAlarmTestStatus(null), 2600);
    });
  }

  return (
    <div className="panel mb-4 overflow-hidden p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="metric-label">Workout timer</p>
          <p className="mt-1 font-display text-5xl font-black leading-none text-porcelain tabular-nums">{formatElapsed(elapsedMs)}</p>
          <p className="mt-2 text-xs font-bold uppercase tracking-[0.12em] text-[rgb(var(--text-muted))]">
            {state.running ? "Running" : latestLap ? `Last split ${formatElapsed(latestLap)}` : "Ready"}
          </p>
        </div>
        <div className="app-icon-soft grid size-12 shrink-0 place-items-center rounded-full">
          <Timer size={22} strokeWidth={2.2} aria-hidden />
        </div>
      </div>

      <div className="app-card mt-4 p-3">
        <div className="mb-2 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <BellRing size={16} className="text-champagne" strokeWidth={2.2} aria-hidden />
            <p className="metric-label text-xs">Alarm</p>
          </div>
          <p className="app-subtle text-xs font-bold">{state.alarmMinutes ? `${state.alarmMinutes} min` : "Off"}</p>
        </div>
        <div className="grid grid-cols-[1fr_auto] gap-2">
          <label className="flex min-h-12 items-center gap-2 rounded-xl border border-[rgb(var(--line-soft))] bg-[rgb(var(--surface-raised))] px-3 focus-within:border-champagne">
            <input
              type="number"
              min={0}
              max={240}
              step={0.5}
              inputMode="decimal"
              value={state.alarmMinutes ? String(state.alarmMinutes) : ""}
              onChange={(event) => setAlarmMinutes(event.target.value)}
              placeholder="Enter minutes"
              className="min-w-0 flex-1 bg-transparent text-base font-black text-[rgb(var(--text-primary))] outline-none placeholder:text-[rgb(var(--text-muted))]"
            />
            <span className="text-xs font-black uppercase tracking-[0.12em] text-[rgb(var(--text-muted))]">min</span>
          </label>
          <button
            type="button"
            onClick={() => setAlarmMinutes("0")}
            className="app-secondary-action min-h-12 rounded-xl px-3 text-xs font-black uppercase tracking-[0.1em]"
          >
            Clear
          </button>
        </div>
        <p className="app-subtle mt-2 text-xs font-semibold leading-5">Enter any duration up to 240 minutes. The timer will keep sounding until you dismiss it.</p>
        {alarmActive ? (
          <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-champagne/25 bg-champagne/12 px-3 py-2">
            <p className="text-sm font-black text-porcelain">Alarm reached</p>
            <button
              type="button"
              onClick={dismissAlarm}
              className="app-primary-action rounded-full px-3 py-1.5 text-xs font-black"
            >
              Dismiss
            </button>
          </div>
        ) : null}
        <button
          type="button"
          onClick={testAlarm}
          className="app-secondary-action mt-2 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl text-xs font-black uppercase tracking-[0.12em]"
        >
          <BellRing size={14} strokeWidth={2.3} aria-hidden />
          Test alarm
        </button>
        {alarmTestStatus ? <p className="mt-2 text-center text-xs font-bold text-champagne">{alarmTestStatus}</p> : null}
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <button
          type="button"
          onClick={state.running ? pause : start}
          className="app-primary-action flex min-h-12 items-center justify-center gap-2 rounded-2xl px-3 text-sm font-black"
        >
          {state.running ? <Pause size={17} strokeWidth={2.4} aria-hidden /> : <Play size={17} strokeWidth={2.4} aria-hidden />}
          {state.running ? "Pause" : "Start"}
        </button>
        <button
          type="button"
          onClick={lap}
          disabled={elapsedMs < 1000}
          className="app-secondary-action flex min-h-12 items-center justify-center gap-2 rounded-2xl px-3 text-sm font-black disabled:opacity-35"
        >
          <Flag size={16} strokeWidth={2.2} aria-hidden />
          Lap
        </button>
        <button
          type="button"
          onClick={reset}
          disabled={elapsedMs < 1000 && !state.laps.length}
          className="app-secondary-action flex min-h-12 items-center justify-center gap-2 rounded-2xl px-3 text-sm font-black disabled:opacity-35"
        >
          <RotateCcw size={16} strokeWidth={2.2} aria-hidden />
          Clear
        </button>
      </div>

      {state.laps.length ? (
        <div className="mt-4 grid gap-2">
          {state.laps.slice(0, 3).map((lapTime, index) => (
            <div key={`${lapTime}-${index}`} className="flex items-center justify-between rounded-xl bg-[rgb(var(--surface-raised))] px-3 py-2 text-sm font-bold">
              <span className="text-[rgb(var(--text-muted))]">Split {state.laps.length - index}</span>
              <span className="font-display text-[rgb(var(--text-primary))] tabular-nums">{formatElapsed(lapTime)}</span>
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

async function playAlarmSequence() {
  try {
    const AudioContextClass = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return false;
    const context = new AudioContextClass();
    const master = context.createGain();
    const start = context.currentTime;
    const pulses = [
      { frequency: 740, offset: 0 },
      { frequency: 988, offset: 0.24 },
      { frequency: 740, offset: 0.48 },
      { frequency: 1175, offset: 0.72 },
      { frequency: 880, offset: 1.02 },
      { frequency: 1319, offset: 1.26 },
    ];

    if (context.state === "suspended") await context.resume();
    master.gain.setValueAtTime(0.001, start);
    master.gain.exponentialRampToValueAtTime(0.58, start + 0.04);
    master.gain.exponentialRampToValueAtTime(0.001, start + 1.72);
    master.connect(context.destination);

    pulses.forEach(({ frequency, offset }) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const pulseStart = start + offset;
      oscillator.frequency.setValueAtTime(frequency, pulseStart);
      oscillator.type = "square";
      gain.gain.setValueAtTime(0.001, pulseStart);
      gain.gain.exponentialRampToValueAtTime(0.34, pulseStart + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, pulseStart + 0.18);
      oscillator.connect(gain);
      gain.connect(master);
      oscillator.start(pulseStart);
      oscillator.stop(pulseStart + 0.2);
    });

    window.setTimeout(() => {
      void context.close();
    }, 2100);
    return true;
  } catch {
    // Some mobile browsers block audio until the user has interacted; vibration still handles the alarm.
    return false;
  }
}
