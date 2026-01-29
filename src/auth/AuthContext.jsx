import { createContext, useContext, useEffect, useMemo, useState } from "react";

const AuthContext = createContext(null);

const LS_KEY = "recipems_user";
const API_URL = "http://localhost:3001";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) setUser(JSON.parse(raw));
  }, []);

  async function login(email, password) {
    const cleanEmail = String(email || "").trim().toLowerCase();
    const cleanPassword = String(password || "");

    if (!cleanEmail || !cleanPassword) {
      throw new Error("Unesi email i lozinku.");
    }

    const res = await fetch(
      `${API_URL}/users?email=${encodeURIComponent(cleanEmail)}`
    );
    if (!res.ok) throw new Error("Ne mogu da dohvatim korisnike (server?).");

    const users = await res.json();
    const found = users?.[0];

    if (!found) throw new Error("Ne postoji korisnik sa tim email-om.");
    if (found.password !== cleanPassword) throw new Error("Pogrešna lozinka.");

    const safeUser = {
      id: found.id,
      name: found.name,
      email: found.email,
      role: found.role || "user",
    };

    setUser(safeUser);
    localStorage.setItem(LS_KEY, JSON.stringify(safeUser));
    return safeUser;
  }

  // ✅ REGISTER (POST /users)
  async function register(name, email, password) {
    const cleanName = String(name || "").trim();
    const cleanEmail = String(email || "").trim().toLowerCase();
    const cleanPassword = String(password || "");

    if (!cleanName) throw new Error("Unesi ime.");
    if (!cleanEmail) throw new Error("Unesi email.");
    if (!cleanPassword || cleanPassword.length < 4)
      throw new Error("Lozinka mora imati bar 4 karaktera.");

    // 1) Provera da li email već postoji
    const checkRes = await fetch(
      `${API_URL}/users?email=${encodeURIComponent(cleanEmail)}`
    );
    if (!checkRes.ok) throw new Error("Ne mogu da proverim korisnike (server?).");

    const existing = await checkRes.json();
    if (existing?.length) throw new Error("Email je već registrovan.");

    // 2) Kreiranje user-a (role je "user")
    const createRes = await fetch(`${API_URL}/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: cleanName,
        email: cleanEmail,
        password: cleanPassword,
        role: "user",
      }),
    });

    if (!createRes.ok) throw new Error("Greška pri registraciji (POST /users).");

    const created = await createRes.json();

    // 3) Auto-login (bez password u localStorage)
    const safeUser = {
      id: created.id,
      name: created.name,
      email: created.email,
      role: created.role || "user",
    };

    setUser(safeUser);
    localStorage.setItem(LS_KEY, JSON.stringify(safeUser));
    return safeUser;
  }

  function logout() {
    setUser(null);
    localStorage.removeItem(LS_KEY);
  }

  const value = useMemo(
    () => ({ user, login, register, logout }),
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth() must be used inside <AuthProvider>");
  return ctx;
}
