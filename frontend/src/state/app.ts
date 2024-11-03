import { atom } from "jotai";


export const importingAtom = atom(false);
export const importedAtom = atom(false);

export const errorAtom = atom<{ error: string; errorDescription: string; } | undefined>(undefined);
