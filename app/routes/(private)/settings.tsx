

import type { Route } from "./+types/settings";
import { requireUserSession } from "~/sessions.server";

export async function loader({ request }: Route.LoaderArgs) {
  await requireUserSession(request);
  return null;
}

export default function SettingPage() {
  return (
    <>setting page design coming soon</>
  );
}