export default function LoginLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-row gap-4 min-h-screen items-center justify-center bg-background">
      {children}
    </div>
  );
}
