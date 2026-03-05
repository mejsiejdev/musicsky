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
      <p>
        This is a work in progress. For now you can log in, upload music and
        listen to it on your profile. Listening to other people&apos;s music by
        typing out their handle in the url should work too. <br />
        <br />
        Below should be a feed of newly uploaded songs, but this requires a
        dedicated backend which I will implement in the future once I implement
        the basic functionality, like liking songs, etc.
        <br />
        Please check back later for more updates. <br />
        <br />
        Thank you for checking this out!
        <br />
        Maciej
      </p>
    </main>
  );
}
