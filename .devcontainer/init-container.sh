#!/usr/bin/env bash

echo "🔒 Initializing container rules..."

# Sever the VS Code host credential tunnel
echo "   -> Removing possible (VS Code) credential helper injection..."
if sudo /usr/bin/git config --system --unset-all credential.helper 2>/dev/null; then
  echo "   -> System credential helper removed."
else
  echo "WARNING: Could not remove system credential helper (sudo unavailable or already unset)."
fi
git config --global --unset-all credential.helper || true

# Tell Git to strictly use the GitHub CLI inside this container
echo "   -> Enforcing GitHub CLI for Git credentials..."
# Rewrite possible remote urls to https so GH_TOKEN/GITHUB_TOKEN would work with the original ssh remote
git config --global url."https://columbiaroad.ghe.com/".insteadOf "columbiaroad@columbiaroad.ghe.com:"
if ! gh auth status --hostname columbiaroad.ghe.com &>/dev/null; then
  echo "WARNING: GitHub CLI is not authenticated. Set GH_TOKEN or GITHUB_TOKEN in .devcontainer/.env.claude to use Git inside the container."
else
  gh auth setup-git --hostname columbiaroad.ghe.com
fi

echo "   -> Disabling automatic NPM install scripts..."
npm config set ignore-scripts true

echo "✅ Container initialization complete!"
