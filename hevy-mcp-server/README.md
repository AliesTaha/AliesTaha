# Hevy MCP Server

An MCP (Model Context Protocol) server that wraps the [Hevy](https://hevy.com) fitness tracking API. Connect it to Claude, Cursor, or any MCP-compatible client to manage your workouts via natural language.

## Requirements

- Node.js 20+
- Hevy Pro subscription (for API access)
- Hevy API key — get yours at https://hevy.com/settings?developer

## Setup

```bash
npm install
npm run build
```

## Usage

Set your API key and run:

```bash
HEVY_API_KEY=your_key_here npm start
```

### Claude Desktop / Claude Code

Add to your MCP config (`claude_desktop_config.json` or `.claude/settings.json`):

```json
{
  "mcpServers": {
    "hevy": {
      "command": "node",
      "args": ["/path/to/hevy-mcp-server/dist/index.js"],
      "env": {
        "HEVY_API_KEY": "your_key_here"
      }
    }
  }
}
```

### Development

```bash
HEVY_API_KEY=your_key_here npm run dev
```

## Available Tools

| Tool | Description |
|------|-------------|
| `get_workouts` | List your workouts (paginated) |
| `get_workout` | Get a specific workout by ID |
| `get_workout_count` | Total number of workouts |
| `get_workout_events` | Workout update/delete events (for syncing) |
| `create_workout` | Log a new workout |
| `update_workout` | Update an existing workout |
| `get_routines` | List your routines |
| `get_routine` | Get a specific routine |
| `create_routine` | Create a new routine |
| `update_routine` | Update an existing routine |
| `get_exercise_templates` | Browse the exercise library |
| `get_exercise_template` | Get exercise details by ID |
| `create_exercise_template` | Create a custom exercise |
| `get_exercise_history` | Get your history for a specific exercise |
| `get_routine_folders` | List routine folders |
| `get_routine_folder` | Get a specific folder |
| `create_routine_folder` | Create a folder for organizing routines |
