import type { Route } from "./+types/logout";
import { logout } from "~/sessions.server";

export async function action({ request }: Route.ActionArgs): Promise<Response> {
	return await logout(request);
}

// Convenience: allow hitting /logout directly in the browser.
export async function loader({ request }: Route.LoaderArgs): Promise<Response> {
	return await logout(request);
}

export default function LogoutRoute() {
	return null;
}


