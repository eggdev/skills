#!/usr/bin/env node
// equip: interactive installer for this repository's skills.
// Global scopes symlink (this repo stays the source of truth); the project
// scope copies real files so collaborators and CI get them from that repo.

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import * as p from "@clack/prompts";
import { parseFrontmatter } from "../hooks/rule-gate.mjs";

const repoRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const skillsDir = path.join(repoRoot, "skills");

const COPY_EXCLUDE = /(^|\/)(\.DS_Store|__pycache__|.*\.pyc)$/;

function discoverSkills() {
  const skills = [];
  for (const entry of fs.readdirSync(skillsDir).sort()) {
    const file = path.join(skillsDir, entry, "SKILL.md");
    if (!fs.existsSync(file)) continue;
    const { meta } = parseFrontmatter(fs.readFileSync(file, "utf8"));
    skills.push({
      name: entry,
      dir: path.join(skillsDir, entry),
      description: String(meta.description ?? ""),
    });
  }
  return skills;
}

function projectRoot() {
  try {
    return execFileSync("git", ["rev-parse", "--show-toplevel"], {
      stdio: ["ignore", "pipe", "ignore"],
    })
      .toString()
      .trim();
  } catch {
    return process.cwd();
  }
}

function truncate(text, max) {
  return text.length > max ? text.slice(0, max - 1) + "…" : text;
}

function shortPath(target) {
  const home = os.homedir();
  return target.startsWith(home) ? "~" + target.slice(home.length) : target;
}

// -> "linked" | "unchanged" | "blocked"
function installLink(srcDir, dest) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  let existing = null;
  try {
    existing = fs.lstatSync(dest);
  } catch {
    /* absent */
  }
  if (existing) {
    if (!existing.isSymbolicLink()) return "blocked";
    if (fs.readlinkSync(dest) === srcDir) return "unchanged";
    fs.rmSync(dest);
  }
  fs.symlinkSync(srcDir, dest);
  return "linked";
}

// -> "copied" | "replaced"
function installCopy(srcDir, dest) {
  const existed = fs.existsSync(dest);
  if (existed) fs.rmSync(dest, { recursive: true });
  fs.cpSync(srcDir, dest, {
    recursive: true,
    filter: (src) => !COPY_EXCLUDE.test(src),
  });
  return existed ? "replaced" : "copied";
}

function bail(message) {
  p.cancel(message);
  process.exit(1);
}

const args = process.argv.slice(2);
if (args.includes("--help") || args.includes("-h")) {
  console.log(`equip - install skills from ${shortPath(repoRoot)}

Usage: equip

Interactive: pick skills, then a scope.
  Global   ~/.agents/skills   symlinks to this repo; ~/.claude/skills links through
  Project  <repo>/.agents/skills   copies files; .claude/skills symlinks to them`);
  process.exit(0);
}
if (!process.stdin.isTTY) {
  console.error("equip: needs an interactive terminal");
  process.exit(1);
}

p.intro("equip");
p.log.info(`Source: ${shortPath(repoRoot)}`);

const skills = discoverSkills();
if (skills.length === 0) bail(`no skills found in ${skillsDir}`);
p.log.success(`Found ${skills.length} skills`);

const chosen = await p.multiselect({
  message: "Select skills to install (space to toggle)",
  options: skills.map((s) => ({
    value: s,
    label: s.name,
    hint: truncate(s.description, 64),
  })),
  required: true,
});
if (p.isCancel(chosen)) bail("nothing installed");

const proot = projectRoot();
const scope = await p.select({
  message: "Install scope",
  options: [
    {
      value: { kind: "link", dir: path.join(os.homedir(), ".agents", "skills") },
      label: "Global · ~/.agents/skills",
      hint: "symlinks to this repo; ~/.claude/skills links through",
    },
    {
      value: { kind: "copy", dir: path.join(proot, ".agents", "skills") },
      label: `Project · ${shortPath(proot)}/.agents/skills`,
      hint: "copies files; .claude/skills symlinks to them",
    },
  ],
});
if (p.isCancel(scope)) bail("nothing installed");

if (scope.kind === "copy" && proot === repoRoot) {
  bail("this is the skills repository itself; a project install here is a no-op");
}

if (scope.kind === "copy") {
  const conflicts = chosen.filter((s) => fs.existsSync(path.join(scope.dir, s.name)));
  if (conflicts.length > 0) {
    const ok = await p.confirm({
      message: `Replace ${conflicts.length} already-installed: ${conflicts.map((s) => s.name).join(", ")}?`,
    });
    if (p.isCancel(ok) || !ok) bail("nothing installed");
  }
}

// Both scopes share the npx-skills paradigm: the skill lives in .agents/skills
// (a symlink to this repo globally, a copy in a project), and .claude/skills
// holds a relative symlink through it.
const claudeBase =
  scope.kind === "link"
    ? path.join(os.homedir(), ".claude", "skills")
    : path.join(proot, ".claude", "skills");
const done = [];
const blocked = [];
for (const skill of chosen) {
  const dest = path.join(scope.dir, skill.name);
  const status =
    scope.kind === "link" ? installLink(skill.dir, dest) : installCopy(skill.dir, dest);
  if (status === "blocked") {
    blocked.push(path.join(shortPath(scope.dir), skill.name));
    continue;
  }
  const linkStatus = installLink(
    `../../.agents/skills/${skill.name}`,
    path.join(claudeBase, skill.name),
  );
  if (linkStatus === "blocked") blocked.push(path.join(shortPath(claudeBase), skill.name));
  done.push(`${skill.name} ${status}${linkStatus === "blocked" ? "" : ", .claude linked"}`);
}

if (done.length > 0) p.log.success(done.join("\n"));
for (const dest of blocked) {
  p.log.warn(`${dest} exists and is not a symlink - move it aside first`);
}

if (done.length === 0) bail("nothing installed");
p.outro(
  `${done.length} skill${done.length === 1 ? "" : "s"} → ${shortPath(scope.dir)} · restart open agent sessions to pick them up`,
);
