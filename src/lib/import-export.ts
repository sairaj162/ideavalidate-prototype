import { z } from "zod";
import { CATEGORIES, CURRENCIES, STAGES, type Idea } from "./types";

const nonEmptyText = z.string().trim().min(1).max(20_000);
const optionalNumber = z.number().finite().nonnegative().nullable();
const timestamp = z
  .string()
  .refine((value) => Number.isFinite(Date.parse(value)), "must be a valid date");

const ideaSchema = z
  .object({
    id: nonEmptyText.max(200),
    createdAt: timestamp,
    updatedAt: timestamp,
    isSample: z.boolean().optional(),
    versionOf: z.string().max(200).optional(),
    name: nonEmptyText.max(200),
    category: z
      .string()
      .refine((value): value is (typeof CATEGORIES)[number] =>
        CATEGORIES.includes(value as (typeof CATEGORIES)[number]),
      ),
    description: nonEmptyText,
    targetMarket: nonEmptyText,
    stage: z
      .string()
      .refine((value): value is (typeof STAGES)[number] =>
        STAGES.includes(value as (typeof STAGES)[number]),
      ),
    problem: z.string().max(20_000),
    whoHasProblem: z.string().max(20_000),
    frequency: z.string().max(20_000),
    currentSolution: z.string().max(20_000),
    research: z.string().max(20_000),
    interviews: z.number().int().nonnegative().finite().nullable(),
    segment: z.string().max(20_000),
    potentialCustomers: optionalNumber,
    competitors: z.string().max(20_000),
    usp: z.string().max(20_000),
    uspEvidence: z.string().max(20_000),
    currency: z
      .string()
      .refine((value): value is (typeof CURRENCIES)[number] =>
        CURRENCIES.includes(value as (typeof CURRENCIES)[number]),
      ),
    price: optionalNumber,
    variableCost: optionalNumber,
    fixedCosts: optionalNumber,
    monthlySales: optionalNumber,
    investment: optionalNumber,
    ratings: z
      .object({
        problem: z.number().int().min(0).max(5),
        demand: z.number().int().min(0).max(5),
        differentiation: z.number().int().min(0).max(5),
        financial: z.number().int().min(0).max(5),
        readiness: z.number().int().min(0).max(5),
      })
      .strict(),
  })
  .strict();

export type ImportedIdea = Omit<z.infer<typeof ideaSchema>, "versionOf"> & { versionOf?: string };

export function parseIdeaJson(json: string): ImportedIdea {
  if (json.length > 1_000_000) {
    throw new Error("The JSON file is too large. Choose a report under 1 MB.");
  }

  let value: unknown;
  try {
    value = JSON.parse(json);
  } catch {
    throw new Error("This file is not valid JSON.");
  }

  const result = ideaSchema.safeParse(value);
  if (!result.success) {
    const issue = result.error.issues[0];
    if (!issue) throw new Error("This file is not a valid Startup Idea Validator report.");
    const field = issue.path.join(".");
    throw new Error(
      field
        ? `Invalid report data at “${field}”: ${issue.message}.`
        : "This file is not a valid Startup Idea Validator report.",
    );
  }
  const { versionOf, ...idea } = result.data;
  return versionOf === undefined ? idea : { ...idea, versionOf };
}
