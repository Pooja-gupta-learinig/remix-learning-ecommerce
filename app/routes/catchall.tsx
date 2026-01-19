import { Link } from "react-router";
import {
  useRouteError,
  isRouteErrorResponse,
} from "react-router";

export default function CatchAll() {
    const error = useRouteError();

    
    // Case 1: loader/action threw a Response
  if (isRouteErrorResponse(error)) {
    return (
      <div>
        <h1>{error.status}</h1>
        <p>{error.statusText}</p>
        <Link to="/">Home</Link>
      </div>
    );
  }

  // Case 2: JavaScript error
  if (error instanceof Error) {
    return <p>{error.message} -  <Link to="/">Home</Link></p>;
  }

  return <p>Unknown error</p>;
}