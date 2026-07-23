import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";


const helpersDir = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(helpersDir, "../../dist");

export function loadAppsScriptContext(globals = {}) {
    const context = vm.createContext(globals);
    const compiledFiles = fs.readdirSync(distDir)
        .filter((file) => file.endsWith(".js"))
        .sort();

    for (const file of compiledFiles) {
        const source = fs.readFileSync(path.join(distDir, file), "utf8");
        vm.runInContext(source, context, { filename: file });
    }

    return context;
}

export function toHostValue(value) {
    return structuredClone(value);
}
