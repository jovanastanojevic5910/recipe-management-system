import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div style={{ padding: 40, textAlign: "center" }}>
      <h1 style={{ fontSize: 48, marginBottom: 10 }}>404</h1>
      <p style={{ marginBottom: 20 }}>Stranica ne postoji.</p>
      <Link to="/" style={{ textDecoration: "underline" }}>
        Vrati se na početnu
      </Link>
    </div>
  );
}
