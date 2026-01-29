import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import {
  adminGetRecipes,
  adminCreateRecipe,
  adminUpdateRecipe,
  adminDeleteRecipe,
  adminGetCategories,
  adminCreateCategory,
  adminDeleteCategory,
} from "../api/admin";

export default function AdminPanel() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const [recipes, setRecipes] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");

  // recipe form
  const [editingId, setEditingId] = useState(null);
  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [steps, setSteps] = useState("");
  const [calories, setCalories] = useState("");
  const [prepMinutes, setPrepMinutes] = useState("");

  // category form
  const [newCat, setNewCat] = useState("");

  useEffect(() => {
    let alive = true;

    async function load() {
      try {
        setLoading(true);
        setErr("");
        setMsg("");

        const [r, c] = await Promise.all([adminGetRecipes(), adminGetCategories()]);
        if (!alive) return;

        setRecipes(r || []);
        setCategories(c || []);
      } catch (e) {
        setErr(e?.message || "Greška pri učitavanju.");
      } finally {
        if (alive) setLoading(false);
      }
    }

    if (isAdmin) load();

    return () => {
      alive = false;
    };
  }, [isAdmin]);

  const catMap = useMemo(() => Object.fromEntries(categories.map((c) => [c.id, c.name])), [categories]);

  function resetForm() {
    setEditingId(null);
    setTitle("");
    setCategoryId("");
    setImageUrl("");
    setIngredients("");
    setSteps("");
    setCalories("");
    setPrepMinutes("");
  }

  function fillForEdit(r) {
    setEditingId(r.id);
    setTitle(r.title || "");
    setCategoryId(String(r.categoryId ?? ""));
    setImageUrl(r.imageUrl || "");
    setIngredients((r.ingredients || []).join("\n"));
    setSteps((r.steps || []).join("\n"));
    setCalories(String(r.calories ?? ""));
    setPrepMinutes(String(r.prepMinutes ?? ""));
    setErr("");
    setMsg("");
  }

  function buildPayload() {
    const cleanTitle = title.trim();
    const cleanCat = Number(categoryId);
    const cleanCalories = Number(calories);
    const cleanPrep = Number(prepMinutes);

    const ingArr = ingredients.split("\n").map((x) => x.trim()).filter(Boolean);
    const stepArr = steps.split("\n").map((x) => x.trim()).filter(Boolean);

    if (!cleanTitle) throw new Error("Title je obavezan.");
    if (!cleanCat) throw new Error("Category je obavezan.");
    if (!imageUrl.trim()) throw new Error("Image URL je obavezan.");
    if (ingArr.length === 0) throw new Error("Unesi bar 1 ingredient.");
    if (stepArr.length === 0) throw new Error("Unesi bar 1 step.");
    if (!Number.isFinite(cleanCalories)) throw new Error("Calories mora biti broj.");
    if (!Number.isFinite(cleanPrep)) throw new Error("Prep minutes mora biti broj.");

    return {
      title: cleanTitle,
      categoryId: cleanCat,
      imageUrl: imageUrl.trim(),
      ingredients: ingArr,
      steps: stepArr,
      calories: cleanCalories,
      prepMinutes: cleanPrep,
    };
  }

  async function onSubmit(e) {
    e.preventDefault();

    try {
      setErr("");
      setMsg("");

      const payload = buildPayload();

      if (editingId) {
        const updated = await adminUpdateRecipe(editingId, payload);
        setRecipes((prev) => prev.map((r) => (r.id === editingId ? updated : r)));
        setMsg("Recipe updated ✅");
      } else {
        const created = await adminCreateRecipe(payload);
        setRecipes((prev) => [created, ...prev]);
        setMsg("Recipe created ✅");
      }

      resetForm();
    } catch (e2) {
      setErr(e2?.message || "Greška pri snimanju.");
    }
  }

  async function onDelete(id) {
    const ok = confirm("Obrisati recept?");
    if (!ok) return;

    try {
      setErr("");
      setMsg("");
      await adminDeleteRecipe(id);
      setRecipes((prev) => prev.filter((r) => r.id !== id));
      setMsg("Recipe deleted ✅");
    } catch (e) {
      setErr(e?.message || "Greška pri brisanju.");
    }
  }

  async function onAddCategory() {
    try {
      setErr("");
      setMsg("");

      const name = newCat.trim();
      if (!name) throw new Error("Unesi naziv kategorije.");

      const created = await adminCreateCategory({ name });
      setCategories((prev) => [...prev, created]);
      setNewCat("");
      setMsg("Category added ✅");
    } catch (e) {
      setErr(e?.message || "Greška sa kategorijom.");
    }
  }

  async function onDeleteCategory(id) {
    const ok = confirm("Obrisati kategoriju?");
    if (!ok) return;

    try {
      setErr("");
      setMsg("");
      await adminDeleteCategory(id);
      setCategories((prev) => prev.filter((c) => c.id !== id));
      setMsg("Category deleted ✅");
    } catch (e) {
      setErr(e?.message || "Greška pri brisanju kategorije.");
    }
  }

  if (!isAdmin) return <p style={{ padding: 20 }}>Nemaš pristup.</p>;
  if (loading) return <p style={{ padding: 20 }}>Loading...</p>;

  return (
    <div style={{ padding: 20, maxWidth: 1100, margin: "0 auto" }}>
      <h1>Admin Panel</h1>

      {msg && <p style={{ color: "green" }}>{msg}</p>}
      {err && <p style={{ color: "crimson" }}>{err}</p>}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginTop: 14 }}>
        {/* FORM */}
        <section style={{ background: "white", border: "1px solid #eee", borderRadius: 16, padding: 14 }}>
          <h2 style={{ marginTop: 0 }}>{editingId ? `Edit recipe #${editingId}` : "Create recipe"}</h2>

          <form onSubmit={onSubmit} style={{ display: "grid", gap: 10 }}>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" />

            <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="Image URL" />
            <input value={calories} onChange={(e) => setCalories(e.target.value)} placeholder="Calories (number)" />
            <input value={prepMinutes} onChange={(e) => setPrepMinutes(e.target.value)} placeholder="Prep minutes (number)" />

            <textarea value={ingredients} onChange={(e) => setIngredients(e.target.value)} rows={6} placeholder="Ingredients (one per line)" />
            <textarea value={steps} onChange={(e) => setSteps(e.target.value)} rows={6} placeholder="Steps (one per line)" />

            <div style={{ display: "flex", gap: 10 }}>
              <button type="submit">{editingId ? "Update" : "Create"}</button>
              <button type="button" onClick={resetForm}>Clear</button>
            </div>
          </form>

          <hr style={{ margin: "16px 0" }} />

          <h3 style={{ marginTop: 0 }}>Categories</h3>
          <div style={{ display: "flex", gap: 8 }}>
            <input value={newCat} onChange={(e) => setNewCat(e.target.value)} placeholder="New category name" />
            <button type="button" onClick={onAddCategory}>Add</button>
          </div>

          <ul style={{ marginTop: 10 }}>
            {categories.map((c) => (
              <li key={c.id} style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                <span>#{c.id} — {c.name}</span>
                <button type="button" onClick={() => onDeleteCategory(c.id)}>Delete</button>
              </li>
            ))}
          </ul>
        </section>

        {/* LIST */}
        <section style={{ background: "white", border: "1px solid #eee", borderRadius: 16, padding: 14 }}>
          <h2 style={{ marginTop: 0 }}>Recipes</h2>

          <div style={{ display: "grid", gap: 10 }}>
            {recipes.map((r) => (
              <div key={r.id} style={{ border: "1px solid #eee", borderRadius: 14, padding: 12, display: "flex", justifyContent: "space-between", gap: 12 }}>
                <div>
                  <div style={{ fontWeight: 800 }}>#{r.id} — {r.title}</div>
                  <div style={{ fontSize: 13, opacity: 0.85 }}>
                    Category: {catMap[r.categoryId] || r.categoryId} • Calories: {r.calories} • Prep: {r.prepMinutes} min
                  </div>
                </div>

                <div style={{ display: "flex", gap: 8 }}>
                  <button type="button" onClick={() => fillForEdit(r)}>Edit</button>
                  <button type="button" onClick={() => onDelete(r.id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
