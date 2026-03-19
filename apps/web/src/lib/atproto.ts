export function getDidFromUri(uri: string): string {
  return uri.split("/")[2]!;
}

export function getRkeyFromUri(uri: string): string {
  return uri.split("/")[4]!;
}

export function buildBlobUrl(
  pds: string,
  did: string,
  ref: { toString(): string },
): string {
  return `${pds}/xrpc/com.atproto.sync.getBlob?did=${did}&cid=${ref.toString()}`;
}

export function isResourceOwner(
  sessionDid: string | undefined,
  resourceUri: string,
): boolean {
  return sessionDid === getDidFromUri(resourceUri);
}

export const COLLECTIONS = {
  song: "app.musicsky.temp.song",
  playlist: "app.musicsky.temp.playlist",
  like: "app.musicsky.temp.like",
  repost: "app.musicsky.temp.repost",
} as const;
