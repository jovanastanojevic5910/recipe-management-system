import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

import { getRecipeById } from "../api/recipes";
import { getCategories } from "../api/categories";
import { addFavorite, deleteFavorite, findFavorite } from "../api/favorites";
import { addMealPlan } from "../api/mealplans";

import styles from "../styles/RecipeDetails.module.css";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const MEALS = ["Breakfast", "Lunch", "Dinner"];

export default function RecipeDetails() {
  const { id } = useParams();
  const recipeId = Number(id);

  const { user } = useAuth();

  const [recipe, setRecipe] = useState(null);
  const [categories, setCategories] = useState([]);
  const [favorite, setFavorite] = useState(null);

  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  const [day, setDay] = useState("Monday");
  const [mealType, setMealType] = useState("Lunch");

  useEffect(() => {
    let alive = true;

    async function load() {
      try {
        setLoading(true);
        setError("");
        setMsg("");

        if (!Number.isFinite(recipeId)) {
          throw new Error("Invalid recipe id.");
        }

        const [r, c] = await Promise.all([getRecipeById(recipeId), getCategories()]);
        if (!alive) return;

        setRecipe(r);
        setCategories(c);

        // favorite status (samo ako je ulogovan)
        if (user) {
          const fav = await findFavorite(user.id, recipeId);
          if (!alive) return;
          setFavorite(fav);
        } else {
          setFavorite(null);
        }
      } catch (e) {
        setError(e?.message || "Greška pri učitavanju recepta.");
      } finally {
        if (alive) setLoading(false);
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, [recipeId, user]);

  const categoryName = useMemo(() => {
    const map = Object.fromEntries(categories.map((c) => [String(c.id), c.name]));
    return recipe ? map[String(recipe.categoryId)] || "—" : "—";
  }, [categories, recipe]);

  async function toggleFavorite() {
    if (!user) {
      setMsg("Uloguj se da bi dodala u favorites.");
      return;
    }

    try {
      setBusy(true);
      setMsg("");
      setError("");

      if (favorite) {
        await deleteFavorite(favorite.id);
        setFavorite(null);
        setMsg("Removed from favorites ✅");
      } else {
        const created = await addFavorite({
          userId: user.id,
          recipeId,
          createdAt: new Date().toISOString(),
        });
        setFavorite(created);
        setMsg("Added to favorites ✅");
      }
    } catch (e) {
      setError(e?.message || "Greška sa favorites.");
    } finally {
      setBusy(false);
    }
  }

  async function addToMealPlan() {
    if (!user) {
      setMsg("Uloguj se da bi dodala u meal plan.");
      return;
    }

    try {
      setBusy(true);
      setMsg("");
      setError("");

      await addMealPlan({
        userId: user.id,
        recipeId,
        day,
        mealType,
        createdAt: new Date().toISOString(),
      });

      setMsg("Added to meal plan ✅");
    } catch (e) {
      setError(e?.message || "Greška sa meal plan.");
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <p className={styles.info}>Loading...</p>;
  if (error && !recipe) return <p className={styles.error}>{error}</p>;
  if (!recipe) return <p className={styles.error}>Recipe not found.</p>;

  return (
    <div className={styles.page}>
      <Link className={styles.back} to="/">
        ← Back
      </Link>

      <div className={styles.header}>
        <h1 className={styles.title}>{recipe.title}</h1>
        <p className={styles.sub}>
          Category: <b>{categoryName}</b> • Calories: <b>{recipe.calories}</b> • Prep:{" "}
          <b>{recipe.prepMinutes} min</b>
        </p>
      </div>

      <div className={styles.hero}>
        <img className={styles.image} src={recipe.imageUrl} alt={recipe.title} />
      </div>

      <div className={styles.actions}>
        <button className={styles.primary} disabled={busy} onClick={toggleFavorite}>
          {favorite ? "★ Remove favorite" : "☆ Add to favorites"}
        </button>

        <div className={styles.mealBox}>
          <select
            className={styles.select}
            value={day}
            onChange={(e) => setDay(e.target.value)}
            disabled={busy}
          >
            {DAYS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>

          <select
            className={styles.select}
            value={mealType}
            onChange={(e) => setMealType(e.target.value)}
            disabled={busy}
          >
            {MEALS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>

          <button className={styles.secondary} disabled={busy} onClick={addToMealPlan}>
            Add to meal plan
          </button>
        </div>
      </div>

      {!!msg && <p className={styles.msg}>{msg}</p>}
      {!!error && <p className={styles.error}>{error}</p>}

      <div className={styles.grid}>
        <section className={styles.card}>
          <h2 className={styles.h2}>Ingredients</h2>
          <ul className={styles.list}>
            {(recipe.ingredients || []).map((x, idx) => (
              <li key={idx}>{x}</li>
            ))}
          </ul>
        </section>

        <section className={styles.card}>
          <h2 className={styles.h2}>Steps</h2>
          <ol className={styles.list}>
            {(recipe.steps || []).map((x, idx) => (
              <li key={idx}>{x}</li>
            ))}
          </ol>
        </section>
      </div>
    </div>
  );
}
