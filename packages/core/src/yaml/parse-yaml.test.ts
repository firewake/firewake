import { describe, expect, it } from "vitest";
import { z } from "zod";

import { parseYaml } from "./parse-yaml";

const schema = z.strictObject({
	name: z.string(),
	count: z.number(),
});

describe("parseYaml", () => {
	it("parses and validates valid YAML", () => {
		const result = parseYaml("name: example\ncount: 5", schema);

		expect(result).toEqual({
			success: true,
			data: {
				name: "example",
				count: 5,
			},
		});
	});

	it("rejects invalid YAML syntax", () => {
		const result = parseYaml("name: [unclosed", schema);

		expect(result).toMatchObject({
			success: false,
			issues: [{ code: "INVALID_YAML" }],
		});
	});

	it("rejects duplicate YAML keys", () => {
		const result = parseYaml("name: first\nname: second", schema);

		expect(result).toMatchObject({
			success: false,
			issues: [{ code: "INVALID_YAML" }],
		});
	});

	it("rejects values that do not match the schema", () => {
		const result = parseYaml("name: example\ncount: invalid", schema);

		expect(result).toMatchObject({
			success: false,
			issues: [
				{
					code: "INVALID_SCHEMA",
					message: expect.stringContaining("count"),
				},
			],
		});
	});

	it("rejects unknown fields in strict schemas", () => {
		const result = parseYaml("name: example\ncount: 5\nunknown: true", schema);

		expect(result).toMatchObject({
			success: false,
			issues: [{ code: "INVALID_SCHEMA" }],
		});
	});
});
