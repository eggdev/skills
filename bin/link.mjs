#!/usr/bin/env node
// Puts the `equip` command on PATH by symlinking it into npm's global bin dir.
// Runs from the `prepare` script, so `npm install` and install.sh both wire it.
// Idempotent. Symlinks directly instead of shelling out to `npm link`, which
// would re-enter this same prepare script.

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const repoRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

// Installed as somebody's dependency: npm links declared bins itself.
if (repoRoot.split(path.sep).includes("node_modules")) process.exit(0);

function globalBinDir() {
  const prefix =
    process.env.npm_config_prefix ??
    execFileSync("npm", ["prefix", "-g"], { stdio: ["ignore", "pipe", "inherit"] })
      .toString()
      .trim();
  return path.join(prefix, "bin");
}

function shortPath(target) {
  const home = os.homedir();
  return target.startsWith(home) ? "~" + target.slice(home.length) : target;
}

const source = path.join(repoRoot, "bin", "equip.mjs");
const binDir = globalBinDir();
const dest = path.join(binDir, "equip");

let existing = null;
try {
  existing = fs.lstatSync(dest);
} catch {
  /* absent */
}
if (existing && !existing.isSymbolicLink()) {
  console.error(`equip: refusing to replace non-symlink ${dest} — move it aside first`);
  process.exit(1);
}

fs.mkdirSync(binDir, { recursive: true });
if (existing) fs.rmSync(dest);
fs.symlinkSync(source, dest);
fs.chmodSync(source, 0o755);
console.log(`linked ${shortPath(dest)} -> ${shortPath(source)}`);

const onPath = (process.env.PATH ?? "").split(path.delimiter).includes(binDir);
if (!onPath) console.warn(`equip: ${binDir} is not on your PATH — add it to run \`equip\``);
