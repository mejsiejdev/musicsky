import { HeartIcon, ListMusicIcon, MusicIcon } from "lucide-react";
import { PagerLink } from "./pager-link";

export async function Pager({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  return (
    <div className="flex flex-row gap-4">
      <PagerLink href={`/${handle}`} exact>
        <MusicIcon /> Songs
      </PagerLink>
      <PagerLink href={`/${handle}/playlists`}>
        <ListMusicIcon /> Playlists
      </PagerLink>
      <PagerLink href={`/${handle}/likes`}>
        <HeartIcon /> Likes
      </PagerLink>
    </div>
  );
}
