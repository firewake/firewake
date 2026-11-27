import { mkdir, mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { createWorkspace } from "./create-workspace";
import { loadWorkspace } from "./load-workspace";

describe("createWorkspace", () => {
	const tempDirectories: string[] = [];

	afterEach(async () => {
		await Promise.all(
			tempDirectories
				.splice(0)
				.map((directory) => rm(directory, { force: true, recursive: true })),
		);
	});

	async function makeTempDirectory(): Promise<string> {
		const directory = await mkdtemp(join(tmpdir(), "firewake-create-"));
		tempDirectories.push(directory);
		return directory;
	}

	it("creates a workspace directory with firewake.yaml", async () => {
		const parentDirectory = await makeTempDirectory();

		const result = await createWorkspace({
			name: "my-app",
			parentDirectory,
		});

		expect(result.success).toBe(true);

		if (!result.success) {
			return;
		}

		expect(result.workspace.rootDirectory).toBe(
			join(parentDirectory, "my-app"),
		);
		expect(result.workspace.configPath).toBe(
			join(parentDirectory, "my-app", "firewake", "firewake.yaml"),
		);
		expect(result.workspace.config).toEqual({
			schemaVersion: 1,
			name: "my-app",
		});

		const source = await readFile(result.workspace.configPath, "utf8");
		expect(source).toContain("schemaVersion: 1");
		expect(source).toContain("name: my-app");

		const loaded = await loadWorkspace(result.workspace.rootDirectory);
		expect(loaded).toEqual({
			success: true,
			workspace: result.workspace,
		});
	});

	it("rejects when the target directory already exists", async () => {
		const parentDirectory = await makeTempDirectory();
		await mkdir(join(parentDirectory, "my-app"));

		const result = await createWorkspace({
			name: "my-app",
			parentDirectory,
		});

		expect(result).toMatchObject({
			success: false,
			issues: [{ code: "DIRECTORY_EXISTS" }],
		});
	});

	it("rejects empty or path-like names", async () => {
		const parentDirectory = await makeTempDirectory();

		for (const name of ["", "   ", ".", "..", "a/b", "a\\b"]) {
			const result = await createWorkspace({
				name,
				parentDirectory,
			});

			expect(result).toMatchObject({
				success: false,
				issues: [{ code: "INVALID_NAME" }],
			});
		}
	});
});
