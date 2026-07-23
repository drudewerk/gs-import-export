const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const test = require("node:test");


test("the CI baseline cannot allow high-severity findings", () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "audit-packages-"));
    const npmPath = path.join(tempDir, "npm");
    const baselinePath = path.join(tempDir, "baseline.json");
    const report = {
        vulnerabilities: {
            vulnerablePackage: {
                severity: "high",
                via: [{
                    source: 1,
                    severity: "high",
                }],
            },
        },
        metadata: {
            vulnerabilities: {
                info: 0,
                low: 0,
                moderate: 0,
                high: 1,
                critical: 0,
                total: 1,
            },
        },
    };

    fs.writeFileSync(
        npmPath,
        `#!/usr/bin/env node\nprocess.stdout.write(${JSON.stringify(JSON.stringify(report))});\n`,
        { mode: 0o755 },
    );
    fs.writeFileSync(baselinePath, JSON.stringify({
        advisories: {
            1: "high",
        },
        packages: {
            vulnerablePackage: "high",
        },
    }));

    const result = spawnSync(
        process.execPath,
        ["auditPackages.js", "--baseline", baselinePath],
        {
            cwd: path.resolve(__dirname, ".."),
            encoding: "utf8",
            env: {
                ...process.env,
                PATH: `${tempDir}${path.delimiter}${process.env.PATH}`,
            },
        },
    );

    fs.rmSync(tempDir, { recursive: true });

    assert.equal(result.status, 1);
    assert.match(result.stderr, /Release blocker: vulnerablePackage:high/);
});
