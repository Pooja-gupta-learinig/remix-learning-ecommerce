import { useParams } from "react-router";

export default function OptionalRoutewithmanual() {
  const { lang } = useParams();

  return (
    <div>
      <h2>Posts</h2>
      <p>Language: {lang ?? "default"} with manual routing (react-router)</p>
    </div>
  );
}