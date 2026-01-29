import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getRecipes } from "../api/recipes";
import { getCategories } from "../api/categories";

export default function Home() {
  const [recipes, setRecipes] = useState([]);
  const [categories, setCategories] = useState([]);

  const [q, setQ] = useState("");
  const [catId, setCatId] = useState("all");

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let alive = true;

    async function load() {
      try {
        setLoading(true);
        setErr("");

        const [r, c] = await Promise.all([getRecipes(), getCategories()]);
        if (!alive) return;

        setRecipes(r || []);
        setCategories(c || []);
      } catch (e) {
        if (!alive) return;
        setErr(e?.message || "Failed to fetch");
      } finally {
        if (alive) setLoading(false);
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const text = q.trim().toLowerCase();

    return (recipes || []).filter((r) => {
      const okText = !text || String(r.title || "").toLowerCase().includes(text);
      const okCat = catId === "all" || String(r.categoryId) === String(catId);
      return okText && okCat;
    });
  }, [recipes, q, catId]);

  return (
    <div style={{ padding: 20 }}>
      <h1>Recipes</h1>

      <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <input
          placeholder="Search recipe..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          style={{ padding: 10, minWidth: 260 }}
        />

        <select value={catId} onChange={(e) => setCatId(e.target.value)} style={{ padding: 10 }}>
          <option value="all">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <span style={{ opacity: 0.8 }}>{filtered.length} results</span>
      </div>

      {loading && <p style={{ marginTop: 14 }}>Loading...</p>}
      {err && <p style={{ marginTop: 14, color: "crimson" }}>{err}</p>}

      {!loading && !err && (
        <div style={{ marginTop: 18, display: "grid", gap: 16, gridTemplateColumns: "repeat(2, minmax(260px, 1fr))" }}>
          {filtered.map((r) => (
            <div key={r.id} style={{ border: "1px solid #e5e5e5", borderRadius: 12, overflow: "hidden" }}>
              <img src={r.imageUrl} alt={r.title} style={{ width: "100%", height: 220, objectFit: "cover" }} />
              <div style={{ padding: 12 }}>
                <h3 style={{ margin: "0 0 6px" }}>{r.title}</h3>
                <div style={{ fontSize: 14, opacity: 0.85 }}>
                  Calories: <b>{r.calories}</b> • Prep: <b>{r.prepMinutes} min</b>
                </div>

                <div style={{ marginTop: 10 }}>
                  <Link to={`/recipe/${r.id}`}>View details</Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
