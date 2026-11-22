import { join, resolve } from "node:path";

import { loadYamlFile } from "../yaml/load-yaml-file";
import type { YamlIssue } from "../yaml/parse-yaml";

import { type WorkspaceConfig, workspaceSchema } from "./workspace.schema";

export interface LoadedWorkspace {
	rootDirectory: string;
	configPath: string;
	config: WorkspaceConfig;
}

export type LoadWorkspaceResult =
	| { success: true; workspace: LoadedWorkspace }
	| {
			success: false;
			configPath: string;
			issues: YamlIssue[];
	  };

export async function loadWorkspace(
	directory: string,
): Promise<LoadWorkspaceResult> {
	const rootDirectory = resolve(directory);

	const configPath = join(rootDirectory, "firewake", "firewake.yaml");

	const result = await loadYamlFile(configPath, workspaceSchema);

	if (!result.success) {
		return {
			success: false,
			configPath,
			issues: result.issues,
		};
	}

	return {
		success: true,
		workspace: {
			rootDirectory,
			configPath,
			config: result.data,
		},
	};
}
