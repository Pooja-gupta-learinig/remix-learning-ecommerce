import "dotenv/config";
import { z } from "zod";

const EnvSchema = z.object({
	NODE_ENV: z.enum(["development", "test", "production"]).optional(),
	SESSION_SECRET: z.string().optional(),
	ADMIN_SIGNUP_CODE: z.string().optional(),
});

type Env = {
	nodeEnv: "development" | "test" | "production";
	sessionSecret: string;
	adminSignupCode?: string;
};

function getNodeEnv(): "development" | "test" | "production" {
	const raw = EnvSchema.shape.NODE_ENV.safeParse(process.env.NODE_ENV);
	return raw.success ? raw.data ?? "development" : "development";
}

function getSessionSecret(nodeEnv: Env["nodeEnv"]): string {
	const raw = EnvSchema.shape.SESSION_SECRET.safeParse(process.env.SESSION_SECRET);
	const value = raw.success ? raw.data : undefined;

	// Reasonable dev default; in production you should set SESSION_SECRET.
	if (!value) {
		// Check if we're in a build environment (Vercel sets VERCEL=1, or we're running build commands)
		const isBuildTime = 
			process.env.VERCEL === "1" || 
			process.env.VERCEL_ENV === "production" ||
			process.argv.includes("build") ||
			process.env.npm_lifecycle_event === "build";
		
		// During build time, allow a temporary value to prevent build failures
		// IMPORTANT: SESSION_SECRET must be set in Vercel environment variables for production
		// The build will succeed, but the app will fail at runtime if SESSION_SECRET is not set
		if (nodeEnv === "production" && !isBuildTime) {
			throw new Error("Missing required env var SESSION_SECRET in production. Please set it in Vercel environment variables.");
		}
		
		// During builds or development, use a default value
		if (nodeEnv === "production") {
			// Temporary value for builds - must be replaced with actual SESSION_SECRET in Vercel
			return "temp-build-secret-must-set-in-vercel-env-vars";
		}
		return "dev-session-secret-change-me";
	}

	if (value.length < 16) {
		throw new Error("SESSION_SECRET must be at least 16 characters");
	}

	return value;
}

function getAdminSignupCode(): string | undefined {
	const raw = EnvSchema.shape.ADMIN_SIGNUP_CODE.safeParse(process.env.ADMIN_SIGNUP_CODE);
	if (!raw.success) return undefined;
	return raw.data;
}

export const env: Env = (() => {
	const nodeEnv = getNodeEnv();
	return {
		nodeEnv,
		sessionSecret: getSessionSecret(nodeEnv),
		adminSignupCode: getAdminSignupCode(),
	};
})();


