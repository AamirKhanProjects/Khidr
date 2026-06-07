import { z } from "zod";

// Publish payload from the admin dashboard. Blurb is REQUIRED and non-trivial.
export const publishSchema = z.object({
  headline: z.string().trim().min(3).max(300),
  blurb: z.string().trim().min(10, "A blurb in your own words is required").max(2000),
  sourceName: z.string().trim().min(1).max(120),
  sourceUrl: z.string().trim().url().max(2000),
  topics: z.array(z.string().trim().min(1).max(40)).max(12).default([]),
  billId: z.string().trim().max(60).optional().or(z.literal("")),
  callPoints: z.array(z.string().trim().min(1).max(200)).max(6).default([]),
  emailContext: z.string().trim().max(600).optional().or(z.literal("")),
});

export type PublishInput = z.infer<typeof publishSchema>;

export const ogSchema = z.object({
  url: z.string().trim().url().max(2000),
});
