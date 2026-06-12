#!/usr/bin/env bash
# Shared ledger CLI for the scout → assess → plan prompt pipeline.
# Replaces the inline SQL boilerplate previously duplicated across the loop prompts.
set -euo pipefail

DB="${LEDGER_DB:-$HOME/dev/skills/research/agentic-tooling/ledger.db}"

usage() {
  cat <<'EOF'
Usage: ledger.sh [-d db_path] <command> [args]

Commands:
  init                          Create all tables (idempotent)
  unassessed <project>          Proposals with no assessment for <project>
  unplanned <project>           Adopt-verdict assessments with no plan for <project>
  insert-find <name> <url> <summary> <date>
  insert-assessment <proposal_id> <project> <verdict> <integration_path> <benefit> <effort_hours> <effort_class> <date>
  insert-plan <assessment_id> <project> <plan_path> <date>
EOF
  exit 1
}

while getopts "d:" opt; do
  case "$opt" in
    d) DB="$OPTARG" ;;
    *) usage ;;
  esac
done
shift $((OPTIND - 1))

[ $# -ge 1 ] || usage
cmd="$1"; shift

sq() { sqlite3 "$DB" "$@"; }
esc() { printf %s "$1" | sed "s/'/''/g"; }
is_int() { [[ "$1" =~ ^[0-9]+$ ]] || { echo "error: '$1' is not an integer" >&2; exit 1; }; }
is_num() { [[ "$1" =~ ^[0-9]+(\.[0-9]+)?$ ]] || { echo "error: '$1' is not a number" >&2; exit 1; }; }
is_date() { [[ "$1" =~ ^[0-9]{4}-[0-9]{2}-[0-9]{2}$ ]] || { echo "error: '$1' is not YYYY-MM-DD" >&2; exit 1; }; }

case "$cmd" in
  init)
    mkdir -p "$(dirname "$DB")"
    sq <<'SQL'
CREATE TABLE IF NOT EXISTS finds(id INTEGER PRIMARY KEY, name TEXT, url TEXT UNIQUE,
  summary TEXT, found_date TEXT, status TEXT DEFAULT 'proposed');
CREATE VIRTUAL TABLE IF NOT EXISTS finds_fts USING fts5(name, summary, content=finds, content_rowid=id);
CREATE TABLE IF NOT EXISTS assessments(id INTEGER PRIMARY KEY, proposal_id INTEGER,
  project TEXT, verdict TEXT, integration_path TEXT, benefit TEXT, effort_hours REAL,
  effort_class TEXT, assessed_date TEXT, outcome TEXT, UNIQUE(proposal_id, project));
CREATE TABLE IF NOT EXISTS plans(id INTEGER PRIMARY KEY, assessment_id INTEGER,
  project TEXT, plan_path TEXT, planned_date TEXT, status TEXT DEFAULT 'planned',
  UNIQUE(assessment_id, project));
SQL
    echo "ok: ledger initialized at $DB"
    ;;
  unassessed)
    [ $# -eq 1 ] || usage
    proj=$(esc "$1")
    sq -header -column "SELECT f.id, f.name, f.url, f.summary FROM finds f
      LEFT JOIN assessments a ON a.proposal_id = f.id AND a.project = '$proj'
      WHERE a.id IS NULL;"
    ;;
  unplanned)
    [ $# -eq 1 ] || usage
    proj=$(esc "$1")
    sq -header -column "SELECT a.id, a.proposal_id, f.name, a.integration_path,
      a.benefit, a.effort_hours, a.effort_class FROM assessments a
      JOIN finds f ON f.id = a.proposal_id
      LEFT JOIN plans p ON p.assessment_id = a.id AND p.project = '$proj'
      WHERE a.project = '$proj' AND a.verdict = 'adopt' AND p.id IS NULL;"
    ;;
  insert-find)
    [ $# -eq 4 ] || usage
    is_date "$4"
    sq "INSERT INTO finds(name, url, summary, found_date) VALUES (
      '$(esc "$1")', '$(esc "$2")', '$(esc "$3")', '$4');
      INSERT INTO finds_fts(rowid, name, summary) VALUES (last_insert_rowid(),
      '$(esc "$1")', '$(esc "$3")');"
    echo "ok: find inserted"
    ;;
  insert-assessment)
    [ $# -eq 8 ] || usage
    is_int "$1"; is_num "$6"; is_date "$8"
    sq "INSERT INTO assessments(proposal_id, project, verdict, integration_path, benefit,
      effort_hours, effort_class, assessed_date) VALUES ($1,
      '$(esc "$2")', '$(esc "$3")', '$(esc "$4")', '$(esc "$5")',
      $6, '$(esc "$7")', '$8');"
    echo "ok: assessment inserted"
    ;;
  insert-plan)
    [ $# -eq 4 ] || usage
    is_int "$1"; is_date "$4"
    sq "INSERT INTO plans(assessment_id, project, plan_path, planned_date) VALUES ($1,
      '$(esc "$2")', '$(esc "$3")', '$4');"
    echo "ok: plan inserted"
    ;;
  *) usage ;;
esac
