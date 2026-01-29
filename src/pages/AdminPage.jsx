import { useEffect, useState } from "react";

export default function AdminPage() {
  const [recipes, setRecipes] = useState([]);

  useEffect(() => {
    fetch("http://localhost:3001/recipes")
      .then(res => res.json())
      .then(data => setRecipes(data));
  }, []);

  function handleDelete(id) {
    fetch(`http://localhost:3001/recipes/${id}`, {
      method: "DELETE"
    }).then(() => {
      setRecipes(prev => prev.filter(r => r.id !== id));
    });
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Admin Panel</h1>
      <p>Manage recipes</p>

      {recipes.map(recipe => (
        <div key={recipe.id} style={{ border: "1px solid #ddd", padding: 12, marginBottom: 10 }}>
          <strong>{recipe.title}</strong>
          <div>Calories: {recipe.calories}</div>
          <button
            onClick={() => handleDelete(recipe.id)}
            style={{ marginTop: 8, background: "crimson", color: "white", border: "none", padding: "6px 10px", cursor: "pointer" }}
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}
