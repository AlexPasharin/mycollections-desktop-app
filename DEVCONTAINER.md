# Secure Node.js DevContainer for Claude Code

A secure, zero-trust DevContainer template pre-configured for Node.js development using Anthropic's Claude Code CLI.

This environment is specifically architected to allow AI-assisted development while strictly protecting host secrets and blocking unauthorized network requests.

## 🛡️ Built-In Security Features

- **Host Isolation:** The AI is completely trapped within the Linux container. It has zero access to your Mac/Windows host filesystem or global SSH keys.
- **Managed Settings:** Core security configurations are enforced via system-level managed settings (`/etc/claude-code/managed-settings.json`), mounted read-only. `allowManagedPermissionRulesOnly` and `allowManagedHooksOnly` ensure no workspace or user-level config can override or extend these rules.
- **Network & Execution Blocks:** Destructive commands (like `git push -f`) and data exfiltration vectors (like `curl` or `wget`) are hard-blocked by the CLI engine.
- **Secret Protection:** The AI is explicitly denied read access to sensitive files like `.env`, `.npmrc`, and SSH directories.

### ⚠️ Security Disclaimer

While this DevContainer is architected with strict zero-trust principles to mitigate risk, no sandbox is entirely impenetrable. AI models are non-deterministic, and zero-day vulnerabilities in containerization tools (Docker/Podman) or IDEs can occur.

This template provides a highly secure baseline, but developers are still responsible for reviewing AI-generated code and ensuring that highly sensitive, out-of-scope credentials are never intentionally moved into the readable project workspace.

---

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed on your local machine:

1. **Visual Studio Code** with the [Dev Containers extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers).
2. **A Container Engine:** [Podman Desktop](https://podman-desktop.io/)

### Podman Machine Requirements

**All platforms:** Run Podman in rootless mode (without root privileges). This reduces blast radius — a container escape lands as your regular user account rather than root on the host. In Podman Desktop, ensure "Machine with root privileges" is **disabled**.

**macOS only:** Set the provider to `HyperVisor`. LibKrun is not supported and will cause permission errors with the workspace mount. If you need to change this, delete and recreate the Podman machine.

---

### 1. Generate a GitHub Token (Optional)

If you want Claude to interact with your remote GitHub repository, you need a scoped Personal Access Token. **If you only need Claude to work locally, you can skip this step.**

1. Go to [GitHub Fine-Grained Tokens](https://github.com/settings/personal-access-tokens/new).
2. Create a token strictly scoped to **your specific new repository**.
3. Grant it **Contents (Read & Write)** permissions.

### 2. Setup Local Environment Variables

Before starting the container, set up your credentials on your local machine:

1. Duplicate the `.devcontainer/.env.claude.example` file and rename it to `.devcontainer/.env.claude`.
2. Paste your newly generated GitHub token into the `GITHUB_TOKEN=` variable. _(If you skipped Step 2, you can just leave this blank)._
3. Run `bash .devcontainer/init-host.sh` once to create the required stub files and directories before first boot.
4. Give the project a name to devcontainer.json and rename volume source to match that `"source=claude-sso-auth-my-project,target=/home/node/.claude,type=volume"`

### 3. Configure VS Code

To ensure VS Code's native AI features don't conflict or leak data outside of our secure Claude environment, update your local VS Code settings.

Open your VS Code `settings.json` and add:

```jsonc
{
  // ... snip
  "chat.disableAIFeatures": true,
  "dev.containers.dockerPath": "podman",
  // ... snip
}
```

### 5. Boot the Sandbox

1. Open the project in VS Code.
2. Open the Command Palette (`Cmd+Shift+P` / `Ctrl+Shift+P`).
3. Select **Dev Containers: Reopen in Container**.
   _(Note: The first time you build this, it will take a minute or two to pull the Node image and install the Anthropic CLI)._

### 6. Authenticate (Inside the Container)

Once the container finishes building, open the **VS Code Integrated Terminal** (which is now securely inside the Linux box) and run the following setup commands:

**Configure Git Authentication (Skip if you didn't create a GitHub token):**

```bash
# Ensure Git uses HTTPS instead of SSH
git remote set-url origin https://github.com/YOUR_ORG/YOUR_REPO.git

# Tell Git to use the 'gh' CLI (and your injected GITHUB_TOKEN) for credentials
gh auth setup-git
```

**Claude authentication is handled automatically** via the `cr-ai-login` helper configured in managed settings. No manual login step is required.

### 7. Using Claude

You are now ready to code! The container includes **Node.js** and **npm** as package managers. Because we are using the official extension, you can interact with Claude in two ways:

- **Option A: The Visual Sidebar**

  Click the Anthropic (Claude) icon in your VS Code sidebar. You can chat naturally, ask questions about your codebase, and approve/reject file changes directly in the UI. It will respect all the security boundaries we set up.

- **Option B: The Terminal CLI**

  Open the integrated terminal and simply run `claude` to enter the interactive command-line chat.<br>Alternatively, run one-off tasks directly from bash:
  `claude -p "Create a new Express router for user authentication and save it in src/routes/"`

### Customizing Permissions

Because `allowManagedPermissionRulesOnly` and `allowManagedHooksOnly` are enabled, **`allow`/`deny` rules and hooks can only be defined in `.devcontainer/.claude/managed-settings.json`**. Any permission or hook entries in workspace or user-level `settings.json` files are ignored.

This mitigates supply chain attacks that attempt privilege escalation by injecting `allow` rules into workspace-level settings — a vector where a compromised dependency or malicious repo quietly widens Claude's permissions without the developer noticing.

Other Claude settings (such as skills and plugins) can still be configured directly through Claude or in any settings file as normal.

Edit `.devcontainer/.claude/managed-settings.json` from your host machine (see section below) and the container will pick up the changes instantly without a rebuild.

### Modifying Configuration Files When the Container is Running

For security purposes, sensitive folders like `.devcontainer` and `.git/hooks` are mounted as read-only inside the container. This physically prevents Claude from altering its own safety guardrails or your Git hooks.

Because your VS Code editor is running inside the container, you cannot edit these files directly in your DevContainer VS Code window (you will get a "read-only file system" error).

How to edit them while the container is running:

1. Leave your DevContainer running.
2. Open a new, local VS Code window (or any text editor on your host machine like Notepad/TextEdit).
3. Open the file directly from your local hard drive
4. Make your changes and save.

Because these folders are bind mounts, the moment you save the file on your host machine, the container (and Claude) instantly sees the updated rules. No container rebuild or restart is required!

### Working with Claude Code Sub-Agents

Sub-Agents are specialized AI workers that run in isolated context windows. Because we run Claude Code inside a secure DevContainer, we have a specific workflow for creating them:

#### 1. Team Sub-Agents (Shared)

We keep project-wide agents (like our standard `code-reviewer` or `security-auditor`) checked into Git under `<project root>/.claude/agents/`.

- **Note on editing:** For security, this folder is mounted as **read-only** inside the container to prevent accidental AI overwrites. If you want to update a team agent's instructions, you must edit the markdown file using your _local host_ VS Code window, not the container terminal.

#### 2. Personal Sub-Agents (Just for you)

You can create your own personal Sub-Agents to help with your unique workflow!

- Run `/agents` in the Claude terminal and create a new agent.
- Select the **Personal** (User-level) option when prompted.
- Your personal agents are safely stored in your local Docker volume (`~/.claude/agents/`). They will survive container rebuilds and will never accidentally be pushed to the project repository!
