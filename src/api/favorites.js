const API_URL = "http://localhost:3001";

export async function getFavoritesByUserId(userId) {
  const res = await fetch(`${API_URL}/favorites?userId=${userId}`);
  if (!res.ok) throw new Error("Failed to fetch favorites");
  return res.json();
}

export async function findFavorite(userId, recipeId) {
  const res = await fetch(`${API_URL}/favorites?userId=${userId}&recipeId=${recipeId}`);
  if (!res.ok) throw new Error("Failed to fetch favorite");
  const data = await res.json();
  return data[0] || null;
}

export async function addFavorite(payload) {
  const res = await fetch(`${API_URL}/favorites`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to add favorite");
  return res.json();
}

export async function deleteFavorite(favoriteId) {
  const res = await fetch(`${API_URL}/favorites/${favoriteId}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete favorite");
  return true;
}
