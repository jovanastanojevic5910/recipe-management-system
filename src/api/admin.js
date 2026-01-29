const API_URL = "http://localhost:3001";

// RECIPES
export async function adminGetRecipes() {
  const res = await fetch(`${API_URL}/recipes`);
  if (!res.ok) throw new Error("Failed to fetch recipes");
  return res.json();
}

export async function adminCreateRecipe(payload) {
  const res = await fetch(`${API_URL}/recipes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to create recipe");
  return res.json();
}

export async function adminUpdateRecipe(id, payload) {
  const res = await fetch(`${API_URL}/recipes/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to update recipe");
  return res.json();
}

export async function adminDeleteRecipe(id) {
  const res = await fetch(`${API_URL}/recipes/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete recipe");
  return true;
}

// CATEGORIES
export async function adminGetCategories() {
  const res = await fetch(`${API_URL}/categories`);
  if (!res.ok) throw new Error("Failed to fetch categories");
  return res.json();
}

export async function adminCreateCategory(payload) {
  const res = await fetch(`${API_URL}/categories`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to create category");
  return res.json();
}

export async function adminDeleteCategory(id) {
  const res = await fetch(`${API_URL}/categories/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete category");
  return true;
}
