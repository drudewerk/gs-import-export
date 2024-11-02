import { atom } from "jotai";


export const sheetOptionAtom = atom<UploadOptions["sheet"]>("active");

export const startAtOptionAtom = atom<UploadOptions["startAt"]>("lastRow");

export const mergeFilesOptionAtom = atom<boolean>(false);
