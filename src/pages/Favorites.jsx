import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { getFavoritesByUserId, deleteFavorite } from "../api/favorites";
import { getRecipeById } from "../api/recipes";

export default function Favorites() {
  const { user } = useAuth();

  const [favorites, setFavorites] = useState([]);
  const [recipesById, setRecipesById] = useState({});
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let alive = true;

    async function load() {
      try {
        setLoading(true);
        setErr("");

        const favs = await getFavoritesByUserId(user.id);
        if (!alive) return;

        setFavorites(favs || []);

        const uniqueRecipeIds = [
          ...new Set((favs || []).map((f) => Number(f.recipeId))),
        ].filter((x) => Number.isFinite(x));

        const pairs = await Promise.all(
          uniqueRecipeIds.map(async (rid) => {
            try {
              const r = await getRecipeById(rid);
              return [rid, r];
            } catch {
              return [rid, null];
            }
          })
        );

        if (!alive) return;
        setRecipesById(Object.fromEntries(pairs));
      } catch (e) {
        if (!alive) return;
        setErr(e?.message || "Greška pri učitavanju favorites.");
      } finally {
        if (alive) setLoading(false);
      }
    }

    if (user?.id) load();

    return () => {
      alive = false;
    };
  }, [user?.id]);

  async function onRemove(favId) {
    try {
      await deleteFavorite(favId);
      setFavorites((prev) => prev.filter((f) => f.id !== favId));
    } catch (e) {
      alert(e?.message || "Ne mogu da obrišem favorite.");
    }
  }

  const items = useMemo(() => {
    // enrich favorites with recipe; filter out missing recipes (opciono)
    return favorites
      .map((f) => ({
        ...f,
        recipe: recipesById[Number(f.recipeId)] || null,
      }))
      .filter((x) => x.recipe); // ako ne želiš ovo, obriši liniju
  }, [favorites, recipesById]);

  if (!user) return <p style={{ padding: 20 }}>Uloguj se da vidiš favorites.</p>;
  if (loading) return <p style={{ padding: 20 }}>Loading...</p>;
  if (err) return <p style={{ padding: 20, color: "crimson" }}>{err}</p>;
  if (items.length === 0) return <p style={{ padding: 20 }}>Nemaš omiljene recepte.</p>;

  return (
    <div style={{ padding: 20, maxWidth: 900, margin: "0 auto" }}>
      <h1>Favorites</h1>

      <div style={{ display: "grid", gap: 12, marginTop: 14 }}>
        {items.map((f) => (
          <div
            key={f.id}
            style={{
              border: "1px solid #e5e5e5",
              borderRadius: 12,
              padding: 12,
              display: "flex",
              justifyContent: "space-between",
              gap: 12,
              alignItems: "center",
            }}
          >
            <div>
              <div style={{ fontWeight: 800 }}>{f.recipe.title}</div>

              <div style={{ fontSize: 13, opacity: 0.85, marginTop: 4 }}>
                Calories: <b>{f.recipe.calories}</b> • Prep:{" "}
                <b>{f.recipe.prepMinutes} min</b>
              </div>

              <div style={{ marginTop: 6 }}>
                <Link to={`/recipe/${f.recipe.id}`} style={{ fontSize: 14 }}>
                  View details
                </Link>
              </div>
            </div>

            <button onClick={() => onRemove(f.id)}>Remove</button>
          </div>
        ))}
      </div>
    </div>
  );
}
