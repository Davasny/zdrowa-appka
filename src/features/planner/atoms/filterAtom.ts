import { atomWithStorage } from "jotai/utils";

export const filterByLocationAtom = atomWithStorage<number[]>(
  "filterByLocationAtom",
  [],
);
