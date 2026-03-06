export async function Info({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  return (
    <div>
      <h3 className="text-2xl font-semibold">Songs by {handle}</h3>
    </div>
  );
}
