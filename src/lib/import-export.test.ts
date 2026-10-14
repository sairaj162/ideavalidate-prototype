import { beforeEach, describe, expect, it } from "vitest";
import { getSampleIdeas } from "./samples";
import { parseIdeaJson } from "./import-export";
import { loadIdeas, saveIdeas, saveImportedIdea } from "./storage";

describe("JSON report import", () => {
  const sample = getSampleIdeas()[0]!;

  beforeEach(() => {
    window.localStorage.clear();
  });

  it("accepts a complete exported report", () => {
    expect(parseIdeaJson(JSON.stringify(sample))).toEqual(sample);
  });

  it("rejects malformed and invalid report data", () => {
    expect(() => parseIdeaJson("{invalid")).toThrow("not valid JSON");
    expect(() =>
      parseIdeaJson(JSON.stringify({ ...sample, ratings: { ...sample.ratings, demand: 8 } })),
    ).toThrow("ratings.demand");
    expect(() => parseIdeaJson(JSON.stringify({ ...sample, unexpected: true }))).toThrow(
      "not a valid IdeaValidate report",
    );
  });

  it("rejects imports larger than 1 MB", () => {
    expect(() => parseIdeaJson(" ".repeat(1_000_001))).toThrow("too large");
  });

  it("does not overwrite an existing report when IDs collide", () => {
    const existing = { ...sample, name: "Existing report" };
    saveIdeas([existing]);

    expect(() => saveImportedIdea(sample)).toThrow("already exists");
    expect(loadIdeas()).toEqual([existing]);
  });

  it("imports an ID collision as a distinct versioned copy", () => {
    const existing = { ...sample, name: "Existing report" };
    saveIdeas([existing]);

    const imported = saveImportedIdea(sample, true);
    const saved = loadIdeas();

    expect(saved).toHaveLength(2);
    expect(saved[1]).toEqual(existing);
    expect(imported.id).not.toBe(sample.id);
    expect(imported.name).toBe(`${sample.name} (imported copy)`);
    expect(imported.versionOf).toBe(sample.id);
    expect(imported.isSample).toBe(false);
  });

  it("restores a report whose ID is not already present", () => {
    saveIdeas([]);
    const imported = saveImportedIdea({ ...sample, id: "restored-idea" });

    expect(loadIdeas()).toEqual([imported]);
    expect(imported.id).toBe("restored-idea");
  });
});
