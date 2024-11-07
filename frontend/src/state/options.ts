import { atom } from "jotai";


export const mergeFilesOptionAtom = atom<UploadOptions["mergeFiles"]>(false);

export const sheetOptionAtom = atom<UploadOptions["sheet"]>("active");

export const startAtOptionAtom = atom<UploadOptions["startAt"]>("end");

