import { type NextRequest } from "next/server";
import { APPVIEW_URL } from "@/lib/api";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const uri = searchParams.get("uri");

  if (!uri) {
    return Response.json(
      { error: "Missing required parameter: uri" },
      { status: 400 },
    );
  }

  const params = new URLSearchParams({ uri });
  const limit = searchParams.get("limit");
  if (limit) params.set("limit", limit);
  const cursor = searchParams.get("cursor");
  if (cursor) params.set("cursor", cursor);

  try {
    const res = await fetch(
      `${APPVIEW_URL}/xrpc/app.musicsky.temp.getComments?${params.toString()}`,
    );

    if (!res.ok) {
      return Response.json(
        { error: "Failed to fetch comments" },
        { status: res.status },
      );
    }

    const data = await res.json();
    return Response.json(data);
  } catch {
    return Response.json(
      { error: "Failed to fetch comments" },
      { status: 500 },
    );
  }
}
