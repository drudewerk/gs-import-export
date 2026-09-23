import { atom } from "jotai";


export const errorAtom = atom<{ error: string; errorDescription: string; } | undefined>(undefined);

export const rateUsShowAtom = atom(false);
