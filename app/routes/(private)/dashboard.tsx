

import type { Route } from "./+types/dashboard";
import { requireUserSession } from "~/sessions.server";

export async function loader({ request }: Route.LoaderArgs) {
  await requireUserSession(request);
  return null;
}

export default function DashboardPage() {
  return (
    <>dashboard page design coming soon</>
  );
}