import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import styles from "../styles/Navbar.module.css";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/");
  }

  const navClass = ({ isActive }) =>
    isActive ? `${styles.link} ${styles.active}` : styles.link;

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link to="/" className={styles.brand}>
          RecipeMS
        </Link>

        <nav className={styles.nav}>
          <NavLink to="/" className={navClass}>
            Home
          </NavLink>

          {user && (
            <>
              <NavLink to="/favorites" className={navClass}>
                Favorites
              </NavLink>
              <NavLink to="/meal-plan" className={navClass}>
                Meal Plan
              </NavLink>
              <NavLink to="/profile" className={navClass}>
                Profile
              </NavLink>

              {user.role === "admin" && (
                <NavLink to="/admin" className={navClass}>
                  Admin
                </NavLink>
              )}
            </>
          )}
        </nav>

        <div className={styles.right}>
          {!user ? (
            <>
              <NavLink to="/login" className={navClass}>
                Login
              </NavLink>
              <NavLink to="/register" className={navClass}>
                Register
              </NavLink>
            </>
          ) : (
            <>
              <span className={styles.pill}>
                {user.name} ({user.role})
              </span>
              <button className={styles.logout} onClick={handleLogout}>
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
