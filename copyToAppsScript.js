// google-sheets-react-addon/copyToAppsScript.js
const fs = require("fs-extra");
const path = require("path");

const frontendDist = path.join(__dirname, "frontend", "dist"); // Frontend build output
const backendDist = path.join(__dirname, "backend", "dist"); // Backend build output
const appsScriptDir = path.join(__dirname, "apps-script"); // Clasp root directory

async function copyFiles() {
    try {
        // Ensure the apps-script directory exists
        await fs.ensureDir(appsScriptDir);

        // Copy frontend index.html
        const frontendIndexSrc = path.join(frontendDist, "index.html");
        const frontendIndexDest = path.join(appsScriptDir, "index.html");

        if (await fs.pathExists(frontendIndexSrc)) {
            await fs.copy(frontendIndexSrc, frontendIndexDest, {
                overwrite: true,
                errorOnExist: false,
            });
            console.log("Copied frontend index.html to apps-script/index.html");
        } else {
            console.warn("Frontend index.html does not exist:", frontendIndexSrc);
        }

        // Copy backend compiled files (.js)
        const backendFiles = await fs.readdir(backendDist);
        for (const file of backendFiles) {
            if (file.endsWith(".js")) {
                const srcPath = path.join(backendDist, file);
                const destPath = path.join(appsScriptDir, file);
                await fs.copy(srcPath, destPath, { overwrite: true, errorOnExist: false });
                console.log(`Copied backend file ${file} to apps-script/${file}`);
            }
        }

        // Copy appsscript.json
        const appsScriptJsonSrc = path.join(__dirname, "appsscript.json");
        const appsScriptJsonDest = path.join(appsScriptDir, "appsscript.json");

        if (await fs.pathExists(appsScriptJsonSrc)) {
            await fs.copy(appsScriptJsonSrc, appsScriptJsonDest, {
                overwrite: true,
                errorOnExist: false,
            });
            console.log("Copied appsscripts.json to apps-script/appsscripts.json");
        } else {
            console.warn("appsscripts.json does not exist:", __dirname);
        }

        // Copy .clasp.json
        const claspJsonSrc = path.join(__dirname, ".clasp.json");
        const claspJsonSrcDest = path.join(appsScriptDir, ".clasp.json");

        if (await fs.pathExists(claspJsonSrc)) {
            await fs.copy(claspJsonSrc, claspJsonSrcDest, {
                overwrite: true,
                errorOnExist: false,
            });
            console.log("Copied .clasp.json to apps-script/.clasp.json");
        } else {
            console.warn(".clasp.json does not exist:", __dirname);
        }

        console.log("All built frontend and backend files have been copied to the Apps Script project.");
    } catch (err) {
        console.error("Error copying files:", err);
        process.exit(1);
    }
}

copyFiles();
