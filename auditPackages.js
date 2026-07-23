const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

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

function runAudit() {
    const result = spawnSync(
        "npm",
        ["audit", "--json", "--workspaces", "--include-workspace-root"],
        { encoding: "utf8" },
    );

    let report;
    try {
        report = JSON.parse(result.stdout);
    } catch {
        console.error("Could not parse the workspace audit result.");
        if (result.stderr) {
            console.error(result.stderr.trim());
        }
        return 1;
    }

    if (!report.metadata?.vulnerabilities || !report.vulnerabilities) {
        console.error("Could not audit workspace dependencies.");
        console.error(report.error?.summary ?? (result.stderr || "").trim());
        return 1;
    }

    const counts = report.metadata.vulnerabilities;
    console.log(
        `${counts.total} total `
        + `(${counts.low} low, ${counts.moderate} moderate, `
        + `${counts.high} high, ${counts.critical} critical)`,
    );

    const findings = collectFindings(report);
    const releaseBlockers = Object.entries(findings.packages)
        .filter(([, severity]) => (
            severities.indexOf(severity) >= severities.indexOf("high")
        ));

    for (const [packageName, severity] of releaseBlockers) {
        console.error(
            `Release blocker: ${packageName}:${severity}`,
        );
    }

    if (baseline) {
        if (!baseline.advisories || !baseline.packages) {
            console.error("Invalid workspace audit baseline.");
            return 1;
        }
        const regressions = findRegressions(findings, baseline);
        for (const regression of regressions) {
            console.error(`Audit regression: ${regression}`);
        }
        return releaseBlockers.length > 0 || regressions.length > 0 ? 1 : 0;
    }

    return releaseBlockers.length > 0 ? 1 : 0;
}

process.exitCode = runAudit();
