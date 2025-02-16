import { atomWithStorage } from "jotai/utils";
import { atom } from "jotai";

export const filterByLocationAtom = atomWithStorage<number[]>(
  "filterByLocationAtom",
  [],
);

export const filterByNameAtom = atom<string>("");
