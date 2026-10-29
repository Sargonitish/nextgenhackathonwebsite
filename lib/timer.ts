export interface TimerState {
  scheduledStart: Date | string | null;
  durationMs: number;
  status: 'not_started' | 'running' | 'paused' | 'ended';
  startedAt: Date | string | null;
  pausedAt: Date | string | null;
  totalPausedMs: number;
}

export interface TimerView {
  label: string;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  progressPercent: number;
  isOver: boolean;
  status: 'not_started' | 'running' | 'paused' | 'ended';
  remainingMs: number;
}

export function computeTimerView(
  timer: TimerState | null | undefined,
  nowTimestamp: number = Date.now()
): TimerView {
  if (!timer) {
    return {
      label: 'Stay tuned',
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      progressPercent: 0,
      isOver: false,
      status: 'not_started',
      remainingMs: 0,
    };
  }

  const durationMs = timer.durationMs || 86400000;
  const totalPausedMs = timer.totalPausedMs || 0;

  // 1. Not Started State
  if (timer.status === 'not_started') {
    if (timer.scheduledStart) {
      const startTime = new Date(timer.scheduledStart).getTime();
      const diff = startTime - nowTimestamp;
      if (diff > 0) {
        return {
          label: 'Hackathon starts in',
          ...breakdownMs(diff),
          progressPercent: 0,
          isOver: false,
          status: 'not_started',
          remainingMs: diff,
        };
      }
    }
    return {
      label: 'Stay tuned',
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      progressPercent: 0,
      isOver: false,
      status: 'not_started',
      remainingMs: 0,
    };
  }

  // 2. Ended State
  if (timer.status === 'ended') {
    return {
      label: '🎉 Hackathon Over',
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      progressPercent: 100,
      isOver: true,
      status: 'ended',
      remainingMs: 0,
    };
  }

  // 3. Paused State
  if (timer.status === 'paused') {
    const startedAt = timer.startedAt ? new Date(timer.startedAt).getTime() : nowTimestamp;
    const pausedAt = timer.pausedAt ? new Date(timer.pausedAt).getTime() : nowTimestamp;
    const elapsedBeforePause = Math.max(0, pausedAt - startedAt - totalPausedMs);
    const remaining = Math.max(0, durationMs - elapsedBeforePause);

    return {
      label: '⏸ Paused',
      ...breakdownMs(remaining),
      progressPercent: Math.min(100, Math.round((elapsedBeforePause / durationMs) * 100)),
      isOver: remaining <= 0,
      status: 'paused',
      remainingMs: remaining,
    };
  }

  // 4. Running State
  const startedAt = timer.startedAt ? new Date(timer.startedAt).getTime() : nowTimestamp;
  const elapsed = Math.max(0, nowTimestamp - startedAt - totalPausedMs);
  const remaining = durationMs - elapsed;

  if (remaining <= 0) {
    return {
      label: '🎉 Hackathon Over',
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      progressPercent: 100,
      isOver: true,
      status: 'ended',
      remainingMs: 0,
    };
  }

  return {
    label: 'Time remaining',
    ...breakdownMs(remaining),
    progressPercent: Math.min(100, Math.round((elapsed / durationMs) * 100)),
    isOver: false,
    status: 'running',
    remainingMs: remaining,
  };
}

function breakdownMs(ms: number) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return { days, hours, minutes, seconds };
}
