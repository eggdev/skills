#!/usr/bin/env bash
# Deploys this repo's global agent config: canonical rules, prose instructions,
# and the rule-gate enforcement hooks. Safe to re-run; everything is idempotent.
set -euo pipefail

REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

link() {
  local target="$1" dest="$2"
  if [ -e "$dest" ] && [ ! -L "$dest" ]; then
    echo "refusing to replace non-symlink $dest — move it aside first" >&2
    exit 1
  fi
  mkdir -p "$(dirname "$dest")"
  ln -sfn "$target" "$dest"
  echo "linked $dest -> $target"
}

# Canonical rules: omp (and anything reading ~/.agents/rules) picks these up natively.
link "$REPO/rules" "$HOME/.agents/rules"

# Prose tier for Claude Code.
link "$REPO/home/AGENTS.md" "$HOME/.claude/CLAUDE.md"

# Enforcement tier: PreToolUse/PostToolUse hooks for Claude Code and Codex CLI.
node "$REPO/hooks/install.mjs"

node --test "$REPO/hooks/rule-gate.test.mjs" >/dev/null && echo "rule-gate tests pass"
echo "done — restart open agent sessions to pick up hooks (Codex: run /hooks once to trust them)"
