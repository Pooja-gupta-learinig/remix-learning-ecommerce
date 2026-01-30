import { Outlet, Link } from "react-router";

// nested route layout with nested routes
// nested routes are defined in the routes/concerts.tsx file
// the nested routes are defined in the routes/concerts._index.tsx file
// the nested routes are defined in the routes/concerts.trending.tsx file
// the nested routes are defined in the routes/concerts.delhi.tsx file
// the nested routes are defined in the routes/concerts.mumbai.tsx file

export default function ConcertsLayout() {
  return (
    <div>
      <h1>Concerts</h1>

      <nav style={{ display: "flex", gap: 10 }}>
        <Link to="">All</Link>
        <Link to="trending">Trending</Link>
        <Link to="delhi">Delhi</Link>
        <Link to="mumbai">Mumbai</Link>
      </nav>

      <hr />

      <Outlet />
    </div>
  );
}
