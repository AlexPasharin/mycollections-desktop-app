# Use the official Node image (trixie is a stable Debian release). 
# It's better to use js container and locally install typescript if needed than having globally installed typescript
FROM mcr.microsoft.com/devcontainers/javascript-node:22-trixie

# RUN AS ROOT (Default at the start of the file)
# All required commands as one to reduce layers
# 1. Pre-create the .claude directory and symlink
# 2. Pre-create /etc/claude-code for managed settings
# 3. Weaken what can be sudoed by the default user without password (required by git credentials helper removal)
RUN mkdir -p /home/node/.claude \
    && echo '{}' > /home/node/.claude/.claude.json \
    && ln -s /home/node/.claude/.claude.json /home/node/.claude.json \
    && chown -R node:node /home/node/.claude /home/node/.claude.json \
    && mkdir -p /etc/claude-code \
    && echo "node ALL=(root) NOPASSWD: /usr/bin/git config --system --unset-all credential.helper" > /etc/sudoers.d/node \
    && chmod 440 /etc/sudoers.d/node

# Switch to the built-in non-root user
USER node

# Install Claude Code
RUN curl -fsSL https://claude.ai/install.sh | bash
# Setup Claude Code
RUN curl -fsSL https://ai.columbiaroad.com/install/install.sh | bash

# Set the working directory
WORKDIR /workspace

