import type { Route } from "./+types/admin.dashboard";
import { requireRole } from "~/sessions.server";

export async function loader({ request }: Route.LoaderArgs) {
  await requireRole(request, "admin");
  return null;
}

export default function AdminDashboard() {
  return (
    <div>
      <h1>Admin Dashboard</h1>
    </div>
  );
}