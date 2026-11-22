import { readFile } from "node:fs/promises";
import type { z } from "zod";

import { parseYaml, type YamlResult } from "./parse-yaml";

export async function loadYamlFile<T extends z.ZodType>(
	filePath: string,
	schema: T,
): Promise<YamlResult<z.output<T>>> {
	let source: string;

	try {
		source = await readFile(filePath, "utf8");
	} catch (error) {
		const missing =
			error !== null &&
			typeof error === "object" &&
			"code" in error &&
			error.code === "ENOENT";

		return {
			success: false,
			issues: [
				{
					code: missing ? "FILE_NOT_FOUND" : "FILE_READ_FAILED",
					message: missing
						? `File not found: ${filePath}`
						: error instanceof Error
							? error.message
							: `Failed to read file: ${filePath}`,
				},
			],
		};
	}

	return parseYaml(source, schema);
}
