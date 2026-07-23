// google-sheets-react-addon/copyToAppsScript.js
const fs = require("fs-extra");
const path = require("path");

const frontendDist = path.join(__dirname, "frontend", "dist"); // Frontend build output
const backendSrc = path.join(__dirname, "backend", "src"); // Backend source
const backendDist = path.join(__dirname, "backend", "dist"); // Backend build output
const appsScriptDir = path.join(__dirname, "apps-script"); // Clasp root directory

async function copyFiles() {
    try {
        const frontendIndexSrc = path.join(frontendDist, "index.html");
        const frontendIndexDest = path.join(appsScriptDir, "index.html");
        const appsScriptJsonSrc = path.join(__dirname, "appsscript.json");
        const appsScriptJsonDest = path.join(appsScriptDir, "appsscript.json");
        const claspJsonSrc = path.join(__dirname, ".clasp.json");
        const claspJsonSrcDest = path.join(appsScriptDir, ".clasp.json");

        for (const requiredPath of [frontendIndexSrc, backendDist, appsScriptJsonSrc]) {
            if (!(await fs.pathExists(requiredPath))) {
                throw new Error(`Required build input does not exist: ${requiredPath}`);
            }
        }

        const backendFiles = (await fs.readdir(backendSrc))
            .filter(file => file.endsWith(".ts"))
            .map(file => file.replace(/\.ts$/, ".js"));

        if (backendFiles.length === 0) {
            throw new Error(`No backend source files found in ${backendSrc}`);
        }

        for (const backendFile of backendFiles) {
            const compiledPath = path.join(backendDist, backendFile);
            if (!(await fs.pathExists(compiledPath))) {
                throw new Error(`Required build input does not exist: ${compiledPath}`);
            }
        }

        await fs.ensureDir(appsScriptDir);
        const existingOutputs = await fs.readdir(appsScriptDir);
        await Promise.all(existingOutputs
            .filter(file => file !== ".clasp.json")
            .map(file => fs.remove(path.join(appsScriptDir, file))));

        await Promise.all([
            fs.copy(frontendIndexSrc, frontendIndexDest),
            fs.copy(appsScriptJsonSrc, appsScriptJsonDest),
            ...backendFiles.map(file => fs.copy(
                path.join(backendDist, file),
                path.join(appsScriptDir, file),
            )),
        ]);

        if (await fs.pathExists(claspJsonSrc)) {
            await fs.copy(claspJsonSrc, claspJsonSrcDest);
        }

        console.log("Assembled a clean Apps Script project in apps-script/");
    } catch (err) {
        console.error("Error copying files:", err);
        process.exit(1);
    }
}

copyFiles();
