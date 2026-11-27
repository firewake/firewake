# firewake

CLI for working with firewake workspaces.

## Install

From the monorepo root:

```sh
pnpm install
pnpm build
```

Then run the CLI from `packages/cli` (or via your local package binary setup).

## Commands

### `firewake new <name>`

Creates a new project directory with `firewake/firewake.yaml` inside.

```sh
firewake new my-app
```

### `firewake validate`

Checks that the current directory has a valid firewake workspace configuration (`firewake/firewake.yaml`).

```sh
firewake validate
```

Exits with an error and prints issues if validation fails; prints a short success message when the workspace is valid.
