import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import vm from "node:vm";
import { fileURLToPath } from "node:url";


const testDir = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(testDir, "../dist");

test("compiled Apps Script exposes the sidebar and menu entry points", () => {
    const context = vm.createContext({});
    const compiledFiles = fs.readdirSync(distDir)
        .filter((file) => file.endsWith(".js"))
        .sort();

    for (const file of compiledFiles) {
        const source = fs.readFileSync(path.join(distDir, file), "utf8");
        vm.runInContext(source, context, { filename: file });
    }

    for (const entryPoint of [
        "getCurrentState",
        "getOptions",
        "getRateUsState",
        "importJsonFile",
        "onOpen",
        "saveOptions",
        "setRateUsState",
        "sheetDataToArray",
    ]) {
        assert.equal(typeof context[entryPoint], "function", entryPoint);
    }
});
