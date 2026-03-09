import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Agent } from "@atproto/api";
import { notFound } from "next/navigation";

async function getProfile(handle: string) {
  const agent = new Agent("https://public.api.bsky.app");
  try {
    const { data: identity } = await agent.resolveHandle({ handle });
    const { data: profile } = await agent.getProfile({ actor: identity.did });
    return profile;
  } catch (error) {
    console.error("Failed to fetch DID for", handle, error);
    return null;
  }
}

export async function Info({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const profile = await getProfile(handle);
  if (profile === null) {
    notFound();
  }
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-row gap-4 items-center">
        <Avatar className="size-16">
          <AvatarImage src={profile.avatar} alt={profile.handle} />
          <AvatarFallback>{profile.handle.slice(0, 2)}</AvatarFallback>
        </Avatar>
        <div>
          <h3 className="text-2xl font-semibold">{profile.displayName}</h3>
          <p className="text-sm">@{profile.handle}</p>
        </div>
      </div>
      <p className="wrap-break-word overflow-clip text-ellipsis">
        {profile.description}
      </p>
    </div>
  );
}
