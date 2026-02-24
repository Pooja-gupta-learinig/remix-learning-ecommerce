import { randomBytes, randomUUID, scrypt as scryptCallback } from "node:crypto";
import { access, mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import { z } from "zod";
import type { Role } from "~/sessions.server";

const scrypt = promisify(scryptCallback);

const ADMIN_EMAIL = "pooja.gupta@galaxyweblinks.com";
const ADMIN_PASSWORD = "123456";

export type StoredUser = {
	id: string;
	email: string;
	passwordHash: string;
	role: Role;
	createdAt: string;
};

const StoredUserSchema = z.object({
	id: z.string().min(1),
	email: z.string().email(),
	passwordHash: z.string().min(1),
	role: z.enum(["admin", "customer"]),
	createdAt: z.string().min(1),
});

const StoredUserInputSchema = z.object({
	// Accept legacy numeric IDs and normalize to string IDs below.
	id: z.union([z.number(), z.string()]).optional(),
	email: z.string().email(),
	passwordHash: z.string().min(1),
	role: z.enum(["admin", "customer"]),
	createdAt: z.string().min(1),
});

const UsersFileInputSchema = z.array(StoredUserInputSchema);

function getUsersFilePath(): string {
	return path.join(process.cwd(), "data", "users.json");
}

async function ensureUsersFile(): Promise<void> {
	const filePath = getUsersFilePath();
	const dir = path.dirname(filePath);
	await mkdir(dir, { recursive: true });
	try {
		await access(filePath);
	} catch {
		await writeFile(filePath, "[]\n", "utf8");
	}
}

async function readUsers(): Promise<StoredUser[]> {
	await ensureUsersFile();
	const raw = await readFile(getUsersFilePath(), "utf8");
	const parsedJson = JSON.parse(raw) as unknown;

	const inputUsers = UsersFileInputSchema.parse(parsedJson);

	// Normalize IDs to non-empty strings. If file already has string IDs, keep them.
	const used = new Set<string>();

	const normalized: StoredUser[] = inputUsers.map((u) => {
		let id: string | null =
			typeof u.id === "string"
				? u.id
				: typeof u.id === "number"
					? String(u.id)
					: null;

		if (!id || used.has(id)) {
			id = randomUUID();
		}

		used.add(id);
		return { ...u, id } satisfies StoredUser;
	});

	// If we changed any IDs, persist the normalized file so future reads are stable.
	const changed =
		inputUsers.length !== normalized.length ||
		inputUsers.some((u, i) => String(u.id ?? "") !== normalized[i]?.id);

	if (changed) {
		await writeUsers(normalized);
	}

	return normalized;
}

async function writeUsers(users: StoredUser[]): Promise<void> {
	await ensureUsersFile();
	const filePath = getUsersFilePath();
	const tmpPath = `${filePath}.tmp`;
	await writeFile(tmpPath, `${JSON.stringify(users, null, 2)}\n`, "utf8");
	await rename(tmpPath, filePath);
}

export async function getUserByEmail(email: string): Promise<StoredUser | null> {
	const users = await readUsers();
	const normalized = email.trim().toLowerCase();
	return users.find((u) => u.email.toLowerCase() === normalized) ?? null;
}

export async function createUser(params: {
	email: string;
	password: string;
	role: Role;
}): Promise<StoredUser> {
	const users = await readUsers();
	const normalized = params.email.trim().toLowerCase();
	const existing = users.find((u) => u.email.toLowerCase() === normalized);
	if (existing) {
		throw new Error("USER_ALREADY_EXISTS");
	}

	const now = new Date().toISOString();
	const user: StoredUser = {
		id: randomUUID(),
		email: normalized,
		passwordHash: await hashPassword(params.password),
		role: params.role,
		createdAt: now,
	};

	users.push(user);
	await writeUsers(users);
	return user;
}

export async function verifyLogin(params: {
	email: string;
	password: string;
}): Promise<StoredUser | null> {
	const user = await getUserByEmail(params.email);
	if (!user) return null;
	const ok = await verifyPassword(params.password, user.passwordHash);
	return ok ? user : null;
}

/**
 * Ensures the default admin user exists for local/dev usage.
 *
 * Note: this is intentionally simple for learning/demo apps.
 * In production you should manage admins via migrations or an admin UI.
 */
export async function ensureDefaultAdminUser(): Promise<StoredUser> {
	const existing = await getUserByEmail(ADMIN_EMAIL);
	if (existing) return existing;
	return await createUser({
		email: ADMIN_EMAIL,
		password: ADMIN_PASSWORD,
		role: "admin",
	});
}

async function hashPassword(password: string): Promise<string> {
	const salt = randomBytes(16).toString("base64");
	const derived = (await scrypt(password, salt, 64)) as Buffer;
	return `scrypt$${salt}$${derived.toString("base64")}`;
}

async function verifyPassword(password: string, passwordHash: string): Promise<boolean> {
	const parts = passwordHash.split("$");
	if (parts.length !== 3) return false;
	const [algo, salt, expected] = parts;
	if (algo !== "scrypt") return false;
	const derived = (await scrypt(password, salt, 64)) as Buffer;
	const actual = derived.toString("base64");
	return timingSafeEqualBase64(actual, expected);
}

function timingSafeEqualBase64(a: string, b: string): boolean {
	// Constant-time compare for same-length strings.
	if (a.length !== b.length) return false;
	let out = 0;
	for (let i = 0; i < a.length; i++) {
		out |= a.charCodeAt(i) ^ b.charCodeAt(i);
	}
	return out === 0;
}


