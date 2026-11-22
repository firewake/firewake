import { z } from "zod";

export const workspaceSchema = z.strictObject({
	schemaVersion: z.literal(1),
	name: z.string().min(1),
});

export type WorkspaceConfig = z.infer<typeof workspaceSchema>;
