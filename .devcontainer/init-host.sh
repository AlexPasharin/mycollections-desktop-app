#!/usr/bin/env bash
# This script runs on the host machine BEFORE Docker starts.
# It ensures all necessary files exist so Docker bind mounts don't crash.
cd "$(dirname "$0")/.." || exit 1
echo "🔒 Initializing secure Claude workspace..."

echo "   -> Creating .claude directories..."
mkdir -p .devcontainer/.claude .claude/agents

echo "   -> Staging config files to prevent Docker auto-folder creation..."
touch CLAUDE.md .devcontainer/.claude/CLAUDE.md

echo "✅ Pre-flight checks complete!"
