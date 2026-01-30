import { useParams } from "react-router";

export default function CityConcerts() {
  const { city } = useParams();

  return (
    <div>
      <h2>Concerts in {city}</h2>
      <p>Showing concerts happening in {city}.</p>
    </div>
  );
}
