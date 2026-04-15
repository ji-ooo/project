import styles from "./SideBar.module.scss";
import ThemeSwitcher from "./ThemeSwitcher";
import useThemeStore from "../../store/ThemeStore";
import { useSideBarStore } from "../../store/SideBarStore";
import MenuIcon from "@mui/icons-material/Menu";
import HouseSidingIcon from "@mui/icons-material/HouseSiding";
import InfoIcon from "@mui/icons-material/Info";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import SportsScoreIcon from "@mui/icons-material/SportsScore";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

function SideBar() {
  const { theme } = useThemeStore();
  const { isOpen, setIsOpen, toggle } = useSideBarStore();
  const location = useLocation();

  useEffect(() => {
    const isMobile = window.innerWidth < 768;

    if (isMobile && isOpen) {
      setIsOpen(false);
    }
  }, [location.pathname, setIsOpen]);

  return (
    <>
      <div className={`${styles.sideBar} ${isOpen ? styles.open : ""}`}>
        <nav className={`${styles.menuContent} ${isOpen ? styles.open : ""}`}>
          <a href="/about" className={styles.aboutButton}>
            {theme === "light" ? <InfoOutlinedIcon /> : <InfoIcon />}
          </a>
          <li>
            <a href="/" className={styles.menuItem}>
              <HouseSidingIcon />
              <span>Home</span>
            </a>
          </li>
          <li>
            <a href="/glitchrace" className={styles.menuItem}>
              <SportsScoreIcon />
              <span>Glitch Race</span>
            </a>
          </li>
          <li>
            <a href="/test" className={styles.menuItem}>
              <SportsScoreIcon />
              <span>TEST</span>
            </a>
          </li>
        </nav>
        <ThemeSwitcher />
      </div>
      <button
        className={`${styles.toggleButton} ${isOpen ? styles.open : ""}`}
        onClick={toggle}
      >
        <MenuIcon />
      </button>
    </>
  );
}

export default SideBar;
