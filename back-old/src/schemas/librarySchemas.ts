import { z } from "zod";

export const createLibrarySchema = z.object({
	label: z.string().min(1, "Label is required"),
	description: z.string().optional(),
	type: z.enum(["model", "diagram"]),
	user_id: z.number().int(),
});

export type CreateLibraryInput = z.infer<typeof createLibrarySchema>;

export const libraryIdSchema = z.object({
	id: z.string().regex(/^\d+$/, "ID must be an integer"),
});

export type LibraryIdInput = z.infer<typeof libraryIdSchema>;
