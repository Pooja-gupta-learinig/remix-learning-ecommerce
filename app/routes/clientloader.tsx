import { useLoaderData } from "react-router";
import { useEffect, useState } from "react";
import type { ClientLoaderFunctionArgs } from "react-router";

/* ---------------- TYPES ---------------- */
type ServerLoaderData = {
  user: { name: string };
  featureFlags: string[];
};

type ClientLoaderData = ServerLoaderData & {
  theme: string | null;
  timezone: string;
};

/* ---------------- SERVER LOADER ---------------- */
export async function loader(): Promise<ServerLoaderData> {
  console.log("🟢 loader (SERVER)");

  // SSR-safe work
  return {
    user: { name: "Pooja" },
    featureFlags: ["new-ui"],
  };
}

/* ---------------- CLIENT LOADER ---------------- */
export const clientLoader = async ({
  serverLoader,
}: ClientLoaderFunctionArgs): Promise<ClientLoaderData> => {
  console.log("🔵🔵🔵 clientLoader STARTED - This should appear in browser console!");
  
  // Verify we're in the browser
  if (typeof window === "undefined") {
    console.log("⚠️ clientLoader called on server (unexpected)");
    throw new Error("clientLoader should not run on server");
  }
  
  console.log("🔵 clientLoader (BROWSER) - Running now!");
  console.log("🔵 window.location:", window.location.href);
  console.log("🔵 typeof window:", typeof window);
  console.log("🔵 typeof localStorage:", typeof localStorage);

  // get data returned by server loader
  console.log("🔵 Calling serverLoader...");
  const serverData = (await serverLoader()) as ServerLoaderData;
  console.log("🔵 Server data received:", serverData);

  // browser-only work
  const theme = localStorage.getItem("theme");
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  console.log("🔵 Client data:", { theme, timezone });
  console.log("🔵🔵🔵 clientLoader COMPLETED!");

  return {
    ...serverData,
    theme,
    timezone,
  };
};

// Enable clientLoader to run during SSR hydration
clientLoader.hydrate = true;

/* ---------------- HYDRATE FALLBACK ---------------- */
export function HydrateFallback() {
  return (
    <div>
      <h1>Loading...</h1>
      <p>Hydrating client data...</p>
    </div>
  );
}

/* ---------------- COMPONENT ---------------- */
export default function Dashboard() {
  const serverData = useLoaderData<typeof loader>();
  const [clientData, setClientData] = useState<{
    theme: string | null;
    timezone: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Workaround: Load client data in useEffect if clientLoader doesn't run
  useEffect(() => {
    console.log("🔵 useEffect - Loading client data (workaround)");
    
    const loadClientData = async () => {
      try {
        // Simulate what clientLoader would do
        const theme = localStorage.getItem("theme");
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        
        console.log("🔵 Client data loaded:", { theme, timezone });
        
        setClientData({ theme, timezone });
        setIsLoading(false);
      } catch (error) {
        console.error("Error loading client data:", error);
        setIsLoading(false);
      }
    };

    loadClientData();
  }, []);

  const data = {
    ...serverData,
    theme: clientData?.theme ?? null,
    timezone: clientData?.timezone ?? "SSR phase",
  };

  console.log("📊 Component rendered with data:", data);
  console.log("📊 isLoading:", isLoading);
  console.log("📊 clientData:", clientData);

  return (
    <div>
      <h1>Hello {data.user.name}</h1>
      <p>Theme: {data.theme ?? "not loaded yet"}</p>
      <p>Timezone: {data.timezone}</p>
      <p>Feature Flags: {data.featureFlags.join(", ")}</p>
      {isLoading && <p style={{ color: "orange" }}>Loading client data...</p>}
      {!isLoading && clientData && (
        <p style={{ color: "green" }}>✅ Client data loaded successfully!</p>
      )}
    </div>
  );
}
