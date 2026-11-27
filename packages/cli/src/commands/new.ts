import { relative } from "node:path";

import { type CreateWorkspaceIssue, createWorkspace } from "@firewake/core";
import { Args, Command } from "@oclif/core";

export default class New extends Command {
	static override args = {
		name: Args.string({
			description: "Name of the new workspace directory",
			required: true,
		}),
	};

	static override description =
		"Create a new project directory with a firewake workspace configuration";

	static override examples = ["<%= config.bin %> <%= command.id %> my-app"];

	public async run(): Promise<void> {
		const { args } = await this.parse(New);

		this.log(`Creating workspace "${args.name}"…`);

		const result = await createWorkspace({
			name: args.name,
			parentDirectory: process.cwd(),
		});

		if (!result.success) {
			const primary = result.issues[0];

			this.error(formatCreateFailure(result.issues), {
				code: primary?.code,
				suggestions: suggestionsFor(primary),
			});
		}

		const { workspace } = result;
		const root = displayPath(workspace.rootDirectory);

		this.log(`Created workspace "${workspace.config.name}"`);
		this.log("");
		this.log("Next:");
		this.log(`  cd ${root}`);
		this.log("  firewake validate");
	}
}

function displayPath(absolutePath: string): string {
	const relativePath = relative(process.cwd(), absolutePath).replaceAll(
		"\\",
		"/",
	);

	if (relativePath.length === 0) {
		return ".";
	}

	if (relativePath.startsWith("..")) {
		return absolutePath;
	}

	return relativePath;
}

function formatCreateFailure(issues: CreateWorkspaceIssue[]): string {
	const messages = issues.map((issue) => issue.message);

	if (messages.length === 1) {
		return `Failed to create workspace.\n${messages[0]}`;
	}

	return `Failed to create workspace.\n${messages.map((message) => `  ${message}`).join("\n")}`;
}

function suggestionsFor(
	issue: CreateWorkspaceIssue | undefined,
): string[] | undefined {
	switch (issue?.code) {
		case "DIRECTORY_EXISTS":
			return [
				"Choose a different workspace name.",
				"Remove or rename the existing directory, then try again.",
			];
		case "INVALID_NAME":
			return [
				'Use a simple folder name such as "my-app".',
				'Do not include path separators or use "." / "..".',
			];
		case "WRITE_FAILED":
			return [
				"Check that you have write permission in the current directory.",
				"Retry the command after resolving any filesystem issues.",
			];
		default:
			return undefined;
	}
}
