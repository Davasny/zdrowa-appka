import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";

export const filterByLocationAtom = atomWithStorage<number[]>(
  "filterByLocationAtom",
  [],
);

export const filterByNameAtom = atom<string>("");

export const filterByBookedAtom = atom<boolean>(false);
