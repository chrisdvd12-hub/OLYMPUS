export interface FrameMetrics {
  fps: number;
  averageFrameMs: number;
  p95FrameMs: number;
  longFrames: number;
  samples: number;
}

export function summarizeFrameTimes(frameTimes: readonly number[]): FrameMetrics {
  const valid = frameTimes.filter((value) => Number.isFinite(value) && value > 0);
  if (!valid.length)
    return { fps: 0, averageFrameMs: 0, p95FrameMs: 0, longFrames: 0, samples: 0 };
  const averageFrameMs = valid.reduce((sum, value) => sum + value, 0) / valid.length;
  const ordered = [...valid].sort((a, b) => a - b);
  const p95FrameMs = ordered[Math.min(ordered.length - 1, Math.ceil(ordered.length * 0.95) - 1)]!;
  return {
    fps: Math.min(120, 1000 / averageFrameMs),
    averageFrameMs,
    p95FrameMs,
    longFrames: valid.filter((value) => value > 32).length,
    samples: valid.length,
  };
}
