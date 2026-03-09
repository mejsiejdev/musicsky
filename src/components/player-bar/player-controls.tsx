import {
  PlayIcon,
  PauseIcon,
  XIcon,
  HeartIcon,
  RepeatIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PlayerControlsProps {
  isPlaying: boolean;
  optimisticLiked: boolean;
  optimisticReposted: boolean;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  onLike: () => void;
  onRepost: () => void;
}

export function PlayerControls({
  isPlaying,
  optimisticLiked,
  optimisticReposted,
  onPlay,
  onPause,
  onStop,
  onLike,
  onRepost,
}: PlayerControlsProps) {
  return (
    <div className="flex items-center gap-4">
      <button onClick={onRepost} aria-label="Repost" className="cursor-pointer">
        <RepeatIcon
          size={18}
          className={cn(optimisticReposted && "text-green-500")}
          fill={optimisticReposted ? "currentColor" : "none"}
        />
      </button>
      <button onClick={onLike} aria-label="Like" className="cursor-pointer">
        <HeartIcon
          size={18}
          className={cn(optimisticLiked && "text-red-500")}
          fill={optimisticLiked ? "currentColor" : "none"}
        />
      </button>
      <button
        onClick={isPlaying ? onPause : onPlay}
        aria-label={isPlaying ? "Pause" : "Play"}
        className="cursor-pointer"
      >
        {isPlaying ? <PauseIcon size={22} /> : <PlayIcon size={22} />}
      </button>
      <button
        onClick={onStop}
        aria-label="Close player"
        className="cursor-pointer"
      >
        <XIcon size={18} />
      </button>
    </div>
  );
}
