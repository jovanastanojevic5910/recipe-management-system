const API_URL = "http://localhost:3001";

function normalizeId(x) {
  // json-server ume da vrati id kao "2" ili 2, pa ovo sve svodi na string/number safe
  if (x === null || x === undefined) return null;
  // ako je objekat (greška iz db.json), probaj da izvučeš pravo polje
  if (typeof x === "object") return null;
  return x;
}

// GET /mealPlans?userId=...
export async function getMealPlansByUserId(userId) {
  const uid = normalizeId(userId);
  const res = await fetch(`${API_URL}/mealPlans?userId=${encodeURIComponent(uid)}`);
  if (!res.ok) throw new Error("Failed to fetch meal plans");
  const data = await res.json();
  // filtriraj loše zapise gde je userId objekat (kao kod tebe u db.json)
  return (data || []).filter((mp) => typeof mp.userId !== "object");
}

// POST /mealPlans
export async function addMealPlan(payload) {
  // payload mora biti ravan objekat: { userId, recipeId, day, mealType, createdAt }
  const clean = {
    userId: normalizeId(payload?.userId),
    recipeId: normalizeId(payload?.recipeId),
    day: payload?.day,
    mealType: payload?.mealType,
    createdAt: payload?.createdAt || new Date().toISOString(),
  };

  if (!clean.userId || !clean.recipeId || !clean.day || !clean.mealType) {
    throw new Error("MealPlan payload is invalid (userId/recipeId/day/mealType).");
  }

  const res = await fetch(`${API_URL}/mealPlans`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(clean),
  });

  if (!res.ok) throw new Error("Failed to add meal plan");
  return res.json();
}

// DELETE /mealPlans/:id
export async function deleteMealPlan(id) {
  const res = await fetch(`${API_URL}/mealPlans/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete meal plan");
  return true;
}
