import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router";
import type { Route } from "./+types/myRouterWithDefaultParams";



export async function loader({ params, request }: LoaderFunctionArgs) {
  return {
    message: "Hello from loader",
    userId: params.userId ?? null,
  };
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  return {
    success: true,
    name: formData.get("name"),
  };
}




export default function MyRouteComponent({
  loaderData,
  actionData,
  params,
  matches,
}: Route.ComponentProps) {

    
  return (
    <div>
      <h1>Welcome to My Route with Props!</h1>
      <p>Loader Data: {JSON.stringify(loaderData)}</p>
      <p>Action Data: {JSON.stringify(actionData)}</p>
      <p>Route Parameters: {JSON.stringify(params)}</p>
      <p>Matched Routes: {JSON.stringify(matches)}</p>
    </div>
  );
}
