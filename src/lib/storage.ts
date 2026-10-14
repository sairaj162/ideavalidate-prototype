import { useCallback, useEffect, useState } from "react";
import type { Idea } from "./types";
import { getSampleIdeas } from "./samples";
import type { ImportedIdea } from "./import-export";

// All data lives in the browser's localStorage under this key.
const KEY = "ideavalidate.ideas.v1";
const EVENT = "ideavalidate:change";

export function loadIdeas(): Idea[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(KEY);
  if (raw === null) {
    // First visit: start with the fictional samples.
    const samples = getSampleIdeas();
    saveIdeas(samples);
    return samples;
  }
  try {
    return JSON.parse(raw) as Idea[];
  } catch {
    return [];
  }
}

export function saveIdeas(ideas: Idea[]) {
  window.localStorage.setItem(KEY, JSON.stringify(ideas));
  window.dispatchEvent(new Event(EVENT));
}

export function saveImportedIdea(idea: ImportedIdea, asCopy = false): Idea {
  const all = loadIdeas();
  const idExists = all.some((item) => item.id === idea.id);
  if (idExists && !asCopy) {
    throw new Error("A report with this ID already exists. Import it as a copy instead.");
  }

  const now = new Date().toISOString();
  const imported: Idea = idExists
    ? {
        ...idea,
        id: crypto.randomUUID(),
        name: `${idea.name} (imported copy)`,
        createdAt: now,
        updatedAt: now,
        isSample: false,
        versionOf: idea.versionOf ?? idea.id,
      }
    : idea;
  if (all.some((item) => item.id === imported.id)) {
    throw new Error("Could not create a unique report ID. Please try importing again.");
  }
  saveIdeas([imported, ...all]);
  return imported;
}

/** React hook: read and change saved ideas. `ready` is false until loaded in the browser. */
export function useIdeas() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const sync = () => setIdeas(loadIdeas());
    sync();
    setReady(true);
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const upsert = useCallback((idea: Idea) => {
    const all = loadIdeas();
    const i = all.findIndex((x) => x.id === idea.id);
    if (i >= 0) all[i] = idea;
    else all.unshift(idea);
    saveIdeas(all);
  }, []);

  const duplicate = useCallback((idea: Idea) => {
    const all = loadIdeas();
    const rootId = idea.versionOf ?? idea.id;
    const version = all.filter((item) => item.versionOf === rootId).length + 2;
    const now = new Date().toISOString();
    const copy: Idea = {
      ...idea,
      id: crypto.randomUUID(),
      name: `${idea.name} (version ${version})`,
      createdAt: now,
      updatedAt: now,
      isSample: false,
      versionOf: rootId,
    };
    saveIdeas([copy, ...all]);
    return copy;
  }, []);

  const importIdea = useCallback(saveImportedIdea, []);

  const remove = useCallback((id: string) => saveIdeas(loadIdeas().filter((x) => x.id !== id)), []);
  const resetDemo = useCallback(() => saveIdeas(getSampleIdeas()), []);

  return { ideas, ready, upsert, remove, duplicate, importIdea, resetDemo };
}
