interface ProgressBarProps {
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
}

function formatTime(seconds: number) {
  if (!isFinite(seconds)) return "0:00";
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
}

export function ProgressBar({
  currentTime,
  duration,
  onSeek,
}: ProgressBarProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground tabular-nums">
        {formatTime(currentTime)}
      </span>
      <input
        type="range"
        min={0}
        max={duration}
        value={currentTime}
        step={1}
        onChange={(event) => onSeek(Number(event.target.value))}
        className="flex-1 h-1 accent-primary cursor-pointer"
      />
      <span className="text-xs text-muted-foreground tabular-nums">
        {formatTime(duration)}
      </span>
    </div>
  );
}
