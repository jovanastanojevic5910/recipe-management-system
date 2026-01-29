import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");

    try {
      await login(email, password);

      // ako si došla sa ProtectedRoute, biće location.state.from
      const backTo = location.state?.from?.pathname || "/";
      navigate(backTo, { replace: true });
    } catch (error) {
      setErr(error.message || "Greška pri logovanju.");
    }
  }

  return (
    <div style={{ padding: 20, maxWidth: 420 }}>
      <h1>Login</h1>

      {err && (
        <div style={{ background: "#ffe6e6", padding: 10, border: "1px solid #ffb3b3" }}>
          {err}
        </div>
      )}

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 10, marginTop: 12 }}>
        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ padding: 10 }}
        />
        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ padding: 10 }}
        />
        <button style={{ padding: 10, cursor: "pointer" }} type="submit">
          Login
        </button>
      </form>

      <p style={{ marginTop: 10 }}>
        Nemaš nalog? <Link to="/register">Register</Link>
      </p>

      <div style={{ marginTop: 14, fontSize: 13, opacity: 0.85 }}>
        <div><b>Test nalozi iz db.json:</b></div>
        <div>Admin: admin@site.com / admin123</div>
        <div>User: marko@site.com / marko123</div>
      </div>
    </div>
  );
}
