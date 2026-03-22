import { Agent } from "@atproto/api";
import { IdResolver } from "@atproto/identity";

export async function getDid(handle: string) {
  const agent = new Agent("https://public.api.bsky.app");
  try {
    const { data: identity } = await agent.resolveHandle({ handle });
    return identity.did;
  } catch (error) {
    console.error("Failed to fetch DID for", handle, error);
    return null;
  }
}

export async function getPds(did: string) {
  const resolver = new IdResolver();
  try {
    const doc = await resolver.did.resolve(did);
    const pdsService = doc?.service?.find(
      (service: { id: string; serviceEndpoint?: string }) =>
        service.id === "#atproto_pds",
    );
    if (!pdsService?.serviceEndpoint) {
      throw new Error("No PDS endpoint found for this user");
    }
    return pdsService.serviceEndpoint as string;
  } catch (error) {
    console.error("Failed to fetch PDS URL for", did, error);
    return null;
  }
}

export async function getHandleFromDid(did: string, knownPds?: string) {
  try {
    const pds = knownPds ?? (await getPds(did));
    if (!pds) throw new Error("Could not resolve PDS for DID");
    const agent = new Agent(pds);
    const { data } = await agent.com.atproto.repo.describeRepo({ repo: did });
    return data.handle;
  } catch (error) {
    console.error("Failed to resolve handle for", did, error);
    return did;
  }
}
