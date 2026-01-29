const API_URL = "http://localhost:3001";

export async function getRecipes() {
  const res = await fetch(`${API_URL}/recipes`);
  if (!res.ok) throw new Error("Failed to fetch recipes");
  return res.json();
}

export async function getRecipeById(id) {
  if (id == null || Number.isNaN(Number(id))) {
    throw new Error("Invalid recipe id");
  }

  const res = await fetch(`${API_URL}/recipes/${id}`);
  if (!res.ok) throw new Error("Failed to fetch recipe");
  return res.json();
}
