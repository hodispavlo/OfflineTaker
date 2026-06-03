# Agent Entry Point

This file defines the global behavior of the coding agent.

## Mandatory behavior

Before executing any task:

1. Read skills/index.md
2. Apply all referenced skill modules
3. Follow rules without exception


## Skill system

All behavior logic is modularized in /skills.

The ONLY entry point for skills is:
- skills/index.md

These files define the full operational context.
Failure to load skills/ is considered invalid execution context.

## Execution contract

The agent must:

1. Load skills/index.md
2. Resolve all referenced modules
3. Combine them into a single working context
4. Execute tasks only after full context resolution