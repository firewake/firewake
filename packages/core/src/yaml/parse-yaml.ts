import { parseDocument } from "yaml";
import type { z } from "zod";

export interface YamlIssue {
	code:
		| "FILE_NOT_FOUND"
		| "FILE_READ_FAILED"
		| "INVALID_YAML"
		| "INVALID_SCHEMA";
	message: string;
}

export type YamlResult<T> =
	| { success: true; data: T }
	| { success: false; issues: YamlIssue[] };

export function parseYaml<T extends z.ZodType>(
	source: string,
	schema: T,
): YamlResult<z.output<T>> {
	const document = parseDocument(source);

	if (document.errors.length > 0) {
		return {
			success: false,
			issues: document.errors.map((error) => ({
				code: "INVALID_YAML",
				message: error.message,
			})),
		};
	}

	let data: unknown;

	try {
		data = document.toJS();
	} catch (error) {
		return {
			success: false,
			issues: [
				{
					code: "INVALID_YAML",
					message:
						error instanceof Error ? error.message : "Failed to convert YAML",
				},
			],
		};
	}

	const result = schema.safeParse(data);

	if (!result.success) {
		return {
			success: false,
			issues: result.error.issues.map((issue) => {
				const path = issue.path.map(String).join(".");

				return {
					code: "INVALID_SCHEMA",
					message: path ? `${path}: ${issue.message}` : issue.message,
				};
			}),
		};
	}

	return {
		success: true,
		data: result.data,
	};
}
