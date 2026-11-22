import { loadWorkspace } from "@firewake/core";
import { Command } from "@oclif/core";

export default class Validate extends Command {
	static override description = "Validate the firewake workspace configuration";

	async run(): Promise<void> {
		await this.parse(Validate);

		const result = await loadWorkspace(process.cwd());

		if (!result.success) {
			this.error(
				result.issues
					.map((issue) => `${issue.code}: ${issue.message}`)
					.join("\n"),
			);
		}

		this.log(`Workspace "${result.workspace.config.name}" is valid.`);
	}
}
