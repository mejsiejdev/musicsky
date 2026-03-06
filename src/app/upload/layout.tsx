export default function UploadSongLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col w-full min-h-screen items-center justify-center p-8">
      <div className="flex flex-col gap-6">
        <p className="text-3xl font-bold text-primary">Upload a song</p>
        {children}
      </div>
    </div>
  );
}
