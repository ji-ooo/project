import { useEffect, useRef, useState } from "react";
import styles from "./SideBar.module.scss";
import useThemeStore from "../../store/ThemeStore";
import MenuIcon from "@mui/icons-material/Menu";
import HouseSidingIcon from "@mui/icons-material/HouseSiding";
import InfoIcon from "@mui/icons-material/Info";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import SportsScoreIcon from "@mui/icons-material/SportsScore";

function SideBar() {
  const { theme } = useThemeStore();
  const [isOpen, setIsOpen] = useState(false);
  const sideBarRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <div
        ref={sideBarRef}
        className={`${styles.sideBar} ${isOpen ? styles.open : ""}`}
      >
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
      </div>
      <button
        className={`${styles.toggleButton} ${isOpen ? styles.open : ""}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <MenuIcon />
      </button>
    </>
  );
}

export default SideBar;
