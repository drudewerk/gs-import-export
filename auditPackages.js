const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const packageRoots = [
    { name: "root", args: [] },
    { name: "frontend", args: ["--prefix", "frontend"] },
    { name: "backend", args: ["--prefix", "backend"] },
];

const severities = ["info", "low", "moderate", "high", "critical"];
const baselineFlag = process.argv.indexOf("--baseline");
const baselinePath = baselineFlag === -1
    ? null
    : process.argv[baselineFlag + 1];

if (baselineFlag !== -1 && !baselinePath) {
    throw new Error("--baseline requires a file path");
}

const baseline = baselinePath
    ? JSON.parse(fs.readFileSync(path.resolve(baselinePath), "utf8"))
    : null;

function collectFindings(report) {
    const advisories = {};
    const packages = {};

    for (const [packageName, vulnerability] of Object.entries(report.vulnerabilities)) {
        packages[packageName] = vulnerability.severity;
        for (const via of vulnerability.via) {
            if (typeof via === "object") {
                advisories[String(via.source)] = via.severity;
            }
        }
    }

    return { advisories, packages };
}

function findRegressions(current, allowed) {
    const regressions = [];

    for (const category of ["advisories", "packages"]) {
        for (const [name, severity] of Object.entries(current[category])) {
            const allowedSeverity = allowed?.[category]?.[name];
            const severityRank = severities.indexOf(severity);
            const allowedRank = severities.indexOf(allowedSeverity);
            if (
                severityRank === -1
                || allowedRank === -1
                || severityRank > allowedRank
            ) {
                regressions.push(`${category}:${name}:${severity}`);
            }
        }
    }

    return regressions;
}

let failed = false;

for (const packageRoot of packageRoots) {
    const result = spawnSync(
        "npm",
        ["audit", "--json", ...packageRoot.args],
        { encoding: "utf8" },
    );

    let report;
    try {
        report = JSON.parse(result.stdout);
    } catch {
        console.error(`Could not parse the ${packageRoot.name} audit result.`);
        if (result.stderr) {
            console.error(result.stderr.trim());
        }
        failed = true;
        continue;
    }

    if (!report.metadata?.vulnerabilities || !report.vulnerabilities) {
        console.error(`Could not audit ${packageRoot.name} dependencies.`);
        console.error(report.error?.summary ?? (result.stderr || "").trim());
        failed = true;
        continue;
    }

    const counts = report.metadata.vulnerabilities;
    console.log(
        `${packageRoot.name}: ${counts.total} total `
        + `(${counts.low} low, ${counts.moderate} moderate, `
        + `${counts.high} high, ${counts.critical} critical)`,
    );

    const findings = collectFindings(report);
    if (baseline) {
        if (
            !baseline[packageRoot.name]?.advisories
            || !baseline[packageRoot.name]?.packages
        ) {
            console.error(`Missing ${packageRoot.name} audit baseline.`);
            failed = true;
            continue;
        }
        const regressions = findRegressions(
            findings,
            baseline[packageRoot.name],
        );
        for (const regression of regressions) {
            console.error(`${packageRoot.name} audit regression: ${regression}`);
        }
        failed ||= regressions.length > 0;
    } else {
        for (const [packageName, severity] of Object.entries(findings.packages)) {
            if (severities.indexOf(severity) >= severities.indexOf("high")) {
                console.error(
                    `${packageRoot.name} release blocker: ${packageName}:${severity}`,
                );
            }
        }
        failed ||= counts.high > 0 || counts.critical > 0;
    }
}

process.exitCode = failed ? 1 : 0;
