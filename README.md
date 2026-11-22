# firewake

firewake is a toolkit for declaring and validating project workspaces, with a longer-term goal of model-driven code generation and reusable plugins.

The project is early. Expect breaking changes.

## Packages

| Package                             | Description                         |
| ----------------------------------- | ----------------------------------- |
| [`@firewake/core`](./packages/core) | Library for workspace configuration |
| [`firewake`](./packages/cli)        | Command-line interface              |

## Requirements

- Node.js 24 (`>=24.11.0 <25`)
- pnpm 12.21.0

## Getting started

```sh
pnpm install
pnpm build
```

Useful scripts:

```sh
pnpm test
pnpm lint
pnpm typecheck
```

## Website

https://firewake.dev
