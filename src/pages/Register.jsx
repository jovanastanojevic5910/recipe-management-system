import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");

    try {
      await register(name, email, password);
      navigate("/");
    } catch (error) {
      setErr(error.message || "Greška pri registraciji.");
    }
  }

  return (
    <div
      style={{
        maxWidth: 420,
        margin: "80px auto",
        background: "white",
        padding: 30,
        borderRadius: 16,
        boxShadow: "0 10px 30px rgba(0,0,0,0.07)"
      }}
    >
      <h1 style={{ marginBottom: 20 }}>Register</h1>

      {err && (
        <div
          style={{
            background: "#ffe6e6",
            padding: 10,
            border: "1px solid #ffb3b3",
            borderRadius: 8,
            marginBottom: 10
          }}
        >
          {err}
        </div>
      )}

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
        <input
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={inputStyle}
        />

        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={inputStyle}
        />

        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={inputStyle}
        />

        <button type="submit" style={buttonStyle}>
          Create account
        </button>
      </form>

      <p style={{ marginTop: 14, fontSize: 14 }}>
        Već imaš nalog? <Link to="/login">Login</Link>
      </p>
    </div>
  );
}

const inputStyle = {
  padding: 12,
  borderRadius: 10,
  border: "1px solid #e2e8f0",
  fontSize: 14
};

const buttonStyle = {
  padding: 12,
  borderRadius: 10,
  border: "none",
  background: "#2563eb",
  color: "white",
  fontWeight: 600,
  cursor: "pointer"
};
