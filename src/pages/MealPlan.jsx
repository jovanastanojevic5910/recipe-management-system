import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

import { getMealPlansByUserId, deleteMealPlan } from "../api/mealplans";
import { getRecipeById } from "../api/recipes";

export default function MealPlan() {
  const { user } = useAuth();

  const [plans, setPlans] = useState([]);
  const [recipesById, setRecipesById] = useState({});
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let alive = true;

    async function load() {
      try {
        setLoading(true);
        setErr("");

        const all = await getMealPlansByUserId(user.id);

        // samo validni zapisi (da ne traži /recipes/undefined)
        const valid = (all || []).filter(
          (p) => p && p.userId != null && p.recipeId != null && p.day && p.mealType
        );

        if (!alive) return;
        setPlans(valid);

        const uniqueRecipeIds = [...new Set(valid.map((p) => Number(p.recipeId)))];

        const pairs = await Promise.all(
          uniqueRecipeIds.map(async (rid) => {
            try {
              const recipe = await getRecipeById(rid);
              return [rid, recipe];
            } catch {
              return [rid, null];
            }
          })
        );

        if (!alive) return;
        setRecipesById(Object.fromEntries(pairs));
      } catch (e) {
        if (!alive) return;
        setErr(e?.message || "Greška pri učitavanju meal plan-a.");
      } finally {
        if (alive) setLoading(false);
      }
    }

    if (user?.id) load();

    return () => {
      alive = false;
    };
  }, [user?.id]);

  async function onRemove(planId) {
    try {
      await deleteMealPlan(planId);
      setPlans((prev) => prev.filter((p) => p.id !== planId));
    } catch (e) {
      alert(e?.message || "Ne mogu da obrišem stavku.");
    }
  }

  const grouped = useMemo(() => {
    const map = {};
    for (const p of plans) {
      const key = `${p.day} • ${p.mealType}`;
      map[key] = map[key] || [];
      map[key].push(p);
    }
    return map;
  }, [plans]);

  if (!user) return <p style={{ padding: 20 }}>Uloguj se da vidiš meal plan.</p>;
  if (loading) return <p style={{ padding: 20 }}>Loading...</p>;
  if (err) return <p style={{ padding: 20, color: "crimson" }}>{err}</p>;

  const keys = Object.keys(grouped);
  if (keys.length === 0) return <p style={{ padding: 20 }}>Nema stavki u meal plan-u.</p>;

  return (
    <div style={{ padding: 20, maxWidth: 900, margin: "0 auto" }}>
      <h1>Meal Plan</h1>

      {keys.map((k) => (
        <div key={k} style={{ marginTop: 18 }}>
          <h2 style={{ marginBottom: 10 }}>{k}</h2>

          <div style={{ display: "grid", gap: 12 }}>
            {grouped[k].map((p) => {
              const recipe = recipesById[Number(p.recipeId)];

              return (
                <div
                  key={p.id}
                  style={{
                    border: "1px solid #e5e5e5",
                    borderRadius: 12,
                    padding: 12,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 800 }}>
                      {recipe ? recipe.title : "Recipe not found"}
                    </div>

                    {recipe && (
                      <Link to={`/recipe/${recipe.id}`} style={{ fontSize: 14 }}>
                        View details
                      </Link>
                    )}
                  </div>

                  <button onClick={() => onRemove(p.id)}>Remove</button>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
