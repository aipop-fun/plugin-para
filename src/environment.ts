import { z } from "zod";

export const ParaEnvironmentSchema = z.object({
    PARA_API_KEY: z.string().min(1, "PARA_API_KEY is required"),
    PARA_ENV: z.enum(["production", "development"]).default("production")
});

export type ParaEnvironment = z.infer<typeof ParaEnvironmentSchema>;

export function validateEnvironment(runtime: { getSetting: (key: string) => string | undefined }): ParaEnvironment {
    const result = ParaEnvironmentSchema.safeParse({
        PARA_API_KEY: runtime.getSetting("PARA_API_KEY"),
        PARA_ENV: runtime.getSetting("PARA_ENV") || "production"
    });

    if (!result.success) {
        throw new Error(`Para plugin configuration error: ${result.error.message}`);
    }

    return result.data;
}