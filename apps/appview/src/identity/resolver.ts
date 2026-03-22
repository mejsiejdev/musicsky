import type { Kysely } from "kysely";
import type { DatabaseSchema } from "../db/schema.js";
import { getPds, getHandleFromDid } from "common";

export interface ResolvedIdentity {
  handle: string;
  pds: string;
}

export interface IdentityResolver {
  resolve(did: string): Promise<ResolvedIdentity | null>;
  resolvePds(did: string): Promise<string>;
  upsertFromEvent(did: string, handle: string, status: string): Promise<void>;
}

export function createIdentityResolver(
  db: Kysely<DatabaseSchema>,
): IdentityResolver {
  async function resolve(did: string): Promise<ResolvedIdentity | null> {
    const existing = await db
      .selectFrom("identity")
      .select(["handle", "pds"])
      .where("did", "=", did)
      .executeTakeFirst();

    if (existing?.pds) return existing;

    const pds = await getPds(did);
    if (!pds) return null;

    const handle = await getHandleFromDid(did, pds);

    await db
      .insertInto("identity")
      .values({
        did,
        handle,
        pds,
        status: "active",
        updated_at: new Date().toISOString(),
      })
      .onConflict((oc) =>
        oc
          .column("did")
          .doUpdateSet({ handle, pds, updated_at: new Date().toISOString() }),
      )
      .execute();

    return { handle, pds };
  }

  async function resolvePds(did: string): Promise<string> {
    const existing = await db
      .selectFrom("identity")
      .select("pds")
      .where("did", "=", did)
      .executeTakeFirst();

    if (existing?.pds) return existing.pds;

    const pds = await getPds(did);
    if (!pds) throw new Error(`Could not resolve PDS for ${did}`);

    await db
      .insertInto("identity")
      .values({
        did,
        handle: did,
        pds,
        status: "active",
        updated_at: new Date().toISOString(),
      })
      .onConflict((oc) =>
        oc
          .column("did")
          .doUpdateSet({ pds, updated_at: new Date().toISOString() }),
      )
      .execute();

    return pds;
  }

  async function upsertFromEvent(
    did: string,
    handle: string,
    status: string,
  ): Promise<void> {
    await db
      .insertInto("identity")
      .values({
        did,
        handle,
        pds: "",
        status,
        updated_at: new Date().toISOString(),
      })
      .onConflict((oc) =>
        oc.column("did").doUpdateSet({
          handle,
          status,
          updated_at: new Date().toISOString(),
        }),
      )
      .execute();
  }

  return { resolve, resolvePds, upsertFromEvent };
}
