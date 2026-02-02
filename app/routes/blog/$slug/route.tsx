import { useParams } from "react-router";

export default function BlogPostRoute() {
  const { slug } = useParams();

  return <h2>Post: {slug}</h2>;
}