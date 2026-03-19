import { PUBLIC_URL } from "@/lib/api";
import Image from "next/image";
import Link from "next/link";

interface SongInfoProps {
  coverArt: string;
  title: string;
  author: string;
}

export function SongInfo({ coverArt, title, author }: SongInfoProps) {
  return (
    <div className="flex flex-row items-center gap-4">
      <Image
        className="rounded size-12"
        src={coverArt}
        alt={title}
        width={48}
        height={48}
      />
      <div className="flex flex-col">
        <span className="text-sm font-semibold truncate">{title}</span>
        <Link
          href={`${PUBLIC_URL}/${author}`}
          className="text-xs text-muted-foreground truncate"
        >
          {author}
        </Link>
      </div>
    </div>
  );
}
