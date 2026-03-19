import { Button } from "@/components/ui/button";
import { ArrowUpRightIcon } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-col gap-4 max-w-lg">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-primary">Hello!</h1>
        <h2 className="text-xl">
          This is MusicSky. A place to listen and share the music in the
          Atmosphere.
        </h2>
      </div>
      <p>This is a work in progress.</p>
      <p>
        For now you can log in, upload music and listen to it on your profile
        (currently all the profile data is fetched from Bluesky, will have to
        implement Musicsky&apos;s own profile data). Listening to other
        people&apos;s music by typing out their handle in the URL should work
        too. <br />
        <br />
        Below should be a feed of newly uploaded songs, but this requires a
        dedicated backend which will be implement in the future once the basic
        functionality is there, like liking songs, comments etc.
        <br />
        Please check back later for more updates. <br />
        <br />
        Thank you for checking this out!
        <br />
        <Link
          target={"_blank"}
          href="https://bsky.app/profile/did:plc:ix2e4nkbttdtyurtuvxbeqpw"
        >
          - Maciej
        </Link>
      </p>
      <Button className="w-min" asChild>
        <Link
          target={"_blank"}
          href="https://tangled.org/mejsiejdev.bsky.social/musicsky/"
        >
          Check out MusicSky repository on Tangled! <ArrowUpRightIcon />
        </Link>
      </Button>
    </main>
  );
}
