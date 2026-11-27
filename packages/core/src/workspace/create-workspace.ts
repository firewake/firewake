import { mkdir, writeFile } from "node:fs/promises";
import { join, resolve, sep } from "node:path";

import { stringify } from "yaml";

import type { LoadedWorkspace } from "./load-workspace";
import { type WorkspaceConfig, workspaceSchema } from "./workspace.schema";

export interface CreateWorkspaceIssue {
	code: "DIRECTORY_EXISTS" | "INVALID_NAME" | "WRITE_FAILED";
	message: string;
}

export type CreateWorkspaceResult =
	| { success: true; workspace: LoadedWorkspace }
	| {
			success: false;
			rootDirectory: string;
			issues: CreateWorkspaceIssue[];
	  };

export interface CreateWorkspaceOptions {
	name: string;
	parentDirectory: string;
}

function isInvalidName(name: string): boolean {
	if (name.length === 0) {
		return true;
	}

	if (name === "." || name === "..") {
		return true;
	}

	if (name.includes("/") || name.includes("\\") || name.includes(sep)) {
		return true;
	}

	return false;
}

export async function createWorkspace(
	options: CreateWorkspaceOptions,
): Promise<CreateWorkspaceResult> {
	const name = options.name.trim();
	const parentDirectory = resolve(options.parentDirectory);
	const rootDirectory = join(parentDirectory, name);

	if (isInvalidName(name)) {
		return {
			success: false,
			rootDirectory,
			issues: [
				{
					code: "INVALID_NAME",
					message:
						"Name must be a non-empty folder name without path separators.",
				},
			],
		};
	}

	const config: WorkspaceConfig = {
		schemaVersion: 1,
		name,
	};

	const parsed = workspaceSchema.safeParse(config);

	if (!parsed.success) {
		return {
			success: false,
			rootDirectory,
			issues: [
				{
					code: "INVALID_NAME",
					message:
						parsed.error.issues[0]?.message ??
						"Name is not a valid workspace name.",
				},
			],
		};
	}

	const configDirectory = join(rootDirectory, "firewake");
	const configPath = join(configDirectory, "firewake.yaml");

	try {
		await mkdir(rootDirectory);
	} catch (error) {
		const exists =
			error !== null &&
			typeof error === "object" &&
			"code" in error &&
			error.code === "EEXIST";

		if (exists) {
			return {
				success: false,
				rootDirectory,
				issues: [
					{
						code: "DIRECTORY_EXISTS",
						message: `A directory already exists at ${rootDirectory}.`,
					},
				],
			};
		}

		return {
			success: false,
			rootDirectory,
			issues: [
				{
					code: "WRITE_FAILED",
					message:
						error instanceof Error
							? `Could not create workspace directory: ${error.message}`
							: `Could not create workspace directory at ${rootDirectory}.`,
				},
			],
		};
	}

	try {
		await mkdir(configDirectory);
		await writeFile(configPath, stringify(parsed.data), "utf8");
	} catch (error) {
		return {
			success: false,
			rootDirectory,
			issues: [
				{
					code: "WRITE_FAILED",
					message:
						error instanceof Error
							? `Could not write workspace configuration: ${error.message}`
							: `Could not write workspace configuration to ${configPath}.`,
				},
			],
		};
	}

	return {
		success: true,
		workspace: {
			rootDirectory,
			configPath,
			config: parsed.data,
		},
	};
}
