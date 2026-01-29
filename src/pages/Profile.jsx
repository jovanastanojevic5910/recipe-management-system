import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { getFavoritesByUserId } from "../api/favorites";
import { getMealPlansByUserId } from "../api/mealplans";

export default function Profile() {
  const { user, logout } = useAuth();

  const [favCount, setFavCount] = useState(0);
  const [planCount, setPlanCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let alive = true;

    async function load() {
      try {
        setLoading(true);
        setErr("");

        const [favs, plans] = await Promise.all([
          getFavoritesByUserId(user.id),
          getMealPlansByUserId(user.id),
        ]);

        if (!alive) return;
        setFavCount((favs || []).length);
        setPlanCount((plans || []).length);
      } catch (e) {
        if (!alive) return;
        setErr(e?.message || "Greška pri učitavanju profila.");
      } finally {
        if (alive) setLoading(false);
      }
    }

    if (user?.id) load();

    return () => {
      alive = false;
    };
  }, [user?.id]);

  const badge = useMemo(() => {
    return user.role === "admin" ? "ADMIN" : "USER";
  }, [user.role]);

  if (!user) return null;
  if (loading) return <p style={{ padding: 20 }}>Loading profile...</p>;
  if (err) return <p style={{ padding: 20, color: "crimson" }}>{err}</p>;

  return (
    <div style={{ padding: 20, maxWidth: 700, margin: "0 auto" }}>
      <h1>Profile</h1>

      <div
        style={{
          border: "1px solid #e5e5e5",
          borderRadius: 14,
          padding: 14,
          display: "grid",
          gap: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <span style={{ fontSize: 18, fontWeight: 800 }}>{user.name}</span>
          <span
            style={{
              border: "1px solid #ddd",
              borderRadius: 999,
              padding: "4px 10px",
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: 0.5,
            }}
          >
            {badge}
          </span>
        </div>

        <div style={{ opacity: 0.9 }}>
          <div>
            <b>Email:</b> {user.email}
          </div>
          <div>
            <b>User ID:</b> {user.id}
          </div>
        </div>

        <hr style={{ border: 0, borderTop: "1px solid #eee" }} />

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <div style={{ border: "1px solid #eee", borderRadius: 12, padding: 12, minWidth: 160 }}>
            <div style={{ fontSize: 12, opacity: 0.8 }}>Favorites</div>
            <div style={{ fontSize: 22, fontWeight: 900 }}>{favCount}</div>
          </div>

          <div style={{ border: "1px solid #eee", borderRadius: 12, padding: 12, minWidth: 160 }}>
            <div style={{ fontSize: 12, opacity: 0.8 }}>Meal plan items</div>
            <div style={{ fontSize: 22, fontWeight: 900 }}>{planCount}</div>
          </div>
        </div>

        <div style={{ marginTop: 6 }}>
          <button
            onClick={logout}
            style={{ padding: "10px 12px", cursor: "pointer" }}
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
