import type { FeedItem, Rep } from "@/types";

/**
 * AI email-draft assist. PRINCIPLE: help an individual write THEIR OWN first
 * message — never blast at scale. The UI must require the user to edit this
 * draft before the Send button enables (see app/action/email.tsx). At scale,
 * unedited AI mail reads as astroturf and offices discount it.
 *
 * Ships as a template-based mock so nothing requires an API key. To use a model,
 * implement generateDraft() to call your backend (which calls Claude) and return
 * a SHORT, personal first draft grounded in `item.emailContext`.
 */

export async function generateDraft(item: FeedItem, rep: Rep): Promise<string> {
  await new Promise((r) => setTimeout(r, 300));
  const context = item.emailContext ?? item.headline;
  return [
    `Dear ${rep.name},`,
    ``,
    `I'm a constituent writing about a story I've been following: ${item.headline}.`,
    ``,
    `${context} As someone in your ${rep.office === "U.S. Representative" ? "district" : "state"}, this matters to me because [add one personal sentence here — why you care].`,
    ``,
    `I'd appreciate knowing where you stand on it.`,
    ``,
    `Thank you for your time,`,
    `[Your name]`,
    `[Your town / ZIP]`,
  ].join("\n");
}

/** Heuristic: has the user meaningfully edited the AI draft? */
export function hasBeenEdited(draft: string, current: string): boolean {
  if (current.trim() === draft.trim()) return false;
  // Require at least one of the bracketed placeholders to be filled/removed.
  const placeholdersRemaining = (current.match(/\[[^\]]+\]/g) ?? []).length;
  const original = (draft.match(/\[[^\]]+\]/g) ?? []).length;
  return placeholdersRemaining < original || current.length !== draft.length;
}
