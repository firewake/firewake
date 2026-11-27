# `@firewake/core`

Core library for firewake workspace configuration.

Use it when you need to resolve a project’s `firewake/firewake.yaml`, check that the config is well-formed, and work with the resulting workspace model in code.

## Features

- Create a new workspace directory with `firewake/firewake.yaml`
- Resolve workspace config from a project directory
- Validate config structure and required fields
- Typed workspace result for successful loads
- Clear issue list when the file is missing, unreadable, or invalid

## Install

This package is private to the monorepo for now (`workspace:*` from the CLI). Public publish is not set up yet.
