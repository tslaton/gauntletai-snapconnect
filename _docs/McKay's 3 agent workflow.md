[link](https://x.com/mckaywrigley/status/1937979046627054020)

# AI CLI Automation with tmux

This setup automates running the same prompt across three AI coding CLIs (Claude, Gemini, and Codex) simultaneously using tmux. It eliminates the need to manually open three terminal tabs and paste prompts into each one.

## Prerequisites

- macOS with Homebrew installed
- tmux: `brew install tmux`

## Installation

### What's Actually Happening?

When you run these commands, you're:

1. Creating a configuration file that tells tmux how you want it to behave
2. Creating a shortcut command `ai` that does all the setup work for you
3. Enabling features like mouse clicking and keyboard shortcuts

Don't worry about understanding the syntax - just copy and paste!

### 1. Set up tmux configuration

Run this command to create your tmux config with all customizations:

```bash
cat > ~/.tmux.conf << 'EOF'
# Change prefix from Ctrl+b to Ctrl+a
unbind C-b
set-option -g prefix C-a
bind-key C-a send-prefix

# Enable mouse support (click to switch panes)
set -g mouse on

# Toggle sync with 's' after prefix (Ctrl+a then s)
bind s setw synchronize-panes

# Direct sync toggle with Option+s (no prefix needed)
bind -n M-s setw synchronize-panes

# Direct sync toggle with Ctrl+s (alternative)
bind -n C-s setw synchronize-panes

# Kill session with 'k' after prefix (Ctrl+a then k)
bind k kill-session

# Show sync status in status bar
set -g status-right '#{?pane_synchronized,#[bg=red]SYNC ON,}'
EOF

# Reload the configuration
tmux source-file ~/.tmux.conf
```

### 2. Create the `ai` command alias

Add this to your shell configuration:

```bash
echo "alias ai='tmux kill-session -t ai_clis 2>/dev/null; tmux new-session -d -s ai_clis \; send-keys \"claude\" C-m \; split-window -h \; send-keys \"gemini\" C-m \; split-window -h \; send-keys \"codex\" C-m \; select-layout even-horizontal \; setw synchronize-panes on \; attach-session -t ai_clis'" >> ~/.zshrc && source ~/.zshrc
```

## Usage

### Basic Workflow

Here's what happens at each step:

1. **Start all CLIs**: Type `ai` in your terminal
   - This opens a split-screen view with Claude on the left, Gemini in the middle, and Codex on the right
   - All three AI tools start up automatically
2. **Enter your prompt**: Type your prompt (it appears in all three panes)
   - Whatever you type shows up in all three tools at once (like typing on three keyboards simultaneously)
3. **Submit prompt**: Press Enter (sends to all three CLIs)
   - All three AIs start working on your prompt at the same time
4. **Toggle sync off**: Press `Ctrl+s` or `Option+s`
   - This "unlocks" the panes so you can interact with each AI individually
   - You'll see "SYNC ON" disappear from the status bar
5. **Work individually**: Click on any pane to interact with that CLI
   - Now you can ask follow-up questions to just one AI, or give different prompts to each
6. **Kill session**: Press `Ctrl+a` then `k` when done
   - This closes everything at once (like closing all three terminal tabs)