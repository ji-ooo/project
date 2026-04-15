import { useLocation, useNavigate } from "react-router-dom";
import styles from "./Header.module.scss";
import { useSideBarStore } from "../../store/SideBarStore";
import ThemeSwitcher from "./ThemeSwitcher";
import logo from "../../../assets/logo.png";

function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isOpen } = useSideBarStore();

  const pageTitles: { [key: string]: string } = {
    "/": "GLITCH HUB",
    "/about": "ABOUT",
    "/glitchrace": "GLITCH RACE",
  };

  const currentPageTitle = pageTitles[location.pathname] || "GLITCH HUB";

  return (
    <div className={styles.header}>
      <img
        src={logo}
        alt="Logo"
        className={`${styles.logo} ${isOpen ? styles.logoShift : ""}`}
        onClick={() => navigate("/")}
      />
      <div className={styles.pageTitle}>{currentPageTitle}</div>
      <ThemeSwitcher />
    </div>
  );
}

export default Header;
