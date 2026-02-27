import { createCookieSessionStorage, redirect } from "@remix-run/node";
import { z } from "zod";
import { env } from "~/config.server";
console.log("env", env);
export const roles = ["admin", "customer"] as const;
export type Role = (typeof roles)[number];

export type UserSession = {
	id: string;
	email: string;
	role: Role;
};

const sessionKey = "user";

export const sessionStorage = createCookieSessionStorage({
	cookie: {
		name: "__session",
		httpOnly: true,
		path: "/",
		sameSite: "lax",
		secrets: [env.sessionSecret],
		secure: env.nodeEnv === "production",
	},
});


export const { getSession, commitSession, destroySession } = sessionStorage;

export async function getUserSession(request: Request): Promise<UserSession | null> {
	const session = await getSession(request.headers.get("Cookie"));
	const user = session.get(sessionKey) as unknown;
	if (!user || typeof user !== "object") return null;

	const parsed = UserSessionSchema.safeParse(user);
	return parsed.success ? parsed.data : null;
}

export async function requireUserSession(
	request: Request,
	redirectTo?: string
): Promise<UserSession> {
	const user = await getUserSession(request);
	if (!user) {
		const url = new URL(request.url);
		const loginUrl = redirectTo
			? `/login?redirectTo=${encodeURIComponent(redirectTo)}`
			: "/login";
		throw redirect(loginUrl);
	}
	return user;
}

export async function requireRole(request: Request, role: Role): Promise<UserSession> {
	const user = await requireUserSession(request);
	if (user.role !== role) {
		throw redirect(getDefaultRedirectForRole(user.role));
	}
	return user;
}

export function getDefaultRedirectForRole(role: Role): string {
	return role === "admin" ? "/admin/dashboard" : "/dashboard";
}

export async function createUserSession(params: {
	request: Request;
	user: UserSession;
	redirectTo?: string;
}): Promise<Response> {
	const session = await getSession(params.request.headers.get("Cookie"));
	session.set(sessionKey, params.user);

	return redirect(params.redirectTo ?? getDefaultRedirectForRole(params.user.role), {
		headers: {
			"Set-Cookie": await commitSession(session),
		},
	});
}

export async function logout(request: Request): Promise<Response> {
	const session = await getSession(request.headers.get("Cookie"));
	return redirect("/login", {
		headers: {
			"Set-Cookie": await destroySession(session),
		},
	});
}

const UserSessionSchema = z.object({
	id: z.string().min(1),
	email: z.string().email(),
	role: z.enum(roles),
});


