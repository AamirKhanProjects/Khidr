import type { Rep } from "@/types";

/**
 * UK MP lookup. BORROWED capability, all free and key-less. The chain (verified
 * live, see docs/uk-plumbing.md):
 *   1. postcode -> constituency (postcodes.io, `parliamentary_constituency_2024`)
 *   2. constituency -> current MP (UK Parliament Members API)
 *   3. MP -> contact details (Members API /Contact)
 *
 * Kept behind one interface so the country module is swappable (UK now, US later).
 */

const WRITE_TO_THEM = "https://www.writetothem.com/";

export interface RepProvider {
  /** Accepts a UK postcode and returns the user's single Westminster MP. */
  lookupByPostcode(postcode: string): Promise<Rep[]>;
}

const norm = (pc: string) => pc.trim().toUpperCase().replace(/\s+/g, " ");

/** Real implementation. No API key required. */
class UkRepProvider implements RepProvider {
  async lookupByPostcode(postcode: string): Promise<Rep[]> {
    const pc = encodeURIComponent(norm(postcode));

    // 1. postcode -> 2024 constituency
    const pcRes = await fetch(`https://api.postcodes.io/postcodes/${pc}`);
    if (!pcRes.ok) throw new Error("Postcode not found");
    const pcJson = await pcRes.json();
    const constituency: string | undefined =
      pcJson?.result?.parliamentary_constituency_2024;
    const constituencyCode: string | undefined =
      pcJson?.result?.codes?.parliamentary_constituency_2024;
    if (!constituency) throw new Error("No constituency for that postcode");

    // 2. constituency -> current MP
    const searchRes = await fetch(
      `https://members-api.parliament.uk/api/Location/Constituency/Search?searchText=${encodeURIComponent(
        constituency
      )}&take=1`
    );
    const searchJson = await searchRes.json();
    const member =
      searchJson?.items?.[0]?.value?.currentRepresentation?.member?.value;
    if (!member) {
      // Seat may be vacant between an MP leaving and a by-election.
      throw new Error(`No sitting MP for ${constituency} (seat may be vacant)`);
    }

    // 3. MP -> contact
    const phones: string[] = [];
    let email: string | undefined;
    try {
      const contactRes = await fetch(
        `https://members-api.parliament.uk/api/Members/${member.id}/Contact`
      );
      const contactJson = await contactRes.json();
      for (const c of contactJson?.value ?? []) {
        if (c.phone) phones.push(c.phone);
        if (!email && c.email) email = c.email;
      }
    } catch {
      // Contact is best-effort; WriteToThem is always available as a fallback.
    }

    return [
      {
        id: String(member.id),
        name: member.nameDisplayAs ?? member.nameListAs ?? "Your MP",
        office: "Member of Parliament",
        party: member.latestParty?.name,
        constituency,
        constituencyCode,
        phones,
        email,
        writeToThemUrl: WRITE_TO_THEM,
        photoUrl: `https://members-api.parliament.uk/api/Members/${member.id}/Thumbnail`,
      },
    ];
  }
}

/** Mock so the app runs offline / in demos with no network. */
class MockRepProvider implements RepProvider {
  async lookupByPostcode(postcode: string): Promise<Rep[]> {
    await new Promise((r) => setTimeout(r, 350));
    return [
      {
        id: "0",
        name: "Your MP (demo)",
        office: "Member of Parliament",
        party: "—",
        constituency: `Constituency for ${norm(postcode)}`,
        phones: ["+442072193000"],
        email: "your.mp@parliament.uk",
        writeToThemUrl: WRITE_TO_THEM,
      },
    ];
  }
}

// Flip to MockRepProvider for offline demos.
export const repProvider: RepProvider = new UkRepProvider();

const repCache = new Map<string, Rep>();

export async function resolveReps(postcode: string): Promise<Rep[]> {
  const reps = await repProvider.lookupByPostcode(postcode);
  reps.forEach((r) => repCache.set(r.id, r));
  return reps;
}

export function getCachedRep(id: string): Rep | undefined {
  return repCache.get(id);
}
