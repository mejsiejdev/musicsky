import { HeartIcon, MusicIcon } from "lucide-react";
import { PagerLink } from "./pager-link";

export async function Pager({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  return (
    <div className="flex flex-row gap-4">
      <PagerLink href={`/${handle}`}>
        <MusicIcon /> Songs
      </PagerLink>
      <PagerLink href={`/${handle}/likes`}>
        <HeartIcon /> Likes
      </PagerLink>
    </div>
  );
}
