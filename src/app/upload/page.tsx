import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import SongUploadForm from "./song-upload-form";

export default async function UploadSongPage() {
  const session = await getSession();

  if (!session) {
    redirect("/auth/login");
  }
  return (
    <main className="flex flex-col gap-6 w-full max-w-md mx-auto p-8">
      <h1 className="text-2xl font-bold">Upload a song</h1>
      <SongUploadForm />
    </main>
  );
}
