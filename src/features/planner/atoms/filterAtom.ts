import { atomWithStorage } from "jotai/utils";

export const filterByLocationAtom = atomWithStorage<number[]>(
  "filterByLocationAtom",
  [],
);

export const filterByNameAtom = atomWithStorage<string>("filterByNameAtom", "");
